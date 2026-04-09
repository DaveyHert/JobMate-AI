// ============================================================================
// LLMClient — thin wrapper around the Anthropic Messages API
// ============================================================================
// Responsibilities:
//   - Read the user's BYOK API key from JobMate settings
//   - Call Claude for the three AI features we actually need:
//       1. classifyFields  — which ProfilePath does an unresolved field map to?
//       2. answerQuestion  — generate a tailored answer to an open-ended field
//       3. generateCoverLetter / analyzeJobFit — the existing UI features
//
// Why BYOK: Chrome extensions are client-side code. Any bundled secret is
// effectively public. The user brings their own key, we store it in
// chrome.storage.local, and every call goes direct from their browser to
// api.anthropic.com.
//
// The "anthropic-dangerous-direct-browser-access" header is required to
// allow calls from a browser origin. Anthropic flags this as "dangerous"
// because in a typical web app it exposes your key to end users — but in
// an extension where the end user IS the key owner, that tradeoff is the
// whole point of BYOK.
// ============================================================================

import type { UserProfile } from "../models/models";
import { jobMateStore } from "../store/jobMateStore";
import { ALL_PROFILE_PATHS, type KnownProfilePath } from "./profilePaths";
import type { FormField } from "./types";

const DEFAULT_MODEL = "claude-sonnet-4-6";
const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_VERSION = "2023-06-01";

export class LLMNotConfiguredError extends Error {
  constructor() {
    super("Anthropic API key not configured. Add one in Settings.");
    this.name = "LLMNotConfiguredError";
  }
}

export class LLMRequestError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = "LLMRequestError";
  }
}

// ---------- Response shapes ----------

interface AnthropicContentBlock {
  type: string;
  text?: string;
}

interface AnthropicResponse {
  content: AnthropicContentBlock[];
  stop_reason?: string;
  usage?: { input_tokens: number; output_tokens: number };
}

interface MessageRequest {
  system: string;
  userPrompt: string;
  maxTokens: number;
  temperature?: number;
}

// ---------- Public feature types ----------

export interface FieldClassificationRequest {
  signature: string;
  label: string;
  placeholder: string;
  inputType: string;
  options?: string[];
}

export type FieldClassificationResult = Record<
  string,
  { profilePath: KnownProfilePath | null; confidence: number }
>;

export interface JobFitAnalysis {
  score: number; // 0-100
  summary: string;
  strengths: string[];
  gaps: string[];
}

// ---------- Client ----------

class LLMClient {
  // ---- Low-level ----

  private async getConfig(): Promise<{ apiKey: string; model: string }> {
    const settings = await jobMateStore.getSettings();
    const apiKey = settings.anthropicApiKey?.trim();
    if (!apiKey) throw new LLMNotConfiguredError();
    return {
      apiKey,
      model: settings.anthropicModel?.trim() || DEFAULT_MODEL,
    };
  }

  private async callMessages(req: MessageRequest): Promise<string> {
    const { apiKey, model } = await this.getConfig();
    const response = await fetch(ANTHROPIC_MESSAGES_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model,
        max_tokens: req.maxTokens,
        temperature: req.temperature ?? 0.2,
        system: req.system,
        messages: [{ role: "user", content: req.userPrompt }],
      }),
    });

    if (!response.ok) {
      const bodyText = await response.text().catch(() => "");
      throw new LLMRequestError(
        `Anthropic API error ${response.status}: ${bodyText.slice(0, 200)}`,
        response.status
      );
    }

    const data: AnthropicResponse = await response.json();
    const text = data.content
      .filter((block) => block.type === "text" && typeof block.text === "string")
      .map((block) => block.text!)
      .join("");
    if (!text) throw new LLMRequestError("Empty response from Anthropic");
    return text;
  }

  // ---- Feature: classify fields ----
  //
  // Takes a batch of unresolved fields and asks Claude which profile path
  // each one maps to. Batching saves tokens and latency — one round-trip
  // instead of one per field.

  async classifyFields(
    fields: FieldClassificationRequest[]
  ): Promise<FieldClassificationResult> {
    if (!fields.length) return {};

    const pathList = ALL_PROFILE_PATHS.map((p) => `  - ${p}`).join("\n");
    const fieldList = fields
      .map((f, i) =>
        [
          `Field ${i} (signature: ${f.signature}):`,
          `  label: ${JSON.stringify(f.label)}`,
          `  placeholder: ${JSON.stringify(f.placeholder)}`,
          `  inputType: ${f.inputType}`,
          f.options?.length ? `  options: ${JSON.stringify(f.options)}` : "",
        ]
          .filter(Boolean)
          .join("\n")
      )
      .join("\n\n");

    const system = [
      "You map job-application form fields to a user's profile schema.",
      "You will receive a list of fields. For each field, return the best",
      "matching profile path from the allowed list, or null if nothing fits.",
      "Respond ONLY with JSON. No prose, no markdown fences.",
      "",
      "Allowed profile paths:",
      pathList,
    ].join("\n");

    const userPrompt = [
      "Map each field to a profile path. Return a JSON object keyed by",
      'the field signature, with values of shape { "profilePath": string | null, "confidence": number }.',
      "Confidence is 0-1. Use null when no path fits or confidence < 0.5.",
      "",
      "Fields:",
      fieldList,
    ].join("\n");

    const text = await this.callMessages({
      system,
      userPrompt,
      maxTokens: 1500,
      temperature: 0,
    });

    const parsed = safeParseJSON<FieldClassificationResult>(text);
    if (!parsed) {
      throw new LLMRequestError("Could not parse classifier response as JSON");
    }

    // Defensive filter: drop entries whose path isn't in the allowed list.
    const allowed = new Set<string>(ALL_PROFILE_PATHS);
    const cleaned: FieldClassificationResult = {};
    for (const [sig, value] of Object.entries(parsed)) {
      if (!value || typeof value !== "object") continue;
      const path = value.profilePath;
      if (path === null || (typeof path === "string" && allowed.has(path))) {
        cleaned[sig] = {
          profilePath: path as KnownProfilePath | null,
          confidence: Math.max(0, Math.min(1, Number(value.confidence) || 0)),
        };
      }
    }
    return cleaned;
  }

  // ---- Feature: answer an open-ended question ----

  async answerQuestion(
    field: FormField,
    profile: UserProfile,
    jobContext?: string
  ): Promise<string> {
    const question =
      field.labelText || field.ariaLabel || field.placeholder || field.nearbyText;
    if (!question) {
      throw new LLMRequestError("No question text found on essay field");
    }

    const system = [
      "You help a job applicant answer open-ended application questions.",
      "Write in the applicant's voice: first person, concise, specific,",
      "grounded in the provided profile. Do not fabricate experience.",
      "Avoid clichés (\"passionate\", \"team player\", \"rockstar\").",
      "Length: 80-180 words unless the question asks for something shorter.",
    ].join(" ");

    const userPrompt = [
      "Applicant profile (JSON):",
      JSON.stringify(summarizeProfile(profile), null, 2),
      jobContext ? `\nJob context:\n${jobContext}` : "",
      `\nQuestion:\n${question}`,
      "\nWrite the answer. No preamble, no markdown.",
    ].join("\n");

    const text = await this.callMessages({
      system,
      userPrompt,
      maxTokens: 700,
      temperature: 0.6,
    });
    return text.trim();
  }

  // ---- Feature: cover letter ----

  async generateCoverLetter(
    jobDescription: string,
    profile: UserProfile
  ): Promise<string> {
    const system = [
      "You write personalized cover letters for job applicants.",
      "Rules: first person, 3-4 short paragraphs, specific achievements",
      "pulled from the profile, no generic filler. Don't invent roles or",
      "metrics. Match the tone of the job description.",
    ].join(" ");

    const userPrompt = [
      "Applicant profile (JSON):",
      JSON.stringify(summarizeProfile(profile), null, 2),
      "\nJob description:",
      jobDescription,
      "\nWrite the cover letter. Plain text, no markdown, no salutation block.",
    ].join("\n");

    const text = await this.callMessages({
      system,
      userPrompt,
      maxTokens: 1000,
      temperature: 0.5,
    });
    return text.trim();
  }

  // ---- Feature: job fit analysis ----

  async analyzeJobFit(
    jobDescription: string,
    profile: UserProfile
  ): Promise<JobFitAnalysis> {
    const system = [
      "You analyze how well a candidate matches a job description.",
      "Be honest — do not inflate scores. Respond ONLY with JSON in the",
      'shape: { "score": number, "summary": string, "strengths": string[], "gaps": string[] }.',
      "Score is 0-100. Strengths and gaps are short phrases (max 5 of each).",
    ].join(" ");

    const userPrompt = [
      "Applicant profile (JSON):",
      JSON.stringify(summarizeProfile(profile), null, 2),
      "\nJob description:",
      jobDescription,
    ].join("\n");

    const text = await this.callMessages({
      system,
      userPrompt,
      maxTokens: 800,
      temperature: 0.2,
    });
    const parsed = safeParseJSON<JobFitAnalysis>(text);
    if (!parsed || typeof parsed.score !== "number") {
      throw new LLMRequestError("Could not parse job fit analysis");
    }
    return {
      score: Math.max(0, Math.min(100, Math.round(parsed.score))),
      summary: String(parsed.summary ?? ""),
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.map(String) : [],
      gaps: Array.isArray(parsed.gaps) ? parsed.gaps.map(String) : [],
    };
  }
}

// ---------- Helpers ----------

/**
 * Compact the profile before sending to Claude. We send only the fields
 * likely to inform answers — dropping raw IDs and timestamps reduces tokens
 * and avoids leaking anything the model doesn't need.
 */
function summarizeProfile(profile: UserProfile): Record<string, unknown> {
  return {
    name: profile.identity.fullName,
    email: profile.identity.email,
    location: `${profile.location.city}, ${profile.location.country}`,
    workAuthorization: profile.authorization,
    skills: profile.skills,
    work: profile.work.map((w) => ({
      title: w.jobTitle,
      company: w.company,
      start: w.startDate,
      end: w.isCurrent ? "present" : w.endDate,
      responsibilities: w.responsibilities,
      technologies: w.technologies,
    })),
    education: profile.education.map((e) => ({
      school: e.school,
      degree: e.degree,
      field: e.fieldOfStudy,
    })),
    compensation: profile.compensation,
    links: profile.links,
  };
}

/**
 * Extract a JSON object from a model response. Claude sometimes wraps
 * structured output in ```json fences despite instructions; we strip those
 * before parsing.
 */
function safeParseJSON<T>(text: string): T | null {
  let trimmed = text.trim();
  // Strip ```json ... ``` fences if present.
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenceMatch) trimmed = fenceMatch[1].trim();
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    // Last-ditch: extract the first {...} block.
    const brace = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (brace >= 0 && end > brace) {
      try {
        return JSON.parse(trimmed.slice(brace, end + 1)) as T;
      } catch {
        return null;
      }
    }
    return null;
  }
}

export const llmClient = new LLMClient();
