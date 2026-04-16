import { Application, DashboardStats } from "../../models/models";
import { exportData } from "../../helpers/exportData";
import { Settings, Download, User } from "lucide-react";

interface QuickActions {
  applications: Application[];
  stats: DashboardStats;
}

function QuickActions({ applications, stats }: QuickActions) {
  return (
    <div className='bg-app-foreground border-brand-border rounded-xl border p-6'>
      <h3 className='mb-4 text-lg font-semibold text-gray-900 dark:text-[#F3F4F6]'>
        Quick Actions
      </h3>
      <div className='flex space-x-4'>
        <button onClick={() => exportData(applications, stats)} className='btn-secondary'>
          <Download className='h-5 w-5' />
          <span>Export Data</span>
        </button>
        <button className='btn-secondary'>
          <User className='h-5 w-5' />
          <span>Update Profile</span>
        </button>
      </div>
    </div>
  );
}
export default QuickActions;
