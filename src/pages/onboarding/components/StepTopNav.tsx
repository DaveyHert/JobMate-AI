import { ChevronLeft, ChevronDown } from "lucide-react";

interface StepTopNavProps {
  onBack: () => void;
  profileLabel?: string;
}

export function StepTopNav({ onBack, profileLabel }: StepTopNavProps) {
  return (
    <div className='mb-8 flex items-center justify-between'>
      <button
        onClick={onBack}
        className='text-neutral-06 flex cursor-pointer items-center gap-1 p-1 transition-colors hover:text-gray-800'
        aria-label='Back'
      >
        <ChevronLeft className='h-5 w-5' />
        <span className='text-sm'>Back</span>
      </button>
      {profileLabel && (
        <div className='flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700'>
          {profileLabel}
          <ChevronDown className='h-4 w-4 text-gray-400' />
        </div>
      )}
    </div>
  );
}
