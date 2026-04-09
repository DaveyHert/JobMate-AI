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

export function EditResumeModal({
  resume,
  onSubmit,
  onClose,
}: EditResumeModalProps) {
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

  const onInputChange = (e: ChangeEvent<HTMLInputElement>) =>
    pickFile(e.target.files?.[0] ?? null);

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
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4'
      onClick={onClose}
    >
      <div
        className='bg-foreground border border-border-col rounded-2xl w-full max-w-md shadow-xl'
        onClick={(e) => e.stopPropagation()}
      >
        <header className='flex items-center justify-between px-6 py-5 border-b border-border-col'>
          <h2 className='text-lg font-semibold text-primary-text'>
            Edit Resume
          </h2>
          <button
            onClick={onClose}
            className='p-1 text-secondary-text hover:text-primary-text transition-colors'
            aria-label='Close'
          >
            <X className='w-5 h-5' />
          </button>
        </header>

        <div className='px-6 py-6 space-y-5'>
          <div>
            <label className='block text-sm font-medium text-primary-text mb-1.5'>
              Label
            </label>
            <input
              type='text'
              value={label}
              onChange={(e) =>
                setLabel(e.target.value.slice(0, MAX_LABEL_LENGTH))
              }
              placeholder='e.g. Frontend Engineer'
              maxLength={MAX_LABEL_LENGTH}
              className='w-full text-sm bg-background border border-border-col text-primary-text rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent placeholder:text-secondary-text'
            />
            <p className='text-xs text-secondary-text mt-1.5'>
              Max {MAX_LABEL_LENGTH} characters
            </p>
          </div>

          <div>
            <label className='block text-sm font-medium text-primary-text mb-1.5'>
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
              className={`flex flex-col items-center justify-center gap-2 px-6 py-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                dragging
                  ? "border-accent bg-accent-soft"
                  : "border-border-col hover:border-accent hover:bg-button-col/50"
              }`}
            >
              <div className='w-12 h-12 rounded-lg bg-accent-soft flex items-center justify-center'>
                <FileText className='w-6 h-6 text-accent' />
              </div>
              <div className='text-sm font-medium text-primary-text text-center truncate max-w-full'>
                {displayFileName}
              </div>
              <div className='text-xs text-secondary-text'>
                {Math.round(displaySize / 1024)} KB ·{" "}
                {file ? "new file selected" : "click or drop to replace"}
              </div>
              {!file && (
                <div className='flex items-center gap-1 text-xs text-accent mt-1'>
                  <UploadCloud className='w-3.5 h-3.5' />
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
            <p className='text-xs text-secondary-text mt-1.5'>
              PDF, JPEG, PNG · max 5 MB. Leave as-is to keep the current file.
            </p>
          </div>

          {error && <p className='text-xs text-danger-500'>{error}</p>}
        </div>

        <footer className='flex gap-3 px-6 pb-6'>
          <button
            onClick={onClose}
            disabled={saving}
            className='flex-1 px-4 py-3 text-sm font-medium text-primary-text bg-background border border-border-col rounded-lg hover:bg-button-col transition-colors disabled:opacity-50'
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving || !label.trim()}
            className='flex-1 px-4 py-3 text-sm font-medium text-white bg-accent rounded-lg hover:bg-primary-600 disabled:bg-button-col disabled:text-secondary-text disabled:cursor-not-allowed transition-colors'
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </footer>
      </div>
    </div>
  );
}
