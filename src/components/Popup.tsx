import React, { useState, useEffect } from "react";
import {
  Home,
  BarChart,
  BarChart3,
  User,
  Settings,
  ChevronDown,
  Search,
  Eye,
  Target,
  PenTool,
  Calendar,
  Brain,
  FileText,
  Wand2,
} from "lucide-react";
import AIFeatures from "./AIFeatures";
import BottomNavigation from "./BottomNavigation";
import QuickActions from "./QuickActions";
import Header from "./Header";

interface Application {
  id: number;
  title: string;
  company: string;
  source: string;
  status: "applied" | "interviewing" | "rejected" | "offer" | "ghosted";
  dateApplied: string;
  url?: string;
}

interface WeeklyGoal {
  current: number;
  target: number;
}

interface PopupData {
  applications: Application[];
  weeklyGoal: WeeklyGoal;
  currentProfile: string;
}

const Popup: React.FC = () => {
  const [data, setData] = useState<PopupData>({
    applications: [],
    weeklyGoal: { current: 5, target: 10 },
    currentProfile: "product-manager",
  });
  const [activeTab, setActiveTab] = useState("home");
  const [statusFilter, setStatusFilter] = useState("applied");
  const [showAIFeature, setShowAIFeature] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";

    return `${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate()
    ).padStart(2, "0")}-${date.getFullYear()}`;
  };

  const getCompanyLogo = (company: string): React.ReactNode => {
    const logoMap: Record<string, React.ReactNode> = {
      Narvar: (
        <div className='w-10 h-10 rounded-full bg-black flex items-center justify-center text-white text-sm font-bold'>
          N
        </div>
      ),
      Stripe: (
        <div className='w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center text-white text-sm font-bold'>
          S
        </div>
      ),
      Slack: (
        <div className='w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white text-sm font-bold'>
          ⚡
        </div>
      ),
      AirBnB: (
        <div className='w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center text-white text-sm font-bold'>
          A
        </div>
      ),
      X: (
        <div className='w-10 h-10 rounded-full bg-black flex items-center justify-center text-white text-sm font-bold'>
          X
        </div>
      ),
      Google: (
        <div className='w-10 h-10 rounded-lg bg-white border flex items-center justify-center text-sm font-bold'>
          G
        </div>
      ),
      Mimi: (
        <div className='w-10 h-10 rounded-lg bg-yellow-500 flex items-center justify-center text-white text-sm font-bold'>
          M
        </div>
      ),
      Figma: (
        <div className='w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-white text-sm font-bold'>
          F
        </div>
      ),
      Apple: (
        <div className='w-10 h-10 rounded-full bg-black flex items-center justify-center text-white text-sm font-bold'>
          🍎
        </div>
      ),
    };
    return (
      logoMap[company] || (
        <div className='w-10 h-10 rounded-lg bg-gray-500 flex items-center justify-center text-white text-sm font-bold'>
          {company.charAt(0)}
        </div>
      )
    );
  };

  const getSourceIcon = (source: string): string => {
    const sourceMap: Record<string, string> = {
      indeed: "🔍",
      greenhouse: "🏢",
      workable: "🛠️",
      lever: "⚡",
      linkedin: "💼",
    };
    return sourceMap[source] || "🌐";
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      applied: "bg-teal-50 text-teal-700 border-teal-200",
      interviewing: "bg-orange-50 text-orange-700 border-orange-200",
      rejected: "bg-red-50 text-red-700 border-red-200",
      offer: "bg-blue-50 text-blue-700 border-blue-200",
      ghosted: "bg-gray-50 text-gray-700 border-gray-200",
    };
    return colors[status] || colors.applied;
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

  const filteredApplications = data.applications.filter(
    (app) => statusFilter === "all" || app.status === statusFilter
  );

  const goalPercentage = Math.round(
    (data.weeklyGoal.current / data.weeklyGoal.target) * 100
  );

  // Calculate filter counts
  const getFilterCounts = () => {
    return {
      all: data.applications.length,
      applied: data.applications.filter((app) => app.status === "applied")
        .length,
      interviewing: data.applications.filter(
        (app) => app.status === "interviewing"
      ).length,
      rejected: data.applications.filter((app) => app.status === "rejected")
        .length,
      offer: data.applications.filter((app) => app.status === "offer").length,
      ghosted: data.applications.filter((app) => app.status === "ghosted")
        .length,
    };
  };

  const filterCounts = getFilterCounts();

  if (activeTab === "applications") {
    return (
      <div className='w-[560px] h-[890px] bg-gray-50 overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='flex justify-between items-center px-6 py-4 bg-white border-b border-gray-100 flex-shrink-0'>
          <div className='flex items-center gap-2'>
            <div className='w-3 h-3 bg-black rounded-sm'></div>
            <span className='font-semibold text-xl text-gray-900'>
              JobMate AI
            </span>
          </div>
          <div className='flex items-center gap-4'>
            <div className='relative'>
              <select
                value={data.currentProfile}
                onChange={(e) =>
                  setData({ ...data, currentProfile: e.target.value })
                }
                className='appearance-none bg-white border border-gray-200 rounded-lg px-4 py-2 pr-10 text-sm text-blue-600 font-medium cursor-pointer hover:bg-gray-50'
              >
                <option value='product-manager'>Product Manager</option>
                <option value='software-engineer'>Software Engineer</option>
                <option value='designer'>Designer</option>
              </select>
              <ChevronDown className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-600 pointer-events-none' />
            </div>
            <img
              src='https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=40&h=40&fit=crop&crop=face'
              alt='Profile'
              className='w-10 h-10 rounded-full'
            />
          </div>
        </div>

        {/* Applications Header */}
        <div className='px-6 py-6 bg-gray-50 flex-shrink-0'>
          <div className='flex justify-between items-center mb-6'>
            <h2 className='text-2xl font-semibold text-gray-900'>
              My Applications
            </h2>
            <Search className='w-6 h-6 text-gray-400' />
          </div>

          {/* Filter Tabs */}
          <div className='flex gap-3 mb-6 overflow-x-auto'>
            {[
              { key: "all", label: `All (${filterCounts.all})` },
              { key: "applied", label: `Applied (${filterCounts.applied})` },
              {
                key: "interviewing",
                label: `Interviewing (${filterCounts.interviewing})`,
              },
              { key: "rejected", label: `Rejected (${filterCounts.rejected})` },
              { key: "offer", label: `Offer (${filterCounts.offer})` },
              { key: "ghosted", label: `Ghosted (${filterCounts.ghosted})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  statusFilter === tab.key
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        <div className='px-6 flex-1 overflow-y-auto bg-gray-50 min-h-0'>
          <div className='space-y-4 pb-4'>
            {filteredApplications.map((app) => (
              <div
                key={app.id}
                className='bg-white rounded-2xl p-4 hover:shadow-sm transition-all border border-gray-100'
              >
                <div className='flex items-center gap-4'>
                  {getCompanyLogo(app.company)}
                  <div className='flex-1 min-w-0'>
                    <div className='text-base font-medium text-gray-900 mb-1'>
                      {app.title} at {app.company}
                    </div>
                    <div className='flex items-center gap-4 text-sm text-gray-500'>
                      <span className='flex items-center gap-1'>
                        <span>{getSourceIcon(app.source)}</span>
                        {app.source}
                      </span>
                      <span className='flex items-center gap-1'>
                        <Calendar className='w-4 h-4' />
                        {formatDate(app.dateApplied)}
                      </span>
                    </div>
                  </div>
                  <div className='relative flex-shrink-0'>
                    <select
                      value={app.status}
                      onChange={(e) =>
                        updateApplicationStatus(
                          app.id,
                          e.target.value as Application["status"]
                        )
                      }
                      className={`appearance-none px-4 py-2 pr-8 rounded-xl text-sm font-medium border cursor-pointer ${getStatusColor(
                        app.status
                      )} focus:outline-none`}
                    >
                      <option value='applied'>Applied</option>
                      <option value='interviewing'>Interviewing</option>
                      <option value='rejected'>Rejected</option>
                      <option value='offer'>Offer</option>
                      <option value='ghosted'>Ghosted</option>
                    </select>
                    <ChevronDown className='absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none' />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Navigation - ALWAYS RENDERED */}
        <BottomNavigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          openDashboard={openDashboard}
        />
      </div>
    );
  }

  return (
    <div className='w-[580px] h-[600px] bg-gray-50 overflow-hidden flex flex-col'>
      {/* Header */}
      <Header
        currentProfile={data.currentProfile}
        onProfileChange={(profile) =>
          setData({ ...data, currentProfile: profile })
        }
      />

      {/* Content - Scrollable area between header and bottom nav */}
      <div className='flex-1 bg-[#F7F7FD] dark:bg-[#111827] custom-scrollbar overflow-y-auto min-h-0'>
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

          <div className='mb-2'>
            {/* Weekly Goal */}
            <div className='bg-white rounded-2xl p-5 mb-6 shadow-sm border border-gray-100'>
              <div className='flex justify-between items-center mb-3'>
                <span className='text-sm text-gray-600'>
                  Weekly Goal: {data.weeklyGoal.current}/
                  {data.weeklyGoal.target} jobs
                </span>
                <span className='text-sm font-semibold text-blue-600'>
                  {goalPercentage}%
                </span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-3'>
                <div
                  className='bg-blue-600 h-3 rounded-full transition-all duration-300'
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
                onClick={() => setActiveTab("applications")}
                className='text-sm text-purple-600 hover:text-purple-700 font-medium'
              >
                View All
              </button>
            </div>

            {/* Status Tabs */}
            <div className='flex gap-3 mb-5 overflow-x-auto'>
              {[
                { key: "applied", label: `Applied (${filterCounts.applied})` },
                {
                  key: "interviewing",
                  label: `Interviewing (${filterCounts.interviewing})`,
                },
                {
                  key: "rejected",
                  label: `Rejected (${filterCounts.rejected})`,
                },
                { key: "offer", label: `Offer (${filterCounts.offer})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    statusFilter === tab.key
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Applications List */}
            <div className='space-y-4 pb-4'>
              {filteredApplications.slice(0, 4).map((app) => (
                <div
                  key={app.id}
                  className='bg-white rounded-2xl p-4 hover:shadow-sm transition-all border border-gray-100'
                >
                  <div className='flex items-center gap-4'>
                    {getCompanyLogo(app.company)}
                    <div className='flex-1 min-w-0'>
                      <div className='text-base font-medium text-gray-900 mb-1'>
                        Job Application for {app.title} at {app.company}
                      </div>
                      <div className='flex items-center gap-4 text-sm text-gray-500'>
                        <span className='flex items-center gap-1'>
                          <span>{getSourceIcon(app.source)}</span>
                          {app.source}
                        </span>
                        <span className='flex items-center gap-1'>
                          <Calendar className='w-4 h-4' />
                          {formatDate(app.dateApplied)}
                        </span>
                      </div>
                    </div>
                    <div className='relative flex-shrink-0'>
                      <select
                        value={app.status}
                        onChange={(e) =>
                          updateApplicationStatus(
                            app.id,
                            e.target.value as Application["status"]
                          )
                        }
                        className={`appearance-none px-4 py-2 pr-8 rounded-xl text-sm font-medium border cursor-pointer ${getStatusColor(
                          app.status
                        )} focus:outline-none`}
                      >
                        <option value='applied'>Applied</option>
                        <option value='interviewing'>Interviewing</option>
                        <option value='rejected'>Rejected</option>
                        <option value='offer'>Offer</option>
                        <option value='ghosted'>Ghosted</option>
                      </select>
                      <ChevronDown className='absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none' />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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
      {isLoading && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 flex items-center gap-3'>
            <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
            <span className='text-gray-700'>Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Popup;
