import React from "react";

import { Home, BarChart, BarChart3, User, Settings } from "lucide-react";

interface BottomNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openDashboard: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  setActiveTab,
  openDashboard,
}) => {
  const navigationItems = [
    { key: "home", icon: Home, label: "Home" },
    { key: "applications", icon: BarChart, label: "Applications" },
    {
      key: "dashboard",
      icon: BarChart3,
      label: "Dashboard",
      action: openDashboard,
    },
    { key: "profile", icon: User, label: "Profile" },
    { key: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className='absolute bottom-0 left-0 right-0 bg-white dark:bg-[#1F2937] border-t border-gray-200 dark:border-gray-700 px-6 py-3 flex justify-between items-center'>
      {navigationItems.map((item) => (
        <button
          key={item.key}
          onClick={
            item.key === "dashboard"
              ? item.action
              : () => setActiveTab(item.key)
          }
          className={`flex flex-col items-center gap-1 ${
            activeTab === item.key
              ? "text-blue-600"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <item.icon className='w-5 h-5' />
          <span className='text-xs font-medium'>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default BottomNavigation;
