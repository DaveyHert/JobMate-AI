import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export interface StatCardProps {
  label: string;
  value: number | string;
  deltaThisWeek?: number;
  percentageChange?: number | null;
  lastWeek?: number;
  positiveIsUp?: boolean;
  suffix?: string;
  footer?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  deltaThisWeek,
  percentageChange,
  lastWeek,
  positiveIsUp = true,
  suffix = "",
  footer,
}) => {
  const showArrow = percentageChange !== null && percentageChange !== undefined;
  const isPositive = positiveIsUp ? (percentageChange ?? 0) >= 0 : (percentageChange ?? 0) <= 0;
  const ArrowIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <div className='bg-foreground dark:border-brand-border relative rounded-xl border p-6 text-white'>
      <h3 className='mb-4 text-sm font-medium text-gray-600 dark:text-white/80'>{label}</h3>
      <div className='mb-2 flex items-end gap-2'>
        <span className='text-3xl font-bold text-gray-900 dark:text-white'>
          {value}
          {suffix}
        </span>
        {showArrow && (
          <div
            className={`flex items-center gap-1 text-sm ${
              isPositive ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"
            }`}
          >
            <ArrowIcon className='h-3 w-3' />
            <span>{Math.abs(percentageChange as number)}%</span>
            <span className='text-[11px] text-gray-400'>than last week</span>
          </div>
        )}
      </div>
      {footer ? (
        <p className='text-xs text-gray-500 dark:text-white/60'>{footer}</p>
      ) : (
        <div className='flex justify-between'>
          {deltaThisWeek !== undefined && (
            <p className='text-xs text-gray-500 dark:text-white/60'>
              {deltaThisWeek >= 0 ? "+" : "-"}
              {deltaThisWeek} app{deltaThisWeek >= 0 ? "s" : ""} this week
            </p>
          )}
          {lastWeek !== undefined && (
            <p className='bg:text-white/60 text-[11.5px] text-gray-500'>
              {lastWeek > 0 ? `+${lastWeek}` : lastWeek} last week
            </p>
          )}
        </div>
      )}
    </div>
  );
};
