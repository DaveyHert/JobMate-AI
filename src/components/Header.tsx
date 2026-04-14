import React from "react";
import { ChevronDown, User } from "lucide-react";
import type { UserProfile } from "../models/models";

interface HeaderProps {
  profiles: UserProfile[];
  activeProfileId: string;
  onProfileChange: (profileId: string) => void;
}

const Header: React.FC<HeaderProps> = ({ profiles, activeProfileId, onProfileChange }) => {
  const activeProfile = profiles.find((p) => p.id === activeProfileId);
  const avatarUrl = activeProfile?.identity.profilePictureUrl;

  return (
    <header className='bg-app-foreground border-brand-border flex shrink-0 items-center justify-between border-b px-5 py-2'>
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

        <span className='font-inter text-lg font-semibold text-gray-900 dark:text-[#E3E3E3]'>
          JobMate AI
        </span>
      </div>

      {/* Selector + Profile */}
      <div className='flex items-center gap-2'>
        <div className='profile-selector relative'>
          <select
            value={activeProfileId}
            onChange={(e) => onProfileChange(e.target.value)}
            className='bg-brand-btn border-brand-border text-primary-text hover:bg-brand-btn-hover max-w-[180px] cursor-pointer appearance-none truncate rounded-sm border px-4 py-1 pr-10 text-sm font-normal'
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
          <ChevronDown className='text-primary-text pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 transform' />
        </div>

        <div className='bg-brand-btn flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-[#D1D5DB] dark:border-[#1D1E21]'>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={activeProfile?.identity.fullName ?? "Profile"}
              className='h-full w-full object-cover'
            />
          ) : (
            <User className='text-secondary-text h-5 w-5' />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
