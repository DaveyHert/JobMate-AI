// ============================================================================
// applicationConstants — shared config, types, and pure helpers for the
// Applications page and its sub-components. No JSX here.
// ============================================================================

import type { Application, ApplicationStatus } from "../../../models/models";
export { formatShortRelative, formatDetailDate } from "../../../utils/dateHelpers";

export const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  applied: {
    label: "Applied",
    bg: "bg-sky-50 dark:bg-sky-950",
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-200 dark:border-sky-800",
  },
  interviewing: {
    label: "Interviewing",
    bg: "bg-amber-50 dark:bg-amber-950",
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
  },
  offer: {
    label: "Accepted",
    bg: "bg-emerald-50 dark:bg-emerald-950",
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
  },
  rejected: {
    label: "Not Moving Forward",
    bg: "bg-rose-50 dark:bg-rose-950",
    text: "text-rose-600 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800",
  },
  ghosted: {
    label: "Not Moving Forward",
    bg: "bg-rose-50 dark:bg-rose-950",
    text: "text-rose-600 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800",
  },
  withdrawn: {
    label: "Withdrawn",
    bg: "bg-violet-50 dark:bg-violet-950",
    text: "text-violet-700 dark:text-violet-300",
    border: "border-violet-200 dark:border-violet-800",
  },
};

export const ALL_STATUSES: ApplicationStatus[] = [
  "applied",
  "interviewing",
  "offer",
  "rejected",
  "ghosted",
  "withdrawn",
];

export function getLastUpdatedDate(app: Application): Date {
  if (app.history && app.history.length > 0) {
    const ms = app.history.map((e) => new Date(e.date).getTime());
    return new Date(Math.max(...ms));
  }
  return new Date(app.dateApplied);
}

const AVATAR_COLORS = [
  "bg-violet-600",
  "bg-indigo-600",
  "bg-blue-600",
  "bg-emerald-600",
  "bg-rose-500",
  "bg-amber-500",
  "bg-cyan-600",
  "bg-fuchsia-600",
];

export function getAvatar(company: string) {
  const idx = company.charCodeAt(0) % AVATAR_COLORS.length;
  return { initial: company.charAt(0).toUpperCase(), bg: AVATAR_COLORS[idx] };
}
