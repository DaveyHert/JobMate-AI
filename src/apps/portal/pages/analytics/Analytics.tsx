// ====================================================================
// AnalyticsPage — portal route: #/analytics
// Layout: page header → stat cards (2 rows) → charts row → goal + job boards
// ===================================================================

import { useMemo } from "react";
import { useJobMateData } from "@hooks/useJobMateData";
import { mockApplications } from "@/data/mockApplications";
import { Application } from "@/models/models";
import { calculateStats } from "@/helpers/calculateStats";
import { AnalyticsStatCards } from "./components/AnalyticsStatCards";
import { ApplicationRateChart } from "./components/ApplicationRateChart";
import { ActivitySummaryChart } from "./components/ActivitySummaryChart";
import { TargetGoalCard } from "./components/TargetGoalCard";
import { TopJobBoardsTable } from "./components/TopJobBoardsTable";

export function AnalyticsPage() {
  const data = useJobMateData();
  const applications: Application[] = data?.applications ?? mockApplications;
  const weeklyGoal = data?.weeklyGoal ?? { current: 0, target: 12 };
  const stats = useMemo(() => calculateStats(applications), [applications]);

  return (
    <div className='mb-8'>
      {/* Page header */}
      <div className='mb-8 flex items-end justify-between'>
        <div>
          <h2 className='text-primary-text text-lg font-bold tracking-tight'>
            Your job search, at a glance
          </h2>
          <p className='text-secondary-text mt-1 text-sm font-medium'>
            Summary of applications report and performances
          </p>
        </div>
      </div>

      {/* Stat cards — 2 rows */}
      <AnalyticsStatCards stats={stats} applications={applications} />

      {/* Charts row — Application Rate (1/2) + Activity Summary (1/2) */}
      <div className='mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <div className='min-w-0'>
          <ApplicationRateChart applications={applications} />
        </div>
        <div className='min-w-0'>
          <ActivitySummaryChart applications={applications} />
        </div>
      </div>

      {/* Bottom row — Target Goal (1/3) + Top Job Boards (2/3) */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='min-w-0 lg:col-span-1'>
          <TargetGoalCard weeklyGoal={weeklyGoal} applications={applications} />
        </div>
        <div className='min-w-0 lg:col-span-2'>
          <TopJobBoardsTable applications={applications} />
        </div>
      </div>
    </div>
  );
}
