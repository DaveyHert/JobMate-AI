import { WeeklyGoal } from "../models/models";

function TargetGoal({ weeklyGoal }: { weeklyGoal: WeeklyGoal }) {
  // calculate target goal percentage
  const goalPercentage = Math.round((weeklyGoal.current / weeklyGoal.target) * 100);

  return (
    <div className='bg-foreground border-brand-border mb-3.5 rounded-lg border px-4 pt-2 pb-4 shadow-xs'>
      <div className='mb-1 flex items-center justify-between'>
        <span className='text-primary-text text-sm'>
          Weekly Goal: {weeklyGoal.current}/{weeklyGoal.target} jobs
        </span>
        <span className='text-brand-accent text-sm font-semibold'>{goalPercentage}%</span>
      </div>
      <div className='h-2.5 w-full rounded-full bg-gray-200'>
        <div
          className='bg-brand-accent h-2.5 rounded-full transition-all duration-300'
          style={{ width: `${goalPercentage}%` }}
        />
      </div>
    </div>
  );
}

export default TargetGoal;
