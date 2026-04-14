import React, { useState, useEffect, useRef, useMemo } from "react";
import { toast } from "sonner";
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
import { Application, DashboardStats } from "../../models/models";
import { AddIcon } from "../../assets/svg/icons";

import QuickActions from "./QuickActions";
import { formatDate } from "../../utils/dateHelpers";
import { calculateStats } from "../../helpers/calculateStats";
import { StatsGrid } from "./StatsGrid";
import drawChart from "../../utils/drawChart";
import { getStatusColor } from "../../utils/getStatusColor";
import ApplicationStatusFilter from "../application/ApplicationStatusFilter";
import { getDynamicFilterCounts } from "../../utils/getDynamicFilterCounts";
import { useJobMateData } from "../../hooks/useJobMateData";
import { jobMateStore } from "../../store/jobMateStore";
import { AddApplicationModal } from "../application/AddApplicationModal";

const STATUSES = ["applied", "interviewing", "rejected", "offer", "ghosted", "withdrawn"];

const Dashboard: React.FC = () => {
  const data = useJobMateData();
  const applications: Application[] = data?.applications ?? mockApplications;
  const stats: DashboardStats = useMemo(() => calculateStats(applications), [applications]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedApp, setExpandedApp] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<{ [key: number]: string }>({});
  const [chartView, setChartView] = useState("timeline");
  const [timeRange, setTimeRange] = useState("week");
  const [editingFields, setEditingFields] = useState<{
    [key: string]: boolean;
  }>({});
  const [editValues, setEditValues] = useState<{ [key: string]: string }>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (applications.length > 0 && chartView === "timeline") {
      drawChart(canvasRef, timeRange, applications);
    }
  }, [applications, chartView, timeRange]);

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
    const colors = ["#6366f1", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];
    return colors[index % colors.length];
  };

  const updateApplicationStatus = async (id: number, status: string) => {
    await jobMateStore.updateApplicationStatus(id, status as Application["status"]);
  };

  const deleteApplication = (id: number) => {
    toast("Delete this application?", {
      description: "This cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          await jobMateStore.deleteApplication(id);
          if (expandedApp === id) setExpandedApp(null);
        },
      },
      cancel: { label: "Cancel", onClick: () => {} },
    });
  };

  const updateApplicationField = async (id: number, field: string, value: string) => {
    const target = applications.find((a) => a.id === id);
    if (!target) return;
    const updated = { ...target, [field]: value } as Application;
    // Write-through the whole applications array via the store's commit path.
    // The store doesn't expose a per-field update helper, so we re-use the
    // public data path to persist the edit.
    const next = applications.map((app) => (app.id === id ? updated : app));
    await jobMateStore.replaceApplications(next);
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
    (app) => statusFilter === "all" || app.status === statusFilter,
  );

  // Calculate filter counts
  const filterCounts = useMemo(
    () => getDynamicFilterCounts(applications, STATUSES),
    [applications],
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
    const hash = company.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
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

  return (
    <div className='bg-app-background'>
      <div className='px-8 pb-8'>
        {/* Stats Cards */}
        <StatsGrid stats={stats} />

        {/* Main Content */}
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-9'>
          {/* Applications List */}
          <div className='lg:col-span-6'>
            <div className='bg-app-foreground border-brand-border rounded-xl border p-6'>
              <div className='mb-6 flex items-center justify-between'>
                <h2 className='text-primary-text text-xl font-semibold'>Recent Applications</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className='bg-brand-accent flex items-center gap-1 rounded-4xl px-3 py-2 text-sm font-medium text-white transition-all hover:bg-indigo-700'
                >
                  <AddIcon className='h-4 w-4 text-white' />
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
                className='custom-scrollbar space-y-3 overflow-y-auto'
                style={{ maxHeight: "calc(100vh - 400px)" }}
              >
                {filteredApplications.length === 0 ? (
                  <div className='py-12 text-center text-gray-500'>
                    <Briefcase className='mx-auto mb-4 h-12 w-12 text-gray-400' />
                    <p className='mb-2 text-lg'>No applications found</p>
                    <p className='text-sm'>Start tracking your job applications to see them here</p>
                  </div>
                ) : (
                  filteredApplications.map((app) => (
                    <div
                      key={app.id}
                      className='bg-app-foreground border-brand-border transition-all. overflow-hidden rounded-xl border hover:shadow-md'
                    >
                      <div className='cursor-pointer p-4' onClick={() => toggleExpanded(app.id)}>
                        <div className='flex items-center gap-4'>
                          <div
                            className={`h-12 w-12 rounded-full ${getCompanyColor(
                              app.company,
                            )} bg-app-background flex shrink-0 items-center justify-center text-lg font-semibold text-white`}
                          >
                            {getCompanyInitial(app.company)}
                          </div>
                          <div className='min-w-0 flex-1'>
                            <div className='text-primary-text mb-1 text-base font-semibold'>
                              {app.title}
                            </div>
                            <div className='text-secondary-text mb-2 text-sm'>{app.company}</div>
                            <div className='flex items-center gap-4 text-xs text-gray-500'>
                              <span className='flex items-center gap-1'>
                                <Building className='h-3 w-3' />
                                {getSourceDisplayName(app.source)}
                              </span>
                              <span className='flex items-center gap-1'>
                                <Calendar className='h-3 w-3' />
                                {formatDate(app.dateApplied)}
                              </span>
                              {app.url && (
                                <a
                                  href={app.url}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='flex items-center gap-1 transition-colors hover:text-gray-700'
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className='h-3 w-3' />
                                  View
                                </a>
                              )}
                            </div>
                          </div>
                          <div className='relative shrink-0' onClick={(e) => e.stopPropagation()}>
                            <select
                              value={app.status}
                              onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                              className={`cursor-pointer appearance-none rounded-2xl border px-3 py-1 pr-5 text-sm font-medium ${getStatusColor(
                                app.status,
                              )} focus:border-2 focus:outline-hidden`}
                            >
                              <option value='applied'>Applied</option>
                              <option value='interviewing'>Interviewing</option>
                              <option value='rejected'>Rejected</option>
                              <option value='offer'>Offer</option>
                              <option value='ghosted'>Ghosted</option>
                            </select>
                            <ChevronDown className='pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 transform text-gray-500' />
                          </div>
                          <div className='shrink-0'>
                            {expandedApp === app.id ? (
                              <ChevronUp className='h-5 w-5 text-gray-400' />
                            ) : (
                              <ChevronDown className='h-5 w-5 text-gray-400' />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {expandedApp === app.id && (
                        <div className='border-brand-border bg-app-background border-t'>
                          <div className='border-brand-border bg-app-foreground flex items-center justify-between border-b px-6 py-3'>
                            <div className='flex'>
                              <button
                                onClick={() => setActiveTabForApp(app.id, "notes")}
                                className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
                                  activeTab[app.id] === "notes" || !activeTab[app.id]
                                    ? "border-indigo-500 text-indigo-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                              >
                                My Notes
                              </button>
                              <button
                                onClick={() => setActiveTabForApp(app.id, "brief")}
                                className={`border-b-2 px-4 py-2 text-sm font-medium transition-colors ${
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
                                        editValues[`${app.id}-jobType`] || app.jobType || "fulltime"
                                      }
                                      onChange={(e) =>
                                        setEditValues({
                                          ...editValues,
                                          [`${app.id}-jobType`]: e.target.value,
                                        })
                                      }
                                      className='rounded-sm border border-gray-300 px-2 py-1 text-xs'
                                    >
                                      <option value='fulltime'>Full-time</option>
                                      <option value='contract'>Contract</option>
                                      <option value='gig'>Gig</option>
                                    </select>
                                    <button
                                      onClick={() => saveEdit(app.id, "jobType")}
                                      className='text-green-600 hover:text-green-700'
                                    >
                                      <Save className='h-3 w-3' />
                                    </button>
                                    <button
                                      onClick={() => cancelEdit(app.id, "jobType")}
                                      className='text-gray-400 hover:text-gray-600'
                                    >
                                      <X className='h-3 w-3' />
                                    </button>
                                  </div>
                                ) : (
                                  <div className='flex items-center gap-1'>
                                    <span
                                      className={`rounded px-2 py-1 text-xs font-medium ${getJobTypeColor(
                                        app.jobType || "fulltime",
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
                                        startEditing(app.id, "jobType", app.jobType || "fulltime")
                                      }
                                      className='text-gray-400 hover:text-gray-600'
                                    >
                                      <PenLine className='h-3 w-3' />
                                    </button>
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => deleteApplication(app.id)}
                                className='ml-4 text-red-400 hover:text-red-600'
                                title='Delete Application'
                              >
                                <Trash2 className='h-4 w-4' />
                              </button>
                            </div>
                          </div>
                          <div className='p-6'>
                            {(activeTab[app.id] === "notes" || !activeTab[app.id]) && (
                              <div>
                                {editingFields[`${app.id}-notes`] ? (
                                  <div className='space-y-3'>
                                    <textarea
                                      value={editValues[`${app.id}-notes`] || ""}
                                      onChange={(e) =>
                                        setEditValues({
                                          ...editValues,
                                          [`${app.id}-notes`]: e.target.value,
                                        })
                                      }
                                      rows={4}
                                      className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
                                      placeholder='Add your notes about this application...'
                                    />
                                    <div className='flex gap-2'>
                                      <button
                                        onClick={() => saveEdit(app.id, "notes")}
                                        className='rounded-sm bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700'
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => cancelEdit(app.id, "notes")}
                                        className='rounded-sm bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300'
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className='group'>
                                    <div className='flex items-start justify-between'>
                                      <p className='flex-1 text-sm leading-relaxed text-gray-700'>
                                        {app.notes || "No notes added yet."}
                                      </p>
                                      <button
                                        onClick={() =>
                                          startEditing(app.id, "notes", app.notes || "")
                                        }
                                        className='ml-2 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-600'
                                      >
                                        <Edit3 className='h-4 w-4' />
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
                                      value={editValues[`${app.id}-jobBrief`] || ""}
                                      onChange={(e) =>
                                        setEditValues({
                                          ...editValues,
                                          [`${app.id}-jobBrief`]: e.target.value,
                                        })
                                      }
                                      rows={4}
                                      className='w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500'
                                      placeholder='Add job brief or description...'
                                    />
                                    <div className='flex gap-2'>
                                      <button
                                        onClick={() => saveEdit(app.id, "jobBrief")}
                                        className='rounded-sm bg-indigo-600 px-3 py-1 text-sm text-white hover:bg-indigo-700'
                                      >
                                        Save
                                      </button>
                                      <button
                                        onClick={() => cancelEdit(app.id, "jobBrief")}
                                        className='rounded-sm bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300'
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className='group'>
                                    <div className='flex items-start justify-between'>
                                      <p className='flex-1 text-sm leading-relaxed text-gray-700'>
                                        {app.jobBrief || "No job brief available."}
                                      </p>
                                      <button
                                        onClick={() =>
                                          startEditing(app.id, "jobBrief", app.jobBrief || "")
                                        }
                                        className='ml-2 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-600'
                                      >
                                        <Edit3 className='h-4 w-4' />
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
          <div className='space-y-6 lg:col-span-3'>
            {/* Chart */}
            <div className='bg-app-foreground border-brand-border rounded-xl border p-6'>
              <div className='mb-6 flex items-center justify-between'>
                <div className='bg-app-background flex rounded-lg p-1'>
                  <button
                    onClick={() => setChartView("timeline")}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                      chartView === "timeline"
                        ? "bg-app-foreground text-secondary-text shadow-xs"
                        : "text-secondary-text hover:text-primary-text"
                    } cursor-pointer`}
                  >
                    <Calendar className='h-4 w-4' />
                    Timeline
                  </button>
                  <button
                    onClick={() => setChartView("sources")}
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-all ${
                      chartView === "sources"
                        ? "bg-white text-gray-900 shadow-xs"
                        : "text-secondary-text hover:text-primary-text"
                    } cursor-pointer`}
                  >
                    <PieChart className='h-4 w-4' />
                    Sources
                  </button>
                </div>
                <button className='text-gray-400 hover:text-gray-600'>
                  <Settings className='h-4 w-4' />
                </button>
              </div>

              {chartView === "timeline" ? (
                <>
                  <div className='mb-4 flex items-center justify-between'>
                    <h3 className='text-primary-text text-lg font-semibold'>
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
                          className={`rounded px-3 py-1 text-sm font-medium transition-all ${
                            timeRange === option.key
                              ? "border-brand-border border bg-gray-900 text-white"
                              : "bg-brand-btn text-primary-text hover:bg-brand-btn-hover border-brand-border rounded border"
                          } cursor-pointer`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className='bg-app-foreground rounded-xl p-4'>
                    <canvas ref={canvasRef} width={320} height={200} className='h-auto w-full' />
                  </div>
                  <div className='mt-4 flex items-center gap-4 text-xs'>
                    <div className='flex items-center gap-2'>
                      <div className='h-2 w-2 rounded-sm bg-[#989AFF]'></div>
                      <span className='text-secondary-text'>Applications</span>
                    </div>
                    <div className='flex items-center gap-2'>
                      <div className='h-2 w-2 rounded-sm bg-[#6366F1]'></div>
                      <span className='text-secondary-text'>Interviews</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3 className='mb-4 text-lg font-semibold text-gray-900'>
                    Application by Sources
                  </h3>
                  <div className='space-y-4'>
                    {getSourceData().map((item, index) => (
                      <div key={item.source} className='space-y-2'>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm font-medium text-gray-700'>{item.source}</span>
                          <span className='text-sm font-semibold text-gray-900'>{item.count}</span>
                        </div>
                        <div className='h-2 w-full rounded-full bg-gray-200'>
                          <div
                            className='h-2 rounded-full transition-all duration-300'
                            style={{
                              width: `${(item.count / applications.length) * 100}%`,
                              backgroundColor: getSourceColor(index),
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className='mt-6 border-t border-gray-200 pt-4 text-center'>
                    <div className='text-sm font-medium text-indigo-600'>Total Applications</div>
                    <div className='text-2xl font-bold text-gray-900'>{applications.length}</div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Actions */}
            <QuickActions applications={applications} stats={stats} />
          </div>
        </div>
      </div>

      <AddApplicationModal open={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
};

export default Dashboard;
