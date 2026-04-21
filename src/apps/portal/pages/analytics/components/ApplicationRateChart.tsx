// ============================================================================
// ApplicationRateChart — area (Trend) or bar (Daily) chart of applications
//
// Trend:  smooth AreaChart — "This week" (teal) vs "Last week" (violet)
// Daily:  BarChart — applications per day in solid brand purple
//
// Sort by dropdown controls granularity: Weekly (Sun-Sat) | Monthly (W1-W4)
// ============================================================================

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  parseISO,
  startOfWeek,
  addDays,
  addWeeks,
  endOfWeek,
  subWeeks,
  startOfMonth,
  isSameDay,
} from "date-fns";
import { Application } from "@/models/models";
import { ChartCard, ChartLegend, SortDropdown, ViewToggle } from "./ChartCard";

interface ApplicationRateChartProps {
  applications: Application[];
}

type SortBy = "Weekly" | "Monthly";
type ChartType = "trend" | "daily";

const SORT_OPTIONS = ["Weekly", "Monthly"] as const;

const TREND_THIS_COLOR = "#22d3ee";
const TREND_PREV_COLOR = "#a78bfa";

// ─── Data helpers ────────────────────────────────────────────────────────────

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function weeklyTrend(apps: Application[]) {
  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  const lastWeekStart = subWeeks(thisWeekStart, 1);
  return DAYS.map((name, i) => ({
    name,
    "This week": apps.filter((a) => isSameDay(parseISO(a.dateApplied), addDays(thisWeekStart, i)))
      .length,
    "Last week": apps.filter((a) => isSameDay(parseISO(a.dateApplied), addDays(lastWeekStart, i)))
      .length,
  }));
}

function weeklyDaily(apps: Application[]) {
  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 0 });
  return DAYS.map((name, i) => ({
    name,
    Applications: apps.filter((a) => isSameDay(parseISO(a.dateApplied), addDays(thisWeekStart, i)))
      .length,
  }));
}

function monthlyTrend(apps: Application[]) {
  const firstWeek = startOfWeek(startOfMonth(new Date()), { weekStartsOn: 0 });
  return Array.from({ length: 5 }, (_, i) => {
    const wStart = addWeeks(firstWeek, i);
    const wEnd = addDays(endOfWeek(wStart, { weekStartsOn: 0 }), 1);
    const lwStart = subWeeks(wStart, 4);
    const lwEnd = subWeeks(wEnd, 4);
    return {
      name: `W${i + 1}`,
      "This month": apps.filter((a) => {
        const d = parseISO(a.dateApplied);
        return d >= wStart && d < wEnd;
      }).length,
      "Last month": apps.filter((a) => {
        const d = parseISO(a.dateApplied);
        return d >= lwStart && d < lwEnd;
      }).length,
    };
  });
}

function monthlyDaily(apps: Application[]) {
  const firstWeek = startOfWeek(startOfMonth(new Date()), { weekStartsOn: 0 });
  return Array.from({ length: 5 }, (_, i) => {
    const wStart = addWeeks(firstWeek, i);
    const wEnd = addDays(endOfWeek(wStart, { weekStartsOn: 0 }), 1);
    return {
      name: `W${i + 1}`,
      Applications: apps.filter((a) => {
        const d = parseISO(a.dateApplied);
        return d >= wStart && d < wEnd;
      }).length,
    };
  });
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className='bg-app-background border-brand-border p y-2 rounded-lg border px-3 shadow-lg'>
      <p className='text-secondary-text mb-1 text-[11px] font-normal'>{label}</p>
      {payload.map((entry: { name: string; value: number; color: string }) => (
        <div key={entry.name} className='flex items-center gap-2 text-xs'>
          <span className='h-2 w-2 rounded-full' style={{ backgroundColor: entry.color }} />
          <span className='text-neutral-06'>{entry.name}:</span>
          <span className='text-neutral-06 font-semibold'>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

// ─── Component ───────────────────────────────────────────────────────────────

export function ApplicationRateChart({ applications }: ApplicationRateChartProps) {
  const [sortBy, setSortBy] = useState<SortBy>("Weekly");
  const [chartType, setChartType] = useState<ChartType>("trend");

  const subtitle =
    chartType === "trend"
      ? "Compare your performance this period vs the last time"
      : "Track your application frequency";

  const data = useMemo(() => {
    if (sortBy === "Weekly") {
      return chartType === "trend" ? weeklyTrend(applications) : weeklyDaily(applications);
    }
    return chartType === "trend" ? monthlyTrend(applications) : monthlyDaily(applications);
  }, [applications, sortBy, chartType]);

  const trendSeriesLabel = sortBy === "Weekly" ? "This week" : "This month";
  const trendPrevLabel = sortBy === "Weekly" ? "Last week" : "Last month";

  const controls = (
    <>
      <SortDropdown value={sortBy} options={SORT_OPTIONS} onChange={setSortBy} />
      <ViewToggle<ChartType>
        value={chartType}
        onChange={setChartType}
        options={[
          { value: "trend", label: "Trend" },
          { value: "daily", label: "Daily" },
        ]}
      />
    </>
  );

  return (
    <ChartCard title='Application Rate' subtitle={subtitle} controls={controls}>
      <ResponsiveContainer width='100%' height={230}>
        {chartType === "trend" ? (
          <AreaChart data={data} margin={{ top: 4, right: 8, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id='gradThisWeek' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor={TREND_THIS_COLOR} stopOpacity={0.3} />
                <stop offset='95%' stopColor={TREND_THIS_COLOR} stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id='gradLastWeek' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='5%' stopColor={TREND_PREV_COLOR} stopOpacity={0.2} />
                <stop offset='95%' stopColor={TREND_PREV_COLOR} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray='4 4'
              stroke='var(--color-brand-border)'
              vertical={false}
            />
            <XAxis
              dataKey='name'
              tick={{ fontSize: 12, fill: "var(--color-secondary-text)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "var(--color-secondary-text)" }}
              axisLine={false}
              tickLine={false}
              width={28}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type='monotone'
              dataKey={trendSeriesLabel}
              stroke={TREND_THIS_COLOR}
              strokeWidth={2.5}
              fill='url(#gradThisWeek)'
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Area
              type='monotone'
              dataKey={trendPrevLabel}
              stroke={TREND_PREV_COLOR}
              strokeWidth={2}
              fill='url(#gradLastWeek)'
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        ) : (
          <BarChart
            data={data}
            barCategoryGap='35%'
            margin={{ top: 4, right: 8, left: 4, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray='4 4'
              stroke='var(--color-brand-border)'
              vertical={false}
            />
            <XAxis
              dataKey='name'
              tick={{ fontSize: 12, fill: "var(--color-secondary-text)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "var(--color-secondary-text)" }}
              axisLine={false}
              tickLine={false}
              width={28}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(87,80,241,0.06)" }} />
            <Bar dataKey='Applications' fill='#5750f1' radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        )}
      </ResponsiveContainer>
      {chartType === "trend" ? (
        <ChartLegend
          items={[
            { label: trendSeriesLabel, color: TREND_THIS_COLOR },
            { label: trendPrevLabel, color: TREND_PREV_COLOR },
          ]}
        />
      ) : (
        <div className='mt-4 h-[18px]' aria-hidden='true' />
      )}
    </ChartCard>
  );
}
