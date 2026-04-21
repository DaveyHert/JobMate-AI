// ============================================================================
// ChartCard — shared card shell for analytics charts
// Provides: card chrome, header (title/subtitle/controls), sort dropdown,
// view toggle tabs, and a bottom legend row. Used by ApplicationRateChart
// and ActivitySummaryChart so they share visual design.
// ============================================================================

import { useState, type ReactNode } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";

// ─── Card wrapper ────────────────────────────────────────────────────────────

interface ChartCardProps {
  title: string;
  subtitle: string;
  controls: ReactNode;
  children: ReactNode;
}

export function ChartCard({ title, subtitle, controls, children }: ChartCardProps) {
  return (
    <div className='bg-app-background border-neutral-01 flex h-full flex-col rounded-2xl border p-5 shadow-sm'>
      <div className='mb-4 flex items-start justify-between gap-4'>
        <div>
          <h3 className='text-neutral-06 text-base font-semibold'>{title}</h3>
          <p className='text-neutral-06 mt-0.5 text-xs whitespace-nowrap'>{subtitle}</p>
        </div>
        <div className='flex shrink-0 items-center gap-2'>{controls}</div>
      </div>
      <div className='flex flex-1 flex-col justify-between'>{children}</div>
    </div>
  );
}

// ─── Sort dropdown ───────────────────────────────────────────────────────────

interface SortDropdownProps<T extends string> {
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}

export function SortDropdown<T extends string>({
  value,
  options,
  onChange,
}: SortDropdownProps<T>) {
  const [open, setOpen] = useState(false);
  return (
    <div className='relative'>
      <button
        onClick={() => setOpen((o) => !o)}
        className='text-secondary-text hover:text-neutral-06 flex items-center gap-1 text-xs transition-colors'
      >
        <span>Sort by:</span>
        <span className='text-neutral-06 font-medium'>{value}</span>
        <ChevronDown className='h-3.5 w-3.5' />
      </button>
      {open && (
        <div className='bg-app-background border-brand-border absolute top-7 right-0 z-10 min-w-[120px] rounded-lg border py-1 shadow-lg'>
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`w-full px-3 py-1.5 text-left text-xs transition-colors ${
                value === opt
                  ? "text-brand-accent font-medium"
                  : "text-secondary-text hover:text-neutral-06"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── View toggle (tabs with optional icons) ──────────────────────────────────

export interface ViewOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

interface ViewToggleProps<T extends string> {
  value: T;
  options: ViewOption<T>[];
  onChange: (v: T) => void;
}

export function ViewToggle<T extends string>({ value, options, onChange }: ViewToggleProps<T>) {
  return (
    <div className='border-brand-border bg-neutral-01 flex items-center rounded-lg border p-0.5'>
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
              active
                ? "bg-app-background text-neutral-06 shadow-sm"
                : "text-secondary-text hover:text-neutral-06"
            }`}
          >
            {Icon && <Icon className='h-3.5 w-3.5' />}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Bottom legend ───────────────────────────────────────────────────────────

export interface LegendItem {
  label: string;
  color: string;
}

export function ChartLegend({ items }: { items: LegendItem[] }) {
  return (
    <div className='mt-4 flex flex-wrap justify-center gap-x-5 gap-y-1.5'>
      {items.map((item) => (
        <div key={item.label} className='flex items-center gap-1.5 text-xs'>
          <span
            className='h-2.5 w-2.5 shrink-0 rounded-full'
            style={{ backgroundColor: item.color }}
          />
          <span className='text-secondary-text'>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
