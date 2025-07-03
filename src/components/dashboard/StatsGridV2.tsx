import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";
import { Application } from "../../models/models";

// Types

interface WeeklyChange {
  applied: number;
  interviews: number;
  responseRate: number;
  companies: number;
}

interface WeeklyPercentageChange {
  applied: number;
  interviews: number;
  responseRate: number;
  companies: number;
}

interface Stats {
  totalApplied: number;
  totalInterviews: number;
  responseRate: number;
  totalCompanies: number;
  weeklyChange: WeeklyChange;
  weeklyPercentageChange: WeeklyPercentageChange;
}

interface StatCardData {
  title: string;
  value: string | number;
  suffix?: string;
  weeklyChange: number;
  percentageChange: number;
  description: string;
  icon?: LucideIcon;
}

// Updated calculation function that returns stats object
const calculateStats = (apps: Application[]): Stats => {
  const totalApplied = apps.length;
  const totalInterviews = apps.filter(
    (app) => app.status === "interviewing" || app.status === "offer"
  ).length;
  const responseRate =
    totalApplied > 0 ? Math.round((totalInterviews / totalApplied) * 100) : 0;
  const totalCompanies = new Set(apps.map((app) => app.company)).size;

  // Current week (last 7 days)
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentApps = apps.filter(
    (app) => new Date(app.dateApplied) >= oneWeekAgo
  );
  const recentInterviews = recentApps.filter(
    (app) => app.status === "interviewing" || app.status === "offer"
  ).length;
  const recentResponseRate =
    recentApps.length > 0
      ? Math.round((recentInterviews / recentApps.length) * 100)
      : 0;

  // Previous week (8-14 days ago) for comparison
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const previousWeekApps = apps.filter((app) => {
    const appDate = new Date(app.dateApplied);
    return appDate >= twoWeeksAgo && appDate < oneWeekAgo;
  });
  const previousWeekInterviews = previousWeekApps.filter(
    (app) => app.status === "interviewing" || app.status === "offer"
  ).length;
  const previousWeekResponseRate =
    previousWeekApps.length > 0
      ? Math.round((previousWeekInterviews / previousWeekApps.length) * 100)
      : 0;
  const previousWeekCompanies = new Set(
    previousWeekApps.map((app) => app.company)
  ).size;

  // Calculate percentage changes
  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const appliedChange = calculatePercentageChange(
    recentApps.length,
    previousWeekApps.length
  );
  const interviewsChange = calculatePercentageChange(
    recentInterviews,
    previousWeekInterviews
  );
  const responseRateChange = calculatePercentageChange(
    recentResponseRate,
    previousWeekResponseRate
  );
  const companiesChange = calculatePercentageChange(
    new Set(recentApps.map((app) => app.company)).size,
    previousWeekCompanies
  );

  return {
    totalApplied,
    totalInterviews,
    responseRate,
    totalCompanies,
    weeklyChange: {
      applied: recentApps.length,
      interviews: recentInterviews,
      responseRate: recentResponseRate,
      companies: new Set(recentApps.map((app) => app.company)).size,
    },
    weeklyPercentageChange: {
      applied: appliedChange,
      interviews: interviewsChange,
      responseRate: responseRateChange,
      companies: companiesChange,
    },
  };
};

// Reusable StatsCard Component
interface StatsCardProps {
  data: StatCardData;
  onActionClick?: () => void;
}

const StatsCard: React.FC<StatsCardProps> = ({ data, onActionClick }) => {
  const {
    title,
    value,
    suffix = "",
    weeklyChange,
    percentageChange,
    description,
    icon: Icon,
  } = data;

  const isPositive = percentageChange >= 0;
  const showChange = percentageChange !== 0;

  return (
    <div className='bg-white rounded-xl border border-gray-200 p-6 relative hover:shadow-md transition-shadow'>
      <div className='flex justify-between items-start mb-4'>
        <div className='flex items-center gap-2'>
          {Icon && <Icon className='w-5 h-5 text-gray-500' />}
          <h3 className='text-gray-600 text-sm font-medium'>{title}</h3>
        </div>
        {onActionClick && (
          <button
            onClick={onActionClick}
            className='text-gray-400 hover:text-gray-600 transition-colors'
          >
            <ArrowUpRight className='w-4 h-4' />
          </button>
        )}
      </div>

      <div className='flex items-end gap-2 mb-2'>
        <span className='text-3xl font-bold text-gray-900'>
          {value}
          {suffix}
        </span>

        {showChange && (
          <div
            className={`flex items-center gap-1 text-sm ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className='w-3 h-3' />
            ) : (
              <ArrowDownRight className='w-3 h-3' />
            )}
            <span>{Math.abs(percentageChange)}%</span>
          </div>
        )}
      </div>

      <p className='text-xs text-gray-500'>{description}</p>
    </div>
  );
};

// Reusable StatsGrid Component
interface StatsGridProps {
  stats: Stats;
  onCardAction?: (cardType: string) => void;
  className?: string;
}

const StatsGrid: React.FC<StatsGridProps> = ({
  stats,
  onCardAction,
  className = "",
}) => {
  const statsData: StatCardData[] = [
    {
      title: "Total Applications",
      value: stats.totalApplied,
      weeklyChange: stats.weeklyChange.applied,
      percentageChange: stats.weeklyPercentageChange.applied,
      description: `${stats.weeklyChange.applied >= 0 ? "+" : ""}${
        stats.weeklyChange.applied
      } this week`,
    },
    {
      title: "Total Interviews",
      value: stats.totalInterviews,
      weeklyChange: stats.weeklyChange.interviews,
      percentageChange: stats.weeklyPercentageChange.interviews,
      description: `${stats.weeklyChange.interviews >= 0 ? "+" : ""}${
        stats.weeklyChange.interviews
      } this week`,
    },
    {
      title: "Response Rate",
      value: stats.responseRate,
      suffix: "%",
      weeklyChange: stats.weeklyChange.responseRate,
      percentageChange: stats.weeklyPercentageChange.responseRate,
      description: `${stats.weeklyChange.responseRate}% this week`,
    },
    {
      title: "Total Companies",
      value: stats.totalCompanies,
      weeklyChange: stats.weeklyChange.companies,
      percentageChange: stats.weeklyPercentageChange.companies,
      description: `${stats.weeklyChange.companies >= 0 ? "+" : ""}${
        stats.weeklyChange.companies
      } new this week`,
    },
  ];

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}
    >
      {statsData.map((statData, index) => (
        <StatsCard
          key={statData.title}
          data={statData}
          onActionClick={
            onCardAction
              ? () =>
                  onCardAction(statData.title.toLowerCase().replace(" ", "_"))
              : undefined
          }
        />
      ))}
    </div>
  );
};

// Export components and utilities
export { StatsCard, StatsGrid, calculateStats };

export type {
  Stats,
  StatCardData,
  StatsCardProps,
  StatsGridProps,
  Application,
};
