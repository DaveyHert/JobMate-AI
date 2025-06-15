import { Application, ApplicationStatus } from "../models/models";
import ApplicationCard from "./ApplicationCard";
import { capitalizeFirstChar } from "../utils/capitalizeFirstChar";
import { Search } from "lucide-react";

interface ApplicationTab {
  filterCounts: Record<string, number>;
  filteredApplications: Application[];
  updateApplicationStatus: (id: number, newStatus: ApplicationStatus) => void;
  setStatusFilter: (status: string) => void;
  statusFilter: string;
}

function ApplicationsTab({
  filterCounts,
  filteredApplications,
  updateApplicationStatus,
  setStatusFilter,
  statusFilter,
}: ApplicationTab) {
  return (
    <div className='overflow-hidden flex flex-col'>
      {/* Applications Header */}
      <div className='px-6 py-2 '>
        <div className='flex justify-between items-center mb-2'>
          <h2 className='text-base font-sans font-semibold text-gray-900'>
            My Applications
          </h2>
          <Search className='w-5 h-5 text-gray-400' />
        </div>

        {/* Filter Tabs */}
        <div
          className='flex gap-3 mb-1 p-1 rounded-[10px]'
          style={{ boxShadow: "inset 0px 0px 15px rgba(0, 0, 0, 0.06)" }}
        >
          {Object.entries(filterCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                statusFilter === status
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {capitalizeFirstChar(status)} <span>({count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div className='px-6 flex-1 overflow-y-auto min-h-0 custom-scrollbar scroll-smooth'>
        <div className='space-y-4 pb-4'>
          {filteredApplications.map((app) => (
            <ApplicationCard
              key={app.id}
              application={app}
              onStatusChange={updateApplicationStatus}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
export default ApplicationsTab;
