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
  const isPositive = positiveIsUp
    ? (percentageChange ?? 0) >= 0
    : (percentageChange ?? 0) <= 0;
  const ArrowIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <div className='bg-foreground  border dark:border-border-col rounded-xl p-6 relative text-white'>
      <h3 className='text-gray-600  text-sm font-medium dark:text-white/80 mb-4'>
        {label}
      </h3>
      <div className='flex items-end gap-2 mb-2'>
        <span className='text-3xl text-gray-900 dark:text-white   font-bold'>
          {value}
          {suffix}
        </span>
        {showArrow && (
          <div
            className={`flex items-center gap-1 text-sm ${
              isPositive
                ? "text-green-600 dark:text-green-500"
                : "text-red-600 dark:text-red-500"
            }`}
          >
            <ArrowIcon className='w-3 h-3' />
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
            <p className='text-[11.5px] text-gray-500 bg:text-white/60'>
              {lastWeek > 0 ? `+${lastWeek}` : lastWeek} last week
            </p>
          )}
        </div>
      )}
    </div>
  );
};
