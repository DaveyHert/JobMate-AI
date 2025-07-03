import { Application, DashboardStats } from "../models/models";

export const exportData = (
  applications: Application[],
  stats: DashboardStats
) => {
  const dataToExport = {
    applications,
    stats,
    exportDate: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `jobmate-data-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
