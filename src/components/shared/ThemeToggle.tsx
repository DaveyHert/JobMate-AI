import React, { useState } from "react";

// --- Design 1: GNOME / Linux Style ---
export const GnomeToggle = () => {
  const [theme, setTheme] = useState("light");

  return (
    <div className='flex items-center gap-6'>
      {/* Light Option */}
      <div className='flex flex-col items-center gap-3'>
        <button
          onClick={() => setTheme("light")}
          className={`relative flex h-28 w-36 items-center justify-center overflow-hidden rounded-xl bg-[#242424] transition-all ${
            theme === "light"
              ? "ring-2 ring-[#57e3d3]"
              : "ring-1 ring-transparent hover:ring-white/10"
          }`}
        >
          {/* Window Representation */}
          <div className='relative z-10 flex h-16 w-20 flex-col overflow-hidden rounded-md bg-white shadow-lg'>
            <div className='border-neutral-06 h-3 w-full border-b bg-gray-100' />
          </div>
          {/* Background Window Shadow */}
          <div className='absolute top-4 right-4 z-0 h-16 w-20 rounded-md bg-white/20' />
        </button>
        <span className='text-neutral-06 text-sm'>Light</span>
      </div>

      {/* Dark Option */}
      <div className='flex flex-col items-center gap-3'>
        <button
          onClick={() => setTheme("dark")}
          className={`relative flex h-28 w-36 items-center justify-center overflow-hidden rounded-xl bg-[#242424] transition-all ${
            theme === "dark"
              ? "ring-2 ring-[#57e3d3]"
              : "ring-1 ring-transparent hover:ring-white/10"
          }`}
        >
          {/* Window Representation */}
          <div className='relative z-10 flex h-16 w-20 flex-col overflow-hidden rounded-md border border-white/5 bg-[#3a3a3a] shadow-lg'>
            <div className='h-3 w-full border-b border-white/5 bg-[#4a4a4a]' />
          </div>
          {/* Background Window Shadow */}
          <div className='absolute top-4 right-4 z-0 h-16 w-20 rounded-md bg-[#3a3a3a]/40' />
        </button>
        <span className='text-neutral-06 text-sm'>Dark</span>
      </div>

      {/* System Option */}
      <div className='flex flex-col items-center gap-3'>
        <button
          onClick={() => setTheme("system")}
          className={`relative flex h-28 w-36 items-center justify-center overflow-hidden rounded-xl bg-[#242424] transition-all ${
            theme === "system"
              ? "ring-2 ring-[#57e3d3]"
              : "ring-1 ring-transparent hover:ring-white/10"
          }`}
        >
          {/* Split Window Representation */}
          <div className='relative z-10 flex h-16 w-20 overflow-hidden rounded-md border border-white/5 shadow-lg'>
            {/* Left Light */}
            <div className='flex h-full w-1/2 flex-col bg-white'>
              <div className='border-neutral-06 h-3 w-full border-b bg-gray-100' />
            </div>
            {/* Right Dark */}
            <div className='flex h-full w-1/2 flex-col border-l border-black/20 bg-[#3a3a3c]'>
              <div className='h-3 w-full border-b border-white/5 bg-[#4a4a4a]' />
            </div>
          </div>
          {/* Background Window Shadow */}
          <div className='absolute top-4 right-4 z-0 h-16 w-20 rounded-md bg-white/10' />
        </button>
        <span className='text-neutral-06 text-sm'>System</span>
      </div>
    </div>
  );
};

// --- Design 2: iOS / macOS Style ---
export const IosToggle = () => {
  const [theme, setTheme] = useState("dark");

  return (
    <div className='flex items-center gap-6'>
      <div className='flex items-end justify-between gap-4 px-2'>
        {/* Light */}
        <div
          className='flex cursor-pointer flex-col items-center gap-2'
          onClick={() => setTheme("light")}
        >
          <div
            className={`rounded-2xl p-[2px] transition-colors ${theme === "light" ? "bg-white" : "bg-transparent"}`}
          >
            <div className='flex h-28 w-20 flex-col items-center rounded-xl bg-[#3a3a3c] p-2 pt-4'>
              <div className='flex w-full flex-1 flex-col gap-2 rounded-lg bg-[#f2f2f7] p-2'>
                <div className='mx-auto mb-1 h-4 w-4 rounded-full bg-gray-300'></div>
                <div className='h-1.5 w-full rounded-full bg-gray-300'></div>
                <div className='h-1.5 w-full rounded-full bg-gray-300'></div>
                <div className='h-1.5 w-3/4 rounded-full bg-gray-300'></div>
              </div>
            </div>
          </div>
          <span
            className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${theme === "light" ? "bg-white text-black" : "text-gray-400"}`}
          >
            Light
          </span>
        </div>

        {/* Dark */}
        <div
          className='flex cursor-pointer flex-col items-center gap-2'
          onClick={() => setTheme("dark")}
        >
          <div
            className={`rounded-2xl p-[2px] transition-colors ${theme === "dark" ? "bg-white" : "bg-transparent"}`}
          >
            <div className='flex h-28 w-20 flex-col items-center rounded-xl border border-white/5 bg-[#2c2c2e] p-2 pt-4'>
              <div className='flex w-full flex-1 flex-col gap-2 rounded-lg border border-white/10 bg-black p-2'>
                <div className='mx-auto mb-1 h-4 w-4 rounded-full bg-[#3a3a3c]'></div>
                <div className='h-1.5 w-full rounded-full bg-[#3a3a3c]'></div>
                <div className='h-1.5 w-full rounded-full bg-[#3a3a3c]'></div>
                <div className='h-1.5 w-3/4 rounded-full bg-[#3a3a3c]'></div>
              </div>
            </div>
          </div>
          <span
            className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${theme === "dark" ? "bg-white text-black" : "text-gray-400"}`}
          >
            Dark
          </span>
        </div>

        {/* System */}
        <div
          className='flex cursor-pointer flex-col items-center gap-3'
          onClick={() => setTheme("system")}
        >
          <div
            className={`rounded-2xl p-[2px] transition-colors ${theme === "system" ? "bg-white" : "bg-transparent"}`}
          >
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
          </div>
          <span
            className={`rounded-full px-4 py-1 text-sm font-medium transition-colors ${theme === "system" ? "bg-white text-black" : "text-gray-400"}`}
          >
            System
          </span>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
export function TestApp() {
  return (
    <div className='flex min-h-screen flex-col items-center gap-20 bg-[#121212] py-16 font-sans'>
      <div className='mb-4 text-center'>
        <h1 className='mb-2 text-3xl font-bold text-white'>Theme Toggle Gallery</h1>
        <p className='text-gray-400'>Recreations of popular OS theme switchers</p>
      </div>

      <GnomeToggle />
      <IosToggle />
    </div>
  );
}
