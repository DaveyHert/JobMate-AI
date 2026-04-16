import { useRef, useEffect, useMemo, useState } from "react";
import { Search, List, LayoutGrid, Calendar, Share2 } from "lucide-react";
import { format } from "date-fns";

interface ToolbarProps {
  view: "grid" | "list";
  search: string;
  startDate: string;
  endDate: string;
  onViewChange: (v: "grid" | "list") => void;
  onSearchChange: (q: string) => void;
  onStartDateChange: (d: string) => void;
  onEndDateChange: (d: string) => void;
  onExport: () => void;
}

export function ApplicationsToolbar({
  view,
  search,
  startDate,
  endDate,
  onViewChange,
  onSearchChange,
  onStartDateChange,
  onEndDateChange,
  onExport,
}: ToolbarProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!datePickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setDatePickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [datePickerOpen]);

  const dateRangeLabel = useMemo(() => {
    if (!startDate && !endDate) return "All time";
    const s = startDate ? format(new Date(startDate), "dd MMM yyyy") : "Start";
    const e = endDate ? format(new Date(endDate), "dd MMM yyyy") : "End";
    return `${s}  –  ${e}`;
  }, [startDate, endDate]);

  return (
    <div className='flex items-center gap-3 py-6'>
      {/* Date range — split button: text left, calendar icon right with divider */}
      <div className='relative shrink-0' ref={datePickerRef}>
        <button
          onClick={() => setDatePickerOpen((o) => !o)}
          className='bg-app-background border-brand-border text-primary-text hover:bg-brand-btn-hover flex items-center overflow-hidden rounded-lg border text-sm whitespace-nowrap transition-colors'
        >
          <span className='px-4 py-2'>{dateRangeLabel}</span>
          <span className='border-brand-border flex items-center justify-center border-l px-3 py-2'>
            <Calendar className='text-secondary-text h-4 w-4' />
          </span>
        </button>

        {datePickerOpen && (
          <div className='bg-app-foreground border-brand-border absolute top-11 left-0 z-30 flex min-w-[300px] gap-3 rounded-xl border p-4 shadow-xl'>
            <div className='flex-1'>
              <label className='text-secondary-text mb-1.5 block text-xs font-medium'>From</label>
              <input
                type='date'
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className='border-brand-border bg-app-background text-primary-text focus:ring-brand-accent/30 w-full rounded-md border px-3 py-1.5 text-sm focus:ring-2 focus:outline-none'
              />
            </div>
            <div className='flex-1'>
              <label className='text-secondary-text mb-1.5 block text-xs font-medium'>To</label>
              <input
                type='date'
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className='border-brand-border bg-app-background text-primary-text focus:ring-brand-accent/30 w-full rounded-md border px-3 py-1.5 text-sm focus:ring-2 focus:outline-none'
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  onStartDateChange("");
                  onEndDateChange("");
                }}
                className='text-brand-accent self-end pb-1.5 text-xs whitespace-nowrap hover:underline'
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Search — fixed width, left-aligned, not full-width */}
      <div className='relative w-72 shrink-0'>
        <Search className='text-secondary-text absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
        <input
          type='text'
          placeholder='Search for job name, status…'
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className='bg-app-background border-brand-border text-primary-text placeholder:text-secondary-text focus:ring-brand-accent/30 focus:border-brand-accent w-full rounded-lg border py-2 pr-4 pl-9 text-sm transition-colors focus:ring-2 focus:outline-none'
        />
      </div>

      {/* Spacer pushes view toggle + export to the right */}
      <div className='flex-1' />

      {/* View toggle */}
      <div className='border-brand-border flex shrink-0 items-center overflow-hidden rounded-lg border'>
        <button
          onClick={() => onViewChange("list")}
          className={`p-2.5 transition-colors ${
            view === "list"
              ? "bg-brand-accent/10 text-brand-accent"
              : "bg-app-background text-secondary-text hover:text-primary-text hover:bg-brand-btn"
          }`}
          aria-label='List view'
          aria-pressed={view === "list"}
        >
          <List className='h-4 w-4' />
        </button>
        <button
          onClick={() => onViewChange("grid")}
          className={`border-brand-border border-l p-2.5 transition-colors ${
            view === "grid"
              ? "bg-brand-accent/10 text-brand-accent"
              : "bg-app-background text-secondary-text hover:text-primary-text hover:bg-brand-btn"
          }`}
          aria-label='Grid view'
          aria-pressed={view === "grid"}
        >
          <LayoutGrid className='h-4 w-4' />
        </button>
      </div>

      {/* Export — gray bg to match design */}
      <button
        onClick={onExport}
        className='bg-app-background border-brand-border text-primary-text hover:bg-brand-btn-hover flex shrink-0 items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors'
      >
        Export data
        <Share2 className='text-secondary-text h-4 w-4' />
      </button>
    </div>
  );
}
