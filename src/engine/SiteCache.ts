// ============================================================================
// SiteCache — remembers field → profile mappings per site
// ============================================================================
// This is the moat. Every time the MappingResolver figures out what a field
// on, say, workday.com maps to, we save that decision here. Next visit, we
// look up the form by its content-based signature and apply the cached
// mapping directly — no rules, no LLM call, no latency.
//
// Storage shape (stored under "jobmate.siteCache" in chrome.storage.local):
//
//   {
//     "workday.com": {
//       origin: "https://workday.com",
//       forms: {
//         "<formSignature>": MappingSet,
//         ...
//       },
//       updatedAt: 1234567890
//     },
//     ...
//   }
//
// Keyed by bare hostname (not full origin) so http/https and subdomain
// cookies don't create parallel cache entries for the same ATS.
//
// Invalidation:
//   - Entries older than SITE_CACHE_TTL_MS are ignored on read.
//   - The user can clear individual origins or the whole cache from Settings.
//   - Schema bumps drop the cache wholesale (simpler than migrating mappings).
// ============================================================================

import type { FieldMapping, MappingSet } from "./types";
import { kvGet, kvRemove, kvSet } from "./kvStorage";

const STORAGE_KEY = "jobmate.siteCache";
const CACHE_SCHEMA_VERSION = 1;

// 30 days. Long enough that a monthly job search sees cache hits; short
// enough that an ATS redesign doesn't keep us on stale mappings forever.
const SITE_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

interface SiteEntry {
  origin: string;
  forms: Record<string, MappingSet>;
  updatedAt: number;
}

interface SiteCacheFile {
  version: number;
  sites: Record<string, SiteEntry>;
}

function emptyFile(): SiteCacheFile {
  return { version: CACHE_SCHEMA_VERSION, sites: {} };
}

function hostFromOrigin(origin: string): string {
  try {
    return new URL(origin).hostname.replace(/^www\./, "");
  } catch {
    return origin;
  }
}

class SiteCache {
  private cache: SiteCacheFile | null = null;
  private initPromise: Promise<void> | null = null;

  private async ensureInit(): Promise<void> {
    if (this.cache) return;
    if (!this.initPromise) {
      this.initPromise = (async () => {
        const stored = await kvGet<SiteCacheFile>(STORAGE_KEY);
        if (stored && stored.version === CACHE_SCHEMA_VERSION) {
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

  /**
   * Look up a cached MappingSet for a given form on a given origin. Returns
   * null on miss or if the entry is past its TTL.
   */
  async get(origin: string, formSignature: string): Promise<MappingSet | null> {
    await this.ensureInit();
    const host = hostFromOrigin(origin);
    const entry = this.cache!.sites[host];
    if (!entry) return null;

    const mapping = entry.forms[formSignature];
    if (!mapping) return null;

    if (Date.now() - mapping.resolvedAt > SITE_CACHE_TTL_MS) {
      return null;
    }
    return mapping;
  }

  /**
   * Store a resolved MappingSet. If a site entry already exists we merge
   * form-by-form so we don't lose unrelated cached forms on the same origin.
   */
  async put(origin: string, mapping: MappingSet): Promise<void> {
    await this.ensureInit();
    const host = hostFromOrigin(origin);
    const existing = this.cache!.sites[host];
    const nextEntry: SiteEntry = {
      origin,
      forms: {
        ...(existing?.forms ?? {}),
        [mapping.formSignature]: mapping,
      },
      updatedAt: Date.now(),
    };
    this.cache!.sites[host] = nextEntry;
    await this.commit();
  }

  /**
   * Merge a per-field mapping into whatever set already exists for this
   * form, or create a new set. Used when a single field is taught by the
   * user via the ReviewOverlay and we want to persist that one correction
   * without re-writing the whole form's mapping set.
   */
  async upsertFieldMapping(
    origin: string,
    formSignature: string,
    mapping: FieldMapping
  ): Promise<void> {
    await this.ensureInit();
    const host = hostFromOrigin(origin);
    const entry = this.cache!.sites[host] ?? {
      origin,
      forms: {},
      updatedAt: Date.now(),
    };
    const existingSet = entry.forms[formSignature];
    const nextSet: MappingSet = existingSet
      ? {
          ...existingSet,
          mappings: {
            ...existingSet.mappings,
            [mapping.fieldSignature]: mapping,
          },
          resolvedAt: Date.now(),
        }
      : {
          formSignature,
          mappings: { [mapping.fieldSignature]: mapping },
          resolvedAt: Date.now(),
        };
    entry.forms[formSignature] = nextSet;
    entry.updatedAt = Date.now();
    this.cache!.sites[host] = entry;
    await this.commit();
  }

  /** Drop every cached mapping for a given origin. */
  async clearOrigin(origin: string): Promise<void> {
    await this.ensureInit();
    const host = hostFromOrigin(origin);
    if (this.cache!.sites[host]) {
      delete this.cache!.sites[host];
      await this.commit();
    }
  }

  /** Nuke the whole cache. Exposed for "Clear cache" in Settings. */
  async clearAll(): Promise<void> {
    this.cache = emptyFile();
    await kvRemove(STORAGE_KEY);
  }

  /** Inspection for debugging / Settings UI. */
  async listSites(): Promise<Array<{ host: string; forms: number; updatedAt: number }>> {
    await this.ensureInit();
    return Object.entries(this.cache!.sites).map(([host, entry]) => ({
      host,
      forms: Object.keys(entry.forms).length,
      updatedAt: entry.updatedAt,
    }));
  }
}

export const siteCache = new SiteCache();
