// ============================================================================
// TargetGoalCard — circular SVG gauge showing weekly application goal progress
// Layout: ring + Completed/Remaining labels (left), divider, motivation (right)
// ============================================================================

import { useMemo } from "react";
import { Application, WeeklyGoal } from "@/models/models";
import { subDays, startOfDay, isAfter, parseISO } from "date-fns";

interface TargetGoalCardProps {
  weeklyGoal: WeeklyGoal;
  applications: Application[];
}

function buildMotivation(completed: number, remaining: number): { title: string; body: string } {
  if (remaining <= 0) {
    return {
      title: "Goal smashed!",
      body: "You hit your weekly target. Keep the momentum going!",
    };
  }
  if (completed === 0) {
    return {
      title: "Let's go!",
      body: `Apply to ${remaining} jobs this week to hit your target. You've got this!`,
    };
  }
  if (remaining <= 2) {
    return {
      title: "Almost there!",
      body: `Just ${remaining} more application${remaining === 1 ? "" : "s"} to reach your daily target. Finish strong!`,
    };
  }
  return {
    title: "Keep it up!",
    body: `Send ${remaining} more tailored applications to hit your daily target. You're almost there—finish strong!`,
  };
}

export function TargetGoalCard({ weeklyGoal, applications }: TargetGoalCardProps) {
  const completed = useMemo(() => {
    const weekAgo = startOfDay(subDays(new Date(), 7));
    return applications.filter((a) => isAfter(parseISO(a.dateApplied), weekAgo)).length;
  }, [applications]);

  const target = weeklyGoal.target || 12;
  const remaining = Math.max(0, target - completed);
  const pct = Math.min(1, completed / target);

  // SVG donut config
  const SIZE = 104;
  const STROKE = 10;
  const R = (SIZE - STROKE) / 2;
  const C = 2 * Math.PI * R;
  const strokePct = pct * C;

  const { title, body } = buildMotivation(completed, remaining);

  return (
    <div className='bg-app-foreground border-brand-border h-full rounded-xl border p-5'>
      <h3 className='text-primary-text mb-4 text-base font-semibold'>Target Goal</h3>

      <div className='flex items-stretch gap-5'>
        {/* Left — ring + stats */}
        <div className='flex shrink-0 flex-col items-center gap-4'>
          <div className='relative'>
            <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
              <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={R}
                fill='none'
                stroke='var(--color-brand-border)'
                strokeWidth={STROKE}
              />
              <circle
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={R}
                fill='none'
                stroke='#5750f1'
                strokeWidth={STROKE}
                strokeLinecap='round'
                strokeDasharray={`${strokePct} ${C}`}
                strokeDashoffset={C / 4}
                style={{ transition: "stroke-dasharray 0.6s ease" }}
              />
            </svg>
            <div className='absolute inset-0 flex flex-col items-center justify-center'>
              <span className='text-primary-text text-2xl leading-none font-bold'>{completed}</span>
              <span className='text-secondary-text mt-1 text-[10px] font-medium'>
                Target: {target}
              </span>
            </div>
          </div>

          <div className='space-y-1 self-start pl-1 text-xs'>
            <div className='text-secondary-text'>
              Completed: <span className='text-primary-text font-medium'>{completed}</span>
            </div>
            <div className='text-secondary-text'>
              Remaining: <span className='text-primary-text font-medium'>{remaining}</span>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className='bg-brand-border w-px shrink-0' />

        {/* Right — motivation */}
        <div className='flex flex-1 flex-col items-center justify-center text-center'>
          <p className='text-primary-text mb-2 text-base font-semibold'>{title}</p>
          <p className='text-secondary-text text-xs leading-relaxed'>{body}</p>
        </div>
      </div>
    </div>
  );
}
