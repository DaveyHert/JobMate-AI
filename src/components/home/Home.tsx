import { useState } from "react";
import QuickActions from "../QuickActions";
import ApplicationCard from "../ApplicationCard";
import { Application, WeeklyGoal } from "../../models/models";

interface PopupData {
  applications: Application[];
  weeklyGoal: WeeklyGoal;
}

interface Home {
  data: PopupData;
}

function Home({
  data,
  handleStatusChange,
  onTriggerAiFeature,
  onTabChange,
  setData,
}: any) {
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
    onTriggerAiFeature("cover-letter");
  };

  const handleAnalyzeJobFit = () => {
    onTriggerAiFeature("job-fit");
  };

  const goalPercentage = Math.round(
    (data.weeklyGoal.current / data.weeklyGoal.target) * 100
  );

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
    onTriggerAiFeature("resume-tailor");
  };

  const handleGenerateAnswer = () => {
    onTriggerAiFeature("answer-generator");
  };

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
        <div className='bg-white dark:bg-[#1F2937] rounded-2xl py-3 px-5 mb-3.5 shadow-sm border border-gray-100 dark:border-[#374151]'>
          <div className='flex justify-between items-center mb-1'>
            <span className='text-sm text-gray-600'>
              Weekly Goal: {data.weeklyGoal.current}/{data.weeklyGoal.target}{" "}
              jobs
            </span>
            <span className='text-sm font-semibold text-blue-600'>
              {goalPercentage}%
            </span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2.5'>
            <div
              className='bg-[#2563EB] h-2.5 rounded-full transition-all duration-300'
              style={{ width: `${goalPercentage}%` }}
            />
          </div>
        </div>

        {/* Recent Applications */}
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-base font-medium text-gray-900'>
            Recent applications
          </h3>
          <button
            onClick={() => onTabChange("applications")}
            className='text-sm text-purple-600 hover:text-purple-700 font-medium'
          >
            View All
          </button>
        </div>

        {/* Recent Applications List */}
        <div className='space-y-4 pb-4'>
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
export default Home;
