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
import type { ResumeDoc } from "../../../models/models";

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
    if (!next) { setFile(null); return; }
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
      className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4'
      onClick={onClose}
    >
      <div
        className='bg-foreground border border-border-col rounded-2xl w-full max-w-md shadow-xl'
        onClick={(e) => e.stopPropagation()}
      >
        <header className='flex items-center justify-between px-6 py-5 border-b border-border-col'>
          <h2 className='text-lg font-semibold text-primary-text'>
            Upload Resume
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
              className={`flex flex-col items-center justify-center gap-2 px-6 py-10 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                dragging
                  ? "border-accent bg-accent-soft"
                  : "border-border-col hover:border-accent hover:bg-button-col/50"
              }`}
            >
              {file ? (
                <>
                  <div className='w-12 h-12 rounded-lg bg-accent-soft flex items-center justify-center'>
                    <FileText className='w-6 h-6 text-accent' />
                  </div>
                  <div className='text-sm font-medium text-primary-text text-center'>
                    {file.name}
                  </div>
                  <div className='text-xs text-secondary-text'>
                    {Math.round(file.size / 1024)} KB · click to replace
                  </div>
                </>
              ) : (
                <>
                  <div className='w-12 h-12 rounded-lg bg-button-col flex items-center justify-center'>
                    <UploadCloud className='w-6 h-6 text-secondary-text' />
                  </div>
                  <div className='text-sm text-primary-text'>
                    <span className='font-medium text-accent'>
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </div>
                  <div className='text-xs text-secondary-text'>
                    PDF, JPEG, PNG · max 5 MB
                  </div>
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

          {error && <p className='text-xs text-danger-500'>{error}</p>}
        </div>

        <footer className='px-6 pb-6'>
          <button
            onClick={submit}
            disabled={!canSubmit}
            className='w-full px-4 py-3 text-sm font-medium text-white bg-accent rounded-lg hover:bg-primary-600 disabled:bg-button-col disabled:text-secondary-text disabled:cursor-not-allowed transition-colors'
          >
            {saving ? "Submitting…" : "Submit resume"}
          </button>
        </footer>
      </div>
    </div>
  );
}
