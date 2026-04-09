// ============================================================================
// ProfessionalInfoTab — Figma 893:3265
// ============================================================================
// Layout (top to bottom):
//   1. Overview       — 2-col grid: "Years of experience" + "Salary expectations"
//                       Each is a labeled bordered input with a pencil-edit icon.
//   2. Primary skills — pill tags + "Add a new skill +" in one bordered row.
//   3. Social links   — 2×2 grid of inputs, icon embedded inside each input.
//   4. Work experience — colored initial-avatar cards, prose description,
//                        blue edit / red trash icons, "Add new experience +" button.
// ============================================================================

import { useState } from "react";
import {
  Plus,
  X as XIcon,
  SquarePen,
  Trash2,
  Check,
} from "lucide-react";
import type { UserProfile, WorkExperience } from "../../../models/models";
import { jobMateStore } from "../../../store/jobMateStore";

interface ProfessionalInfoTabProps {
  profile: UserProfile;
}

// ---- colour palette for company initials ----
const AVATAR_COLORS = [
  "bg-indigo-500",
  "bg-violet-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-sky-500",
  "bg-pink-500",
  "bg-teal-500",
];
function avatarColor(str: string) {
  const hash = str.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

// ---- Overview: inline-editable input box ----
function OverviewBox({
  label,
  value,
  placeholder,
  onSave,
}: {
  label: string;
  value: string;
  placeholder: string;
  onSave: (v: string) => void | Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = async () => {
    await onSave(draft);
    setEditing(false);
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  return (
    <div>
      <div className='flex items-center justify-between mb-2'>
        <span className='text-sm font-medium text-primary-text'>{label}</span>
        <button
          onClick={() => {
            setDraft(value);
            setEditing(true);
          }}
          className='text-accent hover:text-primary-600 transition-colors'
          aria-label={`Edit ${label}`}
        >
          <SquarePen className='w-4 h-4' />
        </button>
      </div>
      {editing ? (
        <div className='flex items-center gap-2'>
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void commit();
              if (e.key === "Escape") cancel();
            }}
            className='flex-1 text-sm bg-background border border-accent rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/30'
          />
          <button onClick={commit} className='text-accent'>
            <Check className='w-4 h-4' />
          </button>
          <button onClick={cancel} className='text-secondary-text'>
            <XIcon className='w-4 h-4' />
          </button>
        </div>
      ) : (
        <div className='text-sm border border-border-col rounded-lg px-4 py-3 bg-background text-primary-text min-h-[46px] flex items-center'>
          {value || (
            <span className='text-secondary-text italic'>{placeholder}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Social link input with embedded icon ----
function SocialInput({
  icon,
  value,
  placeholder,
  onSave,
}: {
  icon: React.ReactNode;
  value: string;
  placeholder: string;
  onSave: (v: string) => void | Promise<void>;
}) {
  const [draft, setDraft] = useState(value);

  const commit = () => {
    if (draft !== value) void onSave(draft);
  };

  return (
    <div className='flex items-center border border-border-col rounded-lg overflow-hidden bg-background'>
      <div className='px-3 shrink-0 text-primary-text'>{icon}</div>
      <input
        type='url'
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur();
          }
        }}
        placeholder={placeholder}
        className='flex-1 py-3 pr-3 text-sm bg-transparent text-primary-text focus:outline-none placeholder:text-secondary-text'
      />
    </div>
  );
}

export function ProfessionalInfoTab({ profile }: ProfessionalInfoTabProps) {
  const [skillDraft, setSkillDraft] = useState("");
  const [editingWork, setEditingWork] = useState<string | null>(null);
  const [workDraft, setWorkDraft] = useState<WorkExperience | null>(null);
  const [addingWork, setAddingWork] = useState(false);

  const save = (patch: Partial<UserProfile>) =>
    jobMateStore.upsertProfile({ ...profile, ...patch });

  // ---- salary ----
  const expectedSalary = formatSalary(
    profile.compensation.expectedMin,
    profile.compensation.expectedMax,
    profile.compensation.currency
  );
  const saveSalary = (raw: string) => {
    const clean = raw.replace(/[$,\s]/g, "");
    const match = clean.match(/^(\d+\.?\d*)k?\s*[-–to]+\s*(\d+\.?\d*)k?$/i);
    if (match) {
      const mul = (s: string) => (/k/i.test(raw) ? 1000 : 1) * parseFloat(s);
      return save({
        compensation: {
          ...profile.compensation,
          expectedMin: mul(match[1]),
          expectedMax: mul(match[2]),
        },
      });
    }
    const single = clean.match(/^(\d+\.?\d*)k?$/i);
    if (single) {
      const mul = /k/i.test(raw) ? 1000 : 1;
      return save({
        compensation: {
          ...profile.compensation,
          expectedMin: parseFloat(single[1]) * mul,
          expectedMax: undefined,
        },
      });
    }
    return save({});
  };

  // ---- years of experience ----
  const yearsOfExperience = calculateYearsOfExperience(profile.work);

  // ---- skills ----
  const addSkill = () => {
    const s = skillDraft.trim();
    if (!s || profile.skills.includes(s)) {
      setSkillDraft("");
      return;
    }
    void save({ skills: [...profile.skills, s] });
    setSkillDraft("");
  };
  const removeSkill = (s: string) => {
    void save({ skills: profile.skills.filter((x) => x !== s) });
  };

  // ---- links ----
  const saveLinks = (patch: Partial<UserProfile["links"]>) =>
    save({ links: { ...profile.links, ...patch } });

  // ---- work ----
  const startAddWork = () => {
    setAddingWork(true);
    setWorkDraft({
      id: `work_${Date.now()}`,
      jobTitle: "",
      company: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      responsibilities: [],
    });
  };

  const saveWork = async () => {
    if (!workDraft) return;
    const exists = profile.work.some((w) => w.id === workDraft.id);
    const next = exists
      ? profile.work.map((w) => (w.id === workDraft.id ? workDraft : w))
      : [workDraft, ...profile.work];
    await save({ work: next });
    setEditingWork(null);
    setAddingWork(false);
    setWorkDraft(null);
  };

  const deleteWork = (id: string) =>
    save({ work: profile.work.filter((w) => w.id !== id) });

  return (
    <div className='space-y-10'>

      {/* ── Overview ── */}
      <section>
        <h2 className='text-xl font-semibold text-primary-text mb-5'>
          Overview
        </h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
          <OverviewBox
            label='Years of experience'
            value={yearsOfExperience}
            placeholder='e.g. 5 years'
            onSave={() => Promise.resolve()}
          />
          <OverviewBox
            label='Salary expectations'
            value={expectedSalary}
            placeholder='e.g. $1k – $5k'
            onSave={saveSalary}
          />
        </div>
      </section>

      {/* ── Primary skills ── */}
      <section>
        <h2 className='text-xl font-semibold text-primary-text mb-1.5'>
          Primary skills
        </h2>
        <p className='text-sm text-secondary-text mb-4'>
          Keywords recruiters and AI use to match you with roles.
        </p>

        <div className='flex items-center gap-3 border border-border-col rounded-lg px-4 py-3 bg-background flex-wrap'>
          {profile.skills.map((s) => (
            <span
              key={s}
              className='inline-flex items-center gap-1.5 px-3 py-1.5 border border-border-col rounded-full text-sm text-primary-text bg-foreground'
            >
              {s}
              <button
                onClick={() => removeSkill(s)}
                className='text-secondary-text hover:text-danger-500 transition-colors'
                aria-label={`Remove ${s}`}
              >
                <XIcon className='w-3 h-3' />
              </button>
            </span>
          ))}
          <input
            value={skillDraft}
            onChange={(e) => setSkillDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder={
              profile.skills.length === 0 ? "Add a skill and press Enter" : ""
            }
            className='flex-1 min-w-[140px] text-sm bg-transparent text-primary-text focus:outline-none placeholder:text-secondary-text'
          />
          <button
            onClick={addSkill}
            className='flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-border-col rounded-lg bg-foreground text-primary-text hover:bg-button-col transition-colors shrink-0'
          >
            Add a new skill
            <Plus className='w-4 h-4' />
          </button>
        </div>
      </section>

      {/* ── Social Media Links ── */}
      <section>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h2 className='text-xl font-semibold text-primary-text'>
              Social Media Links
            </h2>
            <p className='text-sm text-secondary-text mt-1'>
              Recruiters click through these straight from your profile.
            </p>
          </div>
          <button className='flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-border-col rounded-lg text-primary-text hover:bg-button-col transition-colors'>
            Add another link
            <Plus className='w-4 h-4' />
          </button>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
          <SocialInput
            icon={<XLogo />}
            value={profile.links.twitter ?? ""}
            placeholder='x.com/yourhandle'
            onSave={(v) => saveLinks({ twitter: v })}
          />
          <SocialInput
            icon={<GithubLogo />}
            value={profile.links.github ?? ""}
            placeholder='GitHub link'
            onSave={(v) => saveLinks({ github: v })}
          />
          <SocialInput
            icon={<BehanceLogo />}
            value={profile.links.portfolio ?? ""}
            placeholder='Behance link'
            onSave={(v) => saveLinks({ portfolio: v })}
          />
          <SocialInput
            icon={<InstagramLogo />}
            value={""}
            placeholder='Instagram link'
            onSave={() => Promise.resolve()}
          />
        </div>
      </section>

      {/* ── Work experience ── */}
      <section>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h2 className='text-xl font-semibold text-primary-text'>
              Work experience
            </h2>
            <p className='text-sm text-secondary-text mt-1'>
              Most recent roles first.
            </p>
          </div>
          {!addingWork && (
            <button
              onClick={startAddWork}
              className='flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-border-col rounded-lg text-primary-text hover:bg-button-col transition-colors'
            >
              Add new experience
              <Plus className='w-4 h-4' />
            </button>
          )}
        </div>

        <div className='space-y-4'>
          {profile.work.map((w) =>
            editingWork === w.id && workDraft ? (
              <WorkEditor
                key={w.id}
                draft={workDraft}
                setDraft={setWorkDraft}
                onSave={saveWork}
                onCancel={() => {
                  setEditingWork(null);
                  setWorkDraft(null);
                }}
              />
            ) : (
              <WorkCard
                key={w.id}
                work={w}
                onEdit={() => {
                  setEditingWork(w.id);
                  setWorkDraft(w);
                }}
                onDelete={() => deleteWork(w.id)}
              />
            )
          )}

          {addingWork && workDraft && (
            <WorkEditor
              draft={workDraft}
              setDraft={setWorkDraft}
              onSave={saveWork}
              onCancel={() => {
                setAddingWork(false);
                setWorkDraft(null);
              }}
            />
          )}
        </div>
      </section>
    </div>
  );
}

// ---- Work card ----

function WorkCard({
  work,
  onEdit,
  onDelete,
}: {
  work: WorkExperience;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const initial = (work.company || work.jobTitle || "?")[0].toUpperCase();
  const color = avatarColor(work.company || work.jobTitle || "");
  const dateRange = [
    formatMonth(work.startDate),
    work.isCurrent ? "Present" : formatMonth(work.endDate),
  ]
    .filter(Boolean)
    .join(" - ");

  return (
    <div className='border border-border-col rounded-xl p-5 bg-background'>
      <div className='flex items-start gap-4'>
        {/* Avatar */}
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center text-white font-semibold text-base shrink-0 ${color}`}
        >
          {initial}
        </div>

        {/* Body */}
        <div className='flex-1 min-w-0'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <div className='text-base font-semibold text-primary-text'>
                {work.jobTitle || "Untitled role"}
              </div>
              <div className='flex items-center gap-2 text-sm text-secondary-text mt-0.5'>
                <span>{work.company}</span>
                {work.location && (
                  <>
                    <span className='w-1.5 h-1.5 rounded-full bg-secondary-text shrink-0' />
                    <span>{work.location}</span>
                  </>
                )}
              </div>
            </div>
            <div className='flex items-center gap-1 shrink-0'>
              <button
                onClick={onEdit}
                className='p-1.5 text-accent hover:text-primary-600 transition-colors'
                aria-label='Edit'
              >
                <SquarePen className='w-4 h-4' />
              </button>
              <button
                onClick={onDelete}
                className='p-1.5 text-rose-500 hover:text-rose-600 transition-colors'
                aria-label='Delete'
              >
                <Trash2 className='w-4 h-4' />
              </button>
            </div>
          </div>

          {work.responsibilities.length > 0 && (
            <p className='text-sm text-primary-text mt-3 leading-relaxed'>
              {work.responsibilities.join(" ")}
            </p>
          )}

          {dateRange && (
            <div className='text-xs text-secondary-text mt-3'>{dateRange}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Work editor ----

const inputCls =
  "w-full text-sm bg-background border border-border-col text-primary-text rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent placeholder:text-secondary-text";

function WorkEditor({
  draft,
  setDraft,
  onSave,
  onCancel,
}: {
  draft: WorkExperience;
  setDraft: (d: WorkExperience) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className='border border-accent rounded-xl p-5 bg-background space-y-4'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div>
          <label className='block text-xs font-medium text-secondary-text mb-1.5'>
            Job title
          </label>
          <input
            value={draft.jobTitle}
            onChange={(e) => setDraft({ ...draft, jobTitle: e.target.value })}
            className={inputCls}
            placeholder='Frontend Engineer'
          />
        </div>
        <div>
          <label className='block text-xs font-medium text-secondary-text mb-1.5'>
            Company
          </label>
          <input
            value={draft.company}
            onChange={(e) => setDraft({ ...draft, company: e.target.value })}
            className={inputCls}
            placeholder='Stripe'
          />
        </div>
        <div>
          <label className='block text-xs font-medium text-secondary-text mb-1.5'>
            Location
          </label>
          <input
            value={draft.location ?? ""}
            onChange={(e) => setDraft({ ...draft, location: e.target.value })}
            className={inputCls}
            placeholder='Remote'
          />
        </div>
        <div />
        <div>
          <label className='block text-xs font-medium text-secondary-text mb-1.5'>
            Start date
          </label>
          <input
            type='month'
            value={draft.startDate}
            onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className='block text-xs font-medium text-secondary-text mb-1.5'>
            End date
          </label>
          <input
            type='month'
            value={draft.endDate ?? ""}
            disabled={draft.isCurrent}
            onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
            className={inputCls}
          />
        </div>
        <div className='sm:col-span-2'>
          <label className='flex items-center gap-2 text-xs text-secondary-text mb-3 cursor-pointer'>
            <input
              type='checkbox'
              checked={draft.isCurrent}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  isCurrent: e.target.checked,
                  endDate: e.target.checked ? undefined : draft.endDate,
                })
              }
            />
            I currently work here
          </label>
          <label className='block text-xs font-medium text-secondary-text mb-1.5'>
            Description
          </label>
          <textarea
            value={draft.responsibilities.join(" ")}
            onChange={(e) =>
              setDraft({
                ...draft,
                responsibilities: e.target.value
                  ? [e.target.value]
                  : [],
              })
            }
            rows={3}
            placeholder='Describe your role and key achievements…'
            className={inputCls}
          />
        </div>
      </div>
      <div className='flex justify-end gap-2'>
        <button
          onClick={onCancel}
          className='px-4 py-2 text-sm font-medium text-secondary-text hover:text-primary-text transition-colors'
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className='flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-primary-600 rounded-lg transition-colors'
        >
          <Check className='w-4 h-4' />
          Save
        </button>
      </div>
    </div>
  );
}

// ---- helpers ----

function formatSalary(
  min: number | undefined,
  max: number | undefined,
  _currency: string
): string {
  if (!min && !max) return "";
  const fmt = (n: number) =>
    n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return "";
}

function calculateYearsOfExperience(work: WorkExperience[]): string {
  if (!work.length) return "";
  const msPerYear = 1000 * 60 * 60 * 24 * 365;
  let ms = 0;
  for (const w of work) {
    if (!w.startDate) continue;
    const start = new Date(w.startDate).getTime();
    const end = w.isCurrent
      ? Date.now()
      : w.endDate
        ? new Date(w.endDate).getTime()
        : Date.now();
    if (end > start) ms += end - start;
  }
  const years = ms / msPerYear;
  if (years < 1) return "< 1 year";
  const rounded = Math.round(years);
  return `${rounded}+ year${rounded === 1 ? "" : "s"}`;
}

function formatMonth(dateStr?: string): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr + "-01").toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ---- Inline SVG logos (avoids needing custom icon packages) ----

function XLogo() {
  return (
    <svg viewBox='0 0 24 24' className='w-4 h-4 fill-current text-primary-text'>
      <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.264 5.634L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z' />
    </svg>
  );
}

function GithubLogo() {
  return (
    <svg viewBox='0 0 24 24' className='w-4 h-4 fill-current text-primary-text'>
      <path d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z' />
    </svg>
  );
}

function BehanceLogo() {
  return (
    <svg viewBox='0 0 24 24' className='w-4 h-4 fill-current text-indigo-600'>
      <path d='M7.799 5.698C8.667 5.698 9.471 5.807 10.234 6.025 10.997 6.243 11.657 6.571 12.213 7.009 12.771 7.447 13.207 8.005 13.525 8.683 13.843 9.361 14.002 10.169 14.002 11.107 14.002 12.148 13.791 13.044 13.369 13.795 12.947 14.547 12.298 15.165 11.421 15.65 12.662 16.006 13.591 16.658 14.207 17.607 14.825 18.555 15.133 19.706 15.133 21.059L15.133 21.205 8.819 21.205C8.819 21.205 8.819 21.205 8.819 21.205 8.22 21.205 5.762 21.205 4 21.205L4 3.795C4 3.795 7.23 3.795 7.799 3.795L7.799 5.698Z' />
      <path
        fill='white'
        d='M7.651 8.891L7.651 11.658 9.122 11.658C9.637 11.658 10.066 11.519 10.408 11.242 10.751 10.964 10.922 10.549 10.922 9.996 10.922 9.38 10.747 8.941 10.397 8.679 10.047 8.418 9.561 8.287 8.939 8.287L7.651 8.287 7.651 8.891Z'
      />
      <path
        fill='white'
        d='M7.651 14.112L7.651 17.419 9.489 17.419C10.041 17.419 10.494 17.261 10.848 16.944 11.202 16.628 11.379 16.16 11.379 15.54 11.379 14.27 10.636 13.76 9.15 13.82L7.651 13.82 7.651 14.112Z'
      />
      <path d='M20 8.109L20 9.491 16.149 9.491 16.149 8.109 20 8.109ZM17.929 10.612C19.001 10.612 19.843 10.93 20.456 11.565 21.069 12.2 21.375 13.088 21.375 14.229L21.375 15.309 16.215 15.309C16.246 15.935 16.46 16.422 16.857 16.771 17.254 17.12 17.768 17.295 18.4 17.295 18.956 17.295 19.418 17.168 19.787 16.913 20.156 16.659 20.403 16.317 20.527 15.887L21.309 15.887C21.185 16.517 20.832 17.045 20.249 17.472 19.666 17.9 18.956 18.113 18.121 18.113 17.529 18.113 17.001 17.996 16.536 17.76 16.07 17.525 15.71 17.18 15.455 16.724 15.2 16.268 15.072 15.727 15.072 15.1 15.072 14.452 15.198 13.893 15.449 13.423 15.7 12.953 16.052 12.594 16.504 12.344 16.957 12.095 17.476 11.971 18.062 11.971L17.929 10.612ZM18.109 11.756C17.557 11.756 17.1 11.919 16.738 12.246 16.375 12.573 16.163 13.024 16.102 13.599L20.093 13.599C20.065 13.024 19.876 12.573 19.527 12.246 19.177 11.919 18.724 11.756 18.168 11.756L18.109 11.756Z' />
    </svg>
  );
}

function InstagramLogo() {
  return (
    <svg viewBox='0 0 24 24' className='w-4 h-4' fill='none'>
      <defs>
        <linearGradient id='ig' x1='0%' y1='100%' x2='100%' y2='0%'>
          <stop offset='0%' stopColor='#feda75' />
          <stop offset='25%' stopColor='#fa7e1e' />
          <stop offset='50%' stopColor='#d62976' />
          <stop offset='75%' stopColor='#962fbf' />
          <stop offset='100%' stopColor='#4f5bd5' />
        </linearGradient>
      </defs>
      <rect x='2' y='2' width='20' height='20' rx='5' ry='5' fill='url(#ig)' />
      <circle cx='12' cy='12' r='4' fill='none' stroke='white' strokeWidth='1.8' />
      <circle cx='17.5' cy='6.5' r='1.2' fill='white' />
    </svg>
  );
}
