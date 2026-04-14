// ============================================================================
// EditResumeModal — edit resume label and/or replace the file
// ============================================================================
// Unlike UploadResumeModal (which always creates a NEW resume), this dialog
// mutates an existing resume in place. The caller decides how to persist the
// updated ResumeDoc — this modal stays pure.
//
// Both label and file are optional edits: if the user only changes the label,
// the existing file bytes are preserved. If they replace the file, the new
// bytes/metadata overwrite but the id and other profile data stay intact.
// ============================================================================

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { X, UploadCloud, FileText } from "lucide-react";
import type { ResumeDoc } from "../../../models/models";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_LABEL_LENGTH = 60;
const ACCEPTED_MIME = new Set(["application/pdf", "image/jpeg", "image/png"]);
const ACCEPT_ATTR = ".pdf,.jpeg,.jpg,.png";

interface EditResumeModalProps {
  resume: ResumeDoc;
  /** Called with the updated ResumeDoc when the user clicks Save. */
  onSubmit: (doc: ResumeDoc) => Promise<void>;
  onClose: () => void;
}

export function EditResumeModal({ resume, onSubmit, onClose }: EditResumeModalProps) {
  const [label, setLabel] = useState(resume.label);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pickFile = (next: File | null) => {
    setError(null);
    if (!next) {
      setFile(null);
      return;
    }
    if (!ACCEPTED_MIME.has(next.type)) {
      setError("Only PDF, JPEG, and PNG files are allowed.");
      return;
    }
    if (next.size > MAX_SIZE_BYTES) {
      setError("File exceeds the 5 MB limit.");
      return;
    }
    setFile(next);
  };

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) => pickFile(e.target.files?.[0] ?? null);

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    pickFile(e.dataTransfer.files?.[0] ?? null);
  };

  const readAsDataUrl = (f: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = () => reject(r.error);
      r.readAsDataURL(f);
    });

  const submit = async () => {
    const trimmed = label.trim();
    if (!trimmed) {
      setError("Label is required.");
      return;
    }
    const labelChanged = trimmed !== resume.label;
    if (!labelChanged && !file) {
      // Nothing to save — just close.
      onClose();
      return;
    }
    setSaving(true);
    try {
      let updated: ResumeDoc = { ...resume, label: trimmed };
      if (file) {
        const fileUrl = await readAsDataUrl(file);
        updated = {
          ...updated,
          fileName: file.name,
          fileUrl,
          mimeType: file.type,
          sizeBytes: file.size,
          uploadedAt: new Date().toISOString(),
        };
      }
      await onSubmit(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const displayFileName = file?.name ?? resume.fileName;
  const displaySize = file?.size ?? resume.sizeBytes;

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs'
      onClick={onClose}
    >
      <div
        className='bg-app-foreground border-brand-border w-full max-w-md rounded-2xl border shadow-xl'
        onClick={(e) => e.stopPropagation()}
      >
        <header className='border-brand-border flex items-center justify-between border-b px-6 py-5'>
          <h2 className='text-primary-text text-lg font-semibold'>Edit Resume</h2>
          <button
            onClick={onClose}
            className='text-secondary-text hover:text-primary-text p-1 transition-colors'
            aria-label='Close'
          >
            <X className='h-5 w-5' />
          </button>
        </header>

        <div className='space-y-5 px-6 py-6'>
          <div>
            <label className='text-primary-text mb-1.5 block text-sm font-medium'>Label</label>
            <input
              type='text'
              value={label}
              onChange={(e) => setLabel(e.target.value.slice(0, MAX_LABEL_LENGTH))}
              placeholder='e.g. Frontend Engineer'
              maxLength={MAX_LABEL_LENGTH}
              className='bg-app-background border-brand-border text-primary-text focus:ring-brand-accent/30 focus:border-brand-accent placeholder:text-secondary-text w-full rounded-lg border px-3 py-2.5 text-sm focus:ring-2 focus:outline-none'
            />
            <p className='text-secondary-text mt-1.5 text-xs'>Max {MAX_LABEL_LENGTH} characters</p>
          </div>

          <div>
            <label className='text-primary-text mb-1.5 block text-sm font-medium'>
              Resume file
            </label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 transition-colors ${
                dragging
                  ? "border-brand-accent bg-brand-accent-soft"
                  : "border-brand-border hover:border-brand-accent hover:bg-brand-btn/50"
              }`}
            >
              <div className='bg-brand-accent-soft flex h-12 w-12 items-center justify-center rounded-lg'>
                <FileText className='text-brand-accent h-6 w-6' />
              </div>
              <div className='text-primary-text max-w-full truncate text-center text-sm font-medium'>
                {displayFileName}
              </div>
              <div className='text-secondary-text text-xs'>
                {Math.round(displaySize / 1024)} KB ·{" "}
                {file ? "new file selected" : "click or drop to replace"}
              </div>
              {!file && (
                <div className='text-brand-accent mt-1 flex items-center gap-1 text-xs'>
                  <UploadCloud className='h-3.5 w-3.5' />
                  Replace file
                </div>
              )}
              <input
                ref={inputRef}
                type='file'
                accept={ACCEPT_ATTR}
                onChange={onInputChange}
                className='hidden'
              />
            </div>
            <p className='text-secondary-text mt-1.5 text-xs'>
              PDF, JPEG, PNG · max 5 MB. Leave as-is to keep the current file.
            </p>
          </div>

          {error && <p className='text-danger-400 text-xs'>{error}</p>}
        </div>

        <footer className='flex gap-3 px-6 pb-6'>
          <button
            onClick={onClose}
            disabled={saving}
            className='text-primary-text bg-app-background border-brand-border hover:bg-brand-btn flex-1 rounded-lg border px-4 py-3 text-sm font-medium transition-colors disabled:opacity-50'
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving || !label.trim()}
            className='bg-brand-accent hover:bg-brand-600 disabled:bg-brand-btn disabled:text-secondary-text flex-1 rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed'
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </footer>
      </div>
    </div>
  );
}
