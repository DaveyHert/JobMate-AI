// ============================================================================
// DOMProbe — form field discovery
// ============================================================================
// Walks the page (document + open shadow roots + same-origin iframes) and
// produces a FormSnapshot: the set of form fields we could theoretically fill,
// each enriched with enough context for the MappingResolver to classify it.
//
// What DOMProbe does NOT do:
//   - It does not decide what value goes in a field (that's MappingResolver).
//   - It does not write to the DOM (that's Filler).
//   - It does not skip "essay" fields — it tags them as kind: "essay" and
//     lets the resolver decide whether to route them through the LLM.
//
// Design notes:
//   - Closed shadow roots are invisible to userland scripts. We only traverse
//     open shadow roots (element.shadowRoot).
//   - Cross-origin iframes are skipped; Chrome blocks contentDocument access.
//   - The stablePath and signature are content-based so they survive DOM
//     reshuffles. The form signature is the hash of sorted field signatures,
//     so "the same form" keeps the same cache key even if the order changes.
// ============================================================================

import type {
  FieldHost,
  FieldKind,
  FormField,
  FormSnapshot,
} from "./types";
import { hashString, normalizeForHash } from "./hash";

// ---------- Element selector ----------

const FIELD_SELECTOR = [
  'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"])',
  "textarea",
  "select",
  '[contenteditable="true"]',
  '[role="combobox"]',
  '[role="listbox"]',
  '[role="textbox"]',
].join(",");

// ---------- Public API ----------

export class DOMProbe {
  /**
   * Scan the current page for fillable form fields. Safe to call repeatedly;
   * DOMProbe is stateless between calls and always re-queries the DOM.
   */
  public probe(root: Document = document): FormSnapshot {
    const fields: FormField[] = [];
    this.collectFrom(root, { kind: "document" }, fields);

    // Deterministic order for the form signature. Sorting by the per-field
    // signature means two page loads that surface the same form in different
    // orders still produce the same formSignature.
    const sortedSignatures = fields.map((f) => f.signature).sort();
    const formSignature = hashString(sortedSignatures.join("|"));

    return {
      origin: location.origin,
      pathname: location.pathname,
      fields,
      formSignature,
      capturedAt: Date.now(),
    };
  }

  // ---------- Traversal ----------

  private collectFrom(
    root: Document | ShadowRoot,
    host: FieldHost,
    out: FormField[]
  ): void {
    // 1. Direct field candidates in this root.
    const candidates = root.querySelectorAll(FIELD_SELECTOR);
    for (const el of Array.from(candidates)) {
      if (!(el instanceof HTMLElement)) continue;
      if (!this.isFillable(el)) continue;
      const field = this.describeField(el, host);
      if (field) out.push(field);
    }

    // 2. Recurse into open shadow roots.
    // We walk every element in the current root once looking for shadowRoot;
    // closed shadow DOMs return null and are skipped.
    const allElements = root.querySelectorAll("*");
    for (const el of Array.from(allElements)) {
      const sr = (el as Element & { shadowRoot: ShadowRoot | null }).shadowRoot;
      if (sr) {
        this.collectFrom(sr, { kind: "shadow", host: el }, out);
      }
    }

    // 3. Recurse into same-origin iframes (only when traversing a Document).
    if (root instanceof Document) {
      const frames = root.querySelectorAll("iframe");
      for (const frame of Array.from(frames)) {
        const doc = this.safeFrameDocument(frame);
        if (doc) {
          this.collectFrom(doc, { kind: "iframe", frame }, out);
        }
      }
    }
  }

  private safeFrameDocument(frame: HTMLIFrameElement): Document | null {
    try {
      return frame.contentDocument;
    } catch {
      // Cross-origin — contentDocument access throws a SecurityError.
      return null;
    }
  }

  // ---------- Field description ----------

  private describeField(el: HTMLElement, host: FieldHost): FormField | null {
    const ownerDocument = el.ownerDocument;
    const tagName = el.tagName.toLowerCase();
    const inputType = (el.getAttribute("type") || "").toLowerCase();
    const fieldKind = this.detectFieldKind(el, tagName, inputType);

    const name = el.getAttribute("name") || "";
    const id = el.id || "";
    const autocomplete = el.getAttribute("autocomplete") || "";
    const placeholder = el.getAttribute("placeholder") || "";
    const required =
      el.hasAttribute("required") ||
      el.getAttribute("aria-required") === "true";

    const labelText = this.findLabel(el);
    const ariaLabel = this.findAriaLabel(el);
    const nearbyText = this.findNearbyText(el);

    const options = this.extractOptions(el, fieldKind);
    const framework = this.detectFramework(el);
    const stablePath = this.buildStablePath(el);

    const signatureSource = normalizeForHash(
      [
        fieldKind,
        name,
        id,
        autocomplete,
        labelText,
        ariaLabel,
        placeholder,
        nearbyText,
        (options ?? []).join(","),
      ].join("|")
    );
    const signature = hashString(signatureSource);

    // A field with no identifying context at all is unusable — we'd never be
    // able to classify it, and the signature would collide with every other
    // anonymous field. Drop it.
    if (!signatureSource || signatureSource === "unknown") {
      return null;
    }

    // Drop fields whose only "label" is generic UI chrome from custom
    // dropdowns, search boxes, file pickers, etc. ("Select...", "Search",
    // "Attach", "244 results found"). These are almost always sub-elements
    // of widgets we either fill via a different control or can't fill at all,
    // and they clutter the Review modal with rows the user can't act on.
    const displayLabel = (labelText || ariaLabel || placeholder || "").trim();
    if (this.isJunkLabel(displayLabel)) {
      // Only drop when nothing else identifies the field. A real form input
      // will usually have name/id/autocomplete to fall back on.
      const hasStrongHint = Boolean(name || autocomplete);
      if (!hasStrongHint) return null;
    }

    // File inputs without any meaningful label are noise. The dropzone label
    // ("Attach", "Drop your file here") rarely tells us what document goes in
    // it, and there's no value we can safely auto-fill.
    if (fieldKind === "file" && !labelText && !ariaLabel && !name) {
      return null;
    }

    // Search-typed inputs nested inside a custom dropdown / combobox are
    // internal filter boxes — filling them does nothing useful. The outer
    // combobox itself is what we want to handle.
    if (
      inputType === "search" &&
      el.closest('[role="combobox"], [role="listbox"]')
    ) {
      return null;
    }

    return {
      element: el,
      ownerDocument,
      host,
      tagName,
      fieldKind,
      inputType,
      name,
      id,
      autocomplete,
      placeholder,
      required,
      labelText,
      ariaLabel,
      nearbyText,
      options,
      framework,
      stablePath,
      signature,
    };
  }

  // ---------- Junk label filter ----------

  // Patterns that match generic UI chrome rather than a real form field
  // label. If a field's only context matches one of these, we drop it from
  // the snapshot so the Review modal doesn't surface unfillable rows.
  private static readonly JUNK_LABEL_PATTERNS: RegExp[] = [
    /^select\.{0,3}$/i, // "Select", "Select..."
    /^search\.{0,3}$/i, // "Search", "Search..."
    /^choose\.{0,3}$/i, // "Choose", "Choose..."
    /^pick\s+one\.{0,3}$/i,
    /^attach(\s+a\s+file)?\.{0,3}$/i,
    /^upload(\s+a\s+file)?\.{0,3}$/i,
    /^browse\.{0,3}$/i,
    /^drop\s+(your\s+)?file/i,
    /^\d+\s+results?\s+found$/i,
    /^no\s+results?$/i,
    /^loading\.{0,3}$/i,
    /^type\s+to\s+search/i,
    /^start\s+typing/i,
    /^\(unlabeled\s+field\)$/i,
  ];

  private isJunkLabel(label: string): boolean {
    if (!label) return true;
    return DOMProbe.JUNK_LABEL_PATTERNS.some((re) => re.test(label));
  }

  // ---------- Fillable gate ----------

  private isFillable(el: HTMLElement): boolean {
    if (el.hasAttribute("disabled")) return false;
    if (el.getAttribute("aria-disabled") === "true") return false;
    if ((el as HTMLInputElement).readOnly) return false;
    // Elements with zero layout box are typically offscreen/display:none and
    // can't receive user input either, so filling them is pointless.
    if (el.offsetParent === null && el.tagName.toLowerCase() !== "select") {
      // <select> can have offsetParent === null in some frameworks while still
      // being fillable, so we whitelist it.
      const style = el.ownerDocument.defaultView?.getComputedStyle(el);
      if (style && (style.display === "none" || style.visibility === "hidden")) {
        return false;
      }
    }
    return true;
  }

  // ---------- Kind detection ----------

  private detectFieldKind(
    el: HTMLElement,
    tagName: string,
    inputType: string
  ): FieldKind {
    if (tagName === "textarea") {
      return this.looksLikeEssay(el) ? "essay" : "textarea";
    }
    if (tagName === "select") return "select";
    if (el.getAttribute("contenteditable") === "true") return "contenteditable";

    const role = el.getAttribute("role");
    if (role === "combobox" || role === "listbox") return "custom-dropdown";

    if (tagName === "input") {
      switch (inputType) {
        case "email":
          return "email";
        case "tel":
          return "tel";
        case "url":
          return "url";
        case "number":
          return "number";
        case "password":
          return "password";
        case "date":
        case "datetime-local":
        case "month":
        case "week":
          return "date";
        case "checkbox":
          return "checkbox";
        case "radio":
          return "radio";
        case "file":
          return "file";
        case "":
        case "text":
        case "search":
          return "text";
        default:
          return "text";
      }
    }

    return "unknown";
  }

  /**
   * Softer version of the legacy `isQuestionField` heuristic. Instead of
   * skipping these outright, we tag them "essay" and let MappingResolver
   * decide whether to route the text through the LLM or pull from the user's
   * AnswerBank of prior responses.
   */
  private looksLikeEssay(el: HTMLElement): boolean {
    const label = this.findLabel(el).toLowerCase();
    const aria = this.findAriaLabel(el).toLowerCase();
    const placeholder = (el.getAttribute("placeholder") || "").toLowerCase();
    const blob = `${label} ${aria} ${placeholder}`;

    if (!blob.trim()) return false;
    if (blob.includes("?")) return true;

    const essayCues = [
      /why\s+(are|do|should)/,
      /tell\s+us/,
      /describe/,
      /explain/,
      /what\s+(makes|motivates|interests)/,
      /cover\s+letter/,
      /personal\s+statement/,
      /motivation\s+letter/,
    ];
    return essayCues.some((re) => re.test(blob));
  }

  // ---------- Label detection ----------

  private findLabel(el: HTMLElement): string {
    const doc = el.ownerDocument;

    // 1. <label for="..."> within the same root.
    if (el.id) {
      const root = el.getRootNode() as Document | ShadowRoot;
      const labelFor = (root as Document).querySelector?.(
        `label[for="${CSS.escape(el.id)}"]`
      );
      if (labelFor?.textContent) return labelFor.textContent.trim();
    }

    // 2. Ancestor <label>.
    const ancestorLabel = el.closest("label");
    if (ancestorLabel?.textContent) return ancestorLabel.textContent.trim();

    // 3. aria-labelledby.
    const labelledBy = el.getAttribute("aria-labelledby");
    if (labelledBy) {
      const parts = labelledBy
        .split(/\s+/)
        .map((id) => doc.getElementById(id)?.textContent?.trim() || "")
        .filter(Boolean);
      if (parts.length) return parts.join(" ");
    }

    // 4. Preceding sibling <label>.
    let sibling = el.previousElementSibling;
    while (sibling) {
      if (sibling.tagName.toLowerCase() === "label" && sibling.textContent) {
        return sibling.textContent.trim();
      }
      sibling = sibling.previousElementSibling;
    }

    // 5. Short text in a nearby container. Form builders often wrap label
    // text in a <div> or <span> rather than an actual <label>.
    const container = el.closest(
      'div, fieldset, .form-group, .field, [class*="field"], [class*="form"]'
    );
    if (container) {
      const candidates = container.querySelectorAll("label, span, div, p");
      for (const node of Array.from(candidates)) {
        if (node.contains(el)) continue;
        const text = node.textContent?.trim();
        if (!text) continue;
        if (text.length < 2 || text.length > 100) continue;
        const words = text.split(/\s+/);
        if (words.length <= 8) return text;
      }
    }

    return "";
  }

  private findAriaLabel(el: HTMLElement): string {
    return (el.getAttribute("aria-label") || "").trim();
  }

  /**
   * Grab a small window of text immediately preceding the field. Useful for
   * fields that have no label at all — e.g., "Upload your resume" text
   * followed by a bare file input.
   */
  private findNearbyText(el: HTMLElement): string {
    const parent = el.parentElement;
    if (!parent) return "";
    const text = parent.textContent?.trim() || "";
    if (!text) return "";
    // Strip the element's own text (e.g., select option text) from the window.
    const own = el.textContent?.trim() || "";
    const pruned = own ? text.replace(own, "").trim() : text;
    // Cap the window so an entire job description doesn't end up in the hash.
    return pruned.slice(0, 200);
  }

  // ---------- Options (for <select>, radio groups, custom dropdowns) ----------

  private extractOptions(el: HTMLElement, kind: FieldKind): string[] | undefined {
    if (kind === "select" && el instanceof HTMLSelectElement) {
      return Array.from(el.options).map((o) => o.text.trim()).filter(Boolean);
    }
    if (kind === "radio" && el instanceof HTMLInputElement && el.name) {
      const root = el.getRootNode() as Document | ShadowRoot;
      const group = (root as Document).querySelectorAll?.(
        `input[type="radio"][name="${CSS.escape(el.name)}"]`
      );
      if (group) {
        return Array.from(group)
          .map((r) => this.findLabel(r as HTMLElement))
          .filter(Boolean);
      }
    }
    return undefined;
  }

  // ---------- Framework hint ----------

  private detectFramework(el: HTMLElement): FormField["framework"] {
    // Cheap per-element attribute check. Not perfect — e.g., React doesn't
    // leave a reliable DOM marker — but enough to differentiate "bare HTML"
    // from "custom component we need to click through".
    if (el.hasAttribute("ng-model") || el.hasAttribute("ng-reflect-name")) {
      return "angular";
    }
    if (el.hasAttribute("v-model")) return "vue";
    const attrs = el.getAttributeNames();
    if (attrs.some((a) => a.startsWith("data-v-"))) return "vue";
    if (attrs.some((a) => a.startsWith("on:") || a.startsWith("use:"))) {
      return "svelte";
    }
    const win = el.ownerDocument.defaultView as (Window & {
      React?: unknown;
      __REACT_DEVTOOLS_GLOBAL_HOOK__?: unknown;
    }) | null;
    if (win?.React || win?.__REACT_DEVTOOLS_GLOBAL_HOOK__) return "react";
    return "none";
  }

  // ---------- Stable path ----------

  /**
   * Build a selector path we can feed back to querySelector to re-find this
   * element after a re-render. Preference order:
   *   1. #id (if it looks stable — no digits-only auto-generated ids)
   *   2. [name="..."] scoped to the tag
   *   3. positional path using :nth-of-type, rooted at the nearest ancestor
   *      with a stable id or at the document root
   */
  private buildStablePath(el: HTMLElement): string {
    if (el.id && !/^[0-9]+$/.test(el.id) && !el.id.includes(":")) {
      return `#${CSS.escape(el.id)}`;
    }

    const name = el.getAttribute("name");
    if (name) {
      return `${el.tagName.toLowerCase()}[name="${name}"]`;
    }

    const segments: string[] = [];
    let cursor: Element | null = el;
    while (cursor && cursor.nodeType === 1 && cursor.tagName.toLowerCase() !== "html") {
      const current: Element = cursor;
      const tag = current.tagName.toLowerCase();
      if (current.id && !/^[0-9]+$/.test(current.id)) {
        segments.unshift(`#${CSS.escape(current.id)}`);
        break;
      }
      const parent: HTMLElement | null = current.parentElement;
      if (!parent) {
        segments.unshift(tag);
        break;
      }
      const sameTag: Element[] = Array.from(parent.children).filter(
        (c): c is Element => c.tagName === current.tagName
      );
      if (sameTag.length === 1) {
        segments.unshift(tag);
      } else {
        const index = sameTag.indexOf(current) + 1;
        segments.unshift(`${tag}:nth-of-type(${index})`);
      }
      cursor = parent;
    }
    return segments.join(" > ");
  }
}

// Module-level default instance — callers that don't need a custom probe
// can just import this and call .probe().
export const domProbe = new DOMProbe();
