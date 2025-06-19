import { Application, ApplicationStatus } from "../../models/models";
import ApplicationCard from "./ApplicationCard";
import { Search } from "lucide-react";
import ApplicationStatusFilter from "./ApplicationStatusFilter";

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
      <div className='px-2.5 py-2 border-b border-gray-100 dark:border-[#1D1E21]  mb-[2px]'>
        <div className='flex justify-between items-center mb-2'>
          <h2 className='text-base font-sans font-semibold pl-2 text-gray-900 dark:text-[#F3F4F6]'>
            My Applications
          </h2>
          <Search className='w-5 h-5 text-gray-400' />
        </div>

        {/* Filter Tabs */}
        <ApplicationStatusFilter
          filterCounts={filterCounts}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      </div>

      {/* Applications List */}
      <div className='px-2.5 flex-1 overflow-y-auto min-h-0 custom-scrollbar scroll-smooth'>
        <div className='space-y-2 pb-4'>
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
