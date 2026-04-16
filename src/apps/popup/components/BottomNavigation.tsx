import { BarchartIcon, BriefIcon, GearIcon, HomeIcon, ProfileIcon } from "@/assets/svg/icons";

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
    { key: "home", icon: HomeIcon, label: "Home" },
    { key: "applications", icon: BriefIcon, label: "Applications" },
    {
      key: "dashboard",
      icon: BarchartIcon,
      label: "Dashboard",
      action: openDashboard,
    },
    { key: "profile", icon: ProfileIcon, label: "Profile" },
    { key: "settings", icon: GearIcon, label: "Settings" },
  ];

  return (
    <div className='bg-app-foreground border-brand-border absolute right-0 bottom-0 left-0 flex items-center justify-between border-t px-6 py-3'>
      {navigationItems.map((item) => (
        <button
          key={item.key}
          onClick={item.key === "dashboard" ? item.action : () => setActiveTab(item.key)}
          className={`flex cursor-pointer flex-col items-center gap-1 ${
            activeTab === item.key ? "text-brand-accent" : "text-gray-400 hover:text-gray-600"
          }`}
        >
          <item.icon className='h-5 w-5' />
          <span className='text-xs font-medium'>{item.label}</span>
        </button>
      ))}
    </div>
  );
};

export default BottomNavigation;
