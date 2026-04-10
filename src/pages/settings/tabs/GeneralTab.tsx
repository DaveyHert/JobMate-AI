// ============================================================================
// GeneralTab — Resumes, AI Preferences, Integrations
// ============================================================================
// Resume section implements the "one resume = one profile" model:
//
//   • Each profile has exactly one primary resume (documents.resumes[0]).
//   • The list shows EVERY resume across EVERY profile, regardless of which
//     profile is currently active. The row whose profile matches
//     data.activeProfileId gets an "Active" badge; other rows show a
//     "Make active" button that switches the active profile.
//   • "Upload new resume" creates a BRAND NEW profile (cloned from the
//     currently active one) and auto-switches to it. Exception: if the
//     active profile has NO resume yet, the first upload attaches to it.
//   • The pencil icon opens EditResumeModal so the user can change the label
//     and/or replace the file. Edits apply to that row's parent profile.
//   • The trash icon deletes that row's parent profile (confirmed). At least
//     one profile must always remain.
// ============================================================================

import { useState } from "react";
import { Plus, FileText, Pencil, Trash2, Linkedin } from "lucide-react";
import { toast } from "sonner";
import type {
  CoverLetterTone,
  JobMateData,
  JobMateSettings,
  ResumeDoc,
  UserProfile,
} from "../../../models/models";
import { jobMateStore } from "../../../store/jobMateStore";
import { UploadResumeModal } from "../components/UploadResumeModal";
import { EditResumeModal } from "../components/EditResumeModal";
import { useThemeContext } from "../../../hooks/useThemeContext";

interface GeneralTabProps {
  data: JobMateData;
  // The dashboard already exposes the dark-mode toggle in its sidebar, so the
  // Appearance section is only rendered when this tab is hosted inside the
  // extension popup.
  context?: "popup" | "dashboard";
}

const TONE_OPTIONS: { value: CoverLetterTone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "enthusiastic", label: "Enthusiastic" },
  { value: "concise", label: "Concise" },
];

export function GeneralTab({ data, context = "dashboard" }: GeneralTabProps) {
  const [showUpload, setShowUpload] = useState(false);
  const [editingRow, setEditingRow] = useState<{
    profile: UserProfile;
    resume: ResumeDoc;
  } | null>(null);
  const { preference, setPreference } = useThemeContext();

  const settings = data.settings;
  const profiles = Object.values(data.profiles);
  const activeProfile = data.profiles[data.activeProfileId];

  // Flat list of every resume across every profile (one per profile under
  // the "one resume = one profile" model).
  const resumeRows = profiles
    .map((profile) => ({ profile, resume: profile.documents.resumes[0] }))
    .filter((row): row is { profile: UserProfile; resume: ResumeDoc } => Boolean(row.resume));

  const updateSettings = (patch: Partial<JobMateSettings>) => {
    void jobMateStore.updateSettings(patch);
  };

  // ── Upload: first resume on empty active profile, or new profile otherwise ──

  const handleNewResume = async (doc: ResumeDoc) => {
    const hasResume = activeProfile.documents.resumes.length > 0;

    if (!hasResume) {
      // Attach to active profile and rename it to the resume label.
      await jobMateStore.upsertProfile({
        ...activeProfile,
        label: doc.label,
        documents: { ...activeProfile.documents, resumes: [doc] },
      });
    } else {
      // Create a fresh profile (cloned from active) with only this resume.
      const newId = `profile_${Date.now()}`;
      const newProfile: UserProfile = {
        ...activeProfile,
        id: newId,
        label: doc.label,
        documents: { ...activeProfile.documents, resumes: [doc] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await jobMateStore.upsertProfile(newProfile);
      await jobMateStore.setActiveProfile(newId);
    }
  };

  // ── Edit: label and/or file. Applies to the row's parent profile. ──

  const handleEditSubmit = async (rowProfile: UserProfile, updatedResume: ResumeDoc) => {
    await jobMateStore.upsertProfile({
      ...rowProfile,
      label: updatedResume.label,
      documents: {
        ...rowProfile.documents,
        resumes: rowProfile.documents.resumes.map((r) =>
          r.id === updatedResume.id ? updatedResume : r,
        ),
      },
    });
  };

  // ── Delete: removes the row's parent profile entirely ──

  const handleDeleteProfile = (rowProfile: UserProfile) => {
    if (profiles.length <= 1) {
      toast.error("You need at least one resume profile. Upload a new resume first before deleting this one.");
      return;
    }
    const label = rowProfile.documents.resumes[0]?.label ?? rowProfile.label;
    toast(`Delete "${label}"?`, {
      description: "This profile and its resume will be permanently removed.",
      action: {
        label: "Delete",
        onClick: () => void jobMateStore.deleteProfile(rowProfile.id),
      },
      cancel: { label: "Cancel", onClick: () => {} },
    });
  };

  const handleMakeActive = (rowProfile: UserProfile) => {
    void jobMateStore.setActiveProfile(rowProfile.id);
  };

  return (
    <div className='space-y-10'>
      {/* ── Resumes ── */}
      <section>
        <div className='flex items-start justify-between mb-6'>
          <div>
            <h2 className='text-xl font-semibold text-primary-text'>Resumes</h2>
            <p className='text-sm text-secondary-text mt-1'>
              Each resume is a separate profile. Switching profiles loads the personal info, skills,
              and credentials saved for that resume.
            </p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-primary-600 rounded-lg transition-colors shrink-0'
          >
            <Plus className='w-4 h-4' />
            Upload new resume
          </button>
        </div>

        {resumeRows.length === 0 ? (
          <div className='text-sm text-secondary-text py-10 text-center border border-dashed border-border-col rounded-lg'>
            No resume uploaded yet. Upload one to get started.
          </div>
        ) : (
          <div className='border border-border-col rounded-lg overflow-hidden'>
            {resumeRows.map(({ profile, resume }) => {
              const isActive = profile.id === data.activeProfileId;
              return (
                <div
                  key={profile.id}
                  className='group flex items-center gap-4 px-4 py-4 bg-foreground hover:bg-button-col/50 border-b border-border-col last:border-b-0 transition-colors'
                >
                  <div className='w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center shrink-0'>
                    <FileText className='w-5 h-5 text-accent' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-medium text-primary-text truncate'>
                        {resume.label}
                      </span>
                      {isActive && (
                        <span className='text-[10px] uppercase tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-medium'>
                          Active
                        </span>
                      )}
                    </div>
                    <div className='text-xs text-secondary-text truncate mt-0.5'>
                      {resume.fileName} · {Math.round(resume.sizeBytes / 1024)} KB
                    </div>
                  </div>

                  <div className='flex items-center gap-1 shrink-0'>
                    {!isActive && (
                      <button
                        onClick={() => handleMakeActive(profile)}
                        className='px-3 py-1.5 text-xs font-medium text-accent bg-accent-soft hover:bg-accent hover:text-white rounded-md transition-colors mr-1 opacity-0 group-hover:opacity-100 focus:opacity-100'
                        title='Switch to this profile'
                      >
                        Make active
                      </button>
                    )}

                    {/* Edit label and/or replace file */}
                    <button
                      onClick={() => setEditingRow({ profile, resume })}
                      className='p-2 text-secondary-text hover:text-accent transition-colors'
                      aria-label='Edit resume'
                      title='Edit label or replace file'
                    >
                      <Pencil className='w-4 h-4' />
                    </button>

                    {/* Delete profile */}
                    <button
                      onClick={() => handleDeleteProfile(profile)}
                      className='p-2 text-secondary-text hover:text-danger-500 transition-colors'
                      aria-label='Delete this resume profile'
                      title='Delete resume & profile'
                    >
                      <Trash2 className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── AI Preferences ── */}
      <section>
        <h2 className='text-xl font-semibold text-primary-text mb-2'>AI Preferences</h2>
        <p className='text-sm text-secondary-text mb-4'>
          Tune how JobMate generates cover letters and scores jobs.
        </p>

        <div className='border border-border-col rounded-lg bg-foreground'>
          <Row
            label='Cover letter tone'
            description='The voice used when the AI drafts a cover letter.'
          >
            <select
              value={settings.coverLetterTone}
              onChange={(e) =>
                updateSettings({
                  coverLetterTone: e.target.value as CoverLetterTone,
                })
              }
              className='text-sm bg-background border border-border-col text-primary-text rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent min-w-[180px]'
            >
              {TONE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Row>

          <Divider />

          <Row
            label='Allow resume tweaks'
            description='Let AI suggest small edits to match each job description.'
          >
            <Toggle
              checked={settings.resumeTweaksEnabled}
              onChange={(resumeTweaksEnabled) => updateSettings({ resumeTweaksEnabled })}
            />
          </Row>

          <Divider />

          <Row
            label={`Minimum match score: ${settings.minimumMatchScore}%`}
            description='Only autofill postings that score at or above this threshold.'
          >
            <input
              type='range'
              min={0}
              max={100}
              step={5}
              value={settings.minimumMatchScore}
              onChange={(e) => updateSettings({ minimumMatchScore: Number(e.target.value) })}
              className='w-40 accent-accent'
            />
          </Row>
        </div>
      </section>

      {/* ── Integrations ── */}
      <section>
        <h2 className='text-xl font-semibold text-primary-text mb-2'>Integrations</h2>
        <p className='text-sm text-secondary-text mb-4'>
          Connect external services to speed up data entry.
        </p>

        <div className='border border-border-col rounded-lg bg-foreground'>
          <Row label='LinkedIn' description='Sync your headline and work history.'>
            <button
              onClick={() =>
                updateSettings({
                  linkedInConnected: !settings.linkedInConnected,
                })
              }
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                settings.linkedInConnected
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                  : "bg-accent text-white hover:bg-primary-600"
              }`}
            >
              <Linkedin className='w-4 h-4' />
              {settings.linkedInConnected ? "Connected" : "Connect"}
            </button>
          </Row>
        </div>
      </section>

      {/* ── Appearance (popup-only — dashboard has its own sidebar toggle) ── */}
      {context === "popup" && (
        <section>
          <h2 className='text-xl font-semibold text-primary-text mb-2'>Appearance</h2>
          <p className='text-sm text-secondary-text mb-4'>
            Choose between system, light, or dark mode. Syncs to the dashboard.
          </p>

          <div className='border border-border-col rounded-lg bg-foreground'>
            <Row
              label='Color theme'
              description='System follows your OS setting.'
            >
              <div className='inline-flex items-center border border-border-col rounded-lg overflow-hidden text-xs font-medium'>
                {(["system", "light", "dark"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPreference(p)}
                    className={`px-3 py-1.5 capitalize transition-colors border-r border-border-col last:border-r-0 ${
                      preference === p
                        ? "bg-accent text-white"
                        : "text-secondary-text hover:text-primary-text hover:bg-button-col"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </Row>
          </div>
        </section>
      )}

      {showUpload && (
        <UploadResumeModal onSubmit={handleNewResume} onClose={() => setShowUpload(false)} />
      )}

      {editingRow && (
        <EditResumeModal
          resume={editingRow.resume}
          onSubmit={(updated) => handleEditSubmit(editingRow.profile, updated)}
          onClose={() => setEditingRow(null)}
        />
      )}
    </div>
  );
}

function Row({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className='flex items-center gap-4 px-5 py-5'>
      <div className='flex-1 min-w-0'>
        <div className='text-sm font-medium text-primary-text'>{label}</div>
        {description && <div className='text-xs text-secondary-text mt-1'>{description}</div>}
      </div>
      <div className='shrink-0'>{children}</div>
    </div>
  );
}

function Divider() {
  return <div className='border-t border-dashed border-border-col mx-5' />;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-accent" : "bg-button-col border border-border-col"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
