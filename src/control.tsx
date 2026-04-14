import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Monitor } from "lucide-react";

export default function Test() {
  const [theme, setTheme] = useState("system");
  const [activeTab, setActiveTab] = useState("Overview");

  return (
    // We use a generic container here to showcase the components.
    // In your actual app, this will naturally blend into your layout.
    <div className='bg-background border-border flex min-h-[400px] flex-col items-center justify-center gap-12 rounded-xl border p-8 font-sans'>
      {/* 1. Theme Toggle Component */}
      <div className='flex flex-col items-center gap-4'>
        <ThemeToggle theme={theme} onChange={setTheme} />
      </div>

      {/* 2. Segmented Control Component */}
      <div className='flex flex-col items-center gap-3'>
        <span className='text-brand-muted-foreground text-[11px] font-semibold tracking-widest uppercase'>
          Segmented Control
        </span>
        <SegmentedControl
          options={["Overview", "Analytics", "History"]}
          value={activeTab}
          onChange={setActiveTab}
        />
      </div>
    </div>
  );
}

function ThemeToggle({ theme, onChange }) {
  const options = [
    { id: "light", icon: Sun },
    { id: "dark", icon: Moon },
    { id: "system", icon: Monitor },
  ];

  return (
    <div className='bg-brand-muted-brand flex items-center rounded-full p-1'>
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = theme === opt.id;

        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            // Ensure touch targets are appropriately sized and outline is clean
            className={`relative flex h-8 w-10 items-center justify-center rounded-full transition-colors outline-none ${
              isActive ? "text-foreground" : "text-brand-muted-foreground hover:text-foreground"
            }`}
            aria-label={`Switch to ${opt.id} theme`}
          >
            {isActive && (
              <motion.div
                layoutId='theme-active-bg'
                className='bg-background absolute inset-0 rounded-full border border-black/5 shadow-sm dark:border-white/5'
                // This spring physics matches the native Apple/macOS segmented control feel
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            {/* The icon sits on top of the animated background */}
            <Icon className='relative z-10 h-[18px] w-[18px]' strokeWidth={2.5} />
          </button>
        );
      })}
    </div>
  );
}

function SegmentedControl({ options, value, onChange }) {
  return (
    <div className='bg-brand-muted-brand flex items-center rounded-full p-1'>
      {options.map((option) => {
        const isActive = value === option;

        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`relative rounded-full px-5 py-1.5 text-[14px] font-medium transition-colors outline-none ${
              isActive ? "text-foreground" : "text-brand-muted-foreground hover:text-foreground"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId='segment-active-bg'
                className='bg-background absolute inset-0 rounded-full border border-black/5 shadow-sm dark:border-white/5'
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className='relative z-10'>{option}</span>
          </button>
        );
      })}
    </div>
  );
}
