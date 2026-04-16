import { ReactNode } from "react";

interface StepHeaderProps {
  icon: ReactNode;
  title: string;
  action?: ReactNode;
}

export function StepHeader({ icon, title, action }: StepHeaderProps) {
  return (
    <div className='mb-6 flex items-center justify-between'>
      <div className='flex items-center gap-3'>
        <div className='bg-primary-02 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg'>
          {icon}
        </div>
        <h2 className='text-neutral-06 text-xl font-medium'>{title}</h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
