import { useState, useEffect, useMemo } from "react";
import AIFeatures from "./AIFeatures";
import BottomNavigation from "./BottomNavigation";
import Header from "./Header";
import LoadSpinner from "./LoadSpinner";
import ApplicationsTab from "./application/ApplicationTab";
import HomeTab from "./home/HomeTab";
import { getDynamicFilterCounts } from "../utils/getDynamicFilterCounts";
import { PopupData, Application } from "../models/models";

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
      className={`${isInDevMode ? "w-[580px] h-[700px] relative" : "w-dvw h-dvh"} bg-[#F7F7FD] dark:bg-[#111827]  overflow-hidden flex flex-col pb-[58px]`} // prettier-ignore
    >
      {/* Header */}
      <Header
        currentProfile={data.currentProfile}
        onProfileChange={(profile) =>
          setData({ ...data, currentProfile: profile })
        }
      />

      {/* Content - Scrollable area between header and bottom nav */}

      {/* Home Tab */}
      {activeTab === "home" && (
        <HomeTab
          data={data}
          setActiveTab={setActiveTab}
          handleStatusChange={updateApplicationStatus}
          setActiveAIFeature={setShowAIFeature}
          setData={setData}
        />
      )}

      {/* Application Tab */}
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
