// ============================================================================
// JobMate store — single source of truth for anything persisted.
// ============================================================================
// Wraps chrome.storage.local for extension contexts (background, content,
// popup, dashboard) and falls back to localStorage in dev (Vite preview,
// Storybook, etc.) so the app is runnable outside the extension shell.
//
// Always go through this module — do not call chrome.storage.local directly.
// ============================================================================

import type {
  JobMateData,
  JobMateSettings,
  UserProfile,
  Application,
  ApplicationStatus,
} from "../models/models";
import { CURRENT_SCHEMA_VERSION } from "../models/models";
import { createDefaultJobMateData } from "../data/mockProfiles";

const STORAGE_KEY = "jobMateData";

// ---------- Storage backend abstraction ----------

interface StorageBackend {
  get(): Promise<JobMateData | null>;
  set(data: JobMateData): Promise<void>;
  onChange(cb: (data: JobMateData) => void): () => void;
}

function hasChromeStorage(): boolean {
  return (
    typeof chrome !== "undefined" &&
    !!chrome.storage &&
    !!chrome.storage.local
  );
}

class ChromeStorageBackend implements StorageBackend {
  async get(): Promise<JobMateData | null> {
    const result = await chrome.storage.local.get([STORAGE_KEY]);
    return (result[STORAGE_KEY] as JobMateData) ?? null;
  }

  async set(data: JobMateData): Promise<void> {
    await chrome.storage.local.set({ [STORAGE_KEY]: data });
  }

  onChange(cb: (data: JobMateData) => void): () => void {
    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName !== "local") return;
      const change = changes[STORAGE_KEY];
      if (change && change.newValue) {
        cb(change.newValue as JobMateData);
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }
}

class LocalStorageBackend implements StorageBackend {
  async get(): Promise<JobMateData | null> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as JobMateData) : null;
    } catch {
      return null;
    }
  }

  async set(data: JobMateData): Promise<void> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Emit a synthetic event for same-tab subscribers.
    window.dispatchEvent(
      new CustomEvent("jobmate-store-change", { detail: data })
    );
  }

  onChange(cb: (data: JobMateData) => void): () => void {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<JobMateData>).detail;
      if (detail) cb(detail);
    };
    window.addEventListener("jobmate-store-change", handler);
    // Cross-tab via storage event.
    const storageHandler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          cb(JSON.parse(e.newValue) as JobMateData);
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("storage", storageHandler);
    return () => {
      window.removeEventListener("jobmate-store-change", handler);
      window.removeEventListener("storage", storageHandler);
    };
  }
}

// ---------- Migrations ----------

function migrate(data: JobMateData): JobMateData {
  // Future schema migrations land here. For now we only have version 1.
  if (data.version !== CURRENT_SCHEMA_VERSION) {
    // Unknown version — reset to defaults rather than risk corrupt reads.
    console.warn(
      `[jobMateStore] Unknown schema version ${data.version}, resetting to defaults`
    );
    return createDefaultJobMateData();
  }
  return splitMultiResumeProfiles(data);
}

/**
 * Enforce the "one resume = one profile" model. Any profile with more than
 * one resume gets split: the first resume stays on the original profile,
 * and every additional resume becomes its own cloned profile. Also ensures
 * exactly one resume across all profiles is marked as default.
 */
function splitMultiResumeProfiles(data: JobMateData): JobMateData {
  const profilesArr = Object.values(data.profiles);
  const needsSplit = profilesArr.some((p) => p.documents.resumes.length > 1);
  const anyDefault = profilesArr.some((p) =>
    p.documents.resumes.some((r) => r.isDefault)
  );
  if (!needsSplit && anyDefault) return data;

  const nextProfiles: Record<string, UserProfile> = {};
  let counter = 0;
  for (const profile of profilesArr) {
    const resumes = profile.documents.resumes;
    if (resumes.length <= 1) {
      nextProfiles[profile.id] = profile;
      continue;
    }
    // Keep the first resume on the original profile.
    const [first, ...rest] = resumes;
    nextProfiles[profile.id] = {
      ...profile,
      label: first?.label ?? profile.label,
      documents: { ...profile.documents, resumes: first ? [first] : [] },
    };
    // Spawn a new profile for each remaining resume, cloned from original.
    for (const resume of rest) {
      counter += 1;
      const newId = `profile_${Date.now()}_${counter}`;
      nextProfiles[newId] = {
        ...profile,
        id: newId,
        label: resume.label,
        documents: { ...profile.documents, resumes: [resume] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  }

  // Ensure exactly one default across all profiles.
  const allResumes = Object.values(nextProfiles).flatMap((p) =>
    p.documents.resumes.map((r) => ({ profileId: p.id, resume: r }))
  );
  if (allResumes.length > 0) {
    const hasDefault = allResumes.some(({ resume }) => resume.isDefault);
    if (!hasDefault) {
      const firstProfileId = allResumes[0].profileId;
      const firstResumeId = allResumes[0].resume.id;
      nextProfiles[firstProfileId] = {
        ...nextProfiles[firstProfileId],
        documents: {
          ...nextProfiles[firstProfileId].documents,
          resumes: nextProfiles[firstProfileId].documents.resumes.map((r) =>
            r.id === firstResumeId ? { ...r, isDefault: true } : r
          ),
        },
      };
    } else {
      // If multiple defaults (from legacy data), keep only the first.
      let seen = false;
      for (const profileId of Object.keys(nextProfiles)) {
        const p = nextProfiles[profileId];
        const updated = p.documents.resumes.map((r) => {
          if (!r.isDefault) return r;
          if (seen) return { ...r, isDefault: false };
          seen = true;
          return r;
        });
        nextProfiles[profileId] = {
          ...p,
          documents: { ...p.documents, resumes: updated },
        };
      }
    }
  }

  const activeProfileId = nextProfiles[data.activeProfileId]
    ? data.activeProfileId
    : Object.keys(nextProfiles)[0] ?? data.activeProfileId;

  return { ...data, profiles: nextProfiles, activeProfileId };
}

// ---------- JobMateStore ----------

type Listener = (data: JobMateData) => void;

class JobMateStore {
  private backend: StorageBackend;
  private cache: JobMateData | null = null;
  private listeners = new Set<Listener>();
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.backend = hasChromeStorage()
      ? new ChromeStorageBackend()
      : new LocalStorageBackend();

    // React to external writes (other extension contexts).
    this.backend.onChange((data) => {
      this.cache = migrate(data);
      this.emit();
    });
  }

  /** Ensure the cache is populated. Idempotent. */
  private async ensureInit(): Promise<void> {
    if (this.cache) return;
    if (!this.initPromise) {
      this.initPromise = (async () => {
        const stored = await this.backend.get();
        if (stored) {
          const migrated = migrate(stored);
          this.cache = migrated;
          // Persist if migration actually changed the data (reference
          // inequality means splitMultiResumeProfiles produced a new object).
          if (migrated !== stored) {
            await this.backend.set(migrated);
          }
        } else {
          this.cache = createDefaultJobMateData();
          await this.backend.set(this.cache);
        }
      })();
    }
    await this.initPromise;
  }

  private emit(): void {
    if (!this.cache) return;
    for (const listener of this.listeners) {
      try {
        listener(this.cache);
      } catch (err) {
        console.error("[jobMateStore] listener error", err);
      }
    }
  }

  private async commit(next: JobMateData): Promise<void> {
    this.cache = next;
    await this.backend.set(next);
    this.emit();
  }

  // ---- Read ----

  async getData(): Promise<JobMateData> {
    await this.ensureInit();
    return this.cache!;
  }

  async getActiveProfile(): Promise<UserProfile> {
    const data = await this.getData();
    const profile = data.profiles[data.activeProfileId];
    if (!profile) {
      // Defensive: active pointer is stale, fall back to any profile.
      const fallback = Object.values(data.profiles)[0];
      if (!fallback) throw new Error("No profiles available");
      return fallback;
    }
    return profile;
  }

  async getProfiles(): Promise<UserProfile[]> {
    const data = await this.getData();
    return Object.values(data.profiles);
  }

  async getSettings(): Promise<JobMateSettings> {
    const data = await this.getData();
    return data.settings;
  }

  async getApplications(): Promise<Application[]> {
    const data = await this.getData();
    return data.applications;
  }

  // ---- Write: profiles ----

  async setActiveProfile(id: string): Promise<void> {
    const data = await this.getData();
    if (!data.profiles[id]) {
      throw new Error(`Profile not found: ${id}`);
    }
    await this.commit({ ...data, activeProfileId: id });
  }

  async upsertProfile(profile: UserProfile): Promise<void> {
    const data = await this.getData();
    const now = new Date().toISOString();
    const next: JobMateData = {
      ...data,
      profiles: {
        ...data.profiles,
        [profile.id]: { ...profile, updatedAt: now },
      },
    };
    await this.commit(next);
  }

  /**
   * Mark a single resume (by id) as the default. Clears `isDefault` on every
   * other resume across every profile, so exactly one default exists globally.
   */
  async setDefaultResume(resumeId: string): Promise<void> {
    const data = await this.getData();
    const nextProfiles: Record<string, UserProfile> = {};
    for (const [pid, profile] of Object.entries(data.profiles)) {
      nextProfiles[pid] = {
        ...profile,
        documents: {
          ...profile.documents,
          resumes: profile.documents.resumes.map((r) => ({
            ...r,
            isDefault: r.id === resumeId,
          })),
        },
      };
    }
    await this.commit({ ...data, profiles: nextProfiles });
  }

  async deleteProfile(id: string): Promise<void> {
    const data = await this.getData();
    if (!data.profiles[id]) return;
    if (Object.keys(data.profiles).length <= 1) {
      throw new Error("Cannot delete the only profile");
    }
    const { [id]: _removed, ...rest } = data.profiles;
    const nextActive =
      data.activeProfileId === id ? Object.keys(rest)[0] : data.activeProfileId;
    await this.commit({
      ...data,
      profiles: rest,
      activeProfileId: nextActive,
    });
  }

  // ---- Write: settings ----

  async updateSettings(patch: Partial<JobMateSettings>): Promise<void> {
    const data = await this.getData();
    await this.commit({
      ...data,
      settings: { ...data.settings, ...patch },
    });
  }

  // ---- Write: applications ----

  async addApplication(
    app: Omit<Application, "id" | "status" | "dateApplied" | "history">
  ): Promise<Application> {
    const data = await this.getData();
    const now = new Date().toISOString();
    const application: Application = {
      ...app,
      id: Date.now(),
      status: "applied",
      dateApplied: now,
      history: [{ status: "applied", date: now }],
    };
    await this.commit({
      ...data,
      applications: [application, ...data.applications],
      weeklyGoal: { ...data.weeklyGoal, current: data.weeklyGoal.current + 1 },
    });
    return application;
  }

  async updateApplicationStatus(
    id: number,
    status: ApplicationStatus
  ): Promise<void> {
    const data = await this.getData();
    const now = new Date().toISOString();
    const applications = data.applications.map((app) =>
      app.id === id
        ? {
            ...app,
            status,
            history: [...(app.history ?? []), { status, date: now }],
          }
        : app
    );
    await this.commit({ ...data, applications });
  }

  async deleteApplication(id: number): Promise<void> {
    const data = await this.getData();
    await this.commit({
      ...data,
      applications: data.applications.filter((app) => app.id !== id),
    });
  }

  /**
   * Replace the entire applications array. Used when a row is edited in
   * place (notes, title, etc.) — we don't have a per-field mutator.
   */
  async replaceApplications(applications: Application[]): Promise<void> {
    const data = await this.getData();
    await this.commit({ ...data, applications });
  }

  // ---- Subscribe ----

  /**
   * Subscribe to store changes. The callback is invoked on every write
   * (from any context). Returns an unsubscribe function.
   */
  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    // Fire immediately with current state if available.
    if (this.cache) listener(this.cache);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

// Singleton — every import in every context gets the same instance
// within that context. Cross-context sync happens via backend.onChange.
export const jobMateStore = new JobMateStore();
