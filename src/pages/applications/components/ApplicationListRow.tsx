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
      className='border-brand-border hover:bg-brand-btn/40 cursor-pointer border-b transition-colors last:border-b-0'
      onClick={() => onClick(app)}
    >
      <td className='text-primary-text px-5 py-4 text-sm font-semibold whitespace-nowrap'>
        {app.title}
      </td>
      <td className='text-secondary-text px-5 py-4 text-sm whitespace-nowrap'>{app.company}</td>
      <td className='text-secondary-text px-5 py-4 text-sm whitespace-nowrap'>
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
              className='text-secondary-text hover:text-primary-text flex items-center gap-1.5 text-sm transition-colors'
            >
              <ExternalLink className='h-3.5 w-3.5' />
              View
            </a>
          ) : (
            <span className='text-secondary-text flex cursor-not-allowed items-center gap-1.5 text-sm opacity-40 select-none'>
              <ExternalLink className='h-3.5 w-3.5' />
              View
            </span>
          )}
          <button
            onClick={() => onDelete(app.id)}
            className='text-rose-400 transition-colors hover:text-rose-600'
            aria-label='Delete application'
          >
            <Trash2 className='h-4 w-4' />
          </button>
        </div>
      </td>
    </tr>
  );
}
