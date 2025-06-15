import React from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { getStatusColor } from "../utils/getStatusColor";
import { formatDate } from "../utils/dateHelpers";
import { Application } from "../models/models";

interface ApplicationCardProps {
  application: Application;
  onStatusChange: (id: number, newStatus: Application["status"]) => void;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onStatusChange,
}) => {
  const getCompanyLogo = (company: string): React.ReactNode => {
    const logoMap: Record<string, React.ReactNode> = {
      Narvar: (
        <div className='w-10 h-10 rounded-full bg-black flex items-center justify-center text-white text-sm font-bold'>
          N
        </div>
      ),
      Stripe: (
        <div className='w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center text-white text-sm font-bold'>
          S
        </div>
      ),
      Slack: (
        <div className='w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center text-white text-sm font-bold'>
          ⚡
        </div>
      ),
      AirBnB: (
        <div className='w-10 h-10 rounded-lg bg-red-500 flex items-center justify-center text-white text-sm font-bold'>
          A
        </div>
      ),
      X: (
        <div className='w-10 h-10 rounded-full bg-black flex items-center justify-center text-white text-sm font-bold'>
          X
        </div>
      ),
      Google: (
        <div className='w-10 h-10 rounded-lg bg-white border flex items-center justify-center text-sm font-bold'>
          G
        </div>
      ),
      Mimi: (
        <div className='w-10 h-10 rounded-lg bg-yellow-500 flex items-center justify-center text-white text-sm font-bold'>
          M
        </div>
      ),
      Figma: (
        <div className='w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center text-white text-sm font-bold'>
          F
        </div>
      ),
      Apple: (
        <div className='w-10 h-10 rounded-full bg-black flex items-center justify-center text-white text-sm font-bold'>
          🍎
        </div>
      ),
    };
    return (
      logoMap[company] || (
        <div className='w-10 h-10 rounded-lg bg-gray-500 flex items-center justify-center text-white text-sm font-bold'>
          {company.charAt(0)}
        </div>
      )
    );
  };

  const getSourceIcon = (source: string): string => {
    const sourceMap: Record<string, string> = {
      indeed: "🔍",
      greenhouse: "🏢",
      workable: "🛠️",
      lever: "⚡",
      linkedin: "💼",
    };
    return sourceMap[source] || "🌐";
  };

  /* Rectangle 10 */

  return (
    <div
      className='bg-white dark:bg-[#1F2937] rounded-lg px-2 py-3.5 hover:shadow-sm transition-all border border-gray-100 dark:border-[#1F2937] font-poppins '
      style={{ boxShadow: "box-shadow: 0px 1px 20px rgba(0, 0, 0, 0.15)" }}
    >
      <div className='flex items-center gap-4'>
        {getCompanyLogo(application.company)}
        <div className='flex-1 min-w-0'>
          <div className='text-sm font-medium text-gray-900 dark:text-[#F3F4F6] mb-1'>
            {application.title} at {application.company}
          </div>
          <div className='flex items-center gap-4 text-xs text-gray-500'>
            <span className='flex items-center gap-1'>
              <span>{getSourceIcon(application.source)}</span>
              {application.source}
            </span>

            <span className='flex items-center gap-1'>
              <Calendar className='w-4 h-4' />
              {formatDate(application.dateApplied)}
            </span>
          </div>
        </div>
        <div className='relative flex-shrink-0'>
          <select
            value={application.status}
            onChange={(e) =>
              onStatusChange(
                application.id,
                e.target.value as Application["status"]
              )
            }
            className={`appearance-none px-3 py-1 pr-8 rounded-full text-sm font-medium border cursor-pointer ${getStatusColor(
              application.status
            )} focus:outline-none`}
          >
            <option value='applied'>Applied</option>
            <option value='interviewing'>Interviewing</option>
            <option value='rejected'>Rejected</option>
            <option value='offer'>Offer</option>
            <option value='withdrawn'>Withdrawn</option>
            <option value='ghosted'>Ghosted</option>
          </select>
          <ChevronDown
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none ${getStatusColor(
              application.status
            )}`}
          />
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;
