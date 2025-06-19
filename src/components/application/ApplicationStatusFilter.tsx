import { capitalizeFirstChar } from "../../utils/capitalizeFirstChar";

interface ApplicationStatusFilter {
  filterCounts: Record<string, number>;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}
function ApplicationStatusFilter({
  filterCounts,
  setStatusFilter,
  statusFilter,
}: ApplicationStatusFilter) {
  return (
    <div
      className='flex px-1 py-1.5 rounded-[10px] bg-[#F0ECF7] border dark:border-[#1D1E21] dark:bg-[#374151]'
      style={{ boxShadow: "inset 0px 0px 15px rgba(0, 0, 0, 0.06)" }}
    >
      {Object.entries(filterCounts).map(([status, count]) => (
        <button
          key={status}
          onClick={() => setStatusFilter(status)}
          className={`py-[7px] px-[7px] rounded-lg text-xs font-medium whitespace-nowrap transition-all font-inter ${
            statusFilter === status
              ? "bg-white text-gray-900 dark:bg-[#F8FAFF]"
              : " text-gray-600 dark:text-[#9CA3AF] hover:text-gray-500"
          }`}
          style={{
            boxShadow:
              statusFilter === status ? "0px 0px 4px rgba(0, 0, 0, 0.25)" : "",
          }}
        >
          {capitalizeFirstChar(status)} <span>({count})</span>
        </button>
      ))}
    </div>
  );
}

export default ApplicationStatusFilter;
