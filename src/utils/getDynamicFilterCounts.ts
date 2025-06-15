import { Application } from "../models/models";

// calculates the total number of applications in each status
export const getDynamicFilterCounts = (
  applications: Application[],
  statuses: string[]
) => {
  const counts: Record<string, number> = {
    all: applications.length,
  };

  statuses.forEach((status) => {
    counts[status] = applications.filter((app) => app.status === status).length;
  });

  return counts;
};
