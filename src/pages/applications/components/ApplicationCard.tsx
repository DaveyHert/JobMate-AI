import { useState, useEffect, useRef } from "react";
import { MoreVertical, ExternalLink, Trash2 } from "lucide-react";
import type { Application, ApplicationStatus } from "../../../models/models";
import { StatusSelect } from "./StatusSelect";
import { getLastUpdatedDate, formatShortRelative, getAvatar } from "./applicationConstants";

export function ApplicationCard({
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const lastUpdated = getLastUpdatedDate(app);
  const { initial, bg } = getAvatar(app.company);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  return (
    // No border — elevated shadow creates depth as per design
    <div
      className='bg-foreground dark:border-border-col flex cursor-pointer flex-col overflow-hidden rounded-xl shadow-[0px_2px_8px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-[2px_0px_10px_rgba(0,0,0,0.08)] dark:border'
      onClick={() => onClick(app)}
    >
      {/* Card body */}
      <div className='flex flex-1 flex-col gap-4 p-4'>
        {/* Status pill + 3-dot menu — stop clicks bubbling to card onClick */}
        <div className='flex items-center justify-between' onClick={(e) => e.stopPropagation()}>
          <StatusSelect status={app.status} onChange={(s) => onStatusChange(app.id, s)} />
          <div className='relative' ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className='text-secondary-text hover:text-primary-text hover:bg-button-col rounded-md p-1 transition-colors'
              aria-label='More options'
            >
              <MoreVertical className='h-4 w-4' />
            </button>
            {menuOpen && (
              <div className='bg-foreground border-border-col absolute top-8 right-0 z-20 min-w-[140px] rounded-lg border py-1 text-sm shadow-lg'>
                {app.url ? (
                  <a
                    href={app.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hover:bg-button-col text-primary-text flex w-full items-center gap-2 px-3 py-2'
                    onClick={() => setMenuOpen(false)}
                  >
                    <ExternalLink className='h-3.5 w-3.5' />
                    View posting
                  </a>
                ) : (
                  <span className='text-secondary-text flex cursor-not-allowed items-center gap-2 px-3 py-2 opacity-50'>
                    <ExternalLink className='h-3.5 w-3.5' />
                    View posting
                  </span>
                )}
                <button
                  onClick={() => {
                    onDelete(app.id);
                    setMenuOpen(false);
                  }}
                  className='hover:bg-button-col flex w-full items-center gap-2 px-3 py-2 text-left text-rose-500'
                >
                  <Trash2 className='h-3.5 w-3.5' />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Company avatar + title */}
        <div className='flex items-center gap-3'>
          <div
            className={`h-10 w-10 rounded-full ${bg} flex shrink-0 items-center justify-center text-sm font-bold text-white`}
          >
            {initial}
          </div>
          <div className='min-w-0'>
            <div className='text-primary-text truncate text-sm font-semibold'>{app.title}</div>
            <div className='text-secondary-text mt-0.5 flex items-center gap-1.5 text-xs'>
              <span className='truncate'>{app.company}</span>
              <span className='bg-secondary-text inline-block h-1 w-1 shrink-0 rounded-full' />
              <span>{app.source || "Remote"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card footer — light gray bg as per design */}
      <div className='bg-background border-border-col/60 text-secondary-text border-t px-4 py-3 text-xs'>
        Last Updated: <span className='text-primary-text'>{formatShortRelative(lastUpdated)}</span>
      </div>
    </div>
  );
}
