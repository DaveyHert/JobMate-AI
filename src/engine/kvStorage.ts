// ============================================================================
// Tiny typed key-value wrapper around chrome.storage.local
// ============================================================================
// SiteCache and AnswerBank both need "read/write a blob under a stable key,
// fall back to localStorage in dev". Rather than duplicate the backend logic
// from jobMateStore, we expose a minimal generic helper here.
//
// This is deliberately scoped to the engine's cache layer — it does NOT
// replace jobMateStore. jobMateStore owns the main envelope; these keys are
// intentionally stored separately so a cache invalidation doesn't risk
// touching profile data.
// ============================================================================

function hasChromeStorage(): boolean {
  return (
    typeof chrome !== "undefined" &&
    !!chrome.storage &&
    !!chrome.storage.local
  );
}

export async function kvGet<T>(key: string): Promise<T | null> {
  if (hasChromeStorage()) {
    const result = await chrome.storage.local.get([key]);
    return (result[key] as T) ?? null;
  }
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function kvSet<T>(key: string, value: T): Promise<void> {
  if (hasChromeStorage()) {
    await chrome.storage.local.set({ [key]: value });
    return;
  }
  localStorage.setItem(key, JSON.stringify(value));
}

export async function kvRemove(key: string): Promise<void> {
  if (hasChromeStorage()) {
    await chrome.storage.local.remove([key]);
    return;
  }
  localStorage.removeItem(key);
}
