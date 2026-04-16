import React from "react";

/** A single setting row with label, description, and input */
export default function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className='flex items-center gap-4 px-5 py-5'>
      <div className='min-w-0 flex-1'>
        <div className='text-neutral-06 text-base font-medium'>{label}</div>
        {description && <div className='text-neutral-05 mt-1 text-xs'>{description}</div>}
      </div>
      <div className='shrink-0'>{children}</div>
    </div>
  );
}
