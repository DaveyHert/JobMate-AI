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
    <div className='overflow-hidden flex flex-col  '>
      <div className='px-2.5 py-2 '>
        <div className='flex justify-between items-center mb-2'>
          <h2 className='text-base font-sans font-semibold pl-2 text-gray-900 dark:text-[#F3F4F6]'>
            My Applications
          </h2>
          <Search className='w-5 h-5 text-gray-400' />
        </div>

        {/* Filter Tabs */}
        <div
          className='flex mb-1 p-1 rounded-[10px] border dark:border-[#1D1E21] dark:bg-[#374151]'
          style={{ boxShadow: "inset 0px 0px 15px rgba(0, 0, 0, 0.06)" }}
        >
          {Object.entries(filterCounts).map(([status, count]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all font-inter ${
                statusFilter === status
                  ? "bg-gray-900 text-gray-900 dark:bg-[#F8FAFF]"
                  : " text-gray-600 dark:text-[#9CA3AF] hover:text-gray-200"
              }`}
            >
              {capitalizeFirstChar(status)} <span>({count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div className='px-2.5 flex-1 overflow-y-auto min-h-0 custom-scrollbar scroll-smooth'>
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
