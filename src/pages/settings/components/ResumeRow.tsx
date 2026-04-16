import { EditIcon, FileText, TrashIcon } from "@/assets/svg/icons";
import { UserProfile, ResumeDoc } from "@/models/models";
import IconButton from "./IconButton";

/** Specialized row for the Resume list */
export default function ResumeRow({
  profile,
  resume,
  isActive,
  onMakeActive,
  onEdit,
  onDelete,
}: {
  profile: UserProfile;
  resume: ResumeDoc;
  isActive: boolean;
  onMakeActive: (p: UserProfile) => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className='group border-brand-border hover:bg-app-background flex gap-4 border-b transition-colors last:border-b-0'>
      <div className='bg-blue-03 flex h-auto w-15 shrink-0 items-center justify-center'>
        <FileText className='size-8 text-white' />
      </div>

      <div className='min-w-0 flex-1 px-4 py-4'>
        <div className='flex items-center gap-2'>
          <span className='text-neutral-06 truncate text-sm font-medium'>{resume.label}</span>
          {isActive && (
            <span className='rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium tracking-wide text-emerald-700 uppercase'>
              Active
            </span>
          )}
        </div>
        <div className='text-neutral-05 mt-0.5 truncate text-xs'>
          {resume.fileName} · {Math.round(resume.sizeBytes / 1024)} KB
        </div>
      </div>

      <div className='flex shrink-0 items-center gap-1 pr-2'>
        {!isActive && (
          <button
            onClick={() => onMakeActive(profile)}
            className='text-primary-03 mr-1 cursor-pointer rounded-md border border-transparent bg-[#26213F] px-3 py-1.5 text-xs font-normal opacity-0 transition-colors group-hover:opacity-100 hover:text-white focus:opacity-100'
          >
            Make active
          </button>
        )}
        <IconButton
          icon={<EditIcon className='text-primary-03 hover:text-primary-04 h-4 w-4' />}
          onClick={onEdit}
          label='Edit'
        />
        <IconButton
          icon={<TrashIcon className='text-red-04 hover:text-red-02 h-4 w-4' />}
          onClick={onDelete}
          label='Delete'
          danger
        />
      </div>
    </div>
  );
}
