import { RefObject } from "react";
import { Application } from "../models/models";
import getChartData from "./getChartData";

export default function drawChart(
  canvasRef: RefObject<HTMLCanvasElement>,
  timeRange: string,
  applications: Application[]
) {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const data = getChartData(timeRange, applications);
  const maxValue = Math.max(...data.map((d) => d.applications), 1);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const padding = 30;
  const chartWidth = canvas.width - padding * 2;
  const chartHeight = canvas.height - padding * 2;
  const barWidth = chartWidth / data.length;

  // Draw grid lines
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const y = padding + (chartHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(canvas.width - padding, y);
    ctx.stroke();
  }

  // Draw bars
  data.forEach((item, index) => {
    const barHeight = (item.applications / maxValue) * chartHeight;
    const x = padding + index * barWidth + barWidth * 0.25;
    const y = canvas.height - padding - barHeight;
    const width = barWidth * 0.5;

    // Applications bar
    ctx.fillStyle = "#989AFF";
    ctx.fillRect(x, y, width, barHeight);

    // Interviews bar (overlay)
    if (item.interviews > 0) {
      const interviewHeight = (item.interviews / maxValue) * chartHeight;
      const interviewY = canvas.height - padding - interviewHeight;
      ctx.fillStyle = "#6366F1";
      ctx.fillRect(x, interviewY, width, interviewHeight);
    }

    // Labels
    ctx.fillStyle = "#6b7280";
    ctx.font =
      '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = "center";
    ctx.fillText(item.week, x + width / 2, canvas.height - padding + 15);

    // Values
    if (item.applications > 0) {
      ctx.fillStyle = "#374151";
      ctx.font =
        'bold 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(item.applications.toString(), x + width / 2, y - 5);
    }
  });

  // Draw axes
  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, canvas.height - padding);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(padding, canvas.height - padding);
  ctx.lineTo(canvas.width - padding, canvas.height - padding);
  ctx.stroke();

  // Y-axis labels
  ctx.fillStyle = "#6b7280";
  ctx.font =
    '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  ctx.textAlign = "right";
  for (let i = 0; i <= 4; i++) {
    const value = Math.round((maxValue / 4) * (4 - i));
    const y = padding + (chartHeight / 4) * i + 3;
    ctx.fillText(value.toString(), padding - 5, y);
  }
}
