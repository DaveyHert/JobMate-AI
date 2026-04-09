// ============================================================================
// MappingResolver — decides which profile path fills each form field
// ============================================================================
// Given a FormSnapshot + UserProfile, produces a MappingSet that says, for
// every field, either "fill it with this profile path" or "skip it".
//
// Resolution is layered. Every layer gets a shot at each field; we take the
// first answer in this order:
//
//   1. SiteCache    — previously resolved mapping for this form signature.
//                     Zero latency, zero LLM cost. This is the moat.
//   2. Rules        — local pattern matcher over field label / name / id /
//                     autocomplete / type. Deterministic, sub-millisecond,
//                     handles ~80% of common fields.
//   3. AnswerBank   — only for essay fields: previously banked Q&A.
//   4. AI (stub)    — Task 8 wires this to the LLM. For now, fields that
//                     fall through the first three layers are returned with
//                     source "ai" and a null profilePath so the Filler will
//                     skip them and the ReviewOverlay can flag them.
//
// After resolve(), the caller passes the MappingSet back into SiteCache.put
// so next visit is a straight cache hit.
// ============================================================================

import type { UserProfile } from "../models/models";
import type {
  FieldMapping,
  FormField,
  FormSnapshot,
  MappingSet,
  ProfilePath,
} from "./types";
import { siteCache } from "./SiteCache";
import { answerBank } from "./AnswerBank";
import { readProfilePath } from "./profilePaths";
import {
  llmClient,
  LLMNotConfiguredError,
  type FieldClassificationRequest,
} from "./LLMClient";

// ---------- Rule type ----------

interface Rule {
  /** Stable identifier for debugging / telling rules apart in logs. */
  id: string;
  /** Which profile path this rule fills. */
  path: ProfilePath;
  /**
   * Scoring function. Returns 0 for "no opinion", or a positive number
   * indicating confidence (higher = better). The resolver picks the highest-
   * scoring rule per field, then normalizes to 0-1 via the rule's maxScore.
   */
  score(field: FormField): number;
  /** Maximum value `score` can return for this rule. Used for normalization. */
  maxScore: number;
}

// ---------- Scoring primitives ----------
//
// Pulled into small helpers so rules can compose them without repeating the
// case-insensitive "do any of these tokens appear in this haystack" pattern.

function includesAny(haystack: string, needles: string[]): boolean {
  const h = haystack.toLowerCase();
  return needles.some((n) => h.includes(n.toLowerCase()));
}

function exactAny(haystack: string, needles: string[]): boolean {
  const h = haystack.toLowerCase().trim();
  return needles.some((n) => h === n.toLowerCase());
}

function wordMatch(haystack: string, needles: string[]): boolean {
  const h = haystack.toLowerCase();
  return needles.some((n) => {
    const escaped = n.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`).test(h);
  });
}

/** Compose a rule. Boilerplate gets loud without this. */
function rule(config: {
  id: string;
  path: ProfilePath;
  autocomplete?: string[];
  inputTypes?: string[];
  labelExact?: string[];
  labelContains?: string[];
  idNamePatterns?: RegExp[];
  keywords?: string[];
  priority?: number;
}): Rule {
  const {
    id,
    path,
    autocomplete = [],
    inputTypes = [],
    labelExact = [],
    labelContains = [],
    idNamePatterns = [],
    keywords = [],
    priority = 10,
  } = config;

  // Each signal contributes a fraction of priority; autocomplete wins because
  // it's a standards-backed declaration of intent.
  const W_AUTOCOMPLETE = priority * 2.0;
  const W_TYPE = priority * 1.8;
  const W_EXACT_LABEL = priority * 1.5;
  const W_PATTERN = priority * 1.4;
  const W_WORD_LABEL = priority * 1.3;
  const W_PARTIAL_LABEL = priority * 1.1;
  const W_KEYWORD = priority * 0.8;
  const W_PLACEHOLDER = priority * 0.6;

  // The theoretical ceiling — used to normalize scores to 0-1 confidence.
  const maxScore = W_AUTOCOMPLETE + W_TYPE + W_EXACT_LABEL + W_KEYWORD;

  return {
    id,
    path,
    maxScore,
    score(field: FormField): number {
      let score = 0;

      if (autocomplete.length && field.autocomplete) {
        if (autocomplete.includes(field.autocomplete)) score += W_AUTOCOMPLETE;
      }

      if (inputTypes.length && field.inputType) {
        if (inputTypes.includes(field.inputType)) score += W_TYPE;
      }

      if (idNamePatterns.length) {
        const idName = `${field.id} ${field.name}`;
        if (idNamePatterns.some((re) => re.test(idName))) score += W_PATTERN;
      }

      const labelBlob = [field.labelText, field.ariaLabel]
        .filter(Boolean)
        .join(" ");

      if (labelExact.length && labelBlob && exactAny(labelBlob, labelExact)) {
        score += W_EXACT_LABEL;
      } else if (labelContains.length && labelBlob) {
        if (wordMatch(labelBlob, labelContains)) {
          score += W_WORD_LABEL;
        } else if (includesAny(labelBlob, labelContains)) {
          score += W_PARTIAL_LABEL;
        }
      }

      if (keywords.length) {
        const attrBlob = [field.id, field.name, field.placeholder]
          .filter(Boolean)
          .join(" ");
        if (includesAny(attrBlob, keywords)) score += W_KEYWORD;
      }

      if (labelContains.length && field.placeholder) {
        if (includesAny(field.placeholder, labelContains)) score += W_PLACEHOLDER;
      }

      return score;
    },
  };
}

// ---------- Rule table ----------

const RULES: Rule[] = [
  rule({
    id: "identity.firstName",
    path: "identity.firstName",
    autocomplete: ["given-name"],
    idNamePatterns: [/first[_\s-]?name/i, /fname/, /given[_\s-]?name/i],
    labelExact: ["first name", "given name"],
    labelContains: ["first name", "given name"],
    keywords: ["firstname", "fname", "givenname"],
    priority: 12,
  }),
  rule({
    id: "identity.lastName",
    path: "identity.lastName",
    autocomplete: ["family-name"],
    idNamePatterns: [/last[_\s-]?name/i, /lname/, /surname/, /family[_\s-]?name/i],
    labelExact: ["last name", "surname", "family name"],
    labelContains: ["last name", "surname", "family name"],
    keywords: ["lastname", "surname", "familyname"],
    priority: 12,
  }),
  rule({
    id: "identity.fullName",
    path: "identity.fullName",
    autocomplete: ["name"],
    idNamePatterns: [/^full[_\s-]?name$/i, /^name$/i, /applicant[_\s-]?name/i],
    labelExact: ["full name", "name", "your name", "applicant name"],
    labelContains: ["full name", "applicant name"],
    priority: 8,
  }),
  rule({
    id: "identity.email",
    path: "identity.email",
    autocomplete: ["email"],
    inputTypes: ["email"],
    idNamePatterns: [/email/i, /e[_\s-]?mail/i],
    labelExact: ["email", "email address", "e-mail"],
    labelContains: ["email", "e-mail"],
    keywords: ["email", "mail"],
    priority: 15,
  }),
  rule({
    id: "identity.phone",
    path: "identity.phone",
    autocomplete: ["tel"],
    inputTypes: ["tel"],
    idNamePatterns: [/phone/i, /^tel$/i, /mobile/i, /cell/i],
    labelExact: ["phone", "phone number", "mobile", "telephone"],
    labelContains: ["phone", "mobile", "cell"],
    keywords: ["phone", "tel", "mobile", "cell"],
    priority: 13,
  }),
  rule({
    id: "location.address",
    path: "location.address",
    autocomplete: ["street-address", "address-line1"],
    idNamePatterns: [/^address$/i, /street/i, /address[_\s-]?line/i],
    labelExact: ["address", "street address", "home address"],
    labelContains: ["street address", "address line"],
    priority: 9,
  }),
  rule({
    id: "location.city",
    path: "location.city",
    autocomplete: ["address-level2", "locality"],
    idNamePatterns: [/^city$/i, /town/, /locality/],
    labelExact: ["city", "town"],
    labelContains: ["city"],
    priority: 9,
  }),
  rule({
    id: "location.state",
    path: "location.state",
    autocomplete: ["address-level1", "region"],
    idNamePatterns: [/^state$/i, /province/, /region/],
    labelExact: ["state", "province", "region"],
    labelContains: ["state", "province"],
    priority: 9,
  }),
  rule({
    id: "location.zipCode",
    path: "location.zipCode",
    autocomplete: ["postal-code"],
    idNamePatterns: [/zip/i, /postal/i, /postcode/i],
    labelExact: ["zip", "zip code", "postal code", "postcode"],
    labelContains: ["zip code", "postal code"],
    priority: 9,
  }),
  rule({
    id: "location.country",
    path: "location.country",
    autocomplete: ["country", "country-name"],
    idNamePatterns: [/^country$/i, /nation/],
    labelExact: ["country"],
    labelContains: ["country"],
    priority: 9,
  }),
  rule({
    id: "links.linkedIn",
    path: "links.linkedIn",
    idNamePatterns: [/linkedin/i],
    labelExact: ["linkedin", "linkedin profile", "linkedin url"],
    labelContains: ["linkedin"],
    keywords: ["linkedin"],
    priority: 9,
  }),
  rule({
    id: "links.github",
    path: "links.github",
    idNamePatterns: [/github/i, /git[_\s-]?hub/i],
    labelExact: ["github", "github profile", "github url"],
    labelContains: ["github"],
    keywords: ["github"],
    priority: 9,
  }),
  rule({
    id: "links.website",
    path: "links.website",
    autocomplete: ["url"],
    inputTypes: ["url"],
    idNamePatterns: [/website/i, /personal[_\s-]?site/i, /homepage/i],
    labelExact: ["website", "personal website", "homepage"],
    labelContains: ["website", "homepage"],
    keywords: ["website", "homepage"],
    priority: 7,
  }),
  rule({
    id: "links.portfolio",
    path: "links.portfolio",
    idNamePatterns: [/portfolio/i],
    labelExact: ["portfolio", "portfolio url", "portfolio website"],
    labelContains: ["portfolio"],
    keywords: ["portfolio"],
    priority: 8,
  }),
  rule({
    id: "derived.currentTitle",
    path: "derived.currentTitle",
    autocomplete: ["organization-title"],
    idNamePatterns: [/job[_\s-]?title/i, /current[_\s-]?title/i, /^title$/i, /position/i],
    labelExact: ["job title", "current title", "current position", "role"],
    labelContains: ["job title", "current title", "current position"],
    priority: 7,
  }),
  rule({
    id: "derived.currentCompany",
    path: "derived.currentCompany",
    autocomplete: ["organization"],
    idNamePatterns: [/current[_\s-]?company/i, /employer/i, /^company$/i],
    labelExact: ["current company", "company", "employer"],
    labelContains: ["current company", "current employer"],
    priority: 7,
  }),
  rule({
    id: "derived.yearsOfExperience",
    path: "derived.yearsOfExperience",
    idNamePatterns: [/years[_\s-]?of[_\s-]?experience/i, /yoe/i, /experience[_\s-]?years/i],
    labelExact: ["years of experience", "total years of experience"],
    labelContains: ["years of experience"],
    priority: 6,
  }),
  rule({
    id: "derived.expectedSalary",
    path: "derived.expectedSalary",
    idNamePatterns: [/expected[_\s-]?salary/i, /desired[_\s-]?salary/i, /salary[_\s-]?expectation/i],
    labelExact: ["expected salary", "desired salary", "salary expectation"],
    labelContains: ["expected salary", "desired salary", "salary expectation"],
    priority: 6,
  }),
  rule({
    id: "derived.primaryWorkAuth",
    path: "derived.primaryWorkAuth",
    idNamePatterns: [/work[_\s-]?authorization/i, /visa/i, /work[_\s-]?permit/i],
    labelExact: ["work authorization", "work permit", "visa status"],
    labelContains: ["work authorization", "visa status", "work permit"],
    priority: 7,
  }),
  rule({
    id: "availability.startDate",
    path: "availability.startDate",
    idNamePatterns: [/start[_\s-]?date/i, /availability/i, /earliest[_\s-]?start/i],
    labelExact: ["start date", "earliest start date", "when can you start"],
    labelContains: ["start date", "earliest start"],
    priority: 6,
  }),
  rule({
    id: "availability.noticePeriod",
    path: "availability.noticePeriod",
    idNamePatterns: [/notice[_\s-]?period/i],
    labelExact: ["notice period"],
    labelContains: ["notice period"],
    priority: 6,
  }),
];

// ---------- Confidence thresholds ----------

// Below this, we don't trust the rule — the field falls through to AI.
const RULE_CONFIDENCE_FLOOR = 0.3;

// ---------- Resolver ----------

export interface ResolveOptions {
  profileId: string;
  /** Skip cache lookups (forces a fresh resolution). */
  forceFresh?: boolean;
  /** Skip the LLM fallback pass. Useful for tests and offline dev. */
  disableAI?: boolean;
}

export class MappingResolver {
  /**
   * Resolve a FormSnapshot into a MappingSet. Pure except for the cache
   * reads — no DOM access.
   */
  async resolve(
    snapshot: FormSnapshot,
    profile: UserProfile,
    options: ResolveOptions
  ): Promise<MappingSet> {
    // 1. Cache hit — return it intact. The cache already respects TTL.
    if (!options.forceFresh) {
      const cached = await siteCache.get(snapshot.origin, snapshot.formSignature);
      if (cached) return cached;
    }

    // 2. Rules + AnswerBank pass (per-field, synchronous enough).
    const mappings: Record<string, FieldMapping> = {};
    for (const field of snapshot.fields) {
      mappings[field.signature] = await this.resolveField(
        field,
        profile,
        options.profileId
      );
    }

    // 3. LLM fallback: batch every field the rules couldn't place. Essay
    //    fields are intentionally excluded — those route through the
    //    answerQuestion path at plan time, not classifyFields.
    if (!options.disableAI) {
      const unresolved = snapshot.fields.filter(
        (f) =>
          f.fieldKind !== "essay" &&
          mappings[f.signature].source === "ai" &&
          mappings[f.signature].profilePath === null
      );
      if (unresolved.length) {
        await this.classifyWithLLM(unresolved, profile, mappings);
      }
    }

    return {
      formSignature: snapshot.formSignature,
      mappings,
      resolvedAt: Date.now(),
    };
  }

  private async classifyWithLLM(
    fields: FormField[],
    profile: UserProfile,
    mappings: Record<string, FieldMapping>
  ): Promise<void> {
    const requests: FieldClassificationRequest[] = fields.map((f) => ({
      signature: f.signature,
      label: f.labelText || f.ariaLabel || "",
      placeholder: f.placeholder,
      inputType: f.inputType || f.fieldKind,
      options: f.options,
    }));

    try {
      const classified = await llmClient.classifyFields(requests);
      for (const f of fields) {
        const result = classified[f.signature];
        if (!result || !result.profilePath) continue;
        // Sanity check: only accept a classification if the profile has a
        // concrete value at that path. Otherwise we'd plan a fill that
        // skips at plan time anyway.
        const value = readProfilePath(profile, result.profilePath);
        if (value === null) continue;
        mappings[f.signature] = {
          fieldSignature: f.signature,
          profilePath: result.profilePath,
          confidence: result.confidence,
          source: "ai",
        };
      }
    } catch (error) {
      // Missing key is a soft failure — the user hasn't opted in to AI.
      // Other errors we log but don't re-throw: the rules-only mapping
      // is still useful, and the ReviewOverlay will surface the gap.
      if (!(error instanceof LLMNotConfiguredError)) {
        console.warn("[MappingResolver] LLM classification failed", error);
      }
    }
  }

  private async resolveField(
    field: FormField,
    profile: UserProfile,
    profileId: string
  ): Promise<FieldMapping> {
    // Essay fields: short-circuit to the AnswerBank before rules. Rules
    // will never match an open-ended question anyway, and we want the bank
    // hit to count as source "cache" (so the UI doesn't flag it as AI).
    if (field.fieldKind === "essay") {
      const questionText = buildQuestionText(field);
      const banked = await answerBank.find(profileId, questionText);
      if (banked) {
        return {
          fieldSignature: field.signature,
          profilePath: null, // banked answers live outside the profile path space
          confidence: 1,
          source: "cache",
          questionText,
        };
      }
      // Fall through to AI (Task 8). Until wired, return an unresolved
      // mapping so Filler skips it and the overlay can prompt the user.
      return {
        fieldSignature: field.signature,
        profilePath: null,
        confidence: 0,
        source: "ai",
        questionText,
      };
    }

    // Standard field: score every rule and pick the best.
    let best: { rule: Rule; score: number } | null = null;
    for (const r of RULES) {
      const s = r.score(field);
      if (s > 0 && (!best || s > best.score)) {
        best = { rule: r, score: s };
      }
    }

    if (best) {
      const confidence = Math.min(1, best.score / best.rule.maxScore);
      if (confidence >= RULE_CONFIDENCE_FLOOR) {
        // Sanity check: does the profile actually have a value for this
        // path? If not, there's no point claiming a match — mark as
        // no-value so Filler skips.
        const value = readProfilePath(profile, best.rule.path);
        if (value === null) {
          return {
            fieldSignature: field.signature,
            profilePath: null,
            confidence,
            source: "rule",
          };
        }
        return {
          fieldSignature: field.signature,
          profilePath: best.rule.path,
          confidence,
          source: "rule",
        };
      }
    }

    // Fell through to AI layer (Task 8 wires the real call).
    return {
      fieldSignature: field.signature,
      profilePath: null,
      confidence: 0,
      source: "ai",
    };
  }
}

/**
 * Compose the question a field is asking in a form the AnswerBank can hash.
 * Label is most reliable; placeholder is a fallback; nearbyText is last
 * because it can be noisy.
 */
function buildQuestionText(field: FormField): string {
  if (field.labelText) return field.labelText;
  if (field.ariaLabel) return field.ariaLabel;
  if (field.placeholder) return field.placeholder;
  return field.nearbyText.slice(0, 120);
}

export const mappingResolver = new MappingResolver();
