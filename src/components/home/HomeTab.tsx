import { useState } from "react";
import QuickActions from "../QuickActions";
import ApplicationCard from "../application/ApplicationCard";
import {
  Application,
  ApplicationStatus,
  WeeklyGoal,
} from "../../models/models";
import TargetGoal from "../TargetGoal";

interface HomeTabProps {
  applications: Application[];
  weeklyGoal: WeeklyGoal;
  handleStatusChange: (id: number, status: ApplicationStatus) => Promise<void>;
  setActiveTab: (tab: string) => void;
  setActiveAIFeature: (feature: string) => void;
  onAddApplication: (
    app: Omit<Application, "id" | "status" | "dateApplied" | "history">
  ) => Promise<void>;
  setIsBusy: (busy: boolean) => void;
}

function HomeTab({
  applications,
  weeklyGoal,
  handleStatusChange,
  setActiveAIFeature,
  setActiveTab,
  onAddApplication,
  setIsBusy,
}: HomeTabProps) {
  const [isLoading, setIsLoading] = useState(false);

  const setBusy = (next: boolean) => {
    setIsLoading(next);
    setIsBusy(next);
  };

  const handleTrackApplication = async () => {
    setBusy(true);
    try {
      if (
        typeof chrome === "undefined" ||
        !chrome.tabs ||
        !chrome.tabs.query
      ) {
        showNotification(
          "Application tracking is only available in the Chrome extension",
          "warning"
        );
        return;
      }

      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) {
        showNotification("No active tab found", "error");
        return;
      }

      let response: any;
      try {
        response = await chrome.tabs.sendMessage(tab.id, {
          action: "extractJobInfo",
        });
      } catch (err) {
        showNotification(
          "Couldn't read this page. Open a job posting and try again.",
          "warning"
        );
        return;
      }

      if (!response || !response.title) {
        showNotification(
          "No job posting detected on this page",
          "warning"
        );
        return;
      }

      const sourceRaw: string = response.source ?? "";
      const source = sourceRaw.includes("linkedin")
        ? "linkedin"
        : sourceRaw.includes("indeed")
          ? "indeed"
          : sourceRaw.includes("greenhouse")
            ? "greenhouse"
            : sourceRaw.includes("lever")
              ? "lever"
              : sourceRaw || "other";

      await onAddApplication({
        title: response.title,
        company: response.company ?? "Unknown",
        source,
        url: response.url ?? tab.url,
      });

      showNotification("Application tracked successfully!", "success");
    } catch (error) {
      console.error("[track application] failed", error);
      showNotification(
        "Failed to track application. Please try again.",
        "error"
      );
    } finally {
      setBusy(false);
    }
  };

  const handleAutoFill = async () => {
    setBusy(true);
    try {
      if (
        typeof chrome === "undefined" ||
        !chrome.tabs ||
        !chrome.tabs.query
      ) {
        showNotification(
          "Auto-fill is only available in the Chrome extension",
          "warning"
        );
        return;
      }

      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab?.id) {
        showNotification("No active tab found", "error");
        return;
      }

      let response: any;
      try {
        response = await chrome.tabs.sendMessage(tab.id, { action: "autoFill" });
      } catch (err) {
        showNotification(
          "This page isn't reachable. Open a job application form and try again.",
          "warning"
        );
        return;
      }

      if (response?.success) {
        showNotification("Form auto-filled successfully!", "success");
      } else if (response?.error) {
        showNotification(response.error, "error");
      } else {
        showNotification("No fillable fields found on this page", "warning");
      }
    } catch (error) {
      console.error("[autofill] failed", error);
      showNotification("Auto-fill failed. Please try again.", "error");
    } finally {
      setBusy(false);
    }
  };

  const handleGenerateCoverLetter = () => {
    setActiveAIFeature("cover-letter");
  };

  const handleAnalyzeJobFit = () => {
    setActiveAIFeature("job-fit");
  };

  const showNotification = (
    message: string,
    type: "success" | "error" | "warning" | "info"
  ) => {
    const notification = document.createElement("div");
    notification.className = `fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg text-white text-sm font-medium z-50 ${
      type === "success"
        ? "bg-green-500"
        : type === "error"
          ? "bg-red-500"
          : type === "warning"
            ? "bg-yellow-500"
            : "bg-blue-500"
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const handleTailorResume = () => {
    setActiveAIFeature("resume-tailor");
  };

  const handleGenerateAnswer = () => {
    setActiveAIFeature("answer-generator");
  };

  return (
    <div className='flex-1  custom-scrollbar overflow-y-auto scroll-smooth min-h-0 bg-background'>
      <div className='px-2.5 pt-2'>
        <QuickActions
          onAutoFill={handleAutoFill}
          onGenerateCoverLetter={handleGenerateCoverLetter}
          onAnalyzeJobFit={handleAnalyzeJobFit}
          onTrackApplication={handleTrackApplication}
          onTailorResume={handleTailorResume}
          onGenerateAnswer={handleGenerateAnswer}
          isLoading={isLoading}
        />

        {/* Weekly Goal */}
        <TargetGoal weeklyGoal={weeklyGoal} />

        {/* Recent Applications */}
        <div className='flex justify-between items-center mb-2'>
          <h3 className='text-base font-medium text-gray-900 dark:text-[#F3F4F6]'>
            Recent applications
          </h3>
          <button
            onClick={() => setActiveTab("applications")}
            className='text-xs text-accent hover:text-muted font-medium cursor-pointer'
          >
            View All
          </button>
        </div>

        {/* Recent Applications List */}
        <div className='space-y-2 pb-4'>
          {applications.slice(0, 4).map((app: Application) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
export default HomeTab;
