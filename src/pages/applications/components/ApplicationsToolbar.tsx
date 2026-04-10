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
          className='flex items-center bg-background border border-border-col rounded-lg text-sm text-primary-text overflow-hidden hover:bg-button-hov transition-colors whitespace-nowrap'
        >
          <span className='px-4 py-2'>{dateRangeLabel}</span>
          <span className='flex items-center justify-center px-3 py-2 border-l border-border-col'>
            <Calendar className='w-4 h-4 text-secondary-text' />
          </span>
        </button>

        {datePickerOpen && (
          <div className='absolute top-11 left-0 z-30 bg-foreground border border-border-col rounded-xl shadow-xl p-4 flex gap-3 min-w-[300px]'>
            <div className='flex-1'>
              <label className='text-xs font-medium text-secondary-text block mb-1.5'>From</label>
              <input
                type='date'
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className='w-full border border-border-col rounded-md px-3 py-1.5 text-sm bg-background text-primary-text focus:outline-none focus:ring-2 focus:ring-accent/30'
              />
            </div>
            <div className='flex-1'>
              <label className='text-xs font-medium text-secondary-text block mb-1.5'>To</label>
              <input
                type='date'
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className='w-full border border-border-col rounded-md px-3 py-1.5 text-sm bg-background text-primary-text focus:outline-none focus:ring-2 focus:ring-accent/30'
              />
            </div>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  onStartDateChange("");
                  onEndDateChange("");
                }}
                className='self-end text-xs text-accent hover:underline whitespace-nowrap pb-1.5'
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {/* Search — fixed width, left-aligned, not full-width */}
      <div className='relative w-72 shrink-0'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-text' />
        <input
          type='text'
          placeholder='Search for job name, status…'
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className='w-full pl-9 pr-4 py-2 bg-background border border-border-col rounded-lg text-sm text-primary-text placeholder:text-secondary-text focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-colors'
        />
      </div>

      {/* Spacer pushes view toggle + export to the right */}
      <div className='flex-1' />

      {/* View toggle */}
      <div className='flex items-center border border-border-col rounded-lg overflow-hidden shrink-0'>
        <button
          onClick={() => onViewChange("list")}
          className={`p-2.5 transition-colors ${
            view === "list"
              ? "bg-accent/10 text-accent"
              : "bg-background text-secondary-text hover:text-primary-text hover:bg-button-col"
          }`}
          aria-label='List view'
          aria-pressed={view === "list"}
        >
          <List className='w-4 h-4' />
        </button>
        <button
          onClick={() => onViewChange("grid")}
          className={`p-2.5 transition-colors border-l border-border-col ${
            view === "grid"
              ? "bg-accent/10 text-accent"
              : "bg-background text-secondary-text hover:text-primary-text hover:bg-button-col"
          }`}
          aria-label='Grid view'
          aria-pressed={view === "grid"}
        >
          <LayoutGrid className='w-4 h-4' />
        </button>
      </div>

      {/* Export — gray bg to match design */}
      <button
        onClick={onExport}
        className='flex items-center gap-2 px-4 py-2 bg-background border border-border-col rounded-lg text-sm font-medium text-primary-text hover:bg-button-hov transition-colors whitespace-nowrap shrink-0'
      >
        Export data
        <Share2 className='w-4 h-4 text-secondary-text' />
      </button>
    </div>
  );
}
