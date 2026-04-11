// Lightweight shared atoms used across all onboarding step forms.
import {
  ReactNode,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  SelectHTMLAttributes,
  useState,
} from "react";

export const inputCls =
  "w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors bg-white";

export const selectCls =
  "w-full px-4 py-3 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors bg-white appearance-none cursor-pointer";

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
        {optional && <span className='text-gray-400 font-normal ml-1'>(optional)</span>}
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
        <span className='absolute inset-0 px-4 flex items-center text-sm text-gray-400 pointer-events-none'>
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
        className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none'
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
    <div className='flex items-center justify-between mb-8'>
      <div className='flex items-center gap-3'>
        <div className='w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center shrink-0'>
          {icon}
        </div>
        <h2 className='text-xl font-semibold text-gray-900'>{title}</h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function Divider() {
  return <div className='border-t border-dashed border-gray-200 my-8' />;
}

interface StepTopNavProps {
  onBack: () => void;
  profileLabel?: string;
}

export function StepTopNav({ onBack, profileLabel }: StepTopNavProps) {
  return (
    <div className='flex items-center justify-between mb-8'>
      <button
        onClick={onBack}
        className='p-1 text-gray-500 hover:text-gray-800 transition-colors'
        aria-label='Back'
      >
        <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
        </svg>
      </button>
      {profileLabel && (
        <div className='flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700'>
          {profileLabel}
          <svg className='w-4 h-4 text-gray-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
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
    <div className='flex items-center gap-3 mt-10'>
      {onBack && (
        <button
          onClick={onBack}
          className='p-2 text-gray-500 hover:text-gray-800 transition-colors flex items-center gap-1'
          aria-label='Go back'
        >
          <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M15 19l-7-7 7-7'
            />
          </svg>
          <span className='text-neutral-06'>back</span>
        </button>
      )}
      <button
        onClick={onContinue}
        disabled={continueDisabled}
        className='px-8 py-3 bg-accent hover:bg-primary-600 disabled:bg-accent/40 text-white rounded-lg text-sm font-medium transition-colors'
      >
        {continueLabel}
      </button>
      {onSkip && (
        <button
          onClick={onSkip}
          className='px-8 py-3 bg-neutral-01 border border-neutral-02 hover:bg-gray-50 text-neutral-06 rounded-lg text-sm font-medium transition-colors'
        >
          Skip this
        </button>
      )}
    </div>
  );
}
