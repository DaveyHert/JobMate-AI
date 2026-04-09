// ============================================================================
// Planner — turns a MappingSet into a concrete FillPlan
// ============================================================================
// The resolver tells us "this field maps to identity.firstName". The planner
// reads the user's actual first name out of the profile, decides whether the
// fill should actually happen (empty values get skipped, not written as
// blanks), and bundles it into the shape the Filler consumes.
//
// Split from MappingResolver on purpose: the resolver is pure given the
// snapshot + profile, and expensive (SiteCache + LLM calls). The planner is
// cheap and branches on profile values. Keeping them separate lets the
// ReviewOverlay edit a value in the plan without re-running classification.
// ============================================================================

import type { UserProfile } from "../models/models";
import { answerBank } from "./AnswerBank";
import { llmClient, LLMNotConfiguredError } from "./LLMClient";
import { readProfilePath } from "./profilePaths";
import type {
  FieldMapping,
  FillPlan,
  FormField,
  FormSnapshot,
  MappingSet,
  PlannedFill,
} from "./types";

export interface PlanOptions {
  /** When true, skip calling the LLM to generate essay answers. */
  disableAI?: boolean;
  /** Optional job description to ground essay answers against. */
  jobContext?: string;
}

export class Planner {
  /**
   * Build a FillPlan from a snapshot, its resolved MappingSet, and the
   * active profile. Fills come out in snapshot order so the Filler walks
   * fields top-to-bottom on the page.
   */
  async plan(
    snapshot: FormSnapshot,
    mappingSet: MappingSet,
    profile: UserProfile,
    profileId: string,
    options: PlanOptions = {}
  ): Promise<FillPlan> {
    const fills: PlannedFill[] = [];

    for (const field of snapshot.fields) {
      const mapping = mappingSet.mappings[field.signature];
      fills.push(await this.planField(field, mapping, profile, profileId, options));
    }

    return { snapshot, fills, profile };
  }

  private async planField(
    field: FormField,
    mapping: FieldMapping | undefined,
    profile: UserProfile,
    profileId: string,
    options: PlanOptions
  ): Promise<PlannedFill> {
    // No mapping at all — the resolver couldn't place this field.
    if (!mapping) {
      return {
        field,
        mapping: unresolvedMapping(field.signature),
        value: "",
        skip: true,
        note: "No mapping resolved for this field",
      };
    }

    // Essay fields: prefer a banked answer, otherwise ask the LLM and bank
    // the result so the next visit is a straight cache hit.
    if (field.fieldKind === "essay") {
      const questionText = mapping.questionText ?? field.labelText;
      if (!questionText) {
        return {
          field,
          mapping,
          value: "",
          skip: true,
          note: "Essay field missing question text",
        };
      }
      const banked = await answerBank.find(profileId, questionText);
      if (banked) {
        return { field, mapping, value: banked.answer, skip: false };
      }
      if (options.disableAI) {
        return {
          field,
          mapping,
          value: "",
          skip: true,
          note: "Needs review — no banked answer yet",
        };
      }
      try {
        const answer = await llmClient.answerQuestion(
          field,
          profile,
          options.jobContext
        );
        // Source "ai" so a later user edit in the overlay is allowed to
        // overwrite it. The overlay will re-bank with source "user".
        await answerBank.put(profileId, questionText, answer, "ai");
        return {
          field,
          mapping,
          value: answer,
          skip: false,
          note: "AI-generated — review before submitting",
        };
      } catch (error) {
        const message =
          error instanceof LLMNotConfiguredError
            ? "AI disabled — add your Anthropic API key in Settings"
            : error instanceof Error
              ? error.message
              : "AI error";
        return {
          field,
          mapping,
          value: "",
          skip: true,
          note: message,
        };
      }
    }

    // Standard field: the mapping has a path, resolve it against the profile.
    if (!mapping.profilePath) {
      return {
        field,
        mapping,
        value: "",
        skip: true,
        note: mapping.confidence === 0
          ? "Resolver deferred to AI (not wired yet)"
          : "Profile has no value for this field",
      };
    }

    const value = readProfilePath(profile, mapping.profilePath);
    if (value === null || value === "") {
      return {
        field,
        mapping,
        value: "",
        skip: true,
        note: `Profile field "${mapping.profilePath}" is empty`,
      };
    }

    return {
      field,
      mapping,
      value,
      skip: false,
    };
  }
}

function unresolvedMapping(signature: string): FieldMapping {
  return {
    fieldSignature: signature,
    profilePath: null,
    confidence: 0,
    source: "rule",
  };
}

export const planner = new Planner();
