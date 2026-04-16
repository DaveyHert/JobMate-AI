import { useState } from "react";
import { format, parseISO, isValid } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function DatePicker({
  value,
  onChange,
  onBlur,
  placeholder = "Select a date",
  disabled,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const parsed = value ? parseISO(value) : undefined;
  const date = parsed && isValid(parsed) ? parsed : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          onBlur={onBlur}
          className={cn(
            "flex h-auto w-full items-center rounded-lg border border-neutral-02 bg-white px-4 py-3 text-base shadow-none transition-colors",
            "focus-visible:outline-none focus-visible:border-brand-accent focus-visible:ring-2 focus-visible:ring-brand-accent/30",
            "disabled:pointer-events-none disabled:opacity-50",
            date ? "text-neutral-06" : "font-normal text-neutral-04",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-40" />
          {date ? format(date, "MMM d, yyyy") : placeholder}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            onChange(d ? format(d, "yyyy-MM-dd") : "");
            setOpen(false);
          }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
