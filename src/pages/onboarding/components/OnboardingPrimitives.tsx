// Lightweight shared atoms used across all onboarding step forms.
import {
  ReactNode,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  useState,
} from "react";

export const inputCls =
  "w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition-colors bg-white";

export const selectCls =
  "w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition-colors bg-white appearance-none cursor-pointer";

interface FieldProps {
  label: string;
  optional?: boolean;
  children: ReactNode;
}

export function Field({ label, optional, children }: FieldProps) {
  return (
    <div className='flex flex-col gap-1.5'>
      <label className='text-sm font-medium text-gray-700'>
        {label}
        {optional && <span className='ml-1 font-normal text-gray-400'>(optional)</span>}
      </label>
      {children}
    </div>
  );
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${inputCls} ${props.className ?? ""}`} />;
}

interface DateInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  placeholder?: string;
}

export function DateInput({
  value,
  placeholder = "Select a date",
  disabled,
  className,
  ...props
}: DateInputProps) {
  const [focused, setFocused] = useState(false);
  const isEmpty = !value;

  return (
    <div className='relative'>
      <input
        type='date'
        value={value}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
        className={`${inputCls} ${isEmpty && !focused ? "text-transparent" : ""} [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50 ${className ?? ""}`}
      />
      {isEmpty && !focused && (
        <span className='pointer-events-none absolute inset-0 flex items-center px-4 text-sm text-gray-400'>
          {placeholder}
        </span>
      )}
    </div>
  );
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea rows={4} {...props} className={`${inputCls} resize-none ${props.className ?? ""}`} />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className='relative'>
      <select {...props} className={`${selectCls} pr-10 ${props.className ?? ""}`} />
      <svg
        className='pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400'
        fill='none'
        viewBox='0 0 24 24'
        stroke='currentColor'
      >
        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
      </svg>
    </div>
  );
}

interface StepHeaderProps {
  icon: ReactNode;
  title: string;
  action?: ReactNode;
}

export function StepHeader({ icon, title, action }: StepHeaderProps) {
  return (
    <div className='mb-8 flex items-center justify-between'>
      <div className='flex items-center gap-3'>
        <div className='bg-primary-02 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'>
          {icon}
        </div>
        <h2 className='text-neutral-06 text-xl font-medium'>{title}</h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function Divider() {
  return <div className='my-8 border-t border-dashed border-gray-200' />;
}

interface StepTopNavProps {
  onBack: () => void;
  profileLabel?: string;
}

export function StepTopNav({ onBack, profileLabel }: StepTopNavProps) {
  return (
    <div className='mb-8 flex items-center justify-between'>
      <button
        onClick={onBack}
        className='text-neutral-06 flex cursor-pointer items-center gap-1 p-1 transition-colors hover:text-gray-800'
        aria-label='Back'
      >
        <svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
        </svg>

        <span className='text-sm'>Back</span>
      </button>
      {profileLabel && (
        <div className='flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700'>
          {profileLabel}
          <svg
            className='h-4 w-4 text-gray-400'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
          </svg>
        </div>
      )}
    </div>
  );
}

interface FooterProps {
  onBack?: () => void;
  onContinue: () => void;
  onSkip?: () => void;
  continueDisabled?: boolean;
  continueLabel?: string;
}

export function StepFooter({
  onBack,
  onContinue,
  onSkip,
  continueDisabled,
  continueLabel = "Continue",
}: FooterProps) {
  return (
    <div className='mt-10 flex items-center gap-3'>
      {onBack && (
        <button
          onClick={onBack}
          className='flex items-center gap-1 p-2 text-gray-500 transition-colors hover:text-gray-800'
          aria-label='Go back'
        >
          <svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M15 19l-7-7 7-7'
            />
          </svg>
          <span className='text-neutral-06 text-sm font-semibold'>Back</span>
        </button>
      )}
      <button
        onClick={onContinue}
        disabled={continueDisabled}
        className='bg-brand-accent hover:bg-brand-600 disabled:bg-brand-accent/40 rounded-lg px-8 py-3 text-sm font-medium text-white transition-colors'
      >
        {continueLabel}
      </button>
      {onSkip && (
        <button
          onClick={onSkip}
          className='bg-neutral-01 border-neutral-02 text-neutral-06 rounded-lg border px-8 py-3 text-sm font-medium transition-colors hover:bg-gray-50'
        >
          Skip this
        </button>
      )}
    </div>
  );
}
