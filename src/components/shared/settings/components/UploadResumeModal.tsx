// ============================================================================
// UploadResumeModal — label + drag-and-drop file picker
// ============================================================================
// Collects a label + file from the user, then calls onSubmit(ResumeDoc) so
// the CALLER decides whether to attach to the current profile or create a new
// one. This keeps the modal logic pure and reusable.
//
// Accepts PDF, JPEG, PNG up to 5 MB.
// ============================================================================

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { X, UploadCloud, FileText } from "lucide-react";
import type { ResumeDoc } from "@/models/models";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const MAX_LABEL_LENGTH = 60;
const ACCEPTED_MIME = new Set(["application/pdf", "image/jpeg", "image/png"]);
const ACCEPT_ATTR = ".pdf,.jpeg,.jpg,.png";

interface UploadResumeModalProps {
  /** Called with the assembled ResumeDoc when the user clicks Submit. */
  onSubmit: (doc: ResumeDoc) => Promise<void>;
  onClose: () => void;
}

export function UploadResumeModal({ onSubmit, onClose }: UploadResumeModalProps) {
  const [label, setLabel] = useState("");
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
    if (!file || !label.trim()) {
      setError("Label and file are both required.");
      return;
    }
    setSaving(true);
    try {
      const fileUrl = await readAsDataUrl(file);
      const doc: ResumeDoc = {
        id: `resume_${Date.now()}`,
        label: label.trim(),
        fileName: file.name,
        fileUrl,
        mimeType: file.type,
        sizeBytes: file.size,
        uploadedAt: new Date().toISOString(),
        isDefault: true,
      };
      await onSubmit(doc);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setSaving(false);
    }
  };

  const canSubmit = !!file && label.trim().length > 0 && !saving;

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
          <h2 className='text-primary-text text-lg font-semibold'>Upload Resume</h2>
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
              className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 transition-colors ${
                dragging
                  ? "border-brand-accent bg-brand-accent-soft"
                  : "border-brand-border hover:border-brand-accent hover:bg-brand-btn/50"
              }`}
            >
              {file ? (
                <>
                  <div className='bg-brand-accent-soft flex h-12 w-12 items-center justify-center rounded-lg'>
                    <FileText className='text-brand-accent h-6 w-6' />
                  </div>
                  <div className='text-primary-text text-center text-sm font-medium'>
                    {file.name}
                  </div>
                  <div className='text-secondary-text text-xs'>
                    {Math.round(file.size / 1024)} KB · click to replace
                  </div>
                </>
              ) : (
                <>
                  <div className='bg-brand-btn flex h-12 w-12 items-center justify-center rounded-lg'>
                    <UploadCloud className='text-secondary-text h-6 w-6' />
                  </div>
                  <div className='text-primary-text text-sm'>
                    <span className='text-brand-accent font-medium'>Click to upload</span> or drag
                    and drop
                  </div>
                  <div className='text-secondary-text text-xs'>PDF, JPEG, PNG · max 5 MB</div>
                </>
              )}
              <input
                ref={inputRef}
                type='file'
                accept={ACCEPT_ATTR}
                onChange={onInputChange}
                className='hidden'
              />
            </div>
          </div>

          {error && <p className='text-danger-400 text-xs'>{error}</p>}
        </div>

        <footer className='px-6 pb-6'>
          <button
            onClick={submit}
            disabled={!canSubmit}
            className='bg-brand-accent hover:bg-brand-600 disabled:bg-brand-btn disabled:text-secondary-text w-full rounded-lg px-4 py-3 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed'
          >
            {saving ? "Submitting…" : "Submit resume"}
          </button>
        </footer>
      </div>
    </div>
  );
}
