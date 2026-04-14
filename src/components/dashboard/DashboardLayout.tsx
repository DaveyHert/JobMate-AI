// ============================================================================
// DashboardLayout — shared shell for every page on the web portal
// ============================================================================
// Matches the Figma spec: light sidebar with "JobMate AI" wordmark, a count
// badge on My Applications, pill-style active nav item, prominent "Add new
// application" button, and a top greeting header with notification + avatar.
//
// Sub-routes are driven by window.location.hash so dashboard.html stays a
// single SPA entry.
// ============================================================================

import { ReactNode, useState } from "react";
import {
  LayoutDashboard,
  Briefcase,
  LineChart,
  Settings as SettingsIcon,
  LogOut,
  Plus,
  Bell,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import type { ThemePreference } from "../../context/ThemeContext";
import { useJobMateData } from "../../hooks/useJobMateData";
import { useThemeContext } from "../../hooks/useThemeContext";
import { AddApplicationModal } from "../application/AddApplicationModal";
import ThemeToggle from "../ThemeToggle";

export type DashboardRoute = "dashboard" | "applications" | "analytics" | "settings";

interface NavItem {
  route: DashboardRoute;
  label: string;
  icon: typeof LayoutDashboard;
  hash: string;
  showCount?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { route: "dashboard", label: "Dashboard", icon: LayoutDashboard, hash: "#/" },
  {
    route: "applications",
    label: "My Applications",
    icon: Briefcase,
    hash: "#/applications",
    showCount: true,
  },
  {
    route: "analytics",
    label: "Analytics",
    icon: LineChart,
    hash: "#/analytics",
  },
  {
    route: "settings",
    label: "Settings",
    icon: SettingsIcon,
    hash: "#/settings",
  },
];

interface DashboardLayoutProps {
  currentRoute: DashboardRoute;
  children: ReactNode;
}

export function DashboardLayout({ currentRoute, children }: DashboardLayoutProps) {
  const data = useJobMateData();
  const { preference, setPreference } = useThemeContext();

  const THEME_CYCLE: ThemePreference[] = ["system", "light", "dark"];
  const cycleTheme = () => {
    const idx = THEME_CYCLE.indexOf(preference);
    setPreference(THEME_CYCLE[(idx + 1) % THEME_CYCLE.length]);
  };
  const ThemeIcon = { system: Monitor, light: Sun, dark: Moon }[preference];
  const themeLabel = { system: "System", light: "Light mode", dark: "Dark mode" }[preference];
  const [showAddModal, setShowAddModal] = useState(false);
  const profile = data ? data.profiles[data.activeProfileId] : null;
  const firstName = profile?.identity.firstName ?? "there";
  const avatarUrl = profile?.identity.profilePictureUrl;
  const initial = firstName[0]?.toUpperCase() ?? "?";
  const applicationsCount = data?.applications.length ?? 0;

  return (
    <div className='bg-background text-primary-text min-h-screen'>
      {/* Sidebar */}
      <aside className='bg-background border-brand-border fixed top-0 bottom-0 left-0 hidden w-60 flex-col border-r md:flex'>
        {/* Brand */}
        <div className='flex h-20 items-center gap-2 px-6'>
          <div className='bg-primary-text flex h-5 w-5 items-center justify-center rounded-[4px]'>
            <div className='bg-background h-2 w-2 rounded-[1px]' />
          </div>
          <span className='text-lg font-semibold tracking-tight'>JobMate AI</span>
        </div>

        {/* Nav */}
        <nav className='space-y-1 px-4 py-2'>
          {NAV_ITEMS.map((item) => {
            const isActive = item.route === currentRoute;
            const Icon = item.icon;
            return (
              <a
                key={item.route}
                href={item.hash}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-foreground border-brand-border text-primary-text border shadow-sm"
                    : "text-secondary-text hover:text-primary-text"
                }`}
              >
                <Icon className='h-4 w-4 shrink-0' />
                <span className='flex-1'>{item.label}</span>
                {item.showCount && applicationsCount > 0 && (
                  <span className='text-secondary-text bg-button-col border-brand-border rounded-md border px-1.5 py-0.5 text-[10px] font-medium'>
                    {applicationsCount}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        {/* Add application CTA */}
        <div className='mt-4 px-4'>
          <button
            onClick={() => setShowAddModal(true)}
            className='bg-brand-accent hover:bg-primary-600 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors'
          >
            <Plus className='h-4 w-4' />
            Add new application
          </button>
        </div>

        {/* Theme toggle + sign out */}
        <div className='border-brand-border mt-auto space-y-1 border-t px-4 py-4'>
          {/* <ThemeToggle theme={preference} onChange={setPreference} /> */}
          <button
            onClick={cycleTheme}
            className='text-secondary-text hover:text-primary-text hover:bg-button-col flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors'
            aria-label='Cycle theme'
          >
            <ThemeIcon className='h-4 w-4' />
            <span>{themeLabel}</span>
          </button>
          <button className='text-secondary-text hover:text-primary-text hover:bg-button-col flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors'>
            <LogOut className='h-4 w-4' />
            LogOut
          </button>
        </div>
      </aside>

      {/* Main column — white bg to match Figma */}
      <div className='bg-foreground flex min-h-screen flex-col md:pl-60'>
        {/* Top greeting header */}
        <header className='h-20 shrink-0'>
          <div className='mx-auto flex h-full max-w-7xl items-center justify-between px-8'>
            <h1 className='text-primary-text text-2xl font-semibold'>Good day, {firstName}</h1>
            <div className='flex items-center gap-4'>
              <button
                className='text-secondary-text hover:text-primary-text p-2 transition-colors'
                aria-label='Notifications'
              >
                <Bell className='h-5 w-5' />
              </button>
              <div className='bg-button-col border-brand-border flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border'>
                {avatarUrl ? (
                  <img src={avatarUrl} alt={firstName} className='h-full w-full object-cover' />
                ) : (
                  <span className='text-secondary-text text-sm font-semibold'>{initial}</span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className='flex-1'>
          <div className='mx-auto max-w-7xl'>{children}</div>
        </main>
      </div>

      <AddApplicationModal open={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
}
