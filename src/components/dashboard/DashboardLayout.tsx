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
} from "lucide-react";
import { useJobMateData } from "../../hooks/useJobMateData";
import { useThemeContext } from "../../hooks/useThemeContext";
import { AddApplicationModal } from "../application/AddApplicationModal";

export type DashboardRoute =
  | "dashboard"
  | "applications"
  | "analytics"
  | "settings";

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

export function DashboardLayout({
  currentRoute,
  children,
}: DashboardLayoutProps) {
  const data = useJobMateData();
  const { theme, toggleTheme } = useThemeContext();
  const [showAddModal, setShowAddModal] = useState(false);
  const profile = data ? data.profiles[data.activeProfileId] : null;
  const firstName = profile?.identity.firstName ?? "there";
  const avatarUrl = profile?.identity.profilePictureUrl;
  const initial = firstName[0]?.toUpperCase() ?? "?";
  const applicationsCount = data?.applications.length ?? 0;

  return (
    <div className='min-h-screen bg-background text-primary-text'>
      {/* Sidebar */}
      <aside className='hidden md:flex fixed left-0 top-0 bottom-0 w-60 flex-col bg-background border-r border-border-col'>
        {/* Brand */}
        <div className='flex items-center gap-2 px-6 h-20'>
          <div className='w-5 h-5 rounded-[4px] bg-primary-text flex items-center justify-center'>
            <div className='w-2 h-2 bg-background rounded-[1px]' />
          </div>
          <span className='text-lg font-semibold tracking-tight'>
            JobMate AI
          </span>
        </div>

        {/* Nav */}
        <nav className='px-4 py-2 space-y-1'>
          {NAV_ITEMS.map((item) => {
            const isActive = item.route === currentRoute;
            const Icon = item.icon;
            return (
              <a
                key={item.route}
                href={item.hash}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-foreground border border-border-col text-primary-text shadow-sm"
                    : "text-secondary-text hover:text-primary-text"
                }`}
              >
                <Icon className='w-4 h-4 shrink-0' />
                <span className='flex-1'>{item.label}</span>
                {item.showCount && applicationsCount > 0 && (
                  <span className='text-[10px] font-medium text-secondary-text bg-button-col border border-border-col rounded-md px-1.5 py-0.5'>
                    {applicationsCount}
                  </span>
                )}
              </a>
            );
          })}
        </nav>

        {/* Add application CTA */}
        <div className='px-4 mt-4'>
          <button
            onClick={() => setShowAddModal(true)}
            className='w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-accent text-white text-sm font-medium hover:bg-primary-600 transition-colors shadow-sm'
          >
            <Plus className='w-4 h-4' />
            Add new application
          </button>
        </div>

        {/* Theme toggle + sign out */}
        <div className='mt-auto px-4 py-4 border-t border-border-col space-y-1'>
          <button
            onClick={toggleTheme}
            className='w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-secondary-text hover:text-primary-text hover:bg-button-col transition-colors'
            aria-label='Toggle theme'
          >
            {theme === "dark" ? (
              <Sun className='w-4 h-4' />
            ) : (
              <Moon className='w-4 h-4' />
            )}
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </button>
          <button className='w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-secondary-text hover:text-primary-text hover:bg-button-col transition-colors'>
            <LogOut className='w-4 h-4' />
            LogOut
          </button>
        </div>
      </aside>

      {/* Main column — white bg to match Figma */}
      <div className='md:pl-60 min-h-screen flex flex-col bg-foreground'>
        {/* Top greeting header */}
        <header className='h-20 shrink-0'>
          <div className='max-w-7xl mx-auto px-8 h-full flex items-center justify-between'>
            <h1 className='text-2xl font-semibold text-primary-text'>
              Good day, {firstName}
            </h1>
            <div className='flex items-center gap-4'>
              <button
                className='p-2 text-secondary-text hover:text-primary-text transition-colors'
                aria-label='Notifications'
              >
                <Bell className='w-5 h-5' />
              </button>
              <div className='w-10 h-10 rounded-full overflow-hidden bg-button-col border border-border-col flex items-center justify-center'>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={firstName}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <span className='text-sm font-semibold text-secondary-text'>
                    {initial}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className='flex-1'>
          <div className='max-w-7xl mx-auto'>{children}</div>
        </main>
      </div>

      <AddApplicationModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
