// ============================================================================
// JobMate engine — shared types
// ============================================================================
// Types used across DOMProbe, MappingResolver, Filler, SiteCache, and the
// AI classifier. Keep this module free of runtime logic.
// ============================================================================

import type { UserProfile } from "../models/models";

// ---------- Field discovery (DOMProbe) ----------

/**
 * Semantic kind of a form field, derived from its tag, type, and role.
 * This is deliberately coarser than the HTML type because it drives how the
 * Filler interacts with the element (click vs. set value, match option text,
 * etc.), not how it's styled.
 */
export type FieldKind =
  | "text"
  | "email"
  | "tel"
  | "url"
  | "number"
  | "password"
  | "date"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "file"
  | "custom-dropdown"
  | "contenteditable"
  | "essay" // textarea detected as open-ended question (route to AI)
  | "unknown";

/** Where a field lives in the page's DOM tree. */
export type FieldHost =
  | { kind: "document" }
  | { kind: "shadow"; host: Element }
  | { kind: "iframe"; frame: HTMLIFrameElement };

/** A single form field with enough context to classify and fill it. */
export interface FormField {
  /** The actual DOM element. May live inside a shadow root or iframe. */
  element: HTMLElement;
  /** The document this element belongs to (important for iframe fields). */
  ownerDocument: Document;
  /** Which root the element lives under — drives requery behavior. */
  host: FieldHost;

  tagName: string;
  fieldKind: FieldKind;
  inputType: string;

  name: string;
  id: string;
  autocomplete: string;
  placeholder: string;
  required: boolean;

  labelText: string;
  ariaLabel: string;
  nearbyText: string;

  /** For <select> and radio groups, the option labels. */
  options?: string[];

  /** Rough framework hint derived from element attributes or page globals. */
  framework: "react" | "angular" | "vue" | "svelte" | "none";

  /** A stable selector path used to re-find this element after DOM changes. */
  stablePath: string;

  /**
   * Content-based fingerprint of this field's identity: label + name + id +
   * kind + nearby text. Survives DOM reshuffles because it's semantic.
   */
  signature: string;
}

/** A captured snapshot of all form fields on the page at a moment in time. */
export interface FormSnapshot {
  origin: string;
  pathname: string;
  fields: FormField[];
  /** Hash of the sorted field signatures. Identifies "the same form". */
  formSignature: string;
  capturedAt: number;
}

// ---------- Mapping (MappingResolver) ----------

/**
 * A path into the UserProfile, expressed as a dot-notation string.
 * e.g. "identity.firstName", "links.linkedIn", "work[0].jobTitle",
 *      "compensation.expectedMax", "customAnswers[<signature>]".
 */
export type ProfilePath = string;

/** How a mapping was resolved. */
export type MappingSource =
  | "cache" // SiteCache hit
  | "rule" // local rule engine
  | "ai" // LLM classifier
  | "user"; // user taught us manually

export interface FieldMapping {
  fieldSignature: string;
  profilePath: ProfilePath | null; // null = "no good match, skip"
  confidence: number; // 0–1
  source: MappingSource;
  /**
   * For custom questions routed to the AnswerBank/AI, the text of the
   * question that was asked (helps debugging + user review).
   */
  questionText?: string;
}

export interface MappingSet {
  formSignature: string;
  mappings: Record<string, FieldMapping>; // keyed by field signature
  resolvedAt: number;
}

// ---------- Fill plan (Filler) ----------

export interface PlannedFill {
  field: FormField;
  mapping: FieldMapping;
  /** The actual string/value to write, after reading it out of the profile. */
  value: string;
  /** If the mapping produced no value (empty profile field), we skip. */
  skip: boolean;
  /** Reason for skip, or a warning to surface in the review overlay. */
  note?: string;
}

export interface FillPlan {
  snapshot: FormSnapshot;
  fills: PlannedFill[];
  profile: UserProfile;
}

export interface FillOutcome {
  field: FormField;
  success: boolean;
  method: "native-setter" | "select-option" | "click-option" | "file-drop" | "skipped" | "failed";
  error?: string;
}

export interface FillResult {
  attempted: number;
  succeeded: number;
  outcomes: FillOutcome[];
}
