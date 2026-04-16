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
import { Plus, Linkedin } from "lucide-react";
import { toast } from "sonner";
import type {
  CoverLetterTone,
  JobMateData,
  JobMateSettings,
  ResumeDoc,
  UserProfile,
} from "@/models/models";
import { jobMateStore } from "@/store/jobMateStore";
import { UploadResumeModal } from "../components/UploadResumeModal";
import { EditResumeModal } from "../components/EditResumeModal";
import { useThemeContext } from "@hooks/useThemeContext";
import SettingsSection from "../components/SettingsSection";
import ToggleSwitch from "../components/ToggleSwitch";
import SettingsCard from "../components/SettingsCard";
import ResumeRow from "../components/ResumeRow";
import SettingRow from "../components/SettingRow";

// --- Types & Constants ---

interface GeneralTabProps {
  data: JobMateData;
  context?: "popup" | "dashboard";
}

const TONE_OPTIONS: { value: CoverLetterTone; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "enthusiastic", label: "Enthusiastic" },
  { value: "concise", label: "Concise" },
];

// --- Main Component ---

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

  // Helper to flat list every resume across profiles
  const resumeRows = profiles
    .map((profile) => ({ profile, resume: profile.documents.resumes[0] }))
    .filter((row): row is { profile: UserProfile; resume: ResumeDoc } => Boolean(row.resume));

  const updateSettings = (patch: Partial<JobMateSettings>) => {
    void jobMateStore.updateSettings(patch);
  };

  // --- Handlers ---

  const handleNewResume = async (doc: ResumeDoc) => {
    const hasResume = activeProfile.documents.resumes.length > 0;
    if (!hasResume) {
      await jobMateStore.upsertProfile({
        ...activeProfile,
        label: doc.label,
        documents: { ...activeProfile.documents, resumes: [doc] },
      });
    } else {
      const newId = `profile_${Date.now()}`;
      await jobMateStore.upsertProfile({
        ...activeProfile,
        id: newId,
        label: doc.label,
        documents: { ...activeProfile.documents, resumes: [doc] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      await jobMateStore.setActiveProfile(newId);
    }
  };

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

  const handleDeleteProfile = (rowProfile: UserProfile) => {
    if (profiles.length <= 1) {
      toast.error("You need at least one resume profile.");
      return;
    }
    const label = rowProfile.documents.resumes[0]?.label ?? rowProfile.label;
    toast(`Delete "${label}"?`, {
      description: "This profile and its resume will be permanently removed.",
      action: {
        label: "Delete",
        onClick: () => void jobMateStore.deleteProfile(rowProfile.id),
      },
    });
  };

  return (
    <div className='space-y-10'>
      {/* --- Resumes Section --- */}
      <SettingsSection
        title='Resumes'
        description='Each resume is a separate profile. Switching profiles loads the personal info, skills, and credentials saved for that resume.'
        action={
          <button
            onClick={() => setShowUpload(true)}
            className='bg-brand-accent hover:bg-brand-600 flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors'
          >
            <Plus className='h-4 w-4' />
            Upload new resume
          </button>
        }
      >
        {resumeRows.length === 0 ? (
          <div className='text-neutral-05 border-brand-border rounded-lg border border-dashed py-10 text-center text-sm'>
            No resume uploaded yet. Upload one to get started.
          </div>
        ) : (
          <SettingsCard padding={false} divided>
            {resumeRows.map((row) => (
              <ResumeRow
                key={row.profile.id}
                profile={row.profile}
                resume={row.resume}
                isActive={row.profile.id === data.activeProfileId}
                onMakeActive={(p) => void jobMateStore.setActiveProfile(p.id)}
                onEdit={() => setEditingRow(row)}
                onDelete={() => handleDeleteProfile(row.profile)}
              />
            ))}
          </SettingsCard>
        )}
      </SettingsSection>

      {/* --- AI Preferences Section --- */}
      <SettingsSection
        title='AI Preferences'
        description='Tune how JobMate generates cover letters and scores jobs.'
      >
        <SettingsCard divided>
          <SettingRow
            label='Cover letter tone'
            description='The voice used when the AI drafts a cover letter.'
          >
            <select
              value={settings.coverLetterTone}
              onChange={(e) =>
                updateSettings({ coverLetterTone: e.target.value as CoverLetterTone })
              }
              className='bg-app-background border-brand-border text-neutral-06 focus:ring-brand-accent/30 focus:border-brand-accent min-w-[180px] rounded-md border px-3 py-1.5 text-sm focus:ring-2 focus:outline-none'
            >
              {TONE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </SettingRow>

          <SettingRow
            label='Allow resume tweaks'
            description='Let AI suggest small edits to match each job description.'
          >
            <ToggleSwitch
              checked={settings.resumeTweaksEnabled}
              onChange={(val) => updateSettings({ resumeTweaksEnabled: val })}
            />
          </SettingRow>

          <SettingRow
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
              className='accent-brand-accent w-40'
            />
          </SettingRow>
        </SettingsCard>
      </SettingsSection>

      {/* --- Integrations Section --- */}
      <SettingsSection
        title='Integrations'
        description='Connect external services to speed up data entry.'
      >
        <SettingsCard>
          <SettingRow label='LinkedIn' description='Sync your headline and work history.'>
            <button
              onClick={() => updateSettings({ linkedInConnected: !settings.linkedInConnected })}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                settings.linkedInConnected
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "bg-brand-accent hover:bg-brand-600 text-white"
              }`}
            >
              <Linkedin className='h-4 w-4' />
              {settings.linkedInConnected ? "Connected" : "Connect"}
            </button>
          </SettingRow>
        </SettingsCard>
      </SettingsSection>

      {/* --- Appearance Section (Popup Only) --- */}
      {context === "popup" && (
        <SettingsSection
          title='Appearance'
          description='Choose between system, light, or dark mode. Syncs to the dashboard.'
        >
          <SettingsCard>
            <SettingRow label='Color theme' description='System follows your OS setting.'>
              <div className='border-brand-border inline-flex items-center overflow-hidden rounded-lg border text-xs font-medium'>
                {(["system", "light", "dark"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPreference(p)}
                    className={`border-brand-border border-r px-3 py-1.5 capitalize transition-colors last:border-r-0 ${
                      preference === p
                        ? "bg-brand-accent text-white"
                        : "text-neutral-05 hover:text-neutral-06 hover:bg-brand-btn"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </SettingRow>
          </SettingsCard>
        </SettingsSection>
      )}

      {/* --- Developer Section --- */}
      <SettingsSection
        title='Developer'
        description='Debugging tools — not intended for everyday use.'
      >
        <SettingsCard>
          <SettingRow
            label='Highlight detected form fields'
            description='Draw a blue outline on every input JobMate recognises when a page loads.'
          >
            <ToggleSwitch
              checked={settings.highlightFormFields}
              onChange={(val) => updateSettings({ highlightFormFields: val })}
            />
          </SettingRow>
        </SettingsCard>
      </SettingsSection>

      {/* --- Modals --- */}
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
