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
      className='bg-button-col border-brand-border flex rounded-[10px] border px-1 py-1.5'
      style={{ boxShadow: "inset 0px 0px 15px rgba(0, 0, 0, 0.06)" }}
    >
      {Object.entries(filterCounts).map(([status, count]) => (
        <button
          key={status}
          onClick={() => setStatusFilter(status)}
          className={`font-inter rounded-lg px-[7px] py-[7px] text-xs font-medium whitespace-nowrap transition-all ${
            statusFilter === status
              ? "bg-white text-gray-900 dark:bg-[#F8FAFF]"
              : "text-secondary-text hover:text-gray-500"
          } cursor-pointer`}
          style={{
            boxShadow: statusFilter === status ? "0px 0px 4px rgba(0, 0, 0, 0.25)" : "",
          }}
        >
          {capitalizeFirstChar(status)} <span>({count})</span>
        </button>
      ))}
    </div>
  );
}

export default ApplicationStatusFilter;
