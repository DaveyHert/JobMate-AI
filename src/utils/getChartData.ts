import { Application } from "../models/models";

export default function getChartData(
  timeRange: string,
  applications: Application[]
) {
  const data = [];
  const now = new Date();

  if (timeRange === "today") {
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

      const dayApps = applications.filter((app) => {
        const appDate = new Date(app.dateApplied);
        return appDate >= dayStart && appDate < dayEnd;
      });

      const dayInterviews = dayApps.filter(
        (app) => app.status === "interviewing" || app.status === "offer"
      );

      data.push({
        week: `${date.getMonth() + 1}/${date.getDate()}`,
        applications: dayApps.length,
        interviews: dayInterviews.length,
      });
    }
  } else if (timeRange === "week") {
    for (let i = 6; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

      const weekApps = applications.filter((app) => {
        const appDate = new Date(app.dateApplied);
        return appDate >= weekStart && appDate < weekEnd;
      });

      const weekInterviews = weekApps.filter(
        (app) => app.status === "interviewing" || app.status === "offer"
      );

      data.push({
        week: `${weekStart.getMonth() + 1}/${weekStart.getDate()}`,
        applications: weekApps.length,
        interviews: weekInterviews.length,
      });
    }
  } else if (timeRange === "month") {
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const monthApps = applications.filter((app) => {
        const appDate = new Date(app.dateApplied);
        return appDate >= monthStart && appDate < monthEnd;
      });

      const monthInterviews = monthApps.filter(
        (app) => app.status === "interviewing" || app.status === "offer"
      );

      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      data.push({
        week: monthNames[monthStart.getMonth()],
        applications: monthApps.length,
        interviews: monthInterviews.length,
      });
    }
  }

  return data;
}
