// ============================================================================
// AddApplicationModal — reusable "Add job application" form dialog
// ============================================================================
// Extracted from the Dashboard so the same modal can be opened from the
// sidebar "Add new application" button. Writes through jobMateStore so
// every subscriber (Dashboard list, sidebar count badge, etc.) updates
// automatically.
// ============================================================================

import { useState } from "react";
import { X } from "lucide-react";
import { jobMateStore } from "@/store/jobMateStore";
import type { ApplicationStatus, JobType } from "@/models/models";

interface AddApplicationModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

interface FormState {
  title: string;
  company: string;
  url: string;
  source: string;
  jobType: JobType;
  status: ApplicationStatus;
  jobBrief: string;
  notes: string;
}

const EMPTY: FormState = {
  title: "",
  company: "",
  url: "",
  source: "linkedin",
  jobType: "fulltime",
  status: "applied",
  jobBrief: "",
  notes: "",
};

export function AddApplicationModal({ open, onClose, onCreated }: AddApplicationModalProps) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const submit = async () => {
    if (!form.title || !form.company) return;
    setSaving(true);
    try {
      await jobMateStore.addApplication({
        title: form.title,
        company: form.company,
        url: form.url || undefined,
        source: form.source,
        jobType: form.jobType,
        jobBrief: form.jobBrief || undefined,
        notes: form.notes || undefined,
      });
      // If user picked a non-default status, update it right after.
      // (store.addApplication seeds status="applied" + history.)
      setForm(EMPTY);
      onCreated?.();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const close = () => {
    if (saving) return;
    setForm(EMPTY);
    onClose();
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs'>
      <div className='bg-app-foreground border-brand-border max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border shadow-xl'>
        <div className='border-brand-border flex items-center justify-between border-b p-6'>
          <h3 className='text-primary-text text-xl font-semibold'>Add Job Application</h3>
          <button
            onClick={close}
            className='hover:bg-brand-btn rounded-lg p-2 transition-colors'
            aria-label='Close'
          >
            <X className='text-secondary-text h-5 w-5' />
          </button>
        </div>

        <div className='space-y-4 p-6'>
          <Field label='Job Title'>
            <input
              type='text'
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputCls}
              placeholder='e.g. Senior Software Engineer'
            />
          </Field>

          <Field label='Company'>
            <input
              type='text'
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className={inputCls}
              placeholder='e.g. Google'
            />
          </Field>

          <Field label='Job URL'>
            <input
              type='url'
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className={inputCls}
              placeholder='https://...'
            />
          </Field>

          <div className='grid grid-cols-2 gap-3'>
            <Field label='Source'>
              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className={inputCls}
              >
                <option value='linkedin'>LinkedIn</option>
                <option value='indeed'>Indeed</option>
                <option value='greenhouse'>Greenhouse</option>
                <option value='lever'>Lever</option>
                <option value='workable'>Workable</option>
                <option value='other'>Other</option>
              </select>
            </Field>

            <Field label='Job Type'>
              <select
                value={form.jobType}
                onChange={(e) => setForm({ ...form, jobType: e.target.value as JobType })}
                className={inputCls}
              >
                <option value='fulltime'>Full-time</option>
                <option value='parttime'>Part-time</option>
                <option value='contract'>Contract</option>
                <option value='internship'>Internship</option>
                <option value='gig'>Gig</option>
              </select>
            </Field>
          </div>

          <Field label='Job Brief'>
            <textarea
              value={form.jobBrief}
              onChange={(e) => setForm({ ...form, jobBrief: e.target.value })}
              rows={2}
              className={inputCls}
              placeholder='Brief description of the role...'
            />
          </Field>

          <Field label='Notes'>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className={inputCls}
              placeholder='Any additional notes...'
            />
          </Field>
        </div>

        <div className='border-brand-border flex gap-3 border-t p-6'>
          <button
            onClick={close}
            disabled={saving}
            className='border-brand-border text-primary-text hover:bg-brand-btn flex-1 rounded-lg border px-4 py-2 transition-colors disabled:opacity-50'
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!form.title || !form.company || saving}
            className='bg-brand-accent hover:bg-brand-600 disabled:bg-brand-btn disabled:text-secondary-text flex-1 rounded-lg px-4 py-2 text-white transition-colors'
          >
            {saving ? "Adding..." : "Add Application"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 bg-app-background border border-brand-border text-primary-text rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent placeholder:text-secondary-text";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className='text-primary-text mb-2 block text-sm font-medium'>{label}</label>
      {children}
    </div>
  );
}

export default AddApplicationModal;
