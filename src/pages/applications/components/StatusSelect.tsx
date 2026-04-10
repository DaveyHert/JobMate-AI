import { ChevronDown } from "lucide-react";
import type { ApplicationStatus } from "../../../models/models";
import { STATUS_CONFIG, ALL_STATUSES } from "./applicationConstants";

export function StatusSelect({
  status,
  onChange,
}: {
  status: ApplicationStatus;
  onChange: (s: ApplicationStatus) => void;
}) {
  const { bg, text, border, label } = STATUS_CONFIG[status];
  return (
    <div className='relative inline-flex items-center'>
      <select
        value={status}
        onChange={(e) => onChange(e.target.value as ApplicationStatus)}
        className={`appearance-none pl-3 pr-7 py-1 rounded-full text-xs font-medium border cursor-pointer focus:outline-none transition-colors ${bg} ${text} ${border}`}
        title={label}
      >
        {ALL_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_CONFIG[s].label}
          </option>
        ))}
      </select>
      <ChevronDown
        className={`absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none ${text}`}
      />
    </div>
  );
}
