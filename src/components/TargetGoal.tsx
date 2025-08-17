import { WeeklyGoal } from "../models/models";

function TargetGoal({ weeklyGoal }: { weeklyGoal: WeeklyGoal }) {
  // calculate target goal percentage
  const goalPercentage = Math.round(
    (weeklyGoal.current / weeklyGoal.target) * 100
  );

  return (
    <div className='bg-foreground rounded-lg pt-2 pb-4 px-4 mb-3.5 shadow-xs border border-border-col'>
      <div className='flex justify-between items-center mb-1'>
        <span className='text-sm text-primary-text'>
          Weekly Goal: {weeklyGoal.current}/{weeklyGoal.target} jobs
        </span>
        <span className='text-sm font-semibold text-accent'>
          {goalPercentage}%
        </span>
      </div>
      <div className='w-full bg-gray-200 rounded-full h-2.5'>
        <div
          className='bg-accent h-2.5 rounded-full transition-all duration-300'
          style={{ width: `${goalPercentage}%` }}
        />
      </div>
    </div>
  );
}

export default TargetGoal;
