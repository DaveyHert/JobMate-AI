import React, { useState } from "react";

// Extracted the repetitive wrapper, state, and click logic into a reusable component
const ThemeCard = ({
  value,
  label,
  currentTheme,
  onSelect,
  children,
}: {
  value: string;
  label: string;
  currentTheme: string;
  onSelect: (value: string) => void;
  children: React.ReactNode;
}) => {
  const isActive = currentTheme === value;

  return (
    <button
      type='button'
      role='radio'
      aria-checked={isActive}
      className='group flex cursor-pointer flex-col items-center gap-3 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1c1c1e]'
      onClick={() => onSelect(value)}
    >
      <div
        className={`rounded-2xl p-[3px] transition-colors ${
          isActive ? "bg-app-background" : "bg-transparent group-hover:bg-white/10"
        }`}
      >
        {children}
      </div>
      <span
        className={`text-neutral-04 rounded-full px-4 py-1 text-sm font-medium transition-colors ${
          isActive ? "bg-app-background text-neutral-06" : "group-hover:text-neutral-06"
        }`}
      >
        {label}
      </span>
    </button>
  );
};

export const IosStyleToggle = () => {
  const [theme, setTheme] = useState("dark");

  return (
    <div className='flex items-center gap-6'>
      <div
        className='flex items-end justify-between gap-4 px-2'
        role='radiogroup'
        aria-label='Theme selection'
      >
        {/* Light */}
        <ThemeCard value='light' label='Light' currentTheme={theme} onSelect={setTheme}>
          <div className='flex h-28 w-20 flex-col items-center rounded-xl bg-[#3a3a3c] p-2 pt-4'>
            <div className='flex w-full flex-1 flex-col gap-2 rounded-lg bg-[#f2f2f7] p-2'>
              <div className='mx-auto mb-1 h-4 w-4 rounded-full bg-gray-300'></div>
              <div className='h-1.5 w-full rounded-full bg-gray-300'></div>
              <div className='h-1.5 w-full rounded-full bg-gray-300'></div>
              <div className='h-1.5 w-3/4 rounded-full bg-gray-300'></div>
            </div>
          </div>
        </ThemeCard>

        {/* Dark */}
        <ThemeCard value='dark' label='Dark' currentTheme={theme} onSelect={setTheme}>
          <div className='flex h-28 w-20 flex-col items-center rounded-xl border border-white/5 bg-[#2c2c2e] p-2 pt-4'>
            <div className='flex w-full flex-1 flex-col gap-2 rounded-lg border border-white/10 bg-black p-2'>
              <div className='mx-auto mb-1 h-4 w-4 rounded-full bg-[#3a3a3c]'></div>
              <div className='h-1.5 w-full rounded-full bg-[#3a3a3c]'></div>
              <div className='h-1.5 w-full rounded-full bg-[#3a3a3c]'></div>
              <div className='h-1.5 w-3/4 rounded-full bg-[#3a3a3c]'></div>
            </div>
          </div>
        </ThemeCard>

        {/* System */}
        <ThemeCard value='system' label='System' currentTheme={theme} onSelect={setTheme}>
          <div className='relative flex h-28 w-20 overflow-hidden rounded-xl border border-white/5 bg-[#3a3a3c]'>
            {/* Left side (Dark) */}
            <div className='h-full w-1/2 border-r border-black/20 bg-[#2c2c2e] p-2 pt-4 pr-[2px]'>
              <div className='flex h-full w-full flex-col gap-2 rounded-l-md border border-r-0 border-white/10 bg-black p-1'>
                <div className='mx-auto mb-1 h-3 w-3 rounded-full bg-[#3a3a3c]'></div>
                <div className='h-1 w-full rounded-full bg-[#3a3a3c]'></div>
                <div className='h-1 w-full rounded-full bg-[#3a3a3c]'></div>
              </div>
            </div>
            {/* Right side (Light) */}
            <div className='flex h-full w-1/2 flex-col items-end bg-[#3a3a3c] p-2 pt-4 pl-[2px]'>
              <div className='flex h-full w-full flex-col gap-2 rounded-r-md border border-l-0 border-black/10 bg-[#f2f2f7] p-1'>
                <div className='mx-auto mb-1 h-3 w-3 rounded-full bg-gray-300'></div>
                <div className='h-1 w-full rounded-full bg-gray-300'></div>
                <div className='h-1 w-full rounded-full bg-gray-300'></div>
              </div>
            </div>
          </div>
        </ThemeCard>
      </div>
    </div>
  );
};
