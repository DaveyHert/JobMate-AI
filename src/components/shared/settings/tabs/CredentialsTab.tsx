// ============================================================================
// CredentialsTab — Academic Qualifications + Non-Academic Credentials
// ============================================================================
// Two list sections matching the Figma (Image 11). Academic entries come from
// profile.education; non-academic entries from profile.credentials. Each row
// renders a framed summary with an inline edit/delete affordance, and a
// trailing "Add another…" button opens a lightweight inline creator.
// ============================================================================

import { useState } from "react";
import { GraduationCap, Award, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import type { Credential, Education, UserProfile } from "@/models/models";
import { jobMateStore } from "@/store/jobMateStore";

interface CredentialsTabProps {
  profile: UserProfile;
}

const TYPE_OPTIONS: { value: Credential["type"]; label: string }[] = [
  { value: "certification", label: "Certification" },
  { value: "license", label: "License" },
  { value: "award", label: "Award" },
  { value: "other", label: "Other" },
];

export function CredentialsTab({ profile }: CredentialsTabProps) {
  const [editingEdu, setEditingEdu] = useState<string | null>(null);
  const [eduDraft, setEduDraft] = useState<Education | null>(null);
  const [addingEdu, setAddingEdu] = useState(false);

  const [editingCred, setEditingCred] = useState<string | null>(null);
  const [credDraft, setCredDraft] = useState<Credential | null>(null);
  const [addingCred, setAddingCred] = useState(false);

  // ---- Education ----

  const startAddEdu = () => {
    setAddingEdu(true);
    setEduDraft({
      id: `edu_${Date.now()}`,
      school: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
    });
  };

  const saveEdu = async () => {
    if (!eduDraft) return;
    const exists = profile.education.some((e) => e.id === eduDraft.id);
    const next = {
      ...profile,
      education: exists
        ? profile.education.map((e) => (e.id === eduDraft.id ? eduDraft : e))
        : [...profile.education, eduDraft],
    };
    await jobMateStore.upsertProfile(next);
    setEditingEdu(null);
    setAddingEdu(false);
    setEduDraft(null);
  };

  const deleteEdu = async (id: string) => {
    const next = {
      ...profile,
      education: profile.education.filter((e) => e.id !== id),
    };
    await jobMateStore.upsertProfile(next);
  };

  // ---- Credentials ----

  const startAddCred = () => {
    setAddingCred(true);
    setCredDraft({
      id: `cred_${Date.now()}`,
      type: "certification",
      name: "",
      issuer: "",
      issueDate: "",
      expiryDate: "",
      credentialId: "",
      credentialUrl: "",
    });
  };

  const saveCred = async () => {
    if (!credDraft) return;
    const existing = profile.credentials ?? [];
    const exists = existing.some((c) => c.id === credDraft.id);
    const next = {
      ...profile,
      credentials: exists
        ? existing.map((c) => (c.id === credDraft.id ? credDraft : c))
        : [...existing, credDraft],
    };
    await jobMateStore.upsertProfile(next);
    setEditingCred(null);
    setAddingCred(false);
    setCredDraft(null);
  };

  const deleteCred = async (id: string) => {
    const next = {
      ...profile,
      credentials: (profile.credentials ?? []).filter((c) => c.id !== id),
    };
    await jobMateStore.upsertProfile(next);
  };

  return (
    <div className='space-y-10'>
      {/* Academic Qualifications */}
      <section>
        <div className='mb-4'>
          <h2 className='text-primary-text text-xl font-semibold'>Academic Qualifications</h2>
          <p className='text-secondary-text mt-1 text-sm'>
            Your degrees, coursework, and academic achievements.
          </p>
        </div>

        <div className='space-y-3'>
          {profile.education.map((edu) =>
            editingEdu === edu.id && eduDraft ? (
              <EducationEditor
                key={edu.id}
                draft={eduDraft}
                setDraft={setEduDraft}
                onSave={saveEdu}
                onCancel={() => {
                  setEditingEdu(null);
                  setEduDraft(null);
                }}
              />
            ) : (
              <EducationRow
                key={edu.id}
                edu={edu}
                onEdit={() => {
                  setEditingEdu(edu.id);
                  setEduDraft(edu);
                }}
                onDelete={() => deleteEdu(edu.id)}
              />
            ),
          )}

          {addingEdu && eduDraft && (
            <EducationEditor
              draft={eduDraft}
              setDraft={setEduDraft}
              onSave={saveEdu}
              onCancel={() => {
                setAddingEdu(false);
                setEduDraft(null);
              }}
            />
          )}

          {!addingEdu && (
            <button
              onClick={startAddEdu}
              className='text-brand-accent hover:text-brand-600 flex items-center gap-2 text-sm font-medium transition-colors'
            >
              <Plus className='h-4 w-4' />
              Add another certificate
            </button>
          )}
        </div>
      </section>

      {/* Non-Academic Credentials */}
      <section>
        <div className='mb-4'>
          <h2 className='text-primary-text text-xl font-semibold'>Non-Academic Credentials</h2>
          <p className='text-secondary-text mt-1 text-sm'>
            Industry certifications, licenses, and awards.
          </p>
        </div>

        <div className='space-y-3'>
          {(profile.credentials ?? []).map((cred) =>
            editingCred === cred.id && credDraft ? (
              <CredentialEditor
                key={cred.id}
                draft={credDraft}
                setDraft={setCredDraft}
                onSave={saveCred}
                onCancel={() => {
                  setEditingCred(null);
                  setCredDraft(null);
                }}
              />
            ) : (
              <CredentialRow
                key={cred.id}
                cred={cred}
                onEdit={() => {
                  setEditingCred(cred.id);
                  setCredDraft(cred);
                }}
                onDelete={() => deleteCred(cred.id)}
              />
            ),
          )}

          {addingCred && credDraft && (
            <CredentialEditor
              draft={credDraft}
              setDraft={setCredDraft}
              onSave={saveCred}
              onCancel={() => {
                setAddingCred(false);
                setCredDraft(null);
              }}
            />
          )}

          {!addingCred && (
            <button
              onClick={startAddCred}
              className='text-brand-accent hover:text-brand-600 flex items-center gap-2 text-sm font-medium transition-colors'
            >
              <Plus className='h-4 w-4' />
              Add another credential
            </button>
          )}
        </div>
      </section>
    </div>
  );
}

// ---- Education row + editor ----

function EducationRow({
  edu,
  onEdit,
  onDelete,
}: {
  edu: Education;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className='border-brand-border bg-app-foreground flex items-start gap-4 rounded-lg border p-4'>
      <div className='bg-brand-accent-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'>
        <GraduationCap className='text-brand-accent h-5 w-5' />
      </div>
      <div className='min-w-0 flex-1'>
        <div className='text-primary-text text-sm font-medium'>
          {edu.degree || "Untitled degree"}
          {edu.fieldOfStudy && <span className='text-secondary-text'> · {edu.fieldOfStudy}</span>}
        </div>
        <div className='text-secondary-text mt-0.5 text-xs'>{edu.school}</div>
        {(edu.startDate || edu.endDate) && (
          <div className='text-secondary-text mt-0.5 text-xs'>
            {edu.startDate ?? "—"} – {edu.endDate ?? "Present"}
          </div>
        )}
      </div>
      <div className='flex shrink-0 items-center gap-1'>
        <button
          onClick={onEdit}
          className='text-secondary-text hover:text-primary-text p-2 transition-colors'
          aria-label='Edit'
        >
          <Pencil className='h-4 w-4' />
        </button>
        <button
          onClick={onDelete}
          className='text-secondary-text hover:text-danger-400 p-2 transition-colors'
          aria-label='Delete'
        >
          <Trash2 className='h-4 w-4' />
        </button>
      </div>
    </div>
  );
}

function EducationEditor({
  draft,
  setDraft,
  onSave,
  onCancel,
}: {
  draft: Education;
  setDraft: (d: Education) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className='border-brand-accent bg-app-foreground space-y-3 rounded-lg border p-4'>
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        <InputField
          label='Degree'
          value={draft.degree}
          onChange={(v) => setDraft({ ...draft, degree: v })}
          placeholder='B.Sc. Computer Science'
        />
        <InputField
          label='Field of study'
          value={draft.fieldOfStudy ?? ""}
          onChange={(v) => setDraft({ ...draft, fieldOfStudy: v })}
          placeholder='Software Engineering'
        />
        <InputField
          label='School'
          value={draft.school}
          onChange={(v) => setDraft({ ...draft, school: v })}
          placeholder='University of Lagos'
        />
        <div />
        <InputField
          label='Start date'
          type='month'
          value={draft.startDate ?? ""}
          onChange={(v) => setDraft({ ...draft, startDate: v })}
        />
        <InputField
          label='End date'
          type='month'
          value={draft.endDate ?? ""}
          onChange={(v) => setDraft({ ...draft, endDate: v })}
        />
      </div>
      <EditorActions onSave={onSave} onCancel={onCancel} />
    </div>
  );
}

// ---- Credential row + editor ----

function CredentialRow({
  cred,
  onEdit,
  onDelete,
}: {
  cred: Credential;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className='border-brand-border bg-app-foreground flex items-start gap-4 rounded-lg border p-4'>
      <div className='bg-brand-accent-soft flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'>
        <Award className='text-brand-accent h-5 w-5' />
      </div>
      <div className='min-w-0 flex-1'>
        <div className='text-primary-text text-sm font-medium'>
          {cred.name || "Untitled credential"}
        </div>
        <div className='text-secondary-text mt-0.5 text-xs'>
          {cred.issuer}
          {cred.issueDate && ` · Issued ${cred.issueDate}`}
          {cred.expiryDate && ` · Expires ${cred.expiryDate}`}
        </div>
      </div>
      <div className='flex shrink-0 items-center gap-1'>
        <button
          onClick={onEdit}
          className='text-secondary-text hover:text-primary-text p-2 transition-colors'
          aria-label='Edit'
        >
          <Pencil className='h-4 w-4' />
        </button>
        <button
          onClick={onDelete}
          className='text-secondary-text hover:text-danger-400 p-2 transition-colors'
          aria-label='Delete'
        >
          <Trash2 className='h-4 w-4' />
        </button>
      </div>
    </div>
  );
}

function CredentialEditor({
  draft,
  setDraft,
  onSave,
  onCancel,
}: {
  draft: Credential;
  setDraft: (d: Credential) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className='border-brand-accent bg-app-foreground space-y-3 rounded-lg border p-4'>
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        <div>
          <label className='text-secondary-text mb-1 block text-xs font-medium'>Type</label>
          <select
            value={draft.type}
            onChange={(e) => setDraft({ ...draft, type: e.target.value as Credential["type"] })}
            className={inputCls}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <InputField
          label='Name'
          value={draft.name}
          onChange={(v) => setDraft({ ...draft, name: v })}
          placeholder='AWS Solutions Architect'
        />
        <InputField
          label='Issuer'
          value={draft.issuer}
          onChange={(v) => setDraft({ ...draft, issuer: v })}
          placeholder='Amazon Web Services'
        />
        <InputField
          label='Credential ID'
          value={draft.credentialId ?? ""}
          onChange={(v) => setDraft({ ...draft, credentialId: v })}
        />
        <InputField
          label='Issue date'
          type='month'
          value={draft.issueDate ?? ""}
          onChange={(v) => setDraft({ ...draft, issueDate: v })}
        />
        <InputField
          label='Expiry date'
          type='month'
          value={draft.expiryDate ?? ""}
          onChange={(v) => setDraft({ ...draft, expiryDate: v })}
        />
        <div className='sm:col-span-2'>
          <InputField
            label='Credential URL'
            type='url'
            value={draft.credentialUrl ?? ""}
            onChange={(v) => setDraft({ ...draft, credentialUrl: v })}
            placeholder='https://…'
          />
        </div>
      </div>
      <EditorActions onSave={onSave} onCancel={onCancel} />
    </div>
  );
}

// ---- Shared ----

const inputCls =
  "w-full text-sm bg-app-background border border-brand-border text-primary-text rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent placeholder:text-secondary-text";

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className='text-secondary-text mb-1 block text-xs font-medium'>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
    </div>
  );
}

function EditorActions({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  return (
    <div className='flex justify-end gap-2 pt-1'>
      <button
        onClick={onCancel}
        className='text-secondary-text hover:text-primary-text flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors'
      >
        <X className='h-4 w-4' />
        Cancel
      </button>
      <button
        onClick={onSave}
        className='bg-brand-accent hover:bg-brand-600 flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-white transition-colors'
      >
        <Check className='h-4 w-4' />
        Save
      </button>
    </div>
  );
}
