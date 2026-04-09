// ============================================================================
// Orchestrator — the top-level entry the content script calls
// ============================================================================
// One function, six layers. This is where the architecture earns its keep:
//
//   1. DOMProbe      → FormSnapshot
//   2. MappingResolver → MappingSet (cache → rules → LLM)
//   3. Planner       → FillPlan (resolves paths, asks LLM for essays)
//   4. ReviewOverlay → user confirms/edits/skips
//   5. Filler        → actual DOM writes
//   6. SiteCache     → persist the final mapping for next time
//
// Importantly, we persist the cache AFTER the user confirms — that way a
// cancelled run doesn't pollute the cache with an un-reviewed mapping, and
// user edits in the overlay get folded into the cached entry as "user"
// source (the highest-trust band).
// ============================================================================

import type { UserProfile } from "../models/models";
import { domProbe } from "./DOMProbe";
import { filler } from "./Filler";
import { mappingResolver } from "./MappingResolver";
import { planner } from "./Planner";
import { reviewOverlay } from "./ReviewOverlay";
import { siteCache } from "./SiteCache";
import { answerBank } from "./AnswerBank";
import type { FieldMapping, FillResult, MappingSet } from "./types";

export interface AutoFillOptions {
  profile: UserProfile;
  profileId: string;
  /** Skip the review overlay. Off by default — matches requireReviewBeforeFill. */
  skipReview?: boolean;
  /** Skip the LLM pass in both resolver and planner. */
  disableAI?: boolean;
  /** Optional job description text to ground essay answers against. */
  jobContext?: string;
}

export interface AutoFillSummary {
  probed: number;
  planned: number;
  reviewed: boolean;
  cancelled: boolean;
  result?: FillResult;
  error?: string;
}

export class Orchestrator {
  async run(options: AutoFillOptions): Promise<AutoFillSummary> {
    const { profile, profileId } = options;

    // 1. Probe
    const snapshot = domProbe.probe();
    if (snapshot.fields.length === 0) {
      return {
        probed: 0,
        planned: 0,
        reviewed: false,
        cancelled: false,
        error: "No form fields detected on this page",
      };
    }

    // 2. Resolve
    const mappingSet = await mappingResolver.resolve(snapshot, profile, {
      profileId,
      disableAI: options.disableAI,
    });

    // 3. Plan
    const plan = await planner.plan(snapshot, mappingSet, profile, profileId, {
      disableAI: options.disableAI,
      jobContext: options.jobContext,
    });

    // 4. Review (unless explicitly skipped)
    let finalPlan = plan;
    let reviewed = false;
    let cancelled = false;
    const editedSignatures = new Set<string>();

    if (!options.skipReview) {
      const review = await reviewOverlay.show({ plan });
      reviewed = true;
      cancelled = review.cancelled;
      finalPlan = review.plan;
      for (const sig of review.editedSignatures) editedSignatures.add(sig);
      if (cancelled) {
        return {
          probed: snapshot.fields.length,
          planned: plan.fills.filter((f) => !f.skip).length,
          reviewed,
          cancelled,
        };
      }
    }

    // 5. Fill
    const result = await filler.apply(finalPlan);

    // 6. Persist learning
    //    - Fold user edits into the MappingSet so the cached entry reflects
    //      the corrected answers.
    //    - Write essay edits back to the AnswerBank with source "user" so
    //      they override any AI-generated version.
    //    - Save the whole mapping set under this form signature.
    const learnedMappingSet = this.applyUserCorrections(
      mappingSet,
      finalPlan,
      editedSignatures
    );
    await siteCache.put(snapshot.origin, learnedMappingSet);

    for (const fill of finalPlan.fills) {
      if (!editedSignatures.has(fill.field.signature)) continue;
      if (fill.field.fieldKind !== "essay") continue;
      const questionText = fill.mapping.questionText ?? fill.field.labelText;
      if (!questionText || !fill.value) continue;
      await answerBank.put(profileId, questionText, fill.value, "user");
    }

    return {
      probed: snapshot.fields.length,
      planned: finalPlan.fills.filter((f) => !f.skip).length,
      reviewed,
      cancelled,
      result,
    };
  }

  /**
   * Promote any fields the user edited in the overlay to source "user" and
   * max confidence. Everything else passes through unchanged.
   */
  private applyUserCorrections(
    mappingSet: MappingSet,
    plan: import("./types").FillPlan,
    edited: Set<string>
  ): MappingSet {
    if (edited.size === 0) return mappingSet;
    const mappings: Record<string, FieldMapping> = { ...mappingSet.mappings };
    for (const fill of plan.fills) {
      if (!edited.has(fill.field.signature)) continue;
      const prior = mappings[fill.field.signature] ?? fill.mapping;
      mappings[fill.field.signature] = {
        ...prior,
        source: "user",
        confidence: 1,
      };
    }
    return {
      ...mappingSet,
      mappings,
      resolvedAt: Date.now(),
    };
  }
}

export const orchestrator = new Orchestrator();
