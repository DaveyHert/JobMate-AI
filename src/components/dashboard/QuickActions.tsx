import { Application, DashboardStats } from "../../models/models";
import { exportData } from "../../helpers/exportData";
import { Settings, Download, User } from "lucide-react";

interface QuickActions {
  applications: Application[];
  stats: DashboardStats;
}

function QuickActions({ applications, stats }: QuickActions) {
  return (
    <div className='bg-white dark:bg-[#1F2937] rounded-xl border border-gray-200 dark:border-[#374151] p-6'>
      <h3 className='text-lg font-semibold text-gray-900 dark:text-[#F3F4F6] mb-4'>
        Quick Actions
      </h3>
      <div className='space-y-3'>
        <button className='btn-secondary'>
          <User className='w-5 h-5' />
          <span>Update Profile</span>
        </button>
        <button
          onClick={() => exportData(applications, stats)}
          className='btn-secondary'
        >
          <Download className='w-5 h-5' />
          <span>Export Data</span>
        </button>
        <button className='btn-secondary'>
          <Settings className='w-5 h-5' />
          <span>Settings</span>
        </button>
      </div>
    </div>
  );
}
export default QuickActions;
