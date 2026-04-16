import { DashboardStats } from "../../models/models";
import { StatCard } from "./StatCard";

// ---------------------------------------------------------------------
// <StatsGrid /> – maps DashboardStats to cards
// ---------------------------------------------------------------------
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

export const StatsGrid: React.FC<{ stats: DashboardStats }> = ({ stats }) => {
  const {
    weeklyChange: {
      applied,
      interviews,
      companies,
      lastWeek,
      percentageChange,
      responseRate: rateDeltaPts,
    },
  } = stats;

  const cards: StatCardProps[] = [
    {
      label: "Total Applications",
      value: stats.totalApplied,
      deltaThisWeek: applied,
      percentageChange: percentageChange.applied,
      lastWeek: lastWeek.applied,
    },
    {
      label: "Total Interviews",
      value: stats.totalInterviews,
      deltaThisWeek: interviews,
      percentageChange: percentageChange.interviews,
      lastWeek: lastWeek.interviews,
    },
    {
      label: "Response Rate",
      value: stats.responseRate,
      suffix: "%",
      // treat ±percentage‑points as the arrow delta
      percentageChange: rateDeltaPts,
      footer: `Based on ${stats.totalApplied} applications`,
    },
    {
      label: "Total Companies",
      value: stats.totalCompanies,
      deltaThisWeek: companies,
      percentageChange: percentageChange.companies,
      lastWeek: lastWeek.companies,
      footer: "Unique companies applied to",
    },
  ];

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
};
