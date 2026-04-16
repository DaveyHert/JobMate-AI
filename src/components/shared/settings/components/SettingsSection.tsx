import React from "react";

// --- Sub-Components ---
/** Standard layout for a section with title and description */
export default function SettingsSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className='mb-6 flex items-start justify-between'>
        <div>
          <h2 className='text-neutral-06 mb-2 text-xl font-medium'>{title}</h2>
          <p className='text-neutral-05 text-sm font-normal'>{description}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
