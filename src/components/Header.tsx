import React from "react";
import { ChevronDown, User } from "lucide-react";
import type { UserProfile } from "../models/models";

interface HeaderProps {
  profiles: UserProfile[];
  activeProfileId: string;
  onProfileChange: (profileId: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  profiles,
  activeProfileId,
  onProfileChange,
}) => {
  const activeProfile = profiles.find((p) => p.id === activeProfileId);
  const avatarUrl = activeProfile?.identity.profilePictureUrl;

  return (
    <header className='flex justify-between items-center px-5 py-2 bg-foreground shrink-0 border-b border-border-col'>
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
        <div className='profile-selector relative'>
          <select
            value={activeProfileId}
            onChange={(e) => onProfileChange(e.target.value)}
            className='appearance-none bg-button-col border border-border-col rounded-sm px-4 py-1 pr-10 text-sm font-normal text-primary-text cursor-pointer hover:bg-button-hov max-w-[180px] truncate'
          >
            {profiles.length === 0 ? (
              <option value=''>No profiles</option>
            ) : (
              profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.documents.resumes[0]?.label ?? p.label ?? "Untitled"}
                </option>
              ))
            )}
          </select>
          <ChevronDown className='absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-primary-text pointer-events-none' />
        </div>

        <div className='w-10 h-10 rounded-full border-2 border-[#D1D5DB] dark:border-[#1D1E21] overflow-hidden bg-button-col flex items-center justify-center'>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={activeProfile?.identity.fullName ?? "Profile"}
              className='w-full h-full object-cover'
            />
          ) : (
            <User className='w-5 h-5 text-secondary-text' />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
