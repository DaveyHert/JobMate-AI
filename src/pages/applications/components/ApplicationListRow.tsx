import { ExternalLink, Trash2 } from "lucide-react";
import type { Application, ApplicationStatus } from "../../../models/models";
import { StatusSelect } from "./StatusSelect";
import { getLastUpdatedDate } from "./applicationConstants";
import { formatDetailDate } from "../../../utils/dateHelpers";

export function ApplicationListRow({
  app,
  onStatusChange,
  onDelete,
  onClick,
}: {
  app: Application;
  onStatusChange: (id: number, status: ApplicationStatus) => void;
  onDelete: (id: number) => void;
  onClick: (app: Application) => void;
}) {
  const lastUpdated = getLastUpdatedDate(app);

  return (
    <tr
      className='border-b border-border-col last:border-b-0 hover:bg-button-col/40 transition-colors cursor-pointer'
      onClick={() => onClick(app)}
    >
      <td className='px-5 py-4 text-sm font-semibold text-primary-text whitespace-nowrap'>
        {app.title}
      </td>
      <td className='px-5 py-4 text-sm text-secondary-text whitespace-nowrap'>{app.company}</td>
      <td className='px-5 py-4 text-sm text-secondary-text whitespace-nowrap'>
        {formatDetailDate(lastUpdated)}
      </td>
      <td className='px-5 py-4' onClick={(e) => e.stopPropagation()}>
        <StatusSelect status={app.status} onChange={(s) => onStatusChange(app.id, s)} />
      </td>
      <td className='px-5 py-4' onClick={(e) => e.stopPropagation()}>
        <div className='flex items-center gap-4'>
          {app.url ? (
            <a
              href={app.url}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-1.5 text-sm text-secondary-text hover:text-primary-text transition-colors'
            >
              <ExternalLink className='w-3.5 h-3.5' />
              View
            </a>
          ) : (
            <span className='flex items-center gap-1.5 text-sm text-secondary-text opacity-40 cursor-not-allowed select-none'>
              <ExternalLink className='w-3.5 h-3.5' />
              View
            </span>
          )}
          <button
            onClick={() => onDelete(app.id)}
            className='text-rose-400 hover:text-rose-600 transition-colors'
            aria-label='Delete application'
          >
            <Trash2 className='w-4 h-4' />
          </button>
        </div>
      </td>
    </tr>
  );
}
