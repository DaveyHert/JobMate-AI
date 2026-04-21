import { useState } from "react";

export default function LinusStyleToggle() {
  const [theme, setTheme] = useState("system");

  return (
    <div className='flex items-center justify-center antialiased'>
      {/* Toggle Cards */}
      <div className='flex gap-4'>
        <ToggleCard
          type='light'
          label='Light'
          active={theme === "light"}
          onClick={() => setTheme("light")}
        />
        <ToggleCard
          type='dark'
          label='Dark'
          active={theme === "dark"}
          onClick={() => setTheme("dark")}
        />
        <ToggleCard
          type='system'
          label='System'
          active={theme === "system"}
          onClick={() => setTheme("system")}
        />
      </div>
    </div>
  );
}

function ToggleCard({
  type,
  label,
  active,
  onClick,
}: {
  type: "light" | "dark" | "system";
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  const isSystem = type === "system";
  const isLight = type === "light";
  const isDark = type === "dark";

  return (
    <div className='flex flex-col gap-2.5'>
      <button
        onClick={onClick}
        className={`relative box-border block h-[86px] w-[112px] overflow-hidden rounded-[20px] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1A1C] focus-visible:ring-offset-2 ${active ? "border-neutral-05 border-[2px]" : "border-neutral-02 border-[2px] hover:border-[#D1D1D6]"} `}
      >
        {/* --- Background layer --- */}
        {isLight && <div className='absolute inset-0 bg-[#F4F5F7]' />}
        {isDark && <div className='absolute inset-0 bg-[#53565A]' />}
        {isSystem && (
          <div className='absolute inset-0 flex'>
            <div className='h-full w-1/2 bg-[#53565A]' />
            <div className='h-full w-1/2 bg-[#F4F5F7]' />
          </div>
        )}

        {/* --- Inner Window layer --- */}
        <div className='absolute top-[18px] right-0 bottom-0 left-[18px] flex overflow-hidden rounded-tl-[16px] shadow-sm'>
          {isLight && (
            <div className='flex h-full w-full items-center bg-white pl-4'>
              <span className='text-[17px] font-bold text-[#1A1A1C]'>Aa</span>
            </div>
          )}

          {isDark && (
            <div className='flex h-full w-full items-center bg-[#1A1A1C] pl-4'>
              <span className='text-[17px] font-bold text-white'>Aa</span>
            </div>
          )}

          {isSystem && (
            <>
              {/* Dark left portion of inner window */}
              <div className='flex h-full w-[36px] items-center justify-center overflow-hidden bg-[#1A1A1C]'>
                <span className='text-[17px] font-bold tracking-tight text-white'>Aa</span>
              </div>
              {/* Light right portion of inner window */}
              <div className='flex h-full w-[36px] items-center rounded-tr-[16px] bg-white pr-4'>
                <span className='text-[17px] font-bold tracking-tight text-[#1A1A1C]'>Aa</span>
              </div>
            </>
          )}
        </div>

        {/* --- Active Checkmark Badge --- */}
        {active && (
          <div className='animate-in zoom-in absolute right-1.5 bottom-1.5 z-10 flex h-6 w-6 items-center justify-center rounded-full border-[2.5px] border-white bg-[#1A1A1C] shadow-sm duration-200'>
            <svg
              width='10'
              height='10'
              viewBox='0 0 24 24'
              fill='none'
              stroke='white'
              strokeWidth='4'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <polyline points='20 6 9 17 4 12'></polyline>
            </svg>
          </div>
        )}
      </button>

      {/* Label */}
      <span className='text-neutral-06 px-0.5 text-center text-sm font-normal'>{label}</span>
    </div>
  );
}
