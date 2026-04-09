// ============================================================================
// Filler — writes values into form fields
// ============================================================================
// Given a FillPlan (produced upstream by MappingResolver + Planner), walk the
// fills and actually set each field's value in a way modern frameworks accept.
//
// Why this module is non-trivial:
//   - React tracks input values on the element instance; `el.value = x` gets
//     reverted on the next render unless you call the native setter from the
//     prototype descriptor so React's value tracker sees the mutation.
//   - Custom "dropdowns" (role=combobox) are not <select> — you have to click
//     the trigger, wait for the listbox, and click the matching option.
//   - File inputs can't be set via .value; you need a DataTransfer.
//   - Contenteditable fields need innerText + input events, not .value.
//
// What this module does NOT do:
//   - It does not classify fields (that's MappingResolver).
//   - It does not submit forms. Ever. Submission only happens after the user
//     explicitly confirms in the ReviewOverlay.
// ============================================================================

import type { FillOutcome, FillPlan, FillResult, FormField } from "./types";

// ---------- Native setters (bypass React's value tracker) ----------
//
// React patches element instances with its own `value` property that
// intercepts writes. To force-update the real DOM state we fetch the original
// descriptor from the prototype and invoke it directly.

const nativeInputSetter = Object.getOwnPropertyDescriptor(
  HTMLInputElement.prototype,
  "value"
)?.set;

const nativeTextareaSetter = Object.getOwnPropertyDescriptor(
  HTMLTextAreaElement.prototype,
  "value"
)?.set;

const nativeSelectSetter = Object.getOwnPropertyDescriptor(
  HTMLSelectElement.prototype,
  "value"
)?.set;

function setNativeValue(el: HTMLElement, value: string): void {
  if (el instanceof HTMLInputElement && nativeInputSetter) {
    nativeInputSetter.call(el, value);
    return;
  }
  if (el instanceof HTMLTextAreaElement && nativeTextareaSetter) {
    nativeTextareaSetter.call(el, value);
    return;
  }
  if (el instanceof HTMLSelectElement && nativeSelectSetter) {
    nativeSelectSetter.call(el, value);
    return;
  }
  // Fallback for anything else — contenteditable is handled separately.
  (el as HTMLInputElement).value = value;
}

// ---------- Event dispatch ----------
//
// Frameworks (React, Vue, Angular) all listen for these three events to
// propagate form state. The legacy engine dispatched "blur-sm" (a Tailwind
// class name someone copy-pasted) — fixed here to plain "blur".

function fireInputEvents(el: HTMLElement): void {
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  el.dispatchEvent(new Event("blur", { bubbles: true }));
}

// ---------- Filler ----------

export class Filler {
  /**
   * Execute a FillPlan. Walks each planned fill sequentially (some sites
   * re-render on every input event, so parallelism is a trap) and records an
   * outcome for every field — including the ones we deliberately skipped.
   */
  public async apply(plan: FillPlan): Promise<FillResult> {
    const outcomes: FillOutcome[] = [];
    let attempted = 0;
    let succeeded = 0;

    for (const fill of plan.fills) {
      if (fill.skip) {
        outcomes.push({
          field: fill.field,
          success: false,
          method: "skipped",
          error: fill.note,
        });
        continue;
      }

      attempted += 1;
      const outcome = await this.fillOne(fill.field, fill.value);
      outcomes.push(outcome);
      if (outcome.success) succeeded += 1;
    }

    return { attempted, succeeded, outcomes };
  }

  // ---------- Per-field dispatch ----------

  private async fillOne(field: FormField, value: string): Promise<FillOutcome> {
    const el = field.element;

    // Re-check fillability right before writing. The DOM may have changed
    // between probe and fill on reactive sites.
    if (!el.isConnected) {
      return {
        field,
        success: false,
        method: "failed",
        error: "Element detached from DOM",
      };
    }

    try {
      switch (field.fieldKind) {
        case "select":
          return this.fillSelect(field, value);

        case "custom-dropdown":
          return await this.fillCustomDropdown(field, value);

        case "checkbox":
          return this.fillCheckbox(field, value);

        case "radio":
          return this.fillRadio(field, value);

        case "file":
          return this.fillFile(field, value);

        case "contenteditable":
          return this.fillContentEditable(field, value);

        // "essay" and every text-ish kind flow through the native setter path
        default:
          return this.fillText(field, value);
      }
    } catch (error) {
      return {
        field,
        success: false,
        method: "failed",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // ---------- Text / number / email / tel / url / date / textarea / essay ----------

  private fillText(field: FormField, value: string): FillOutcome {
    const el = field.element;
    setNativeValue(el, value);
    fireInputEvents(el);

    // Trust the setter call; do NOT verify via `el.value === value`. React
    // controlled inputs can revert the DOM value on the next render, so
    // comparing here produces false negatives even when the write was
    // correct. The ReviewOverlay handles the "did it actually take?" check.
    return {
      field,
      success: true,
      method: "native-setter",
    };
  }

  // ---------- <select> ----------

  private fillSelect(field: FormField, value: string): FillOutcome {
    const el = field.element;
    if (!(el instanceof HTMLSelectElement)) {
      return { field, success: false, method: "failed", error: "Not a <select>" };
    }

    const match = matchOption(
      Array.from(el.options).map((o) => ({ value: o.value, text: o.text })),
      value
    );
    if (match === null) {
      return {
        field,
        success: false,
        method: "failed",
        error: `No matching option for "${value}"`,
      };
    }

    el.selectedIndex = match;
    setNativeValue(el, el.options[match].value);
    fireInputEvents(el);
    return { field, success: true, method: "select-option" };
  }

  // ---------- Custom dropdown (role=combobox / listbox) ----------
  //
  // These are the things half the modern ATS platforms use — a div with
  // role=combobox that opens a popup listbox when clicked. We have to drive
  // it with clicks, not value assignment.

  private async fillCustomDropdown(field: FormField, value: string): Promise<FillOutcome> {
    const trigger = field.element;
    trigger.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    trigger.click();

    // Give the listbox a microtask + a frame to render.
    await new Promise((r) => setTimeout(r, 50));

    const doc = field.ownerDocument;
    // Listbox can be portaled outside the trigger's subtree (common in
    // Radix/Headless UI), so we search the whole document.
    const listboxes = Array.from(
      doc.querySelectorAll<HTMLElement>('[role="listbox"], [role="option"]')
    );
    const options = listboxes.filter(
      (el) => el.getAttribute("role") === "option"
    );
    if (!options.length) {
      return {
        field,
        success: false,
        method: "failed",
        error: "Listbox did not open or has no options",
      };
    }

    const entries = options.map((el) => ({
      value: el.getAttribute("data-value") || el.textContent?.trim() || "",
      text: el.textContent?.trim() || "",
    }));
    const match = matchOption(entries, value);
    if (match === null) {
      // Close the listbox before reporting failure — leaving it open blocks
      // subsequent fills and looks broken to the user.
      trigger.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      return {
        field,
        success: false,
        method: "failed",
        error: `No matching option for "${value}"`,
      };
    }

    options[match].click();
    fireInputEvents(trigger);
    return { field, success: true, method: "click-option" };
  }

  // ---------- Checkbox ----------

  private fillCheckbox(field: FormField, value: string): FillOutcome {
    const el = field.element;
    if (!(el instanceof HTMLInputElement)) {
      return { field, success: false, method: "failed", error: "Not a checkbox" };
    }
    const truthy = /^(true|yes|on|1|checked)$/i.test(value.trim());
    if (el.checked !== truthy) {
      el.click();
    }
    fireInputEvents(el);
    return { field, success: true, method: "native-setter" };
  }

  // ---------- Radio ----------

  private fillRadio(field: FormField, value: string): FillOutcome {
    const el = field.element;
    if (!(el instanceof HTMLInputElement) || !el.name) {
      return { field, success: false, method: "failed", error: "Not a radio" };
    }

    const root = el.getRootNode() as Document | ShadowRoot;
    const group = Array.from(
      (root as Document).querySelectorAll<HTMLInputElement>(
        `input[type="radio"][name="${CSS.escape(el.name)}"]`
      )
    );
    if (!group.length) {
      return { field, success: false, method: "failed", error: "Empty radio group" };
    }

    const entries = group.map((r) => ({
      value: r.value,
      text: labelTextFor(r) || r.value,
    }));
    const match = matchOption(entries, value);
    if (match === null) {
      return {
        field,
        success: false,
        method: "failed",
        error: `No matching radio for "${value}"`,
      };
    }

    group[match].click();
    fireInputEvents(group[match]);
    return { field, success: true, method: "click-option" };
  }

  // ---------- File ----------
  //
  // File inputs reject direct assignment (`el.files = …` throws). The
  // DataTransfer trick is the standard workaround: build a DataTransfer,
  // add the File, and assign its `.files` to the input.

  private fillFile(field: FormField, value: string): FillOutcome {
    // For now, the Filler accepts a data URL or a plain string reference.
    // The upstream Planner is responsible for resolving a profile's
    // Documents entry into an actual File. We surface a clear error when
    // that resolution hasn't happened yet.
    if (!value.startsWith("data:")) {
      return {
        field,
        success: false,
        method: "failed",
        error: "File input requires a data: URL (resolve Documents upstream)",
      };
    }

    const el = field.element;
    if (!(el instanceof HTMLInputElement) || el.type !== "file") {
      return { field, success: false, method: "failed", error: "Not a file input" };
    }

    try {
      const file = dataUrlToFile(value, "upload");
      const dt = new DataTransfer();
      dt.items.add(file);
      el.files = dt.files;
      fireInputEvents(el);
      return { field, success: true, method: "file-drop" };
    } catch (error) {
      return {
        field,
        success: false,
        method: "failed",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // ---------- Contenteditable ----------

  private fillContentEditable(field: FormField, value: string): FillOutcome {
    const el = field.element;
    el.focus();
    // Clearing via selection+delete preserves the element's event listeners
    // and any observers attached by rich-text editors.
    const range = el.ownerDocument.createRange();
    range.selectNodeContents(el);
    const sel = el.ownerDocument.defaultView?.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    el.ownerDocument.execCommand("delete");
    el.ownerDocument.execCommand("insertText", false, value);
    fireInputEvents(el);
    return { field, success: true, method: "native-setter" };
  }
}

// ---------- Option matching ----------
//
// Used by <select>, radio groups, and custom dropdowns. Returns the index of
// the best match or null. The matching is intentionally lenient: we want
// "California" to match "CA" and vice versa, but we don't want "California"
// to match "New Caledonia" just because of a substring hit. So we try exact
// matches first, then case-insensitive exact, then startsWith, then a scored
// substring match.

interface Option {
  value: string;
  text: string;
}

export function matchOption(options: Option[], target: string): number | null {
  if (!options.length) return null;
  const wanted = target.trim();
  if (!wanted) return null;
  const wantedLower = wanted.toLowerCase();

  // Pass 1: exact match on value or text.
  for (let i = 0; i < options.length; i++) {
    if (options[i].value === wanted || options[i].text === wanted) return i;
  }
  // Pass 2: case-insensitive exact.
  for (let i = 0; i < options.length; i++) {
    if (
      options[i].value.toLowerCase() === wantedLower ||
      options[i].text.toLowerCase() === wantedLower
    ) {
      return i;
    }
  }
  // Pass 3: startsWith (either direction).
  for (let i = 0; i < options.length; i++) {
    const v = options[i].value.toLowerCase();
    const t = options[i].text.toLowerCase();
    if (
      v.startsWith(wantedLower) ||
      t.startsWith(wantedLower) ||
      wantedLower.startsWith(v) ||
      wantedLower.startsWith(t)
    ) {
      return i;
    }
  }
  // Pass 4: substring — but only when the target is long enough that a
  // substring match is meaningful. "CA" inside "Canada" is a false positive
  // we want to avoid.
  if (wantedLower.length >= 4) {
    for (let i = 0; i < options.length; i++) {
      if (
        options[i].value.toLowerCase().includes(wantedLower) ||
        options[i].text.toLowerCase().includes(wantedLower)
      ) {
        return i;
      }
    }
  }
  return null;
}

// ---------- Helpers ----------

function labelTextFor(el: HTMLInputElement): string {
  if (el.id) {
    const root = el.getRootNode() as Document | ShadowRoot;
    const label = (root as Document).querySelector?.(
      `label[for="${CSS.escape(el.id)}"]`
    );
    if (label?.textContent) return label.textContent.trim();
  }
  const parent = el.closest("label");
  if (parent?.textContent) return parent.textContent.trim();
  return "";
}

function dataUrlToFile(dataUrl: string, fallbackName: string): File {
  const [header, base64] = dataUrl.split(",");
  if (!header || base64 === undefined) {
    throw new Error("Malformed data URL");
  }
  const mimeMatch = header.match(/data:([^;]+);base64/);
  const mime = mimeMatch?.[1] ?? "application/octet-stream";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const ext = mime.split("/")[1] || "bin";
  return new File([bytes], `${fallbackName}.${ext}`, { type: mime });
}

// Module-level default instance.
export const filler = new Filler();
