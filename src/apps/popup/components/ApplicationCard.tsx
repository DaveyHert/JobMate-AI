import React from "react";
import { Calendar, ChevronDown } from "lucide-react";
import { getStatusColor } from "@/utils/getStatusColor";
import { formatDate } from "@/utils/dateHelpers";
import { Application } from "@/models/models";

interface ApplicationCardProps {
  application: Application;
  onStatusChange: (id: number, newStatus: Application["status"]) => void;
}

const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onStatusChange }) => {
  const getCompanyLogo = (company: string): React.ReactNode => {
    const logoMap: Record<string, React.ReactNode> = {
      Narvar: (
        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-bold text-white'>
          N
        </div>
      ),
      Stripe: (
        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600 text-sm font-bold text-white'>
          S
        </div>
      ),
      Slack: (
        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-green-500 text-sm font-bold text-white'>
          ⚡
        </div>
      ),
      AirBnB: (
        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-red-500 text-sm font-bold text-white'>
          A
        </div>
      ),
      X: (
        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-bold text-white'>
          X
        </div>
      ),
      Google: (
        <div className='flex h-10 w-10 items-center justify-center rounded-lg border bg-white text-sm font-bold'>
          G
        </div>
      ),
      Mimi: (
        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500 text-sm font-bold text-white'>
          M
        </div>
      ),
      Figma: (
        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500 text-sm font-bold text-white'>
          F
        </div>
      ),
      Apple: (
        <div className='flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-bold text-white'>
          🍎
        </div>
      ),
    };
    return (
      logoMap[company] || (
        <div className='flex h-10 w-10 items-center justify-center rounded-lg bg-gray-500 text-sm font-bold text-white'>
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
      className='bg-app-foreground border-brand-border font-poppins rounded-lg border px-2 py-3.5 transition-all hover:shadow-xs'
      style={{ boxShadow: "box-shadow: 0px 1px 20px rgba(0, 0, 0, 0.15)" }}
    >
      <div className='flex items-center gap-4'>
        {getCompanyLogo(application.company)}
        <div className='min-w-0 flex-1'>
          <div className='text-primary-text mb-1 text-sm font-medium'>
            {application.title} at {application.company}
          </div>
          <div className='text-secondary-text flex items-center gap-4 text-xs'>
            <span className='flex items-center gap-1'>
              <span>{getSourceIcon(application.source)}</span>
              {application.source}
            </span>

            <span className='flex items-center gap-1'>
              <Calendar className='h-4 w-4' />
              {formatDate(application.dateApplied)}
            </span>
          </div>
        </div>

        {/* status selector */}
        <div className='relative shrink-0'>
          <select
            value={application.status}
            onChange={(e) =>
              onStatusChange(application.id, e.target.value as Application["status"])
            }
            className={`cursor-pointer appearance-none rounded-full border px-3 py-1 pr-8 text-xs font-medium ${getStatusColor(
              application.status,
            )} focus:outline-hidden`}
          >
            <option value='applied'>Applied</option>
            <option value='interviewing'>Interviewing</option>
            <option value='rejected'>Rejected</option>
            <option value='offer'>Offer</option>
            <option value='withdrawn'>Withdrawn</option>
            <option value='ghosted'>Ghosted</option>
          </select>
          <ChevronDown
            className={`pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 transform ${getStatusColor(
              application.status,
            )}`}
          />
        </div>
      </div>
    </div>
  );
};

export default ApplicationCard;
