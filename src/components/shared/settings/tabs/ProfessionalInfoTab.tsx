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
import { Plus, SquarePen, Trash2, Check } from "lucide-react";
import type { UserProfile, WorkExperience } from "@/models/models";
import { jobMateStore } from "@/store/jobMateStore";
import { BehanceIcon, GithubIcon, XIcon } from "@/assets/svg/icons/";

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
      <div className='mb-2 flex items-center justify-between'>
        <span className='text-primary-text text-sm font-medium'>{label}</span>
        <button
          onClick={() => {
            setDraft(value);
            setEditing(true);
          }}
          className='text-accent hover:text-brand-600 transition-colors'
          aria-label={`Edit ${label}`}
        >
          <SquarePen className='h-4 w-4' />
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
            className='bg-app-background border-accent focus:ring-accent/30 flex-1 rounded-lg border px-4 py-3 text-sm focus:ring-2 focus:outline-none'
          />
          <button onClick={commit} className='text-accent'>
            <Check className='h-4 w-4' />
          </button>
          <button onClick={cancel} className='text-secondary-text'>
            <XIcon className='h-4 w-4' />
          </button>
        </div>
      ) : (
        <div className='border-brand-border bg-app-background text-primary-text flex min-h-[46px] items-center rounded-lg border px-4 py-3 text-sm'>
          {value || <span className='text-secondary-text italic'>{placeholder}</span>}
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
    <div className='border-brand-border bg-app-background flex items-center overflow-hidden rounded-lg border'>
      <div className='text-primary-text shrink-0 px-3'>{icon}</div>
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
        className='text-primary-text placeholder:text-secondary-text flex-1 bg-transparent py-3 pr-3 text-sm focus:outline-none'
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
    profile.compensation.currency,
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

  const deleteWork = (id: string) => save({ work: profile.work.filter((w) => w.id !== id) });

  return (
    <div className='space-y-10'>
      {/* ── Overview ── */}
      <section>
        <h2 className='text-primary-text mb-5 text-xl font-semibold'>Overview</h2>
        <div className='grid grid-cols-1 gap-5 sm:grid-cols-2'>
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
        <h2 className='text-primary-text mb-1.5 text-xl font-semibold'>Primary skills</h2>
        <p className='text-secondary-text mb-4 text-sm'>
          Keywords recruiters and AI use to match you with roles.
        </p>

        <div className='border-brand-border bg-app-background flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3'>
          {profile.skills.map((s) => (
            <span
              key={s}
              className='border-brand-border text-primary-text bg-app-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm'
            >
              {s}
              <button
                onClick={() => removeSkill(s)}
                className='text-secondary-text hover:text-danger-400 transition-colors'
                aria-label={`Remove ${s}`}
              >
                <XIcon className='h-3 w-3' />
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
            placeholder={profile.skills.length === 0 ? "Add a skill and press Enter" : ""}
            className='text-primary-text placeholder:text-secondary-text min-w-[140px] flex-1 bg-transparent text-sm focus:outline-none'
          />
          <button
            onClick={addSkill}
            className='border-brand-border bg-app-foreground text-primary-text hover:bg-brand-btn flex shrink-0 items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors'
          >
            Add a new skill
            <Plus className='h-4 w-4' />
          </button>
        </div>
      </section>

      {/* ── Social Media Links ── */}
      <section>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h2 className='text-primary-text text-xl font-semibold'>Social Media Links</h2>
            <p className='text-secondary-text mt-1 text-sm'>
              Recruiters click through these straight from your profile.
            </p>
          </div>
          <button className='border-brand-border text-primary-text hover:bg-brand-btn flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors'>
            Add another link
            <Plus className='h-4 w-4' />
          </button>
        </div>

        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <SocialInput
            icon={<XIcon className='text-neutral-06 size-5' />}
            value={profile.links.twitter ?? ""}
            placeholder='x.com/yourhandle'
            onSave={(v) => saveLinks({ twitter: v })}
          />
          <SocialInput
            icon={<GithubIcon className='text-neutral-06 size-5' />}
            value={profile.links.github ?? ""}
            placeholder='GitHub link'
            onSave={(v) => saveLinks({ github: v })}
          />
          <SocialInput
            icon={<BehanceIcon className='size-5 text-indigo-600' />}
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
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h2 className='text-primary-text text-xl font-semibold'>Work experience</h2>
            <p className='text-secondary-text mt-1 text-sm'>Most recent roles first.</p>
          </div>
          {!addingWork && (
            <button
              onClick={startAddWork}
              className='border-brand-border text-primary-text hover:bg-brand-btn flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors'
            >
              Add new experience
              <Plus className='h-4 w-4' />
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
            ),
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
    <div className='border-brand-border bg-app-background rounded-xl border p-5'>
      <div className='flex items-start gap-4'>
        {/* Avatar */}
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-semibold text-white ${color}`}
        >
          {initial}
        </div>

        {/* Body */}
        <div className='min-w-0 flex-1'>
          <div className='flex items-start justify-between gap-4'>
            <div>
              <div className='text-primary-text text-base font-semibold'>
                {work.jobTitle || "Untitled role"}
              </div>
              <div className='text-secondary-text mt-0.5 flex items-center gap-2 text-sm'>
                <span>{work.company}</span>
                {work.location && (
                  <>
                    <span className='bg-secondary-text h-1.5 w-1.5 shrink-0 rounded-full' />
                    <span>{work.location}</span>
                  </>
                )}
              </div>
            </div>
            <div className='flex shrink-0 items-center gap-1'>
              <button
                onClick={onEdit}
                className='text-accent hover:text-brand-600 p-1.5 transition-colors'
                aria-label='Edit'
              >
                <SquarePen className='h-4 w-4' />
              </button>
              <button
                onClick={onDelete}
                className='p-1.5 text-rose-500 transition-colors hover:text-rose-600'
                aria-label='Delete'
              >
                <Trash2 className='h-4 w-4' />
              </button>
            </div>
          </div>

          {work.responsibilities.length > 0 && (
            <p className='text-primary-text mt-3 text-sm leading-relaxed'>
              {work.responsibilities.join(" ")}
            </p>
          )}

          {dateRange && <div className='text-secondary-text mt-3 text-xs'>{dateRange}</div>}
        </div>
      </div>
    </div>
  );
}

// ---- Work editor ----

const inputCls =
  "w-full text-sm bg-app-background border border-brand-border text-primary-text rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent placeholder:text-secondary-text";

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
    <div className='border-accent bg-app-background space-y-4 rounded-xl border p-5'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        <div>
          <label className='text-secondary-text mb-1.5 block text-xs font-medium'>Job title</label>
          <input
            value={draft.jobTitle}
            onChange={(e) => setDraft({ ...draft, jobTitle: e.target.value })}
            className={inputCls}
            placeholder='Frontend Engineer'
          />
        </div>
        <div>
          <label className='text-secondary-text mb-1.5 block text-xs font-medium'>Company</label>
          <input
            value={draft.company}
            onChange={(e) => setDraft({ ...draft, company: e.target.value })}
            className={inputCls}
            placeholder='Stripe'
          />
        </div>
        <div>
          <label className='text-secondary-text mb-1.5 block text-xs font-medium'>Location</label>
          <input
            value={draft.location ?? ""}
            onChange={(e) => setDraft({ ...draft, location: e.target.value })}
            className={inputCls}
            placeholder='Remote'
          />
        </div>
        <div />
        <div>
          <label className='text-secondary-text mb-1.5 block text-xs font-medium'>Start date</label>
          <input
            type='month'
            value={draft.startDate}
            onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
            className={inputCls}
          />
        </div>
        <div>
          <label className='text-secondary-text mb-1.5 block text-xs font-medium'>End date</label>
          <input
            type='month'
            value={draft.endDate ?? ""}
            disabled={draft.isCurrent}
            onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
            className={inputCls}
          />
        </div>
        <div className='sm:col-span-2'>
          <label className='text-secondary-text mb-3 flex cursor-pointer items-center gap-2 text-xs'>
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
          <label className='text-secondary-text mb-1.5 block text-xs font-medium'>
            Description
          </label>
          <textarea
            value={draft.responsibilities.join(" ")}
            onChange={(e) =>
              setDraft({
                ...draft,
                responsibilities: e.target.value ? [e.target.value] : [],
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
          className='text-secondary-text hover:text-primary-text px-4 py-2 text-sm font-medium transition-colors'
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className='bg-accent hover:bg-brand-600 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors'
        >
          <Check className='h-4 w-4' />
          Save
        </button>
      </div>
    </div>
  );
}

// ---- helpers ----

function formatSalary(min: number | undefined, max: number | undefined, _currency: string): string {
  if (!min && !max) return "";
  const fmt = (n: number) => (n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`);
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
    const end = w.isCurrent ? Date.now() : w.endDate ? new Date(w.endDate).getTime() : Date.now();
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

function InstagramLogo() {
  return (
    <svg viewBox='0 0 24 24' className='h-4 w-4' fill='none'>
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
