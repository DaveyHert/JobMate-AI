// ============================================================================
// SettingsPrimitives — low-level UI atoms shared across all settings tabs
// ============================================================================
// Keeping these in one file avoids the component explosion that makes big
// settings screens hard to scan. Every tab uses the same Card, Row, Toggle,
// and Field, so visual consistency is free.
// ============================================================================

import { ReactNode, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

// -------- Card --------

interface CardProps {
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Card({ title, description, children, footer }: CardProps) {
  return (
    <section className='bg-app-foreground border-brand-border mb-4 overflow-hidden rounded-xl border'>
      {(title || description) && (
        <header className='border-brand-border border-b px-5 pt-5 pb-3'>
          {title && <h2 className='text-primary-text text-base font-semibold'>{title}</h2>}
          {description && <p className='text-secondary-text mt-1 text-xs'>{description}</p>}
        </header>
      )}
      <div className='p-5'>{children}</div>
      {footer && (
        <footer className='border-brand-border bg-app-background/40 border-t px-5 py-3'>
          {footer}
        </footer>
      )}
    </section>
  );
}

// -------- Row --------

interface RowProps {
  label: string;
  description?: string;
  children: ReactNode;
}

/** A horizontal label/value row — used for toggles and inline controls. */
export function Row({ label, description, children }: RowProps) {
  return (
    <div className='border-brand-border flex items-center justify-between gap-4 border-b py-3 last:border-b-0'>
      <div className='min-w-0'>
        <div className='text-primary-text text-sm font-medium'>{label}</div>
        {description && <div className='text-secondary-text mt-0.5 text-xs'>{description}</div>}
      </div>
      <div className='shrink-0'>{children}</div>
    </div>
  );
}

// -------- Toggle --------

interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label?: string; // accessibility
}

export function Toggle({ checked, onChange, disabled, label }: ToggleProps) {
  return (
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-brand-accent" : "bg-brand-btn border-brand-border border"
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

// -------- Field --------

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  required?: boolean;
}

export function Field({ label, hint, error, children, required }: FieldProps) {
  return (
    <label className='mb-4 block last:mb-0'>
      <div className='text-primary-text mb-1.5 text-xs font-medium'>
        {label}
        {required && <span className='text-danger-400 ml-0.5'>*</span>}
      </div>
      {children}
      {hint && !error && <div className='text-secondary-text mt-1 text-[11px]'>{hint}</div>}
      {error && <div className='text-danger-400 mt-1 text-[11px]'>{error}</div>}
    </label>
  );
}

// -------- TextInput --------

type TextInputProps = InputHTMLAttributes<HTMLInputElement>;

export function TextInput(props: TextInputProps) {
  return (
    <input
      {...props}
      className={`bg-app-background border-brand-border text-primary-text placeholder:text-secondary-text focus:ring-brand-accent/30 focus:border-brand-accent w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none ${
        props.className ?? ""
      }`}
    />
  );
}

// -------- TextArea --------

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export function TextArea(props: TextAreaProps) {
  return (
    <textarea
      {...props}
      className={`bg-app-background border-brand-border text-primary-text placeholder:text-secondary-text focus:ring-brand-accent/30 focus:border-brand-accent min-h-[96px] w-full resize-y rounded-lg border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none ${
        props.className ?? ""
      }`}
    />
  );
}

// -------- Select --------

interface SelectProps<T extends string> {
  value: T;
  onChange: (next: T) => void;
  options: { value: T; label: string }[];
  disabled?: boolean;
}

export function Select<T extends string>({ value, onChange, options, disabled }: SelectProps<T>) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as T)}
      className='bg-app-background border-brand-border text-primary-text focus:ring-brand-accent/30 focus:border-brand-accent w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:ring-2 focus:outline-none'
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// -------- Button --------

interface ButtonProps {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md";
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit";
  children: ReactNode;
  className?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  onClick,
  disabled,
  type = "button",
  children,
  className = "",
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
  };
  const variants = {
    primary: "bg-brand-accent text-white hover:bg-brand-600",
    secondary: "bg-brand-btn text-primary-text border border-brand-border hover:bg-brand-btn-hover",
    danger: "bg-danger-400 text-white hover:opacity-90",
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
