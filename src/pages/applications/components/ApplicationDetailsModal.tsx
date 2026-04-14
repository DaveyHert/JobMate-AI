// ============================================================================
// ApplicationDetailsModal — right-side panel showing full application details
// ============================================================================
// Two modes:
//   View — read-only display matching the design (label / value rows)
//   Edit — all fields become inputs; Save commits via jobMateStore.updateApplication
//
// Opened by clicking any card (grid) or row (list) in ApplicationsPage.
// ============================================================================

import { useState, useEffect } from "react";
import { X, FileText, ExternalLink, Pencil } from "lucide-react";
import { jobMateStore } from "../../../store/jobMateStore";
import { toast } from "sonner";
import type { Application, ApplicationStatus, JobType } from "../../../models/models";
import { StatusSelect } from "./StatusSelect";
import { getLastUpdatedDate, getAvatar } from "./applicationConstants";
import { formatDetailDate } from "../../../utils/dateHelpers";

interface Props {
  app: Application | null;
  onClose: () => void;
  onDeleted: (id: number) => void;
}

interface EditState {
  title: string;
  company: string;
  source: string;
  url: string;
  jobType: JobType;
  status: ApplicationStatus;
  jobBrief: string;
  notes: string;
}

const JOB_TYPE_LABELS: Record<JobType, string> = {
  fulltime: "Full-time",
  parttime: "Part-time",
  contract: "Contract",
  internship: "Internship",
  gig: "Gig",
};

const SOURCE_OPTIONS = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "indeed", label: "Indeed" },
  { value: "greenhouse", label: "Greenhouse" },
  { value: "lever", label: "Lever" },
  { value: "workable", label: "Workable" },
  { value: "other", label: "Other" },
];

export function ApplicationDetailsModal({ app, onClose, onDeleted }: Props) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EditState | null>(null);

  // Reset edit state whenever a new app is opened
  useEffect(() => {
    if (!app) return;
    setEditing(false);
    setForm(appToForm(app));
  }, [app?.id]);

  if (!app || !form) return null;

  const lastUpdated = getLastUpdatedDate(app);
  const { initial, bg } = getAvatar(app.company);

  const startEdit = () => {
    setForm(appToForm(app));
    setEditing(true);
  };

  const cancelEdit = () => {
    setForm(appToForm(app));
    setEditing(false);
  };

  const save = async () => {
    if (!form.title || !form.company) return;
    setSaving(true);
    try {
      await jobMateStore.updateApplication(app.id, {
        title: form.title,
        company: form.company,
        source: form.source,
        url: form.url || undefined,
        jobType: form.jobType,
        status: form.status,
        jobBrief: form.jobBrief || undefined,
        notes: form.notes || undefined,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    toast("Delete this application?", {
      description: "This cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          await jobMateStore.deleteApplication(app.id);
          onDeleted(app.id);
          onClose();
        },
      },
      cancel: { label: "Cancel", onClick: () => {} },
    });
  };

  const set = (k: keyof EditState, v: string) => setForm((f) => f && { ...f, [k]: v });

  return (
    // Overlay
    <div
      className='fixed inset-0 z-50 flex items-stretch justify-end bg-black/40 backdrop-blur-xs'
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Panel */}
      <div className='bg-app-foreground flex w-[420px] flex-col overflow-hidden rounded-l-2xl shadow-2xl'>
        {/* ── Header ── */}
        <div className='border-brand-border flex items-center justify-between border-b px-6 py-5'>
          <div className='flex items-center gap-2'>
            <FileText className='text-secondary-text h-5 w-5' />
            <h2 className='text-primary-text text-base font-semibold'>Job Details</h2>
          </div>
          <div className='flex items-center gap-1'>
            {!editing && (
              <button
                onClick={startEdit}
                className='text-secondary-text hover:text-primary-text hover:bg-brand-btn rounded-md p-1.5 transition-colors'
                aria-label='Edit application'
              >
                <Pencil className='h-4 w-4' />
              </button>
            )}
            <button
              onClick={onClose}
              className='text-secondary-text hover:text-primary-text hover:bg-brand-btn rounded-md p-1.5 transition-colors'
              aria-label='Close'
            >
              <X className='h-5 w-5' />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className='flex-1 space-y-0 overflow-y-auto px-6 py-5'>
          {editing ? (
            <EditForm form={form} set={set} />
          ) : (
            <ViewDetails app={app} lastUpdated={lastUpdated} initial={initial} avatarBg={bg} />
          )}
        </div>

        {/* ── Footer ── */}
        <div className='border-brand-border space-y-2 border-t px-6 py-4'>
          {editing ? (
            <div className='flex gap-3'>
              <button
                onClick={cancelEdit}
                disabled={saving}
                className='border-brand-border text-primary-text hover:bg-brand-btn flex-1 rounded-lg border px-4 py-2.5 text-sm transition-colors disabled:opacity-50'
              >
                Cancel
              </button>
              <button
                onClick={save}
                disabled={!form.title || !form.company || saving}
                className='bg-brand-accent hover:bg-brand-600 disabled:bg-brand-btn disabled:text-secondary-text flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors'
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
            </div>
          ) : (
            <button
              onClick={handleDelete}
              className='bg-app-background border-brand-border text-primary-text w-full rounded-lg border px-4 py-2.5 text-sm transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:hover:border-rose-800 dark:hover:bg-rose-950 dark:hover:text-rose-400'
            >
              Delete application
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── View mode ──────────────────────────────────────────────────────────────

function ViewDetails({
  app,
  lastUpdated,
  initial,
  avatarBg,
}: {
  app: Application;
  lastUpdated: Date;
  initial: string;
  avatarBg: string;
}) {
  return (
    <div className='divide-brand-border divide-y'>
      <DetailRow label='Company Name'>
        <div className='flex items-center gap-2'>
          <div
            className={`h-6 w-6 rounded-full ${avatarBg} flex shrink-0 items-center justify-center text-[10px] font-bold text-white`}
          >
            {initial}
          </div>
          <span className='text-primary-text text-sm font-medium'>{app.company}</span>
        </div>
      </DetailRow>

      <DetailRow label='Job Title'>
        <span className='text-primary-text text-sm font-medium'>{app.title}</span>
      </DetailRow>

      <DetailRow label='Location'>
        <span className='text-primary-text text-sm'>{app.source || "Remote"}</span>
      </DetailRow>

      <DetailRow label='Job Status'>
        <StatusSelect
          status={app.status}
          onChange={(s) => void jobMateStore.updateApplicationStatus(app.id, s)}
        />
      </DetailRow>

      <DetailRow label='Last Updated'>
        <span className='text-primary-text text-right text-sm'>
          {formatDetailDate(lastUpdated).replace(" \u2022 ", "\n")}
        </span>
      </DetailRow>

      {app.jobType && (
        <DetailRow label='Job Type'>
          <span className='text-primary-text text-sm'>{JOB_TYPE_LABELS[app.jobType]}</span>
        </DetailRow>
      )}

      {app.url && (
        <DetailRow label='Job URL'>
          <a
            href={app.url}
            target='_blank'
            rel='noopener noreferrer'
            className='text-brand-accent flex max-w-[220px] items-start gap-1 text-right text-sm break-all hover:underline'
          >
            <ExternalLink className='mt-0.5 h-3.5 w-3.5 shrink-0' />
            <span className='break-all'>{app.url}</span>
          </a>
        </DetailRow>
      )}

      {app.jobBrief && (
        <DetailRow label='Job Brief' stacked>
          <p className='text-primary-text text-sm leading-relaxed'>{app.jobBrief}</p>
        </DetailRow>
      )}

      {app.notes && (
        <DetailRow label='Notes' stacked>
          <p className='text-primary-text text-sm leading-relaxed whitespace-pre-wrap'>
            {app.notes}
          </p>
        </DetailRow>
      )}
    </div>
  );
}

function DetailRow({
  label,
  children,
  stacked = false,
}: {
  label: string;
  children: React.ReactNode;
  stacked?: boolean;
}) {
  if (stacked) {
    return (
      <div className='py-4'>
        <p className='text-secondary-text mb-2 text-sm'>{label}:</p>
        {children}
      </div>
    );
  }
  return (
    <div className='flex items-start justify-between gap-4 py-4'>
      <span className='text-secondary-text shrink-0 text-sm'>{label}:</span>
      <div className='text-right'>{children}</div>
    </div>
  );
}

// ── Edit mode ──────────────────────────────────────────────────────────────

function EditForm({
  form,
  set,
}: {
  form: EditState;
  set: (k: keyof EditState, v: string) => void;
}) {
  return (
    <div className='space-y-4 pt-1'>
      <FormField label='Job Title'>
        <input
          type='text'
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          className={inputCls}
          placeholder='e.g. Senior Designer'
        />
      </FormField>

      <FormField label='Company'>
        <input
          type='text'
          value={form.company}
          onChange={(e) => set("company", e.target.value)}
          className={inputCls}
          placeholder='e.g. Stripe'
        />
      </FormField>

      <FormField label='Job URL'>
        <input
          type='url'
          value={form.url}
          onChange={(e) => set("url", e.target.value)}
          className={inputCls}
          placeholder='https://...'
        />
      </FormField>

      <div className='grid grid-cols-2 gap-3'>
        <FormField label='Source'>
          <select
            value={form.source}
            onChange={(e) => set("source", e.target.value)}
            className={inputCls}
          >
            {SOURCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label='Job Type'>
          <select
            value={form.jobType}
            onChange={(e) => set("jobType", e.target.value)}
            className={inputCls}
          >
            <option value='fulltime'>Full-time</option>
            <option value='parttime'>Part-time</option>
            <option value='contract'>Contract</option>
            <option value='internship'>Internship</option>
            <option value='gig'>Gig</option>
          </select>
        </FormField>
      </div>

      <FormField label='Status'>
        <select
          value={form.status}
          onChange={(e) => set("status", e.target.value)}
          className={inputCls}
        >
          <option value='applied'>Applied</option>
          <option value='interviewing'>Interviewing</option>
          <option value='offer'>Accepted / Offer</option>
          <option value='rejected'>Not Moving Forward</option>
          <option value='ghosted'>Ghosted</option>
          <option value='withdrawn'>Withdrawn</option>
        </select>
      </FormField>

      <FormField label='Job Brief'>
        <textarea
          value={form.jobBrief}
          onChange={(e) => set("jobBrief", e.target.value)}
          rows={3}
          className={inputCls}
          placeholder='Brief description of the role…'
        />
      </FormField>

      <FormField label='Notes'>
        <textarea
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
          rows={4}
          className={inputCls}
          placeholder='Interview notes, contacts, follow-up reminders…'
        />
      </FormField>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className='text-secondary-text mb-1.5 block text-xs font-medium'>{label}</label>
      {children}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────

function appToForm(app: Application): EditState {
  return {
    title: app.title,
    company: app.company,
    source: app.source,
    url: app.url ?? "",
    jobType: app.jobType ?? "fulltime",
    status: app.status,
    jobBrief: app.jobBrief ?? "",
    notes: app.notes ?? "",
  };
}

const inputCls =
  "w-full px-3 py-2 bg-app-background border border-brand-border text-primary-text rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent placeholder:text-secondary-text";
