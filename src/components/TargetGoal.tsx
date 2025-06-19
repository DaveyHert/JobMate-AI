import { WeeklyGoal } from "../models/models";

function TargetGoal({ weeklyGoal }: { weeklyGoal: WeeklyGoal }) {
  // calculate target goal percentage
  const goalPercentage = Math.round(
    (weeklyGoal.current / weeklyGoal.target) * 100
  );

  return (
    <div className='bg-white dark:bg-[#1F2937] rounded-lg pt-2 pb-4 px-4 mb-3.5 shadow-sm border border-gray-100 dark:border-[#374151]'>
      <div className='flex justify-between items-center mb-1'>
        <span className='text-sm text-gray-600'>
          Weekly Goal: {weeklyGoal.current}/{weeklyGoal.target} jobs
        </span>
        <span className='text-sm font-semibold text-blue-600'>
          {goalPercentage}%
        </span>
      </div>
      <div className='w-full bg-gray-200 rounded-full h-2.5'>
        <div
          className='bg-[#2563EB] h-2.5 rounded-full transition-all duration-300'
          style={{ width: `${goalPercentage}%` }}
        />
      </div>
    </div>
  );
}

export default TargetGoal;
