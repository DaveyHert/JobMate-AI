// ============================================================================
// Popup — extension popup shell
// ============================================================================
// Subscribes to jobMateStore via useJobMateData so the popup always reflects
// what the dashboard saved (active profile, applications, weekly goal, etc).
// All writes go through jobMateStore so the dashboard sees them on next render.
// ============================================================================

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AIFeatures from "./AIFeatures";
import BottomNavigation from "./BottomNavigation";
import Header from "./Header";
import LoadSpinner from "./LoadSpinner";
import ApplicationsTab from "./application/ApplicationTab";
import HomeTab from "./home/HomeTab";
import PopupSettingsTab from "./settings/PopupSettingsTab";
import { getDynamicFilterCounts } from "../utils/getDynamicFilterCounts";
import type { Application, ApplicationStatus } from "../models/models";
import { useJobMateData } from "../hooks/useJobMateData";
import { jobMateStore } from "../store/jobMateStore";

const STATUSES = ["applied", "interviewing", "rejected", "offer", "ghosted", "withdrawn"];

function Popup() {
  const data = useJobMateData();
  const [activeTab, setActiveTab] = useState("home");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAIFeature, setShowAIFeature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isInDevMode = process.env.NODE_ENV === "development";
  const navigate = useNavigate();

  const applications = data?.applications ?? [];
  const profiles = useMemo(() => (data ? Object.values(data.profiles) : []), [data]);
  const activeProfile = data ? data.profiles[data.activeProfileId] : null;

  const filterCounts = useMemo(
    () => getDynamicFilterCounts(applications, STATUSES),
    [applications],
  );

  const filteredApplications = applications.filter(
    (app) => statusFilter === "all" || app.status === statusFilter,
  );

  const handleProfileChange = (profileId: string) => {
    void jobMateStore.setActiveProfile(profileId);
  };

  const handleStatusChange = async (id: number, newStatus: ApplicationStatus) => {
    await jobMateStore.updateApplicationStatus(id, newStatus);
  };

  const handleAddApplication = async (
    app: Omit<Application, "id" | "status" | "dateApplied" | "history">,
  ) => {
    await jobMateStore.addApplication(app);
  };

  const openDashboard = () => {
    if (typeof chrome !== "undefined" && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
    } else {
      navigate("/dashboard.html");
    }
  };

  if (!data) {
    return (
      <div
        className={`${isInDevMode ? "h-[700px] w-[580px]" : "h-dvh w-dvw"} bg-app-background flex items-center justify-center`}
      >
        <p className='text-secondary-text text-sm'>Loading…</p>
      </div>
    );
  }

  return (
    <div
      className={`${isInDevMode ? "w-[580px] h-[700px] relative" : "w-dvw h-dvh"} bg-[#F7F7FD] dark:bg-[#111827]  overflow-hidden flex flex-col pb-[58px]`} // prettier-ignore
    >
      {/* Header */}
      <Header
        profiles={profiles}
        activeProfileId={data.activeProfileId}
        onProfileChange={handleProfileChange}
      />

      {/* Home Tab */}
      {activeTab === "home" && (
        <HomeTab
          applications={applications}
          weeklyGoal={data.weeklyGoal}
          setActiveTab={setActiveTab}
          handleStatusChange={handleStatusChange}
          setActiveAIFeature={setShowAIFeature}
          onAddApplication={handleAddApplication}
          setIsBusy={setIsLoading}
        />
      )}

      {/* Application Tab */}
      {activeTab === "applications" && (
        <ApplicationsTab
          filterCounts={filterCounts}
          filteredApplications={filteredApplications}
          updateApplicationStatus={handleStatusChange}
          setStatusFilter={setStatusFilter}
          statusFilter={statusFilter}
        />
      )}

      {/* Settings Tab */}
      {activeTab === "settings" && <PopupSettingsTab />}

      {/* Bottom Navigation */}
      <BottomNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openDashboard={openDashboard}
      />

      {/* AI Features Modal */}
      {showAIFeature && (
        <AIFeatures
          feature={showAIFeature as any}
          activeProfile={activeProfile}
          onClose={() => setShowAIFeature(null)}
        />
      )}

      {/* Loading Overlay */}
      {isLoading && <LoadSpinner />}
    </div>
  );
}

export default Popup;
