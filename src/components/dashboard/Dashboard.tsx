import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Briefcase,
  Building,
  ChevronUp,
  ExternalLink,
  PenLine,
  PieChart,
  X,
  Calendar,
  ChevronDown,
  Settings,
  Trash2,
  Save,
  Edit3,
} from "lucide-react";
import { mockApplications } from "../../data/mockApplications";
import {
  Application,
  ApplicationStatus,
  JobType,
  DashboardStats,
} from "../../models/models";
import { AddIcon } from "../../assets/icons";

import QuickActions from "./QuickActions";
import Header from "./Header";
import { formatDate } from "../../utils/dateHelpers";
import { calculateStats } from "../../helpers/calculateStats";
import { StatsGrid } from "./StatsGrid";
import drawChart from "../../utils/drawChart";
import { getStatusColor } from "../../utils/getStatusColor";
import ApplicationStatusFilter from "../application/ApplicationStatusFilter";
import { getDynamicFilterCounts } from "../../utils/getDynamicFilterCounts";

const initialStats: DashboardStats = {
  totalApplied: 0,
  totalInterviews: 0,
  responseRate: 0,
  totalCompanies: 0,
  weeklyChange: {
    applied: 0,
    interviews: 0,
    responseRate: 0,
    companies: 0,
    lastWeek: { applied: 0, interviews: 0, companies: 0 },
    percentageChange: {
      applied: 0,
      interviews: 0,
      companies: 0,
    },
  },
};

const STATUSES = [
  "applied",
  "interviewing",
  "rejected",
  "offer",
  "ghosted",
  "withdrawn",
];

const Dashboard: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedApp, setExpandedApp] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<{ [key: number]: string }>({});
  const [chartView, setChartView] = useState("timeline");
  const [timeRange, setTimeRange] = useState("week");
  const [newApp, setNewApp] = useState<Omit<Application, "id" | "dateApplied">>(
    {
      title: "",
      company: "",
      url: "",
      source: "linkedin",
      status: "applied",
      history: [],
      notes: "",
      jobType: "fulltime",
      jobBrief: "",
    }
  );
  const [editingFields, setEditingFields] = useState<{
    [key: string]: boolean;
  }>({});
  const [editValues, setEditValues] = useState<{ [key: string]: string }>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (applications.length > 0 && chartView === "timeline") {
      drawChart(canvasRef, timeRange, applications);
    }
  }, [applications, chartView, timeRange]);

  const loadData = async () => {
    try {
      if (typeof chrome !== "undefined" && chrome.storage) {
        const result = await chrome.storage.local.get(["jobMateData"]);
        if (result.jobMateData?.applications) {
          const apps = result.jobMateData.applications;
          setApplications(apps);
          setStats(calculateStats(apps));
          return;
        }
      }
      setApplications(mockApplications);
      setStats(calculateStats(mockApplications));
    } catch (error) {
      console.error("Error loading data:", error);
      setApplications(mockApplications);
      setStats(calculateStats(mockApplications));
    }
  };

  const getSourceData = () => {
    const sourceMap: { [key: string]: number } = {};
    applications.forEach((app) => {
      const source = getSourceName(app.source);
      sourceMap[source] = (sourceMap[source] || 0) + 1;
    });

    return Object.entries(sourceMap)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);
  };

  const getSourceName = (source: string): string => {
    const sourceNames: { [key: string]: string } = {
      linkedin: "LinkedIn",
      indeed: "Indeed",
      greenhouse: "Greenhouse",
      lever: "Lever",
      workable: "Workable",
      other: "Direct Apply",
    };
    return sourceNames[source] || "Other";
  };

  const getSourceColor = (index: number): string => {
    const colors = [
      "#6366f1",
      "#8b5cf6",
      "#06b6d4",
      "#10b981",
      "#f59e0b",
      "#ef4444",
    ];
    return colors[index % colors.length];
  };

  const addApplication = async () => {
    const newApplication: Application = {
      id: Date.now(),
      ...newApp,
      dateApplied: new Date().toISOString(),
    };

    const updatedApps = [newApplication, ...applications];
    setApplications(updatedApps);
    setStats(calculateStats(updatedApps));

    try {
      if (typeof chrome !== "undefined" && chrome.storage) {
        const result = await chrome.storage.local.get(["jobMateData"]);
        const existingData = result.jobMateData || {};
        existingData.applications = updatedApps;
        await chrome.storage.local.set({ jobMateData: existingData });
      }
    } catch (error) {
      console.error("Error saving application:", error);
    }

    setShowAddModal(false);
    setNewApp({
      title: "",
      company: "",
      url: "",
      source: "linkedin",
      status: "applied",
      history: [],
      notes: "",
      jobType: "fulltime",
      jobBrief: "",
    });
  };

  const updateApplicationStatus = async (id: number, status: string) => {
    const updatedApps = applications.map((app) =>
      app.id === id ? { ...app, status: status as Application["status"] } : app
    );
    setApplications(updatedApps);
    setStats(calculateStats(updatedApps));

    try {
      if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.local
      ) {
        const result = await chrome.storage.local.get(["jobMateData"]);
        const existingData = result.jobMateData || {};
        existingData.applications = updatedApps;
        await chrome.storage.local.set({ jobMateData: existingData });
      }
    } catch (error) {
      console.error("Error saving to storage:", error);
    }
  };

  const deleteApplication = async (id: number) => {
    if (!confirm("Are you sure you want to delete this application?")) return;

    const updatedApps = applications.filter((app) => app.id !== id);
    setApplications(updatedApps);
    setStats(calculateStats(updatedApps));

    try {
      if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.local
      ) {
        const result = await chrome.storage.local.get(["jobMateData"]);
        const existingData = result.jobMateData || {};
        existingData.applications = updatedApps;
        await chrome.storage.local.set({ jobMateData: existingData });
      }
    } catch (error) {
      console.error("Error saving to storage:", error);
    }

    // Close expanded view if this app was expanded
    if (expandedApp === id) {
      setExpandedApp(null);
    }
  };

  const updateApplicationField = async (
    id: number,
    field: string,
    value: string
  ) => {
    const updatedApps = applications.map((app) =>
      app.id === id ? { ...app, [field]: value } : app
    );
    setApplications(updatedApps);
    setStats(calculateStats(updatedApps));

    try {
      if (
        typeof chrome !== "undefined" &&
        chrome.storage &&
        chrome.storage.local
      ) {
        const result = await chrome.storage.local.get(["jobMateData"]);
        const existingData = result.jobMateData || {};
        existingData.applications = updatedApps;
        await chrome.storage.local.set({ jobMateData: existingData });
      }
    } catch (error) {
      console.error("Error saving to storage:", error);
    }
  };

  const startEditing = (appId: number, field: string, currentValue: string) => {
    setEditingFields({ ...editingFields, [`${appId}-${field}`]: true });
    setEditValues({ ...editValues, [`${appId}-${field}`]: currentValue });
  };

  const saveEdit = async (appId: number, field: string) => {
    const key = `${appId}-${field}`;
    const newValue = editValues[key];

    await updateApplicationField(appId, field, newValue);

    setEditingFields({ ...editingFields, [key]: false });
    delete editValues[key];
  };

  const cancelEdit = (appId: number, field: string) => {
    const key = `${appId}-${field}`;
    setEditingFields({ ...editingFields, [key]: false });
    delete editValues[key];
  };

  const toggleExpanded = (id: number) => {
    if (expandedApp === id) {
      setExpandedApp(null);
    } else {
      setExpandedApp(id);
      setActiveTab({ ...activeTab, [id]: "notes" });
    }
  };

  const setActiveTabForApp = (appId: number, tab: string) => {
    setActiveTab({ ...activeTab, [appId]: tab });
  };

  const filteredApplications = applications.filter(
    (app) => statusFilter === "all" || app.status === statusFilter
  );

  // Calculate filter counts
  const filterCounts = useMemo(
    () => getDynamicFilterCounts(applications, STATUSES),
    [applications]
  );

  const getSourceDisplayName = (source: string): string => {
    const sourceMap: { [key: string]: string } = {
      linkedin: "LinkedIn",
      indeed: "Indeed",
      greenhouse: "Greenhouse",
      lever: "Lever",
      workable: "Workable",
      other: "Other",
    };
    return sourceMap[source] || "Other";
  };

  const getCompanyInitial = (company: string): string => {
    return company.charAt(0);
  };

  const getCompanyColor = (company: string): string => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-red-500",
      "bg-yellow-500",
      "bg-indigo-500",
      "bg-pink-500",
      "bg-gray-500",
    ];
    const hash = company
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getJobTypeColor = (jobType: string): string => {
    const jobTypeColors: { [key: string]: string } = {
      fulltime: "bg-blue-50 text-blue-700 border-blue-200",
      contract: "bg-orange-50 text-orange-700 border-orange-200",
      gig: "bg-purple-50 text-purple-700 border-purple-200",
    };
    return jobTypeColors[jobType] || jobTypeColors.fulltime;
  };

  const statusCounts = {
    all: applications.length,
    applied: applications.filter((app) => app.status === "applied").length,
    interviewing: applications.filter((app) => app.status === "interviewing")
      .length,
    rejected: applications.filter((app) => app.status === "rejected").length,
    ghosted: applications.filter((app) => app.status === "ghosted").length,
  };

  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-7xl mx-auto p-6'>
        {/* Header */}
        <Header />

        {/* Stats Cards */}
        <StatsGrid stats={stats} />

        {/* Main Content */}
        <div className='grid grid-cols-1 lg:grid-cols-9 gap-6'>
          {/* Applications List */}
          <div className='lg:col-span-6'>
            <div className='bg-foreground rounded-xl border border-border-col p-6'>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-primary-text'>
                  Recent Applications
                </h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className='px-3 py-2 bg-accent hover:bg-indigo-700 rounded-4xl text-white font-medium text-sm transition-all flex items-center gap-1'
                >
                  <AddIcon className='w-4 h-4 text-white' />
                  Add Application
                </button>
              </div>

              {/* Filter Tabs */}
              <div className='mb-6'>
                <ApplicationStatusFilter
                  statusFilter={statusFilter}
                  filterCounts={filterCounts}
                  setStatusFilter={setStatusFilter}
                />
              </div>

              {/* Applications */}
              <div
                className='space-y-3 overflow-y-auto custom-scrollbar'
                style={{ maxHeight: "calc(100vh - 400px)" }}
              >
                {filteredApplications.length === 0 ? (
                  <div className='text-center py-12 text-gray-500'>
                    <Briefcase className='w-12 h-12 mx-auto mb-4 text-gray-400' />
                    <p className='text-lg mb-2'>No applications found</p>
                    <p className='text-sm'>
                      Start tracking your job applications to see them here
                    </p>
                  </div>
                ) : (
                  filteredApplications.map((app) => (
                    <div
                      key={app.id}
                      className='bg-foreground border border-border-col rounded-xl overflow-hidden hover:shadow-md transition-all.  '
                    >
                      <div
                        className='p-4 cursor-pointer'
                        onClick={() => toggleExpanded(app.id)}
                      >
                        <div className='flex items-center gap-4'>
                          <div
                            className={`w-12 h-12 rounded-full ${getCompanyColor(
                              app.company
                            )} flex items-center justify-center text-white font-semibold text-lg shrink-0 bg-background`}
                          >
                            {getCompanyInitial(app.company)}
                          </div>
                          <div className='flex-1 min-w-0'>
                            <div className='text-base font-semibold text-primary-text mb-1'>
                              {app.title}
                            </div>
                            <div className='text-sm text-secondary-text mb-2'>
                              {app.company}
                            </div>
                            <div className='flex items-center gap-4 text-xs text-gray-500'>
                              <span className='flex items-center gap-1'>
                                <Building className='w-3 h-3' />
                                {getSourceDisplayName(app.source)}
                              </span>
                              <span className='flex items-center gap-1'>
                                <Calendar className='w-3 h-3' />
                                {formatDate(app.dateApplied)}
                              </span>
                              {app.url && (
                                <a
                                  href={app.url}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='flex items-center gap-1 hover:text-gray-700 transition-colors'
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className='w-3 h-3' />
                                  View
                                </a>
                              )}
                            </div>
                          </div>
                          <div
                            className='relative shrink-0'
                            onClick={(e) => e.stopPropagation()}
                          >
                            <select
                              value={app.status}
                              onChange={(e) =>
                                updateApplicationStatus(app.id, e.target.value)
                              }
                              className={`appearance-none px-3 py-1 pr-5 rounded-2xl text-sm font-medium border cursor-pointer ${getStatusColor(
                                app.status
                              )} focus:outline-hidden focus:border-2`}
                            >
                              <option value='applied'>Applied</option>
                              <option value='interviewing'>Interviewing</option>
                              <option value='rejected'>Rejected</option>
                              <option value='offer'>Offer</option>
                              <option value='ghosted'>Ghosted</option>
                            </select>
                            <ChevronDown className='absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none' />
                          </div>
                          <div className='shrink-0'>
                            {expandedApp === app.id ? (
                              <ChevronUp className='w-5 h-5 text-gray-400' />
                            ) : (
                              <ChevronDown className='w-5 h-5 text-gray-400' />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {expandedApp === app.id && (
                        <div className='border-t border-border-col bg-background'>
                          <div className='flex justify-between items-center border-b border-border-col bg-foreground px-6 py-3'>
                            <div className='flex'>
                              <button
                                onClick={() =>
                                  setActiveTabForApp(app.id, "notes")
                                }
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                  activeTab[app.id] === "notes" ||
                                  !activeTab[app.id]
                                    ? "border-indigo-500 text-indigo-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                              >
                                My Notes
                              </button>
                              <button
                                onClick={() =>
                                  setActiveTabForApp(app.id, "brief")
                                }
                                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                                  activeTab[app.id] === "brief"
                                    ? "border-indigo-500 text-indigo-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                              >
                                Job Brief
                              </button>
                            </div>
                            <div className='flex items-center gap-2 text-sm text-gray-600'>
                              <span>Category:</span>
                              <div className='flex items-center gap-1'>
                                {editingFields[`${app.id}-jobType`] ? (
                                  <div className='flex items-center gap-2'>
                                    <select
                                      value={
                                        editValues[`${app.id}-jobType`] ||
                                        app.jobType ||
                                        "fulltime"
                                      }
                                      onChange={(e) =>
                                        setEditValues({
                                          ...editValues,
                                          [`${app.id}-jobType`]: e.target.value,
                                        })
                                      }
                                      className='px-2 py-1 border border-gray-300 rounded-sm text-xs'
                                    >
                                      <option value='fulltime'>
                                        Full-time
                                      </option>
                                      <option value='contract'>Contract</option>
                                      <option value='gig'>Gig</option>
                                    </select>
                                    <button
                                      onClick={() =>
                                        saveEdit(app.id, "jobType")
                                      }
                                      className='text-green-600 hover:text-green-700'
                                    >
                                      <Save className='w-3 h-3' />
                                    </button>
                                    <button
                                      onClick={() =>
                                        cancelEdit(app.id, "jobType")
                                      }
                                      className='text-gray-400 hover:text-gray-600'
                                    >
                                      <X className='w-3 h-3' />
                                    </button>
                                  </div>
                                ) : (
                                  <div className='flex items-center gap-1'>
                                    <span
                                      className={`px-2 py-1 rounded text-xs font-medium ${getJobTypeColor(
                                        app.jobType || "fulltime"
                                      )}`}
                                    >
                                      {app.jobType === "fulltime"
                                        ? "Full-time"
                                        : app.jobType === "contract"
                                        ? "Contract"
                                        : "Gig"}
                                    </span>
                                    <button
                                      onClick={() =>
                                        startEditing(
                                          app.id,
                                          "jobType",
                                          app.jobType || "fulltime"
                                        )
                                      }
                                      className='text-gray-400 hover:text-gray-600'
                                    >
                                      <PenLine className='w-3 h-3' />
                                    </button>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => deleteApplication(app.id)}
                                className='text-red-400 hover:text-red-600 ml-4'
                                title='Delete Application'
                              >
                                <Trash2 className='w-4 h-4' />
                              </button>
                            </div>
                          </div>
                          <div className='p-6'>
                            {(activeTab[app.id] === "notes" ||
                              !activeTab[app.id]) && (
                              <div>
                                {editingFields[`${app.id}-notes`] ? (
                                  <div className='space-y-3'>
                                    <textarea
                                      value={
                                        editValues[`${app.id}-notes`] || ""
                                      }
                                      onChange={(e) =>
                                        setEditValues({
                                          ...editValues,
                                          [`${app.id}-notes`]: e.target.value,
                                        })
                                      }
                                      rows={4}
                                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                                      placeholder='Add your notes about this application...'
                                    />
                                    <div className='flex gap-2'>
                                      <button
                                        onClick={() =>
                                          saveEdit(app.id, "notes")
                                        }
                                        className='px-3 py-1 bg-indigo-600 text-white rounded-sm text-sm hover:bg-indigo-700'
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() =>
                                          cancelEdit(app.id, "notes")
                                        }
                                        className='px-3 py-1 bg-gray-200 text-gray-700 rounded-sm text-sm hover:bg-gray-300'
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className='group'>
                                    <div className='flex items-start justify-between'>
                                      <p className='text-sm text-gray-700 leading-relaxed flex-1'>
                                        {app.notes || "No notes added yet."}
                                      </p>
                                      <button
                                        onClick={() =>
                                          startEditing(
                                            app.id,
                                            "notes",
                                            app.notes || ""
                                          )
                                        }
                                        className='opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 ml-2'
                                      >
                                        <Edit3 className='w-4 h-4' />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            {activeTab[app.id] === "brief" && (
                              <div>
                                {editingFields[`${app.id}-jobBrief`] ? (
                                  <div className='space-y-3'>
                                    <textarea
                                      value={
                                        editValues[`${app.id}-jobBrief`] || ""
                                      }
                                      onChange={(e) =>
                                        setEditValues({
                                          ...editValues,
                                          [`${app.id}-jobBrief`]:
                                            e.target.value,
                                        })
                                      }
                                      rows={4}
                                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
                                      placeholder='Add job brief or description...'
                                    />
                                    <div className='flex gap-2'>
                                      <button
                                        onClick={() =>
                                          saveEdit(app.id, "jobBrief")
                                        }
                                        className='px-3 py-1 bg-indigo-600 text-white rounded-sm text-sm hover:bg-indigo-700'
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() =>
                                          cancelEdit(app.id, "jobBrief")
                                        }
                                        className='px-3 py-1 bg-gray-200 text-gray-700 rounded-sm text-sm hover:bg-gray-300'
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className='group'>
                                    <div className='flex items-start justify-between'>
                                      <p className='text-sm text-gray-700 leading-relaxed flex-1'>
                                        {app.jobBrief ||
                                          "No job brief available."}
                                      </p>
                                      <button
                                        onClick={() =>
                                          startEditing(
                                            app.id,
                                            "jobBrief",
                                            app.jobBrief || ""
                                          )
                                        }
                                        className='opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 ml-2'
                                      >
                                        <Edit3 className='w-4 h-4' />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className='lg:col-span-3 space-y-6'>
            {/* Chart */}
            <div className='bg-foreground rounded-xl border border-border-col p-6'>
              <div className='flex justify-between items-center mb-6'>
                <div className='flex bg-background rounded-lg p-1'>
                  <button
                    onClick={() => setChartView("timeline")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      chartView === "timeline"
                        ? "bg-foreground text-secondary-text shadow-xs"
                        : "text-secondary-text hover:text-primary-text"
                    } cursor-pointer`}
                  >
                    <Calendar className='w-4 h-4' />
                    Timeline
                  </button>
                  <button
                    onClick={() => setChartView("sources")}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      chartView === "sources"
                        ? "bg-white text-gray-900 shadow-xs"
                        : "text-secondary-text hover:text-primary-text"
                    } cursor-pointer`}
                  >
                    <PieChart className='w-4 h-4' />
                    Sources
                  </button>
                </div>
                <button className='text-gray-400 hover:text-gray-600 '>
                  <Settings className='w-4 h-4' />
                </button>
              </div>

              {chartView === "timeline" ? (
                <>
                  <div className='flex justify-between items-center mb-4'>
                    <h3 className='text-lg font-semibold text-primary-text'>
                      Applications Overview
                    </h3>
                    <div className='flex gap-1'>
                      {[
                        { key: "today", label: "Today" },
                        { key: "week", label: "Week" },
                        { key: "month", label: "Month" },
                      ].map((option) => (
                        <button
                          key={option.key}
                          onClick={() => setTimeRange(option.key)}
                          className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                            timeRange === option.key
                              ? "bg-gray-900 text-white border border-border-col"
                              : "bg-button-col text-primary-text hover:bg-button-hov border border-border-col rounded"
                          } cursor-pointer`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className='bg-foreground rounded-xl p-4'>
                    <canvas
                      ref={canvasRef}
                      width={320}
                      height={200}
                      className='w-full h-auto'
                    />
                  </div>
                  <div className='flex items-center gap-4 mt-4 text-xs'>
                    <div className='flex items-center gap-2'>
                      <div className='w-2 h-2 bg-[#989AFF] rounded-sm'></div>
                      <span className='text-secondary-text'>Applications</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='w-2 h-2 bg-[#6366F1] rounded-sm'></div>
                      <span className='text-secondary-text'>Interviews</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                    Application by Sources
                  </h3>
                  <div className='space-y-4'>
                    {getSourceData().map((item, index) => (
                      <div key={item.source} className='space-y-2'>
                        <div className='flex justify-between items-center'>
                          <span className='text-sm font-medium text-gray-700'>
                            {item.source}
                          </span>
                          <span className='text-sm font-semibold text-gray-900'>
                            {item.count}
                          </span>
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-2'>
                          <div
                            className='h-2 rounded-full transition-all duration-300'
                            style={{
                              width: `${
                                (item.count / applications.length) * 100
                              }%`,
                              backgroundColor: getSourceColor(index),
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className='mt-6 pt-4 border-t border-gray-200 text-center'>
                    <div className='text-sm text-indigo-600 font-medium'>
                      Total Applications
                    </div>
                    <div className='text-2xl font-bold text-gray-900'>
                      {applications.length}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Actions */}
            <QuickActions applications={applications} stats={stats} />
          </div>
        </div>
      </div>

      {/* Add Application Modal */}
      {showAddModal && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl w-full max-w-md'>
            <div className='flex justify-between items-center p-6 border-b border-gray-200'>
              <h3 className='text-xl font-semibold text-gray-900'>
                Add Job Application
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <X className='w-5 h-5 text-gray-500' />
              </button>
            </div>
            <div className='p-6 space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Job Title
                </label>
                <input
                  type='text'
                  value={newApp.title}
                  onChange={(e) =>
                    setNewApp({ ...newApp, title: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                  placeholder='e.g. Senior Software Engineer'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Company
                </label>
                <input
                  type='text'
                  value={newApp.company}
                  onChange={(e) =>
                    setNewApp({ ...newApp, company: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                  placeholder='e.g. Google'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Job URL
                </label>
                <input
                  type='url'
                  value={newApp.url}
                  onChange={(e) =>
                    setNewApp({ ...newApp, url: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                  placeholder='https://...'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Source
                </label>
                <select
                  value={newApp.source}
                  onChange={(e) =>
                    setNewApp({ ...newApp, source: e.target.value })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                >
                  <option value='linkedin'>LinkedIn</option>
                  <option value='indeed'>Indeed</option>
                  <option value='greenhouse'>Greenhouse</option>
                  <option value='lever'>Lever</option>
                  <option value='workable'>Workable</option>
                  <option value='other'>Other</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Job Type
                </label>
                <select
                  value={newApp.jobType}
                  onChange={(e) =>
                    setNewApp({ ...newApp, jobType: e.target.value as JobType })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                >
                  <option value='fulltime'>Full-time</option>
                  <option value='contract'>Contract</option>
                  <option value='gig'>Gig</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Status
                </label>
                <select
                  value={newApp.status}
                  onChange={(e) =>
                    setNewApp({
                      ...newApp,
                      status: e.target.value as ApplicationStatus,
                    })
                  }
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                >
                  <option value='applied'>Applied</option>
                  <option value='interviewing'>Interviewing</option>
                  <option value='rejected'>Rejected</option>
                  <option value='offer'>Offer</option>
                </select>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Job Brief
                </label>
                <textarea
                  value={newApp.jobBrief}
                  onChange={(e) =>
                    setNewApp({ ...newApp, jobBrief: e.target.value })
                  }
                  rows={2}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                  placeholder='Brief description of the role...'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Notes
                </label>
                <textarea
                  value={newApp.notes}
                  onChange={(e) =>
                    setNewApp({ ...newApp, notes: e.target.value })
                  }
                  rows={3}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                  placeholder='Any additional notes...'
                />
              </div>
            </div>
            <div className='flex gap-3 p-6 border-t border-gray-200'>
              <button
                onClick={() => setShowAddModal(false)}
                className='flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={addApplication}
                disabled={!newApp.title || !newApp.company}
                className='flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-lg transition-colors'
              >
                Add Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
