// ============================================================================
// TopJobBoardsTable — per-source breakdown of applications, interviews, offers
// Has a Percentage/Count toggle that switches rate columns between count & %
// ============================================================================

import { useMemo, useState } from "react";
import { Application } from "@/models/models";
import LinkedInIcon from "@/assets/svg/icons/LinkedInIcon";

interface TopJobBoardsTableProps {
  applications: Application[];
}

type DisplayMode = "percentage" | "count";

const SOURCE_DISPLAY: Record<string, string> = {
  linkedin: "LinkedIn",
  indeed: "Indeed",
  greenhouse: "Greenhouse",
  lever: "Lever",
  workable: "Workable",
  other: "Direct website",
};

const SOURCE_COLORS: Record<string, string> = {
  linkedin: "#0A66C2",
  indeed: "#003A9B",
  greenhouse: "#22A06B",
  lever: "#F97316",
  workable: "#111827",
  other: "#1F2937",
};

// ─── Source icon ─────────────────────────────────────────────────────────────

function SourceIcon({ source, color, name }: { source: string; color: string; name: string }) {
  if (source === "linkedin") {
    return (
      <div
        className='flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-white'
        style={{ backgroundColor: color }}
      >
        <LinkedInIcon className='h-4 w-4' />
      </div>
    );
  }
  return (
    <div
      className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white'
      style={{ backgroundColor: color }}
    >
      {name[0]}
    </div>
  );
}

// ─── iOS-style toggle (Percentage / Count) ───────────────────────────────────

function ModeToggle({
  mode,
  onChange,
}: {
  mode: DisplayMode;
  onChange: (m: DisplayMode) => void;
}) {
  const isCount = mode === "count";
  return (
    <div className='flex items-center gap-3'>
      <span
        className={`text-xs ${mode === "percentage" ? "text-primary-text font-medium" : "text-secondary-text"}`}
      >
        Percentage
      </span>
      <button
        type='button'
        role='switch'
        aria-checked={isCount}
        onClick={() => onChange(isCount ? "percentage" : "count")}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          isCount ? "bg-neutral-06" : "bg-neutral-03"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            isCount ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </button>
      <span
        className={`text-xs ${isCount ? "text-primary-text font-medium" : "text-secondary-text"}`}
      >
        Count
      </span>
    </div>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────────

interface BoardRow {
  source: string;
  name: string;
  color: string;
  applications: number;
  interviews: number;
  interviewRate: number;
  ghosted: number;
  ghostRate: number;
  offers: number;
  successRate: number;
}

export function TopJobBoardsTable({ applications }: TopJobBoardsTableProps) {
  const [mode, setMode] = useState<DisplayMode>("count");

  const rows: BoardRow[] = useMemo(() => {
    const map: Record<
      string,
      { apps: Application[]; interviews: number; offers: number; ghosted: number }
    > = {};

    applications.forEach((a) => {
      if (!map[a.source]) map[a.source] = { apps: [], interviews: 0, offers: 0, ghosted: 0 };
      map[a.source].apps.push(a);
      if (a.status === "interviewing") map[a.source].interviews += 1;
      if (a.status === "offer") map[a.source].offers += 1;
      if (a.status === "ghosted") map[a.source].ghosted += 1;
    });

    return Object.entries(map)
      .map(([source, { apps, interviews, offers, ghosted }]) => {
        const total = apps.length;
        return {
          source,
          name: SOURCE_DISPLAY[source] ?? source,
          color: SOURCE_COLORS[source] ?? "#6b7280",
          applications: total,
          interviews,
          interviewRate: total > 0 ? Math.round((interviews / total) * 100) : 0,
          ghosted,
          ghostRate: total > 0 ? Math.round((ghosted / total) * 100) : 0,
          offers,
          successRate: total > 0 ? Math.round((offers / total) * 100) : 0,
        };
      })
      .sort((a, b) => b.applications - a.applications);
  }, [applications]);

  const formatRate = (count: number, rate: number) =>
    mode === "count" ? String(count) : `${rate}%`;

  return (
    <div className='bg-app-foreground border-brand-border h-full rounded-xl border p-5'>
      <div className='mb-4 flex items-start justify-between gap-4'>
        <div>
          <h3 className='text-primary-text text-base font-semibold'>Top Performing Job Boards</h3>
          <p className='text-secondary-text mt-0.5 text-xs'>
            See where you are having more success
          </p>
        </div>
        <ModeToggle mode={mode} onChange={setMode} />
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='w-full text-sm'>
          <thead>
            <tr className='border-brand-border border-b'>
              <th className='text-secondary-text pb-2.5 text-left text-xs font-medium'>
                Job Board
              </th>
              <th className='text-secondary-text pb-2.5 text-right text-xs font-medium'>
                Applications
              </th>
              <th className='text-secondary-text pb-2.5 text-right text-xs font-medium'>
                Interviews / Rate
              </th>
              <th className='text-secondary-text pb-2.5 text-right text-xs font-medium'>
                Ghost Rate
              </th>
              <th className='text-secondary-text pb-2.5 text-right text-xs font-medium'>Offers</th>
              <th className='text-secondary-text pr-0 pb-2.5 text-right text-xs font-medium'>
                Success Rate
              </th>
            </tr>
          </thead>
          <tbody className='divide-brand-border divide-y'>
            {rows.map((row) => (
              <tr key={row.source} className='hover:bg-app-background transition-colors'>
                <td className='py-3 pr-4'>
                  <div className='flex items-center gap-2.5'>
                    <SourceIcon source={row.source} color={row.color} name={row.name} />
                    <span className='text-primary-text text-sm font-medium'>{row.name}</span>
                  </div>
                </td>

                <td className='py-3 pr-4 text-right'>
                  <span className='text-primary-text font-semibold'>{row.applications}</span>
                </td>

                <td className='py-3 pr-4 text-right'>
                  <span className='text-primary-text font-semibold'>
                    {formatRate(row.interviews, row.interviewRate)}
                  </span>
                </td>

                <td className='py-3 pr-4 text-right'>
                  <span className='text-primary-text font-semibold'>
                    {formatRate(row.ghosted, row.ghostRate)}
                  </span>
                </td>

                <td className='py-3 pr-4 text-right'>
                  <span className='text-primary-text font-semibold'>{row.offers}</span>
                </td>

                <td className='py-3 text-right'>
                  <span className='text-primary-text font-semibold'>{row.successRate}%</span>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className='text-secondary-text py-8 text-center text-sm'>
                  No application data yet. Start tracking to see performance by source.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
