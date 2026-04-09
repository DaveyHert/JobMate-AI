// ============================================================================
// ReviewOverlay — the user's gate between plan and fill
// ============================================================================
// Fundamental rule of this product: we never auto-submit. We don't even
// auto-fill without consent. Every fill goes through this overlay so the
// user can see what we propose to write, edit any value, and uncheck any
// field they'd rather fill manually.
//
// The overlay:
//   - Mounts into a shadow root attached to document.body so the host
//     page's CSS can't deform it.
//   - Renders one row per PlannedFill, including the ones we're skipping
//     so the user can see why (missing profile value, AI not configured,
//     low-confidence match, etc.).
//   - Captures edits and returns the final FillPlan via a resolved promise.
//   - Calls an onTeach callback when the user changes a field's value —
//     the caller is expected to persist that correction into SiteCache so
//     the next visit to this form is a cache hit.
//
// It deliberately has zero dependency on React: the content script bundle
// should stay small, and the rest of the app's UI lives on popup/dashboard
// anyway. Plain DOM is enough.
// ============================================================================

import type { FillPlan, PlannedFill } from "./types";

export interface ReviewResult {
  /** The finalized plan (same shape, with user edits and skip toggles applied). */
  plan: FillPlan;
  /** True if the user hit Cancel. Filler should not run when this is true. */
  cancelled: boolean;
  /** Signatures of fields whose values were edited by the user. */
  editedSignatures: string[];
}

export interface ReviewOverlayOptions {
  plan: FillPlan;
  /**
   * Called when the user edits a row's value. The caller can use this to
   * teach the SiteCache that (formSignature, fieldSignature) should now
   * resolve to the corrected value / profile path.
   */
  onTeach?: (fill: PlannedFill, newValue: string) => void;
}

// Scoped style — all selectors target elements inside the shadow root, so
// these rules can't leak into the host page.
const STYLE = `
  :host, * { box-sizing: border-box; }
  .backdrop {
    position: fixed; inset: 0;
    background: rgba(15, 23, 42, 0.55);
    z-index: 2147483646;
    display: flex; align-items: center; justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #0f172a;
  }
  .panel {
    background: #fff;
    border-radius: 14px;
    width: min(640px, 92vw);
    max-height: 86vh;
    display: flex; flex-direction: column;
    box-shadow: 0 24px 48px rgba(15, 23, 42, 0.25);
    overflow: hidden;
  }
  header {
    padding: 18px 22px 12px;
    border-bottom: 1px solid #e2e8f0;
  }
  header h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
  header p {
    margin: 4px 0 0;
    font-size: 12px;
    color: #64748b;
  }
  .rows {
    flex: 1;
    overflow-y: auto;
    padding: 8px 22px;
  }
  .row {
    padding: 12px 0;
    border-bottom: 1px solid #f1f5f9;
  }
  .row:last-child { border-bottom: none; }
  .row-head {
    display: flex; align-items: baseline; justify-content: space-between;
    gap: 8px;
  }
  .row-label {
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .row-meta {
    font-size: 11px;
    color: #64748b;
  }
  .badge {
    display: inline-block;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    margin-left: 6px;
  }
  .badge-cache { background: #dcfce7; color: #166534; }
  .badge-rule { background: #dbeafe; color: #1e40af; }
  .badge-ai { background: #ede9fe; color: #5b21b6; }
  .badge-user { background: #fef3c7; color: #92400e; }
  .row-body {
    margin-top: 6px;
    display: flex; gap: 8px; align-items: flex-start;
  }
  .row-body input[type="text"],
  .row-body textarea {
    flex: 1;
    font: inherit;
    font-size: 13px;
    padding: 8px 10px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
    resize: vertical;
    color: #0f172a;
    background: #fff;
  }
  .row-body textarea { min-height: 72px; }
  .row-body input[type="text"]:focus,
  .row-body textarea:focus {
    outline: 2px solid #6366f1;
    outline-offset: 1px;
  }
  .skip-toggle {
    display: flex; align-items: center; gap: 4px;
    font-size: 11px;
    color: #64748b;
    white-space: nowrap;
  }
  .row.skipped .row-body input,
  .row.skipped .row-body textarea {
    background: #f8fafc;
    color: #94a3b8;
  }
  .row-note {
    font-size: 11px;
    color: #b45309;
    margin-top: 4px;
  }
  footer {
    padding: 14px 22px;
    border-top: 1px solid #e2e8f0;
    display: flex; justify-content: space-between; align-items: center;
    gap: 12px;
    background: #f8fafc;
  }
  .counts {
    font-size: 12px;
    color: #64748b;
  }
  .actions { display: flex; gap: 8px; }
  button {
    font: inherit;
    font-size: 13px;
    font-weight: 500;
    padding: 8px 14px;
    border-radius: 6px;
    border: 1px solid transparent;
    cursor: pointer;
  }
  button.secondary {
    background: #fff;
    border-color: #cbd5e1;
    color: #334155;
  }
  button.primary {
    background: #4f46e5;
    border-color: #4f46e5;
    color: #fff;
  }
  button.primary:hover { background: #4338ca; }
  button.secondary:hover { background: #f1f5f9; }
`;

export class ReviewOverlay {
  private container: HTMLDivElement | null = null;
  private shadow: ShadowRoot | null = null;
  private editedSignatures = new Set<string>();
  private rowState = new Map<string, { value: string; skip: boolean }>();

  /**
   * Mount the overlay, wait for the user to confirm or cancel, return a
   * ReviewResult. Resolves after cleanup so the caller can immediately
   * hand the plan to Filler.
   */
  show(options: ReviewOverlayOptions): Promise<ReviewResult> {
    return new Promise((resolve) => {
      const { plan, onTeach } = options;

      // Seed per-row state from the plan.
      for (const fill of plan.fills) {
        this.rowState.set(fill.field.signature, {
          value: fill.value,
          skip: fill.skip,
        });
      }

      this.container = document.createElement("div");
      this.container.style.all = "initial"; // reset inherited host styles
      document.body.appendChild(this.container);
      this.shadow = this.container.attachShadow({ mode: "closed" });

      const style = document.createElement("style");
      style.textContent = STYLE;
      this.shadow.appendChild(style);

      const backdrop = document.createElement("div");
      backdrop.className = "backdrop";

      const panel = document.createElement("div");
      panel.className = "panel";

      // Header
      const header = document.createElement("header");
      const h2 = document.createElement("h2");
      h2.textContent = "Review & fill";
      const p = document.createElement("p");
      const fillableCount = plan.fills.filter((f) => !f.skip).length;
      p.textContent = `JobMate will fill ${fillableCount} of ${plan.fills.length} fields. Review each one — nothing is submitted automatically.`;
      header.append(h2, p);
      panel.appendChild(header);

      // Rows
      const rows = document.createElement("div");
      rows.className = "rows";
      for (const fill of plan.fills) {
        rows.appendChild(this.renderRow(fill, onTeach));
      }
      panel.appendChild(rows);

      // Footer
      const footer = document.createElement("footer");
      const counts = document.createElement("div");
      counts.className = "counts";
      const updateCounts = () => {
        const active = plan.fills.filter(
          (f) => !this.rowState.get(f.field.signature)?.skip
        ).length;
        counts.textContent = `${active} of ${plan.fills.length} selected`;
      };
      updateCounts();

      const actions = document.createElement("div");
      actions.className = "actions";
      const cancelBtn = document.createElement("button");
      cancelBtn.className = "secondary";
      cancelBtn.textContent = "Cancel";
      const fillBtn = document.createElement("button");
      fillBtn.className = "primary";
      fillBtn.textContent = "Fill form";

      const finish = (cancelled: boolean) => {
        const finalPlan: FillPlan = {
          ...plan,
          fills: plan.fills.map((f) => {
            const state = this.rowState.get(f.field.signature);
            if (!state) return f;
            return {
              ...f,
              value: state.value,
              skip: state.skip || !state.value,
            };
          }),
        };
        this.destroy();
        resolve({
          plan: finalPlan,
          cancelled,
          editedSignatures: Array.from(this.editedSignatures),
        });
      };

      cancelBtn.addEventListener("click", () => finish(true));
      fillBtn.addEventListener("click", () => finish(false));
      // Escape key = cancel. Captured on the shadow host so it doesn't
      // interfere with the host page's own shortcuts.
      this.container.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          e.preventDefault();
          finish(true);
        }
      });

      // Re-render counts on row state changes.
      rows.addEventListener("input", updateCounts);
      rows.addEventListener("change", updateCounts);

      actions.append(cancelBtn, fillBtn);
      footer.append(counts, actions);
      panel.appendChild(footer);

      backdrop.appendChild(panel);
      this.shadow.appendChild(backdrop);
    });
  }

  private renderRow(
    fill: PlannedFill,
    onTeach?: (fill: PlannedFill, newValue: string) => void
  ): HTMLElement {
    const row = document.createElement("div");
    row.className = "row";
    if (fill.skip) row.classList.add("skipped");

    const head = document.createElement("div");
    head.className = "row-head";
    const label = document.createElement("div");
    label.className = "row-label";
    label.textContent =
      fill.field.labelText ||
      fill.field.ariaLabel ||
      fill.field.placeholder ||
      fill.field.name ||
      fill.field.id ||
      "(unlabeled field)";

    const meta = document.createElement("div");
    meta.className = "row-meta";
    const source = fill.mapping.source;
    const badge = document.createElement("span");
    badge.className = `badge badge-${source}`;
    badge.textContent = source;
    const pct = Math.round((fill.mapping.confidence || 0) * 100);
    meta.append(document.createTextNode(`${pct}%`), badge);

    head.append(label, meta);
    row.appendChild(head);

    const body = document.createElement("div");
    body.className = "row-body";

    // Input: textarea for essay/textarea/contenteditable, plain input otherwise.
    const isLong =
      fill.field.fieldKind === "essay" ||
      fill.field.fieldKind === "textarea" ||
      fill.field.fieldKind === "contenteditable";
    const input = isLong
      ? document.createElement("textarea")
      : document.createElement("input");
    if (!isLong) (input as HTMLInputElement).type = "text";
    input.value = fill.value;
    input.addEventListener("input", () => {
      const state = this.rowState.get(fill.field.signature)!;
      state.value = input.value;
      this.editedSignatures.add(fill.field.signature);
      if (onTeach) onTeach(fill, input.value);
    });
    body.appendChild(input);

    const skipLabel = document.createElement("label");
    skipLabel.className = "skip-toggle";
    const skip = document.createElement("input");
    skip.type = "checkbox";
    skip.checked = !fill.skip;
    skip.addEventListener("change", () => {
      const state = this.rowState.get(fill.field.signature)!;
      state.skip = !skip.checked;
      row.classList.toggle("skipped", state.skip);
    });
    skipLabel.append(skip, document.createTextNode("fill"));
    body.appendChild(skipLabel);

    row.appendChild(body);

    if (fill.note) {
      const note = document.createElement("div");
      note.className = "row-note";
      note.textContent = fill.note;
      row.appendChild(note);
    }

    return row;
  }

  private destroy(): void {
    if (this.container) {
      this.container.remove();
      this.container = null;
      this.shadow = null;
    }
    this.rowState.clear();
    this.editedSignatures.clear();
  }
}

export const reviewOverlay = new ReviewOverlay();
