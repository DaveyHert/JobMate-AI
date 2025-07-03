import {
  Application,
  ApplicationStatus,
  DashboardStats,
} from "../models/models";

import { subWeeks, startOfDay, isAfter, isBefore, parseISO } from "date-fns";

// utility helper functions

const isInterview = (status: ApplicationStatus): boolean =>
  status === "interviewing" || status === "offer";

const calcRelativeChange = (curr: number, prev: number): number | null =>
  prev === 0 ? null : Math.round(((curr - prev) / prev) * 100);

const calcRatePts = (curr: number, prev: number): number =>
  Math.round((curr - prev) * 100);

// date helpers (date‑fns)
const today = startOfDay(new Date());
const oneWeekAgoDate = subWeeks(today, 1);
const twoWeeksAgoDate = subWeeks(today, 2);

const inCurrentWeek = (iso: string): boolean => {
  const d = parseISO(iso);
  return isAfter(d, oneWeekAgoDate) || d.getTime() === oneWeekAgoDate.getTime();
};

const inPrevWeek = (iso: string): boolean => {
  const d = parseISO(iso);
  return (
    (isAfter(d, twoWeeksAgoDate) ||
      d.getTime() === twoWeeksAgoDate.getTime()) &&
    isBefore(d, oneWeekAgoDate)
  );
};

// ---------------------------------------------------------------------
// Main calculator (pure)
// ---------------------------------------------------------------------

export const calculateStats = (apps: Application[]): DashboardStats => {
  // Lifetime totals ---------------------------------------------------
  const totalApplied = apps.length;
  const totalInterviews = apps.filter((app) => {
    const history = app.history ?? [];
    return history.length
      ? history.some((ev) => isInterview(ev.status))
      : isInterview(app.status);
  }).length;

  const responseRate = totalApplied
    ? Math.round((totalInterviews / totalApplied) * 100)
    : 0;

  const totalCompanies = new Set(apps.map((a) => a.company)).size;

  // Weekly slices -----------------------------------------------------
  const recentApps = apps.filter((a) => inCurrentWeek(a.dateApplied));
  const prevWeekApps = apps.filter((a) => inPrevWeek(a.dateApplied));

  const recentInterviews = apps.filter((a) => {
    const history = a.history ?? [];
    if (history.length) {
      return history.some(
        (ev) => isInterview(ev.status) && inCurrentWeek(ev.date)
      );
    }
    // fallback for legacy records without history
    return isInterview(a.status) && inCurrentWeek(a.dateApplied);
  }).length;

  const prevWeekInterviews = apps.filter((a) => {
    const history = a.history ?? [];
    if (history.length) {
      return history.some(
        (ev) => isInterview(ev.status) && inPrevWeek(ev.date)
      );
    }
    return isInterview(a.status) && inPrevWeek(a.dateApplied);
  }).length;

  const recentCompanies = new Set(recentApps.map((a) => a.company)).size;
  const prevWeekCompanies = new Set(prevWeekApps.map((a) => a.company)).size;

  // Response‑rate delta ----------------------------------------------
  const weeklyRate = recentApps.length
    ? recentInterviews / recentApps.length
    : 0;
  const prevWeeklyRate = prevWeekApps.length
    ? prevWeekInterviews / prevWeekApps.length
    : 0;
  const rateDeltaPts = calcRatePts(weeklyRate, prevWeeklyRate);

  // Return ------------------------------------------------------------
  const dashboardStats = {
    totalApplied,
    totalInterviews,
    responseRate,
    totalCompanies,
    weeklyChange: {
      applied: recentApps.length,
      interviews: recentInterviews,
      companies: recentCompanies,
      responseRate: rateDeltaPts,
      lastWeek: {
        applied: prevWeekApps.length,
        interviews: prevWeekInterviews,
        companies: prevWeekCompanies,
      },
      percentageChange: {
        applied: calcRelativeChange(recentApps.length, prevWeekApps.length),
        interviews: calcRelativeChange(recentInterviews, prevWeekInterviews),
        companies: calcRelativeChange(recentCompanies, prevWeekCompanies),
      },
    },
  };

  return dashboardStats;
};
