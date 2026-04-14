// ============================================================================
// InlineEditRow — label + value + Edit link; clicking Edit swaps to an input
// ============================================================================
// The core visual pattern of the Settings screens in Figma. By default each
// row shows read-only text plus a small "Edit" link on the right. Clicking
// Edit swaps the value for an input; pressing Enter or clicking Save commits
// through onSave, Escape or Cancel reverts. Keeps the display dense while
// still supporting per-field editing.
// ============================================================================

import { useState, useEffect, useRef, KeyboardEvent } from "react";
import { Check, X } from "lucide-react";

interface InlineEditRowProps {
  label: string;
  description?: string;
  value: string;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "url";
  onSave: (next: string) => void | Promise<void>;
  /** Render an alternative display (e.g. for empty states). */
  renderValue?: (value: string) => string;
}

export function InlineEditRow({
  label,
  description,
  value,
  placeholder,
  type = "text",
  onSave,
  renderValue,
}: InlineEditRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!editing) setDraft(value);
  }, [value, editing]);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = async () => {
    if (draft === value) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      await onSave(draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void commit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  };

  const display = renderValue ? renderValue(value) : value;
  const isEmpty = !value;

  return (
    <div className='border-brand-border flex items-start gap-4 border-b py-6 last:border-b-0'>
      <div className='min-w-0 flex-1'>
        <div className='text-primary-text text-sm font-medium'>{label}</div>
        {description && <div className='text-secondary-text mt-1 text-xs'>{description}</div>}
      </div>

      <div className='flex shrink-0 items-center gap-3'>
        {editing ? (
          <>
            <input
              ref={inputRef}
              type={type}
              value={draft}
              placeholder={placeholder}
              disabled={saving}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              className='text-primary-text bg-background border-brand-border focus:ring-brand-accent/30 focus:border-brand-accent min-w-[220px] rounded-md border px-3 py-1.5 text-right text-sm focus:ring-2 focus:outline-none'
            />
            <button
              onClick={commit}
              disabled={saving}
              className='text-brand-accent hover:text-primary-600 p-1 disabled:opacity-50'
              aria-label='Save'
            >
              <Check className='h-4 w-4' />
            </button>
            <button
              onClick={cancel}
              disabled={saving}
              className='text-secondary-text hover:text-primary-text p-1 disabled:opacity-50'
              aria-label='Cancel'
            >
              <X className='h-4 w-4' />
            </button>
          </>
        ) : (
          <>
            <span
              className={`text-right text-sm ${
                isEmpty ? "text-secondary-text italic" : "text-primary-text"
              }`}
            >
              {isEmpty ? (placeholder ?? "Not set") : display}
            </span>
            <button
              onClick={() => setEditing(true)}
              className='text-brand-accent hover:text-primary-600 text-sm font-medium underline-offset-2 transition-colors hover:underline'
            >
              Edit
            </button>
          </>
        )}
      </div>
    </div>
  );
}
