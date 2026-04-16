Here's why, and how I'd architect it:

---

**Why this is hard:**

Job application forms aren't standardized. You're dealing with a spectrum:

At one end, you have **standard HTML forms** — simple `<input>`, `<select>`, `<textarea>` elements with reasonable labels. These are easy. A rule-based engine can handle them.

In the middle, you have **ATS platforms like Greenhouse, Lever, Workday, iCIMS, Taleo, SmartRecruiters**. These use custom components — React/Angular-rendered dropdowns, multi-step wizards, dynamically loaded fields, shadow DOM elements, custom file upload widgets. Each one behaves differently. Workday in particular is notorious — it's a deeply nested iframe-based nightmare with dynamically generated IDs.

At the far end, you have **completely custom career pages** — companies that built their own application flow. These are unpredictable.

---

**How I'd architect the auto-fill engine:**

I'd build it in three layers:

**Layer 1: Generic form detection (covers ~60% of sites)**

This is your foundation — a DOM analysis engine that works on any page with form elements.

The approach: crawl the DOM, find all input-like elements (inputs, selects, textareas, contenteditable divs, custom dropdown triggers), then figure out _what_ each field is asking for. You determine field intent through a priority stack: check `name` and `id` attributes first (e.g., `name="first_name"` is obvious), then check associated `<label>` elements, then `placeholder` text, then `aria-label`, and finally nearby text via DOM proximity. You build a mapping dictionary — a big lookup table: if the field looks like it's asking for "first name," "fname," "given name," "vorname," etc., map it to `user.firstName` from the stored profile.

This works surprisingly well for standard HTML forms. The core logic is maybe 500–800 lines of well-structured TypeScript.

**Layer 2: Platform-specific adapters (covers the next ~25%)**

This is where the real work lives. For the top ATS platforms, you write dedicated adapters that understand their specific DOM structure and quirks.

For example, Greenhouse uses a fairly consistent structure with `#application-form` containers and predictable field patterns. You can write a Greenhouse adapter that knows exactly where to find each field. Lever has a different structure but is also relatively consistent. Workday though — you'd need to handle iframe traversal, wait for their Angular rendering cycle, and deal with their custom dropdown components that require simulated clicks followed by option selection rather than just setting a value.

Each adapter follows a common interface — something like `detect()`, `getFields()`, `fillField()`, `submitFile()` — but the implementation differs per platform. You'd prioritize by market share: Greenhouse, Lever, Workday, iCIMS, and SmartRecruiters probably cover 60–70% of all job applications at companies of meaningful size.

The key insight here: **don't just set values programmatically — simulate real user interaction.** Many modern frameworks (React, Angular) don't pick up direct value changes. You need to dispatch proper events — `focus`, `input`, `change`, `blur` in the right sequence — so the framework's state management recognizes the update. Something like:

```javascript
function setFieldValue(element, value) {
  element.focus();
  // Override the native value setter to trigger React's state
  const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
  nativeSetter.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
  element.blur();
}
```

This pattern alone solves a huge class of "why isn't my auto-fill working" bugs.

**Layer 3: AI fallback for unknown forms (covers another ~5–8%)**

For forms you haven't seen before, you use an LLM as a classification engine. Take a snapshot of the visible form — the labels, placeholders, field types, surrounding text — send it to Claude's API, and ask it to map each field to your user profile schema. The model is remarkably good at understanding "What is this field asking for?" even when the HTML is messy.

This isn't something you'd do on every page load — it's expensive and slow. You'd use it as a fallback when Layer 1 confidence is low, then **cache the mapping** for that domain so it's instant next time. Over time, your cache becomes a crowdsourced adapter library.

---

**The hard problems you'll hit:**

**Custom dropdowns and selects.** Half the ATS platforms don't use native `<select>` elements. They use a `<div>` that opens a list of `<div>` options. Filling these means: click the trigger element, wait for the options list to render, search through the options for the best match, click the right one. Each platform does this differently.

**File uploads.** Resume upload fields are especially tricky. Some use standard `<input type="file">`, some use drag-and-drop zones, some use custom upload widgets with presigned URLs. You can't just set the value of a file input for security reasons — you need to use the `DataTransfer` API to simulate a drop, or trigger the native file picker and intercept it via the extension's background script.

**Multi-step forms.** Workday and some others split applications across multiple pages or dynamic steps. Your engine needs to fill page one, detect when page two loads (MutationObserver on the form container), then fill that, and so on.

**Dynamic fields.** "Do you require visa sponsorship?" → if "Yes," three new fields appear. Your engine needs to handle this cascade — fill the trigger field, wait for the DOM to update, then fill the conditional fields.

**CAPTCHAs and bot detection.** Some sites will flag rapid form filling as bot behavior. You'd want to add small random delays between field fills to mimic human typing speed and avoid triggering anti-automation systems.

---

**The architecture I'd actually ship:**

```
Chrome Extension
├── Content Script (runs on page)
│   ├── FormDetector — finds and classifies all form fields
│   ├── AdapterRegistry — picks the right platform adapter
│   │   ├── GenericAdapter (Layer 1)
│   │   ├── GreenhouseAdapter
│   │   ├── LeverAdapter
│   │   ├── WorkdayAdapter
│   │   └── ...
│   ├── FieldFiller — handles value setting + event dispatch
│   └── FormOrchestrator — coordinates multi-step fills
├── Background Script
│   ├── UserProfile store
│   ├── AI classification service (Layer 3)
│   └── Field mapping cache
└── Popup/Side Panel UI
    ├── Profile editor
    ├── Fill controls
    └── Field review before submission
```

**Critical UX detail:** never auto-submit. Always fill the fields and let the user review before they click submit. This builds trust and prevents disasters. Show a small overlay: "Filled 12/14 fields — 2 need your attention."

---

**Timeline and effort:**

A solid v1 with Layer 1 + 3 platform adapters (Greenhouse, Lever, Workday) is probably 6–8 weeks for a strong engineer. The generic adapter is week one. Each platform adapter is roughly a week of work including testing. The AI fallback layer is another week.

Getting to 95%+ coverage across the long tail is an ongoing effort — you'd be adding adapters and refining heuristics for months. But that first 85% is totally achievable in a focused sprint.

**Bottom line:** it's absolutely buildable. The architecture isn't exotic — it's meticulous. The moat isn't in the AI, it's in the accumulated knowledge of how each platform's DOM works and the edge cases you've solved. That's hard-won, hard-to-copy competitive advantage.

Want me to go deeper on any specific layer, or sketch out the actual code for one of the platform adapters?
