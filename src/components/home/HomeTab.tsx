import { useState } from "react";
import QuickActions from "../QuickActions";
import ApplicationCard from "../application/ApplicationCard";
import { Application, ApplicationStatus, PopupData } from "../../models/models";
import TargetGoal from "../TargetGoal";

interface Home {
  data: PopupData;
  handleStatusChange: (id: number, status: ApplicationStatus) => Promise<void>;
  setActiveTab: (tab: string) => void;
  setActiveAIFeature: (feature: string) => void;
  setData: (updatedData: PopupData) => void;
}

function HomeTab({
  data,
  handleStatusChange,
  setActiveAIFeature,
  setActiveTab,
  setData,
}: Home) {
  const [isLoading, setIsLoading] = useState(false);

  const handleTrackApplication = async () => {
    setIsLoading(true);
    try {
      if (typeof chrome !== "undefined" && chrome.tabs) {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        const response = await chrome.tabs.sendMessage(tab.id!, {
          action: "extractJobInfo",
        });

        if (response) {
          const newApp: Application = {
            // id: crypto.randomUUID,
            id: Date.now(),
            title: response.title,
            company: response.company,
            source: response.source.includes("linkedin")
              ? "linkedin"
              : response.source.includes("indeed")
              ? "indeed"
              : response.source.includes("greenhouse")
              ? "greenhouse"
              : response.source.includes("lever")
              ? "lever"
              : "other",
            status: "applied",
            dateApplied: new Date().toISOString(),
            url: response.url,
          };

          const updatedApps = [newApp, ...data.applications];
          const updatedData = {
            ...data,
            applications: updatedApps,
            weeklyGoal: {
              ...data.weeklyGoal,
              current: data.weeklyGoal.current + 1,
            },
          };
          setData(updatedData);

          // Save to storage if available
          if (typeof chrome !== "undefined" && chrome.storage) {
            try {
              const result = await chrome.storage.local.get(["jobMateData"]);
              const existingData = result.jobMateData || {};
              await chrome.storage.local.set({
                jobMateData: {
                  ...existingData,
                  applications: updatedApps,
                  weeklyGoal: updatedData.weeklyGoal,
                },
              });
            } catch (error) {
              console.error("Error saving to storage:", error);
            }
          }

          showNotification("Application tracked successfully!", "success");
        }
      } else {
        showNotification(
          "Application tracking is only available in Chrome extension mode",
          "warning"
        );
      }
    } catch (error) {
      showNotification(
        "Failed to track application. Please try again.",
        "error"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoFill = async () => {
    setIsLoading(true);
    try {
      if (typeof chrome !== "undefined" && chrome.tabs) {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        const response = await chrome.tabs.sendMessage(tab.id!, {
          action: "autoFill",
        });

        if (response?.success) {
          showNotification("Form auto-filled successfully!", "success");
        } else {
          showNotification("No fillable fields found on this page", "warning");
        }
      } else {
        showNotification(
          "Auto-fill is only available in Chrome extension mode",
          "warning"
        );
      }
    } catch (error) {
      showNotification("Auto-fill failed. Please try again.", "error");
    } finally {
      setIsLoading(false);
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
  console.log(data);
  return (
    <div className='flex-1  custom-scrollbar overflow-y-auto scroll-smooth min-h-0'>
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
        <TargetGoal weeklyGoal={data.weeklyGoal} />

        {/* Recent Applications */}
        <div className='flex justify-between items-center mb-2'>
          <h3 className='text-base font-medium text-gray-900 dark:text-[#F3F4F6]'>
            Recent applications
          </h3>
          <button
            onClick={() => setActiveTab("applications")}
            className='text-xs text-[#2563EB] hover:text-purple-700 font-medium'
          >
            View All
          </button>
        </div>

        {/* Recent Applications List */}
        <div className='space-y-2 pb-4'>
          {data.applications.slice(0, 4).map((app: Application) => (
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
