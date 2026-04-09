// ============================================================================
// profilePaths — resolve dot-notation paths into UserProfile values
// ============================================================================
// A ProfilePath is a dot-notation string like "identity.firstName" or
// "work[0].jobTitle". Mappings use these strings as a stable, serializable
// reference to a piece of the profile so SiteCache entries survive profile
// shape edits without storing actual values.
//
// This module does two jobs:
//   1. readProfilePath(profile, path) — pull the concrete string value.
//   2. A set of well-known paths + helpers for computing derived values
//      (full name, expected salary display, years of experience, etc.).
//
// Derived paths use the prefix "derived.". They are not real fields on
// UserProfile — the resolver just recognizes them and computes the value
// from multiple source fields.
// ============================================================================

import type { UserProfile, WorkExperience } from "../models/models";

// ---------- Raw path reader ----------

/**
 * Read a value out of a UserProfile by dot-notation path. Returns null if
 * the path is missing or resolves to an empty string/undefined.
 *
 * Supports:
 *   - "identity.firstName"
 *   - "links.linkedIn"
 *   - "work[0].jobTitle"
 *   - "authorization.US"
 *   - "derived.currentTitle" (see derived paths below)
 */
export function readProfilePath(
  profile: UserProfile,
  path: string
): string | null {
  if (path.startsWith("derived.")) {
    return readDerivedPath(profile, path.slice("derived.".length));
  }

  // Tokenize: split on "." but respect "[n]" array indexing.
  // "work[0].jobTitle" → ["work", 0, "jobTitle"]
  const tokens: Array<string | number> = [];
  for (const segment of path.split(".")) {
    const match = segment.match(/^([a-zA-Z_$][\w$]*)(?:\[(\d+)\])?$/);
    if (!match) return null;
    tokens.push(match[1]);
    if (match[2] !== undefined) tokens.push(Number(match[2]));
  }

  let cursor: unknown = profile;
  for (const token of tokens) {
    if (cursor == null) return null;
    if (typeof token === "number") {
      if (!Array.isArray(cursor)) return null;
      cursor = cursor[token];
    } else {
      cursor = (cursor as Record<string, unknown>)[token];
    }
  }

  if (cursor == null) return null;
  if (typeof cursor === "string") return cursor.trim() || null;
  if (typeof cursor === "number") return String(cursor);
  if (typeof cursor === "boolean") return cursor ? "true" : "false";
  return null;
}

// ---------- Derived paths ----------
//
// The resolver can map a field to a "derived." path when the value comes
// from computed state rather than a raw profile field.

function currentRole(profile: UserProfile): WorkExperience | undefined {
  return profile.work.find((w) => w.isCurrent) ?? profile.work[0];
}

function readDerivedPath(profile: UserProfile, subpath: string): string | null {
  switch (subpath) {
    case "currentTitle":
      return currentRole(profile)?.jobTitle ?? null;
    case "currentCompany":
      return currentRole(profile)?.company ?? null;
    case "yearsOfExperience": {
      if (!profile.work.length) return null;
      // Simple heuristic: count distinct roles. A real implementation
      // should sum durations, but that requires parsing date strings we
      // haven't standardized yet.
      return `${profile.work.length}`;
    }
    case "expectedSalary": {
      const c = profile.compensation;
      if (c.expectedMax != null) return `${c.currency} ${c.expectedMax}`;
      if (c.expectedMin != null) return `${c.currency} ${c.expectedMin}`;
      return null;
    }
    case "expectedSalaryNumber": {
      const c = profile.compensation;
      if (c.expectedMax != null) return String(c.expectedMax);
      if (c.expectedMin != null) return String(c.expectedMin);
      return null;
    }
    case "primaryWorkAuth": {
      // Prefer the user's country if we can match it, otherwise any entry.
      const code = profile.location.countryCode;
      if (code && profile.authorization[code]) {
        return profile.authorization[code];
      }
      const first = Object.values(profile.authorization)[0];
      return first ?? null;
    }
    case "skillsCSV":
      return profile.skills.length ? profile.skills.join(", ") : null;
    case "resumeUrl":
      return profile.documents.resumeUrl ?? null;
    case "coverLetterUrl":
      return profile.documents.coverLetterUrl ?? null;
    case "linkedInHandle": {
      const url = profile.links.linkedIn;
      if (!url) return null;
      // "https://linkedin.com/in/daveyhert/" → "daveyhert"
      const match = url.match(/linkedin\.com\/in\/([^/?#]+)/i);
      return match?.[1] ?? url;
    }
    default:
      return null;
  }
}

// ---------- Path catalog ----------
//
// Every path the rule engine and LLM classifier are allowed to produce.
// Kept here as a single list so the LLM prompt, the UI review screen, and
// the resolver all agree on the universe of valid paths.

export const ALL_PROFILE_PATHS = [
  // identity
  "identity.firstName",
  "identity.lastName",
  "identity.fullName",
  "identity.preferredName",
  "identity.pronouns",
  "identity.email",
  "identity.phone",
  "identity.dateOfBirth",
  // location
  "location.address",
  "location.city",
  "location.state",
  "location.zipCode",
  "location.country",
  "location.countryCode",
  // links
  "links.linkedIn",
  "links.github",
  "links.website",
  "links.portfolio",
  "links.twitter",
  // compensation
  "compensation.currentSalary",
  "compensation.expectedMin",
  "compensation.expectedMax",
  "compensation.currency",
  // availability
  "availability.startDate",
  "availability.noticePeriod",
  // demographics (optional, EEO)
  "demographics.gender",
  "demographics.ethnicity",
  "demographics.veteranStatus",
  "demographics.disabilityStatus",
  // derived
  "derived.currentTitle",
  "derived.currentCompany",
  "derived.yearsOfExperience",
  "derived.expectedSalary",
  "derived.expectedSalaryNumber",
  "derived.primaryWorkAuth",
  "derived.skillsCSV",
  "derived.resumeUrl",
  "derived.coverLetterUrl",
  "derived.linkedInHandle",
] as const;

export type KnownProfilePath = (typeof ALL_PROFILE_PATHS)[number];
