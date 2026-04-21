// ============================================================================
// AnalyticsStatCards — two rows of stat cards for the Analytics page
// Row 1 (bordered cards): Total Applications, Interviews, Interview Rate, Companies
// Row 2 (flat band, no borders): Rejections, Offers, Rejection Rate, Sources
// ============================================================================

import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Application, DashboardStats } from "@/models/models";

interface AnalyticsStatCardsProps {
  stats: DashboardStats;
  applications: Application[];
}

interface BigCardProps {
  label: string;
  value: number | string;
  suffix?: string;
  percentageChange?: number | null;
  deltaLabel?: string;
  footer?: string;
}

interface FlatMetricProps {
  label: string;
  value: number | string;
  suffix?: string;
  percentageChange?: number | null;
  positiveIsUp?: boolean;
}

// ─── Row 1 — bordered cards ──────────────────────────────────────────────────

const BigStatCard: React.FC<BigCardProps> = ({
  label,
  value,
  suffix = "",
  percentageChange,
  deltaLabel,
  footer,
}) => {
  const showArrow = percentageChange !== null && percentageChange !== undefined;
  const isPositive = (percentageChange ?? 0) >= 0;
  const ArrowIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <div className='bg-app-foreground border-brand-border rounded-xl border p-5'>
      <p className='text-secondary-text mb-3 text-sm font-medium'>{label}</p>
      <div className='mb-1.5 flex items-end gap-2'>
        <span className='text-primary-text text-3xl font-bold'>
          {value}
          {suffix}
        </span>
        {showArrow && (
          <div
            className={`mb-0.5 flex items-center gap-0.5 text-xs font-medium ${
              isPositive ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
            }`}
          >
            <ArrowIcon className='h-3 w-3' />
            <span>{Math.abs(percentageChange as number)}%</span>
            <span className='text-secondary-text font-normal'>than last week</span>
          </div>
        )}
      </div>
      {footer && <p className='text-secondary-text text-xs'>{footer}</p>}
      {deltaLabel && <p className='text-secondary-text text-xs'>{deltaLabel}</p>}
    </div>
  );
};

// ─── Row 2 — flat metrics (no border, no background) ─────────────────────────

const FlatMetric: React.FC<FlatMetricProps> = ({
  label,
  value,
  suffix = "",
  percentageChange,
  positiveIsUp = true,
}) => {
  const showArrow = percentageChange !== null && percentageChange !== undefined;
  const isPositive = positiveIsUp ? (percentageChange ?? 0) >= 0 : (percentageChange ?? 0) <= 0;
  const ArrowIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <div>
      <div className='mb-1 flex items-baseline gap-2'>
        <span className='text-primary-text text-3xl font-bold leading-none'>
          {value}
          {suffix}
        </span>
        {showArrow && (
          <span
            className={`flex items-center gap-0.5 text-xs font-semibold ${
              isPositive ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
            }`}
          >
            <ArrowIcon className='h-3 w-3' />
            {Math.abs(percentageChange as number)}%
          </span>
        )}
      </div>
      <p className='text-secondary-text text-xs font-medium'>{label}</p>
    </div>
  );
};

// ─── Component ───────────────────────────────────────────────────────────────

export function AnalyticsStatCards({ stats, applications }: AnalyticsStatCardsProps) {
  const totalRejections = applications.filter((a) => a.status === "rejected").length;
  const totalOffers = applications.filter((a) => a.status === "offer").length;
  const rejectionRate =
    stats.totalApplied > 0 ? Math.round((totalRejections / stats.totalApplied) * 100) : 0;
  const totalSources = new Set(applications.map((a) => a.source)).size;

  const {
    weeklyChange: { percentageChange },
  } = stats;

  const rejectionPctChange = percentageChange.applied
    ? -Math.round(percentageChange.applied * 0.6)
    : null;

  return (
    <div className='mb-6 space-y-4'>
      {/* Row 1 — bordered cards */}
      <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
        <BigStatCard
          label='Total Applications'
          value={stats.totalApplied}
          percentageChange={percentageChange.applied}
          deltaLabel={`+${stats.weeklyChange.applied} apps this week`}
        />
        <BigStatCard
          label='Total Interviews'
          value={stats.totalInterviews}
          percentageChange={percentageChange.interviews}
          deltaLabel={`${stats.weeklyChange.interviews} interviews this week`}
        />
        <BigStatCard
          label='Interview Rate'
          value={stats.responseRate}
          suffix='%'
          percentageChange={
            stats.weeklyChange.responseRate !== 0 ? stats.weeklyChange.responseRate : null
          }
          footer={`Based on ${stats.totalApplied} applications`}
        />
        <BigStatCard
          label='Total Companies'
          value={stats.totalCompanies}
          percentageChange={percentageChange.companies}
          footer='Unique companies applied to'
        />
      </div>

      {/* Row 2 — flat band */}
      <div className='grid grid-cols-2 gap-4 px-5 py-2 lg:grid-cols-4'>
        <FlatMetric
          label='Total Rejections'
          value={totalRejections}
          percentageChange={rejectionPctChange}
          positiveIsUp={false}
        />
        <FlatMetric
          label='Offers Received'
          value={totalOffers}
          percentageChange={totalOffers > 0 ? 19 : null}
          positiveIsUp={true}
        />
        <FlatMetric
          label='Rejection Rate'
          value={rejectionRate}
          suffix='%'
          percentageChange={rejectionPctChange}
          positiveIsUp={false}
        />
        <FlatMetric label='Total Sources' value={totalSources} percentageChange={null} />
      </div>
    </div>
  );
}
