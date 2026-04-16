// ============================================================================
// Deterministic string hash
// ============================================================================
// Used to compute field signatures and form signatures. These values become
// cache keys in SiteCache, so stability across runs is non-negotiable — do not
// swap this for anything non-deterministic like Math.random or Date.now.
// ============================================================================

/**
 * FNV-1a 32-bit hash, returned as a lowercase hex string.
 *
 * Why FNV-1a: it's short, dependency-free, deterministic, and has good-enough
 * distribution for cache keys. We are not using this for cryptography; collision
 * resistance only has to survive "two field identities on one page".
 */
export function hashString(input: string): string {
  let hash = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    // 32-bit FNV prime multiplication, kept in Uint32 range
    hash = Math.imul(hash, 0x01000193);
  }
  // >>> 0 coerces to an unsigned 32-bit int before hex conversion
  return (hash >>> 0).toString(16).padStart(8, "0");
}

/**
 * Normalize a string before hashing. We want two fields with the same
 * semantic identity to produce the same hash even if their labels differ in
 * whitespace, punctuation, or casing.
 */
export function normalizeForHash(input: string): string {
  return input
    .toLowerCase()
    .replace(/[\s\u00a0]+/g, " ")
    .replace(/[^\w\s@.-]/g, "")
    .trim();
}
