// ============================================================================
// JobMate AI+ — Canonical data model
// ============================================================================
// Single source of truth for UserProfile, Application, and related types.
// Do NOT define these shapes anywhere else in the codebase.
// ============================================================================

// ---------- Applications ----------

export interface Application {
  id: number;
  title: string;
  company: string;
  url?: string;
  source: string;
  status: ApplicationStatus;
  dateApplied: string; // ISO timestamp
  history?: StatusEventLog[];
  notes?: string;
  jobType?: JobType;
  jobBrief?: string;
  profileId?: string; // which profile was used
}

export type ApplicationStatus =
  | "applied"
  | "interviewing"
  | "rejected"
  | "offer"
  | "ghosted"
  | "withdrawn";

export interface StatusEventLog {
  status: ApplicationStatus;
  date: string; // ISO timestamp of the change
}
// History is append-only: every status change pushes a new {status, date}.
// We never delete events so historical analytics stay intact.

export type JobType = "fulltime" | "contract" | "gig" | "parttime" | "internship";

export interface WeeklyGoal {
  current: number;
  target: number;
}

// ---------- User Profile ----------

export interface UserProfile {
  id: string;
  label: string; // "Frontend Engineer", "Product Designer", etc.
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  identity: Identity;
  location: Location;
  links: Links;
  work: WorkExperience[]; // ordered, most recent first
  education: Education[];
  skills: string[];
  compensation: Compensation;
  authorization: WorkAuthorization;
  availability: Availability;
  demographics?: Demographics; // optional EEO data — user controls
  documents: Documents;
  credentials: Credential[]; // non-academic certifications, licenses, awards
  customAnswers: CustomAnswer[]; // free-form Q&A bank, grows over time
}

export interface Identity {
  firstName: string;
  lastName: string;
  fullName: string;
  preferredName?: string;
  pronouns?: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  profilePictureUrl?: string; // data URL or remote URL
}

export interface Location {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  countryCode: string; // ISO 3166-1 alpha-2, e.g. "US", "NG", "GB"
  willingToRelocate: boolean;
  preferredLocations: string[];
  remotePreference: "remote" | "hybrid" | "onsite" | "flexible";
}

export interface Links {
  linkedIn?: string;
  github?: string;
  website?: string;
  portfolio?: string;
  twitter?: string;
  custom: { label: string; url: string }[];
}

export interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  location?: string;
  startDate: string; // "YYYY-MM" or ISO date
  endDate?: string; // omit if isCurrent
  isCurrent: boolean;
  responsibilities: string[];
  technologies?: string[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  gpa?: string;
}

export interface Compensation {
  currency: string; // ISO 4217, e.g. "USD", "NGN"
  currentSalary?: number;
  expectedMin?: number;
  expectedMax?: number;
  negotiable: boolean;
}

export type WorkAuthStatus =
  | "citizen"
  | "permanent-resident"
  | "work-visa"
  | "needs-sponsorship"
  | "not-authorized";

// Per-country work authorization, keyed by ISO country code.
// e.g. { "US": "needs-sponsorship", "GB": "citizen" }
export type WorkAuthorization = Record<string, WorkAuthStatus>;

export interface Availability {
  startDate?: string; // ISO date or keyword like "immediately"
  noticePeriod?: string; // e.g. "2 weeks"
}

export interface Demographics {
  gender?: string;
  ethnicity?: string;
  veteranStatus?: string;
  disabilityStatus?: string;
  // All optional — EEO questions are never required by the engine.
}

export interface ResumeDoc {
  id: string;
  label: string; // user-assigned label, e.g. "Frontend", "PM"
  fileName: string;
  fileUrl: string; // data URL (localhost mode) or remote URL
  mimeType: string; // "application/pdf", "image/jpeg", "image/png"
  sizeBytes: number;
  uploadedAt: string; // ISO timestamp
  isDefault?: boolean;
}

export interface Documents {
  resumes: ResumeDoc[]; // multi-resume library
  // Legacy single-file fields kept for back-compat until UI migration lands.
  resumeUrl?: string;
  resumeFileName?: string;
  coverLetterUrl?: string;
  coverLetterFileName?: string;
}

export interface Credential {
  id: string;
  type: "certification" | "license" | "award" | "other";
  name: string; // e.g. "AWS Solutions Architect"
  issuer: string; // e.g. "Amazon Web Services"
  issueDate?: string; // "YYYY-MM" or ISO date
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface CustomAnswer {
  id: string;
  questionSignature: string; // hash of normalized question text + context
  questionText: string; // original question as shown to user
  answer: string;
  tags?: string[]; // e.g. ["why-company", "strengths"]
  lastUsed?: string; // ISO date
  useCount: number;
}

// ---------- Storage-level shape ----------
// Everything JobMate persists to chrome.storage.local lives under the
// `jobMateData` key, shaped like this. One canonical envelope.

export interface JobMateData {
  version: number; // schema version for migrations
  activeProfileId: string;
  profiles: Record<string, UserProfile>;
  applications: Application[];
  weeklyGoal: WeeklyGoal;
  settings: JobMateSettings;
}

export type CoverLetterTone =
  | "professional"
  | "friendly"
  | "enthusiastic"
  | "concise";

export interface JobMateSettings {
  theme: "light" | "dark" | "system";
  autoFillEnabled: boolean;
  notifications: boolean;
  weeklyGoalReminders: boolean;
  requireReviewBeforeFill: boolean; // non-negotiable default: true

  // AI preferences (surfaced in Settings → General)
  coverLetterTone: CoverLetterTone;
  resumeTweaksEnabled: boolean; // allow AI to suggest per-job resume tweaks
  minimumMatchScore: number; // 0-100; only autofill jobs at/above this score

  // Privacy & data (surfaced in Settings → Privacy & data)
  allowDataSharing: boolean; // anonymized product analytics
  personalizedExperience: boolean; // use history to tailor suggestions
  loginAlerts: boolean;
  emailNotifications: boolean;

  // Integrations
  linkedInConnected: boolean;

  // Developer / debugging
  highlightFormFields: boolean; // draw outlines on detected fields on page load

  // --- Deferred (SaaS pivot) ----------------------------------------------
  // Left in the schema so LLMClient keeps compiling until we swap it for an
  // AIClient that calls a backend proxy. Not surfaced in the Settings UI.
  anthropicApiKey?: string;
  anthropicModel?: string;
}

export const CURRENT_SCHEMA_VERSION = 1;

// ---------- UI-only view models ----------

export interface PopupData {
  applications: Application[];
  weeklyGoal: WeeklyGoal;
  currentProfile: string;
}

export interface WeeklyPercentageChange {
  applied: number | null;
  interviews: number | null;
  companies: number | null;
}

export interface WeeklyLastWeek {
  applied: number;
  interviews: number;
  companies: number;
}

export interface WeeklyChange {
  applied: number;
  interviews: number;
  companies: number;
  responseRate: number;
  lastWeek: WeeklyLastWeek;
  percentageChange: WeeklyPercentageChange;
}

export interface DashboardStats {
  totalApplied: number;
  totalInterviews: number;
  totalCompanies: number;
  responseRate: number;
  weeklyChange: WeeklyChange;
}
