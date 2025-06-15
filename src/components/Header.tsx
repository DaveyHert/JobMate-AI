import React from "react";
import { ChevronDown } from "lucide-react";

interface HeaderProps {
  currentProfile: string;
  onProfileChange: (profile: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentProfile, onProfileChange }) => {
  return (
    <header className='flex justify-between items-center px-5 py-2 bg-white dark:bg-[#1F2937] flex-shrink-0 border-b border-gray-100 dark:border-[#374151]'>
      {/* Logo */}
      <div className='flex items-center gap-1'>
        <svg width='12' height='16' viewBox='0 0 12 14' fill='none'>
          <path
            fillRule='evenodd'
            clipRule='evenodd'
            d='M6 0.0833334H12V4.52777V8.97223H6V13.4167H0V8.97223V4.52777H6V0.0833334Z'
            fill='currentColor'
            className='fill-[#0D141C] dark:fill-[#E3E3E3]'
          />
        </svg>

        <span className='font-semibold text-lg font-inter text-gray-900 dark:text-[#E3E3E3]'>
          JobMate AI
        </span>
      </div>

      {/* Selector + Profile */}
      <div className='flex items-center gap-2'>
        <div className='profile-selector relative '>
          <select
            value={currentProfile}
            onChange={(e) => onProfileChange(e.target.value)}
            className='appearance-none bg-[#F8FAFF] dark:bg-[#2C3236] border border-[#D1D5DB] dark:border-[#1D1E21] rounded px-4 py-1 pr-10 text-sm font-normal text-[#0C0A09] dark:text-[#F3F4F6] cursor-pointer hover:bg-[#f5f5f5] dark:hover:bg-[#434345]'
          >
            <option value='product-manager'>Product Manager</option>
            <option value='software-engineer'>Software Engineer</option>
            <option value='designer'>Designer</option>
          </select>
          <ChevronDown className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#4B5563] dark:text-[#D1D5DB] pointer-events-none' />
        </div>

        <div className='w-10 h-10 rounded-full border-2 border-[#D1D5DB] dark:border-[#1D1E21] overflow-hidden'>
          <img
            src='https://images.pexels.com/photos/3785424/pexels-photo-3785424.jpeg?auto=compress&cs=tinysrgb&w=500&h=500&fit=crop&crop=face'
            alt='Profile'
            className='w-full h-full object-center'
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
