import { useState, useEffect, useMemo } from "react";
import AIFeatures from "./AIFeatures";
import BottomNavigation from "./BottomNavigation";
import Header from "./Header";
import LoadSpinner from "./LoadSpinner";
import ApplicationsTab from "./application/ApplicationTab";
import HomeTab from "./home/HomeTab";
import { getDynamicFilterCounts } from "../utils/getDynamicFilterCounts";
import { PopupData, Application } from "../models/models";
import { useNavigate } from "react-router-dom";
import { getMockData } from "../utils/getMockData";

const STATUSES = [
  "applied",
  "interviewing",
  "rejected",
  "offer",
  "ghosted",
  "withdrawn",
];

function PopupUi() {
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
  const navigate = useNavigate();

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

  const { mockApplications } = getMockData();

  const loadData = async () => {
    try {
      setIsLoading(true);
      if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.local
      ) {
        const result = await chrome.storage.local.get(["jobMateData"]);
        if (result.jobMateData) {
          setData({
            applications: result.jobMateData.applications || mockApplications,
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

      setData({
        applications: mockApplications,
        weeklyGoal: { current: 5, target: 10 },
        currentProfile: "product-manager",
      });
    } catch (error) {
      console.error("Error loading data:", error);
      const mockApps = mockApplications;
      setData({
        applications: mockApps,
        weeklyGoal: { current: 5, target: 10 },
        currentProfile: "product-manager",
      });
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
    }
  };

  const openDashboard = () => {
    if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
    } else {
      // window.location.href = "/dashboard.html";
      navigate("/dashboard");
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

export default PopupUi;
