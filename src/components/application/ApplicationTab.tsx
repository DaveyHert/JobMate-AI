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
    <div className='flex flex-col overflow-hidden'>
      <div className='border-brand-border mb-[2px] border-b px-2.5 py-2'>
        <div className='mb-2 flex items-center justify-between'>
          <h2 className='pl-2 font-sans text-base font-semibold text-gray-900 dark:text-[#F3F4F6]'>
            My Applications
          </h2>
          <Search className='h-5 w-5 text-gray-400' />
        </div>

        {/* Filter Tabs */}
        <ApplicationStatusFilter
          filterCounts={filterCounts}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />
      </div>

      {/* Applications List */}
      <div className='custom-scrollbar min-h-0 flex-1 overflow-y-auto scroll-smooth px-2.5'>
        <div className='space-y-2 py-1 pb-4'>
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
