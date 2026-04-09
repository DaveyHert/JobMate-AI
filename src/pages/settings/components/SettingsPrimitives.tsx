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
    <section className='bg-foreground border border-border-col rounded-xl overflow-hidden mb-4'>
      {(title || description) && (
        <header className='px-5 pt-5 pb-3 border-b border-border-col'>
          {title && (
            <h2 className='text-base font-semibold text-primary-text'>
              {title}
            </h2>
          )}
          {description && (
            <p className='text-xs text-secondary-text mt-1'>{description}</p>
          )}
        </header>
      )}
      <div className='p-5'>{children}</div>
      {footer && (
        <footer className='px-5 py-3 border-t border-border-col bg-background/40'>
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
    <div className='flex items-center justify-between gap-4 py-3 border-b border-border-col last:border-b-0'>
      <div className='min-w-0'>
        <div className='text-sm font-medium text-primary-text'>{label}</div>
        {description && (
          <div className='text-xs text-secondary-text mt-0.5'>
            {description}
          </div>
        )}
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
        checked ? "bg-accent" : "bg-button-col border border-border-col"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
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

export function Field({
  label,
  hint,
  error,
  children,
  required,
}: FieldProps) {
  return (
    <label className='block mb-4 last:mb-0'>
      <div className='text-xs font-medium text-primary-text mb-1.5'>
        {label}
        {required && <span className='text-danger-500 ml-0.5'>*</span>}
      </div>
      {children}
      {hint && !error && (
        <div className='text-[11px] text-secondary-text mt-1'>{hint}</div>
      )}
      {error && (
        <div className='text-[11px] text-danger-500 mt-1'>{error}</div>
      )}
    </label>
  );
}

// -------- TextInput --------

type TextInputProps = InputHTMLAttributes<HTMLInputElement>;

export function TextInput(props: TextInputProps) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 text-sm bg-background border border-border-col rounded-lg text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors ${
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
      className={`w-full px-3 py-2 text-sm bg-background border border-border-col rounded-lg text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors resize-y min-h-[96px] ${
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

export function Select<T extends string>({
  value,
  onChange,
  options,
  disabled,
}: SelectProps<T>) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as T)}
      className='w-full px-3 py-2 text-sm bg-background border border-border-col rounded-lg text-primary-text focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors'
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
    primary: "bg-accent text-white hover:bg-primary-600",
    secondary:
      "bg-button-col text-primary-text border border-border-col hover:bg-button-hov",
    danger: "bg-danger-500 text-white hover:opacity-90",
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
