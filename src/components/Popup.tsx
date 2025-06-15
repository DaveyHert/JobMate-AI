import { useState, useEffect, useMemo } from "react";
import AIFeatures from "./AIFeatures";
import BottomNavigation from "./BottomNavigation";
import QuickActions from "./QuickActions";
import Header from "./Header";
import LoadSpinner from "./LoadSpinner";
import ApplicationCard from "./ApplicationCard";
import { Application } from "../models/models";
import { getDynamicFilterCounts } from "../utils/getDynamicFilterCounts";
import ApplicationsTab from "./ApplicationTab";
import Home from "./home/Home";

interface WeeklyGoal {
  current: number;
  target: number;
}

interface PopupData {
  applications: Application[];
  weeklyGoal: WeeklyGoal;
  currentProfile: string;
}

const STATUSES = [
  "applied",
  "interviewing",
  "rejected",
  "offer",
  "ghosted",
  "withdrawn",
];

function Popup() {
  const [data, setData] = useState<PopupData>({
    applications: [],
    weeklyGoal: { current: 5, target: 10 },
    currentProfile: "product-manager",
  });
  const [activeTab, setActiveTab] = useState("home");
  const [statusFilter, setStatusFilter] = useState("applied");
  const [showAIFeature, setShowAIFeature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isInDevMode = process.env.NODE_ENV === "development";

  useEffect(() => {
    loadData();
  }, []);

  // Calculate filter counts
  const filterCounts = useMemo(
    () => getDynamicFilterCounts(data.applications, STATUSES),
    [data.applications]
  );

  const filteredApplications = data.applications.filter(
    (app) => statusFilter === "all" || app.status === statusFilter
  );

  const goalPercentage = Math.round(
    (data.weeklyGoal.current / data.weeklyGoal.target) * 100
  );

  const getMockApplications = (): Application[] => {
    return [
      {
        id: 1,
        title: "Director of Engineering",
        company: "Narvar",
        source: "indeed",
        status: "applied",
        dateApplied: new Date().toISOString(),
        url: "https://careers.narvar.com",
      },
      {
        id: 2,
        title: "Director of Engineering",
        company: "Narvar",
        source: "greenhouse",
        status: "applied",
        dateApplied: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000
        ).toISOString(),
        url: "https://careers.narvar.com",
      },
      {
        id: 3,
        title: "Frontend Engineer",
        company: "Stripe",
        source: "workable",
        status: "offer",
        dateApplied: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000
        ).toISOString(),
        url: "https://stripe.com/jobs",
      },
      {
        id: 4,
        title: "Director of Engineering",
        company: "Narvar",
        source: "lever",
        status: "applied",
        dateApplied: new Date(
          Date.now() - 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
        url: "https://careers.narvar.com",
      },
      {
        id: 5,
        title: "Senior Product Engineering Manager",
        company: "Slack",
        source: "greenhouse",
        status: "applied",
        dateApplied: new Date(
          Date.now() - 4 * 24 * 60 * 60 * 1000
        ).toISOString(),
        url: "https://slack.com/careers",
      },
      {
        id: 6,
        title: "Principal Frontend Engineer",
        company: "AirBnB",
        source: "lever",
        status: "interviewing",
        dateApplied: new Date(
          Date.now() - 5 * 24 * 60 * 60 * 1000
        ).toISOString(),
        url: "https://careers.airbnb.com",
      },
      {
        id: 7,
        title: "Director of Engineering",
        company: "X",
        source: "lever",
        status: "applied",
        dateApplied: new Date(
          Date.now() - 6 * 24 * 60 * 60 * 1000
        ).toISOString(),
        url: "https://careers.x.com",
      },
      {
        id: 8,
        title: "Frontend Engineer",
        company: "Google",
        source: "lever",
        status: "rejected",
        dateApplied: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        url: "https://careers.google.com",
      },
      {
        id: 9,
        title: "Director of Engineering",
        company: "Mimi",
        source: "lever",
        status: "rejected",
        dateApplied: new Date(
          Date.now() - 8 * 24 * 60 * 60 * 1000
        ).toISOString(),
        url: "https://careers.mimi.com",
      },
      {
        id: 10,
        title: "Design Engineer",
        company: "Figma",
        source: "lever",
        status: "applied",
        dateApplied: new Date(
          Date.now() - 9 * 24 * 60 * 60 * 1000
        ).toISOString(),
        url: "https://careers.figma.com",
      },
      {
        id: 11,
        title: "Director of Engineering",
        company: "Apple",
        source: "indeed",
        status: "applied",
        dateApplied: new Date(
          Date.now() - 10 * 24 * 60 * 60 * 1000
        ).toISOString(),
        url: "https://careers.apple.com",
      },
    ];
  };

  const loadData = async () => {
    try {
      if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.local
      ) {
        const result = await chrome.storage.local.get(["jobMateData"]);
        if (result.jobMateData) {
          setData({
            applications:
              result.jobMateData.applications || getMockApplications(),
            weeklyGoal: result.jobMateData.weeklyGoal || {
              current: 5,
              target: 10,
            },
            currentProfile:
              result.jobMateData.currentProfile || "product-manager",
          });
          return;
        }
      }

      const mockApps = getMockApplications();
      setData({
        applications: mockApps,
        weeklyGoal: { current: 5, target: 10 },
        currentProfile: "product-manager",
      });
    } catch (error) {
      console.error("Error loading data:", error);
      const mockApps = getMockApplications();
      setData({
        applications: mockApps,
        weeklyGoal: { current: 5, target: 10 },
        currentProfile: "product-manager",
      });
    }
  };

  const handleAutoFill = async () => {
    setIsLoading(true);
    try {
      if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.query) {
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
    setShowAIFeature("cover-letter");
  };

  const handleAnalyzeJobFit = () => {
    setShowAIFeature("job-fit");
  };

  const handleTrackApplication = async () => {
    setIsLoading(true);
    try {
      if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.query) {
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        const response = await chrome.tabs.sendMessage(tab.id!, {
          action: "extractJobInfo",
        });

        if (response) {
          const newApp: Application = {
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
          if (
            typeof chrome !== "undefined" &&
            chrome.storage &&
            chrome.storage.local
          ) {
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

  const handleTailorResume = () => {
    setShowAIFeature("resume-tailor");
  };

  const handleGenerateAnswer = () => {
    setShowAIFeature("answer-generator");
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

  const openDashboard = () => {
    if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
    } else {
      window.location.href = "/dashboard.html";
    }
  };

  const updateApplicationStatus = async (
    id: number,
    newStatus: Application["status"]
  ) => {
    const updatedApps = data.applications.map((app) =>
      app.id === id ? { ...app, status: newStatus } : app
    );
    const updatedData = { ...data, applications: updatedApps };
    setData(updatedData);

    // Save to storage if available
    if (
      typeof chrome !== "undefined" &&
      chrome.storage &&
      chrome.storage.local
    ) {
      try {
        const result = await chrome.storage.local.get(["jobMateData"]);
        const existingData = result.jobMateData || {};
        await chrome.storage.local.set({
          jobMateData: {
            ...existingData,
            applications: updatedApps,
          },
        });
      } catch (error) {
        console.error("Error saving to storage:", error);
      }
    }
  };

  return (
    <div
      className={`${isInDevMode ? "w-[580px] h-[700px] relative" : "w-dvw h-dvh"} bg-[#F7F7FD] dark:bg-[#111827]  overflow-hidden flex flex-col pb-[65px]`} // prettier-ignore
    >
      {/* Header */}
      <Header
        currentProfile={data.currentProfile}
        onProfileChange={(profile) =>
          setData({ ...data, currentProfile: profile })
        }
      />

      {/* Content - Scrollable area between header and bottom nav */}

      {activeTab === "home" && (
        <div className='flex-1 custom-scrollbar overflow-y-auto min-h-0'>
          <div className='px-2.5 pt-2 '>
            {/* Quick Actions */}
            <QuickActions
              onAutoFill={handleAutoFill}
              onGenerateCoverLetter={handleGenerateCoverLetter}
              onAnalyzeJobFit={handleAnalyzeJobFit}
              onTrackApplication={handleTrackApplication}
              onGenerateAnswer={handleGenerateAnswer}
              onTailorResume={handleTailorResume}
              isLoading={isLoading}
            />

            {/* Weekly Goal */}
            <div className='Weekly-goal'>
              <div className='bg-white dark:bg-[#1F2937] rounded-lg py-3 px-5 mb-3.5 shadow-sm border border-gray-100 dark:border-[#374151]'>
                <div className='flex justify-between items-center mb-1'>
                  <span className='inline-block mb-1 text-sm text-gray-600 dark:text-[#9CA3AF] font-inter '>
                    Weekly Goal: {data.weeklyGoal.current}/
                    {data.weeklyGoal.target} jobs
                  </span>
                  <span className='text-sm font-semibold text-[#2563EB]'>
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
              <div className='flex justify-between items-center mb-2'>
                <h3 className='text-base font-medium text-gray-900 dark:text-[#F3F4F6] font-poppins'>
                  Recent applications
                </h3>
                <button
                  onClick={() => setActiveTab("applications")}
                  className='text-xs text-[#2563EB] hover:text-purple-700 font-medium'
                >
                  View All
                </button>
              </div>

              {/* Applications List */}

              <div className='space-y-4 pb-4'>
                {data.applications.slice(0, 5).map((app) => (
                  <ApplicationCard
                    application={app}
                    onStatusChange={updateApplicationStatus}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* <Home /> */}
      {activeTab === "applications" && (
        <ApplicationsTab
          filterCounts={filterCounts}
          filteredApplications={filteredApplications}
          updateApplicationStatus={updateApplicationStatus}
          setStatusFilter={setStatusFilter}
          statusFilter={statusFilter}
        />
      )}
      {/* Bottom Navigation - ALWAYS RENDERED */}
      <BottomNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openDashboard={openDashboard}
      />

      {/* AI Features Modal */}
      {showAIFeature && (
        <AIFeatures
          feature={showAIFeature as any}
          activeProfile={null} // You can pass the actual profile data here
          onClose={() => setShowAIFeature(null)}
        />
      )}

      {/* Loading Overlay */}
      {isLoading && <LoadSpinner />}
    </div>
  );
}

export default Popup;
