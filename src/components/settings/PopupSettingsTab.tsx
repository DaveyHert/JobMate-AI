// ============================================================================
// PopupSettingsTab — responsive Settings view for the extension popup
// ============================================================================
// Reuses the same tab bodies that power the web portal Settings page — only
// the chrome differs. The tab rail becomes a horizontal scrollable pill row
// to fit the popup's 400-580 px width, and the outer container drops the
// max-width constraint the web version uses.
//
// Every tab body (GeneralTab, PersonalInfoTab, ...) already writes straight
// through jobMateStore, so the popup and web portal stay in sync: save in
// one, see it in the other on next render.
// ============================================================================

import { useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Briefcase,
  Award,
  Shield,
} from "lucide-react";
import { useJobMateData } from "../../hooks/useJobMateData";
import { GeneralTab } from "../../pages/settings/tabs/GeneralTab";
import { PersonalInfoTab } from "../../pages/settings/tabs/PersonalInfoTab";
import { ProfessionalInfoTab } from "../../pages/settings/tabs/ProfessionalInfoTab";
import { CredentialsTab } from "../../pages/settings/tabs/CredentialsTab";
import { PrivacyTab } from "../../pages/settings/tabs/PrivacyTab";

type Tab = "general" | "personal" | "professional" | "credentials" | "privacy";

interface TabDef {
  id: Tab;
  label: string;
  icon: typeof SettingsIcon;
}

const TABS: TabDef[] = [
  { id: "general", label: "General", icon: SettingsIcon },
  { id: "personal", label: "Personal", icon: User },
  { id: "professional", label: "Professional", icon: Briefcase },
  { id: "credentials", label: "Credentials", icon: Award },
  { id: "privacy", label: "Privacy", icon: Shield },
];

export default function PopupSettingsTab() {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const data = useJobMateData();

  if (!data) {
    return (
      <div className='flex-1 p-4'>
        <p className='text-sm text-secondary-text'>Loading settings…</p>
      </div>
    );
  }

  const profile = data.profiles[data.activeProfileId];

  return (
    <div className='flex-1 flex flex-col overflow-hidden'>
      {/* Header + horizontal tab pills */}
      <div className='shrink-0 px-4 pt-4 pb-2 bg-foreground border-b border-border-col'>
        <h1 className='text-lg font-semibold text-primary-text mb-2'>
          Settings
        </h1>
        <div className='flex gap-1 overflow-x-auto no-scrollbar -mx-1 px-1'>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-accent text-white"
                    : "bg-button-col text-secondary-text hover:bg-button-hov hover:text-primary-text"
                }`}
              >
                <Icon className='w-3.5 h-3.5' />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrolling body */}
      <div className='flex-1 overflow-y-auto px-4 py-4 custom-scrollbar bg-background'>
        {activeTab === "general" && <GeneralTab data={data} context='popup' />}
        {activeTab === "personal" && <PersonalInfoTab profile={profile} />}
        {activeTab === "professional" && (
          <ProfessionalInfoTab profile={profile} />
        )}
        {activeTab === "credentials" && <CredentialsTab profile={profile} />}
        {activeTab === "privacy" && <PrivacyTab settings={data.settings} />}
      </div>
    </div>
  );
}
