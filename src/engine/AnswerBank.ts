// ============================================================================
// AnswerBank — remembers answers to open-ended questions
// ============================================================================
// When MappingResolver sees an "essay" field ("Why do you want to work here?",
// "Describe a time you showed leadership", salary preference narratives, etc.)
// it shouldn't hit the LLM every single time. The AnswerBank gives us a
// persistent Q&A cache keyed by a normalized question hash, so repeat visits
// to the same ATS reuse the user's previous (possibly AI-generated, possibly
// user-edited) answer.
//
// Relationship to UserProfile.customAnswers:
//   - UserProfile.customAnswers is part of the profile the user manages in
//     the dashboard: curated, named, meant to be portable across profiles.
//   - AnswerBank is the runtime cache the resolver writes to. The two feed
//     each other: resolver reads both, and the ReviewOverlay lets the user
//     promote a bank answer to a profile customAnswer when it's something
//     they'd want to reuse.
//
// Storage shape (under "jobmate.answerBank"):
//
//   {
//     version: 1,
//     answers: {
//       "<questionHash>": {
//         questionText: "...",
//         answer: "...",
//         source: "ai" | "user",
//         profileId: "default",
//         createdAt: 1234,
//         updatedAt: 1234,
//         usageCount: 3
//       }
//     }
//   }
// ============================================================================

import { hashString, normalizeForHash } from "./hash";
import { kvGet, kvRemove, kvSet } from "./kvStorage";

const STORAGE_KEY = "jobmate.answerBank";
const ANSWER_BANK_SCHEMA_VERSION = 1;

export type AnswerSource = "ai" | "user";

export interface BankedAnswer {
  questionHash: string;
  questionText: string;
  answer: string;
  source: AnswerSource;
  /** Scope answers to a profile so work/personal personas don't bleed. */
  profileId: string;
  createdAt: number;
  updatedAt: number;
  /** Incremented every time the resolver reuses this entry. */
  usageCount: number;
}

interface AnswerBankFile {
  version: number;
  answers: Record<string, BankedAnswer>;
}

function emptyFile(): AnswerBankFile {
  return { version: ANSWER_BANK_SCHEMA_VERSION, answers: {} };
}

/**
 * Hash a question the same way across reads and writes. Normalizes
 * whitespace, punctuation, and case so "Why do you want to work here?" and
 * "why do you want to work here" collapse to the same bucket.
 */
export function hashQuestion(questionText: string): string {
  return hashString(normalizeForHash(questionText));
}

class AnswerBank {
  private cache: AnswerBankFile | null = null;
  private initPromise: Promise<void> | null = null;

  private async ensureInit(): Promise<void> {
    if (this.cache) return;
    if (!this.initPromise) {
      this.initPromise = (async () => {
        const stored = await kvGet<AnswerBankFile>(STORAGE_KEY);
        if (stored && stored.version === ANSWER_BANK_SCHEMA_VERSION) {
          this.cache = stored;
        } else {
          this.cache = emptyFile();
        }
      })();
    }
    await this.initPromise;
  }

  private async commit(): Promise<void> {
    if (!this.cache) return;
    await kvSet(STORAGE_KEY, this.cache);
  }

  private bucketKey(profileId: string, questionHash: string): string {
    return `${profileId}::${questionHash}`;
  }

  /**
   * Look up a previously banked answer for a question. Returns null on miss.
   * Increments usageCount on hit so Settings can show the user their
   * most-reused answers.
   */
  async find(profileId: string, questionText: string): Promise<BankedAnswer | null> {
    await this.ensureInit();
    const hash = hashQuestion(questionText);
    const key = this.bucketKey(profileId, hash);
    const entry = this.cache!.answers[key];
    if (!entry) return null;

    // Update usage stats without blocking the read path.
    entry.usageCount += 1;
    entry.updatedAt = Date.now();
    void this.commit();
    return entry;
  }

  /**
   * Store an answer. If one already exists for the same (profileId, hash)
   * it's overwritten — the caller is expected to decide whether a new AI
   * response is better than the banked one before calling put(). Source
   * "user" overrides "ai" regardless; we do not let an AI response clobber
   * a user-edited answer.
   */
  async put(
    profileId: string,
    questionText: string,
    answer: string,
    source: AnswerSource
  ): Promise<void> {
    await this.ensureInit();
    const hash = hashQuestion(questionText);
    const key = this.bucketKey(profileId, hash);
    const existing = this.cache!.answers[key];

    if (existing && existing.source === "user" && source === "ai") {
      // Refuse to overwrite a user-written answer with an AI guess.
      return;
    }

    const now = Date.now();
    this.cache!.answers[key] = {
      questionHash: hash,
      questionText,
      answer,
      source,
      profileId,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      usageCount: existing?.usageCount ?? 0,
    };
    await this.commit();
  }

  /** Remove a single answer. */
  async remove(profileId: string, questionText: string): Promise<void> {
    await this.ensureInit();
    const key = this.bucketKey(profileId, hashQuestion(questionText));
    if (this.cache!.answers[key]) {
      delete this.cache!.answers[key];
      await this.commit();
    }
  }

  /** Drop every answer for a given profile (e.g., when the profile is deleted). */
  async clearProfile(profileId: string): Promise<void> {
    await this.ensureInit();
    const prefix = `${profileId}::`;
    let changed = false;
    for (const key of Object.keys(this.cache!.answers)) {
      if (key.startsWith(prefix)) {
        delete this.cache!.answers[key];
        changed = true;
      }
    }
    if (changed) await this.commit();
  }

  /** Nuke everything. Exposed for "Clear saved answers" in Settings. */
  async clearAll(): Promise<void> {
    this.cache = emptyFile();
    await kvRemove(STORAGE_KEY);
  }

  /** List all answers for a profile — used by the Settings UI. */
  async listForProfile(profileId: string): Promise<BankedAnswer[]> {
    await this.ensureInit();
    const prefix = `${profileId}::`;
    return Object.entries(this.cache!.answers)
      .filter(([key]) => key.startsWith(prefix))
      .map(([, value]) => value)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }
}

export const answerBank = new AnswerBank();
