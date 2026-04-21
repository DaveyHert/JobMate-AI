// ============================================================================
// ApplicationsPage — applications route shell for the dashboard web portal
// ============================================================================
// Orchestrates filtering, pagination, and view-mode state. All rendering
// is delegated to sub-components in ./components/.
//
// Layout modes:
//   • Grid  — 3-column card grid (9 per page), cards float with shadow
//   • List  — sortable table (10 per page) in a bordered container
// ============================================================================

import { useState, useMemo } from "react";
import { ChevronDown, Search } from "lucide-react";
import { useJobMateData } from "@hooks/useJobMateData";
import { jobMateStore } from "@/store/jobMateStore";
import type { ApplicationStatus } from "@/models/models";
import { toast } from "sonner";
import { ApplicationCard } from "./components/ApplicationCard";
import { ApplicationListRow } from "./components/ApplicationListRow";
import { ApplicationsToolbar } from "./components/ApplicationsToolbar";
import { ApplicationsPagination } from "./components/ApplicationsPagination";
import { ApplicationDetailsModal } from "./components/ApplicationDetailsModal";
import { STATUS_CONFIG, getLastUpdatedDate } from "./components/applicationConstants";

const GRID_PAGE_SIZE = 12; // 3 × 4
const LIST_PAGE_SIZE = 10;

export function ApplicationsPage() {
  const data = useJobMateData();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // Store ID only so the modal always reflects the latest store state
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const selectedApp =
    selectedAppId != null ? (data?.applications.find((a) => a.id === selectedAppId) ?? null) : null;

  const applications = useMemo(
    () =>
      [...(data?.applications ?? [])].sort(
        (a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime(),
      ),
    [data?.applications],
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return applications.filter((app) => {
      if (
        q &&
        !app.title.toLowerCase().includes(q) &&
        !app.company.toLowerCase().includes(q) &&
        !STATUS_CONFIG[app.status].label.toLowerCase().includes(q)
      ) {
        return false;
      }
      const lu = getLastUpdatedDate(app);
      if (startDate && lu < new Date(startDate)) return false;
      if (endDate && lu > new Date(endDate + "T23:59:59")) return false;
      return true;
    });
  }, [applications, search, startDate, endDate]);

  const pageSize = view === "grid" ? GRID_PAGE_SIZE : LIST_PAGE_SIZE;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const setPageClamped = (p: number) => setPage(Math.max(1, Math.min(p, totalPages)));

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleViewChange = (v: "grid" | "list") => {
    setView(v);
    setPage(1);
  };

  const handleSearchChange = (q: string) => {
    setSearch(q);
    setPage(1);
  };

  const handleStartDateChange = (d: string) => {
    setStartDate(d);
    setPage(1);
  };

  const handleEndDateChange = (d: string) => {
    setEndDate(d);
    setPage(1);
  };

  const handleStatusChange = (id: number, status: ApplicationStatus) => {
    void jobMateStore.updateApplicationStatus(id, status);
  };

  const handleDelete = (id: number) => {
    toast("Delete this application?", {
      description: "This cannot be undone.",
      action: {
        label: "Delete",
        onClick: () => void jobMateStore.deleteApplication(id),
      },
      cancel: { label: "Cancel", onClick: () => {} },
    });
  };

  const handleExport = () => {
    const rows = [
      ["Title", "Company", "Status", "Source", "Date Applied", "URL"],
      ...applications.map((a) => [
        a.title,
        a.company,
        STATUS_CONFIG[a.status].label,
        a.source,
        a.dateApplied,
        a.url ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "applications.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (!data) {
    return <div className='text-secondary-text px-8 pt-8 text-sm'>Loading…</div>;
  }

  return (
    <div className='px-8 pb-16'>
      <ApplicationDetailsModal
        app={selectedApp}
        onClose={() => setSelectedAppId(null)}
        onDeleted={() => setSelectedAppId(null)}
      />
      <ApplicationsToolbar
        view={view}
        search={search}
        startDate={startDate}
        endDate={endDate}
        onViewChange={handleViewChange}
        onSearchChange={handleSearchChange}
        onStartDateChange={handleStartDateChange}
        onEndDateChange={handleEndDateChange}
        onExport={handleExport}
      />

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div className='text-secondary-text flex flex-col items-center justify-center py-32'>
          <Search className='mb-3 h-10 w-10 opacity-30' />
          <p className='text-sm'>No applications match your filters.</p>
          {(search || startDate || endDate) && (
            <button
              onClick={() => {
                setSearch("");
                setStartDate("");
                setEndDate("");
              }}
              className='text-brand-accent mt-3 text-sm hover:underline'
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* ── Grid view ── */}
      {filtered.length > 0 && view === "grid" && (
        <>
          <div className='grid grid-cols-3 gap-4'>
            {paginated.map((app) => (
              <ApplicationCard
                key={app.id}
                app={app}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onClick={(a) => setSelectedAppId(a.id)}
              />
            ))}
          </div>
          {/* Pagination sits below the floating cards */}
          <div className='mt-6'>
            <ApplicationsPagination
              currentPage={safePage}
              totalPages={totalPages}
              onPageChange={setPageClamped}
            />
          </div>
        </>
      )}

      {/* ── List view ── */}
      {filtered.length > 0 && view === "list" && (
        <div className='bg-app-foreground border-brand-border overflow-hidden rounded-xl border'>
          <table className='w-full'>
            <thead>
              <tr className='border-brand-border bg-app-background border-b'>
                <th className='text-secondary-text px-5 py-3 text-left text-xs font-medium'>
                  Job Title
                </th>
                <th className='text-secondary-text px-5 py-3 text-left text-xs font-medium'>
                  Company Name
                </th>
                <th className='text-secondary-text px-5 py-3 text-left text-xs font-medium'>
                  Last Updated
                </th>
                <th className='text-secondary-text px-5 py-3 text-left text-xs font-medium'>
                  <div className='flex items-center gap-1'>
                    Job Status <ChevronDown className='h-3 w-3' />
                  </div>
                </th>
                <th className='text-secondary-text px-5 py-3 text-left text-xs font-medium'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((app) => (
                <ApplicationListRow
                  key={app.id}
                  app={app}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  onClick={(a) => setSelectedAppId(a.id)}
                />
              ))}
            </tbody>
          </table>
          <ApplicationsPagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setPageClamped}
          />
        </div>
      )}
    </div>
  );
}
