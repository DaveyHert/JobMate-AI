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
      className='bg-foreground rounded-xl shadow-[0px_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[2px_0px_10px_rgba(0,0,0,0.08)] transition-shadow overflow-hidden flex flex-col cursor-pointer'
      onClick={() => onClick(app)}
    >
      {/* Card body */}
      <div className='p-4 flex flex-col gap-4 flex-1'>
        {/* Status pill + 3-dot menu — stop clicks bubbling to card onClick */}
        <div className='flex items-center justify-between' onClick={(e) => e.stopPropagation()}>
          <StatusSelect status={app.status} onChange={(s) => onStatusChange(app.id, s)} />
          <div className='relative' ref={menuRef}>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className='p-1 rounded-md text-secondary-text hover:text-primary-text hover:bg-button-col transition-colors'
              aria-label='More options'
            >
              <MoreVertical className='w-4 h-4' />
            </button>
            {menuOpen && (
              <div className='absolute right-0 top-8 z-20 bg-foreground border border-border-col rounded-lg shadow-lg min-w-[140px] py-1 text-sm'>
                {app.url ? (
                  <a
                    href={app.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex items-center gap-2 px-3 py-2 hover:bg-button-col text-primary-text w-full'
                    onClick={() => setMenuOpen(false)}
                  >
                    <ExternalLink className='w-3.5 h-3.5' />
                    View posting
                  </a>
                ) : (
                  <span className='flex items-center gap-2 px-3 py-2 text-secondary-text opacity-50 cursor-not-allowed'>
                    <ExternalLink className='w-3.5 h-3.5' />
                    View posting
                  </span>
                )}
                <button
                  onClick={() => {
                    onDelete(app.id);
                    setMenuOpen(false);
                  }}
                  className='flex items-center gap-2 px-3 py-2 hover:bg-button-col text-rose-500 w-full text-left'
                >
                  <Trash2 className='w-3.5 h-3.5' />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Company avatar + title */}
        <div className='flex items-center gap-3'>
          <div
            className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center text-white text-sm font-bold shrink-0`}
          >
            {initial}
          </div>
          <div className='min-w-0'>
            <div className='text-sm font-semibold text-primary-text truncate'>{app.title}</div>
            <div className='text-xs text-secondary-text mt-0.5 flex items-center gap-1.5'>
              <span className='truncate'>{app.company}</span>
              <span className='w-1 h-1 rounded-full bg-secondary-text inline-block shrink-0' />
              <span>{app.source || "Remote"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card footer — light gray bg as per design */}
      <div className='px-4 py-3 bg-background border-t border-border-col/60 text-xs text-secondary-text'>
        Last Updated: <span className=' text-primary-text'>{formatShortRelative(lastUpdated)}</span>
      </div>
    </div>
  );
}
