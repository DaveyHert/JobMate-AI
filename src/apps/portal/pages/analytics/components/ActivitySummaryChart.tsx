// ============================================================================
// ActivitySummaryChart — pie (Timeline) or grouped-bar (Volume) activity view
//
// Timeline: donut pie with outer slice labels ("N (pct%)") and "Total N" center
//           Sort by: This Week | This Month | All Time
//
// Volume:   grouped side-by-side bars over time periods
//           Sort by: Weekly | Monthly
// ============================================================================

import { useState, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Label,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  format,
  parseISO,
  startOfWeek,
  endOfWeek,
  subWeeks,
  startOfMonth,
  endOfMonth,
  subMonths,
  isWithinInterval,
} from "date-fns";
import { PieChart as PieIcon, BarChart2 } from "lucide-react";
import { Application, ApplicationStatus } from "@/models/models";
import { ChartCard, ChartLegend, SortDropdown, ViewToggle } from "./ChartCard";

// ─── Constants ───────────────────────────────────────────────────────────────

interface ActivitySummaryChartProps {
  applications: Application[];
}

type ChartView = "timeline" | "volume";

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  applied: "#5750f1",
  interviewing: "#f59e0b",
  rejected: "#ef4444",
  offer: "#22d3ee",
  ghosted: "#9ca3af",
  withdrawn: "#c084fc",
};

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: "Applied",
  interviewing: "Interviews",
  rejected: "Rejected",
  offer: "Offers",
  ghosted: "Ghosted",
  withdrawn: "Withdrawn",
};

const ALL_STATUSES: ApplicationStatus[] = [
  "applied",
  "interviewing",
  "rejected",
  "offer",
  "ghosted",
  "withdrawn",
];

const TIMELINE_SORT_OPTIONS = ["This Week", "This Month", "All Time"] as const;
const VOLUME_SORT_OPTIONS = ["Weekly", "Monthly"] as const;
type TimelinePeriod = (typeof TIMELINE_SORT_OPTIONS)[number];
type VolumePeriod = (typeof VOLUME_SORT_OPTIONS)[number];

const STATUS_LEGEND = ALL_STATUSES.map((s) => ({
  label: STATUS_LABELS[s],
  color: STATUS_COLORS[s],
}));

// ─── Data helpers ────────────────────────────────────────────────────────────

function filterByPeriod(apps: Application[], period: TimelinePeriod): Application[] {
  const now = new Date();
  if (period === "This Week") {
    const start = startOfWeek(now, { weekStartsOn: 0 });
    return apps.filter((a) => parseISO(a.dateApplied) >= start);
  }
  if (period === "This Month") {
    const start = startOfMonth(now);
    return apps.filter((a) => parseISO(a.dateApplied) >= start);
  }
  return apps;
}

function buildPieData(apps: Application[]) {
  const total = apps.length || 1;
  return ALL_STATUSES.map((s) => {
    const count = apps.filter((a) => a.status === s).length;
    return {
      name: STATUS_LABELS[s],
      value: count,
      fill: STATUS_COLORS[s],
      pct: ((count / total) * 100).toFixed(1),
    };
  }).filter((d) => d.value > 0);
}

function weekRangeLabel(start: Date, end: Date): string {
  const sm = format(start, "MMM");
  const em = format(end, "MMM");
  const sd = format(start, "d");
  const ed = format(end, "d");
  return sm === em ? `${sd}–${ed} ${em}` : `${sd} ${sm}–${ed} ${em}`;
}

function buildWeeklyVolumeData(apps: Application[]) {
  return Array.from({ length: 7 }, (_, i) => {
    const weekStart = startOfWeek(subWeeks(new Date(), 6 - i), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const label = weekRangeLabel(weekStart, weekEnd);
    const slice = apps.filter((a) =>
      isWithinInterval(parseISO(a.dateApplied), { start: weekStart, end: weekEnd }),
    );
    const row: Record<string, string | number> = { name: label };
    ALL_STATUSES.forEach((s) => {
      row[STATUS_LABELS[s]] = slice.filter((a) => a.status === s).length;
    });
    return row;
  });
}

function buildMonthlyVolumeData(apps: Application[]) {
  return Array.from({ length: 6 }, (_, i) => {
    const monthStart = startOfMonth(subMonths(new Date(), 5 - i));
    const monthEnd = endOfMonth(monthStart);
    const slice = apps.filter((a) =>
      isWithinInterval(parseISO(a.dateApplied), { start: monthStart, end: monthEnd }),
    );
    const row: Record<string, string | number> = { name: format(monthStart, "MMM") };
    ALL_STATUSES.forEach((s) => {
      row[STATUS_LABELS[s]] = slice.filter((a) => a.status === s).length;
    });
    return row;
  });
}

// ─── Pie outer label ─────────────────────────────────────────────────────────

const RADIAN = Math.PI / 180;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function PieSliceLabel({ cx, cy, midAngle, outerRadius, value, payload }: any) {
  if (!value) return null;
  const radius = outerRadius + 28;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fontSize={11}
      fontWeight={500}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline='central'
    >
      <tspan fill={payload.fill}>
        {value} ({payload.pct}%)
      </tspan>
    </text>
  );
}

// ─── Tooltips ────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className='bg-app-background border-brand-border rounded-lg border px-3 py-2 shadow-lg'>
      <p className='text-secondary-text mb-1.5 text-[11px] font-medium'>{label}</p>
      {payload
        .filter((e: { value: number }) => e.value > 0)
        .map((entry: { name: string; value: number; color: string }) => (
          <div key={entry.name} className='flex items-center gap-2 text-xs'>
            <span className='h-2 w-2 rounded-full' style={{ backgroundColor: entry.color }} />
            <span className='text-neutral-06'>{entry.name}:</span>
            <span className='text-neutral-06 font-semibold'>{entry.value}</span>
          </div>
        ))}
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PieTooltip = ({ active, payload, total }: any) => {
  if (!active || !payload?.length) return null;
  const e = payload[0];
  return (
    <div className='bg-app-background border-brand-border rounded-lg border px-3 py-2 shadow-lg'>
      <div className='flex items-center gap-2 text-xs'>
        <span className='h-2 w-2 rounded-full' style={{ backgroundColor: e.payload.fill }} />
        <span className='text-neutral-06'>{e.name}:</span>
        <span className='text-neutral-06 font-semibold'>
          {e.value} ({e.payload.pct}%)
        </span>
      </div>
      <p className='text-secondary-text mt-1 text-[10px]'>
        {e.payload.pct}% of {total} total applications
      </p>
    </div>
  );
};

// ─── Component ───────────────────────────────────────────────────────────────

export function ActivitySummaryChart({ applications }: ActivitySummaryChartProps) {
  const [view, setView] = useState<ChartView>("timeline");
  const [timelinePeriod, setTimelinePeriod] = useState<TimelinePeriod>("This Week");
  const [volumePeriod, setVolumePeriod] = useState<VolumePeriod>("Weekly");

  const pieData = useMemo(() => {
    const filtered = filterByPeriod(applications, timelinePeriod);
    return buildPieData(filtered);
  }, [applications, timelinePeriod]);

  const pieTotal = useMemo(
    () => filterByPeriod(applications, timelinePeriod).length,
    [applications, timelinePeriod],
  );

  const volumeData = useMemo(
    () =>
      volumePeriod === "Weekly"
        ? buildWeeklyVolumeData(applications)
        : buildMonthlyVolumeData(applications),
    [applications, volumePeriod],
  );

  const controls = (
    <>
      {view === "timeline" ? (
        <SortDropdown
          value={volumePeriod}
          options={VOLUME_SORT_OPTIONS}
          onChange={setVolumePeriod}
        />
      ) : (
        <SortDropdown
          value={timelinePeriod}
          options={TIMELINE_SORT_OPTIONS}
          onChange={setTimelinePeriod}
        />
      )}
      <ViewToggle<ChartView>
        value={view}
        onChange={setView}
        options={[
          { value: "timeline", label: "Timeline", icon: PieIcon },
          { value: "volume", label: "Volume", icon: BarChart2 },
        ]}
      />
    </>
  );

  return (
    <ChartCard
      title='Activity Summary'
      subtitle='Break down of your progress so far'
      controls={controls}
    >
      {view === "timeline" ? (
        <>
          <ResponsiveContainer width='100%' height={230}>
            <BarChart
              data={volumeData}
              barCategoryGap='20%'
              barGap={1}
              margin={{ top: 4, right: 8, left: 4, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray='4 4'
                stroke='var(--color-brand-border)'
                vertical={false}
              />
              <XAxis
                dataKey='name'
                tick={{ fontSize: 10, fill: "var(--color-secondary-text)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--color-secondary-text)" }}
                axisLine={false}
                tickLine={false}
                width={28}
                allowDecimals={false}
              />
              <Tooltip
                content={<BarTooltip />}
                cursor={{ fill: "rgba(87,80,241,0.04)" }}
                isAnimationActive={false}
              />
              {ALL_STATUSES.map((s) => (
                <Bar
                  key={s}
                  dataKey={STATUS_LABELS[s]}
                  fill={STATUS_COLORS[s]}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={10}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
          <ChartLegend items={STATUS_LEGEND} />
        </>
      ) : (
        <>
          <ResponsiveContainer width='100%' height={230}>
            <PieChart margin={{ top: 28, right: 12, bottom: 20, left: 12 }}>
              <Pie
                data={pieData}
                cx='50%'
                cy='50%'
                innerRadius={33}
                outerRadius={92}
                paddingAngle={5}
                cornerRadius={4}
                dataKey='value'
                isAnimationActive={false}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                label={(props: any) => <PieSliceLabel {...props} />}
                labelLine={{ stroke: "var(--color-brand-border)", strokeWidth: 1 }}
              >
                {pieData.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
                <Label
                  content={({ viewBox }) => {
                    if (!viewBox || !("cx" in viewBox)) return null;
                    const { cx, cy } = viewBox as { cx: number; cy: number };
                    return (
                      <g>
                        <text
                          x={cx}
                          y={cy - 9}
                          textAnchor='middle'
                          fill='var(--color-secondary-text)'
                          fontSize={12}
                        >
                          Total
                        </text>
                        <text
                          x={cx}
                          y={cy + 14}
                          textAnchor='middle'
                          fill='var(--color-neutral-06)'
                          fontSize={20}
                          fontWeight={700}
                        >
                          {pieTotal}
                        </text>
                      </g>
                    );
                  }}
                />
              </Pie>
              <Tooltip content={<PieTooltip total={pieTotal} />} isAnimationActive={false} />
            </PieChart>
          </ResponsiveContainer>
          <ChartLegend items={STATUS_LEGEND} />
        </>
      )}
    </ChartCard>
  );
}
