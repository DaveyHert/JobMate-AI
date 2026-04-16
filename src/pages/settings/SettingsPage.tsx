// ============================================================================
// SettingsPage — horizontal top-tab settings shell
// ============================================================================
// Matches the Figma: a pill-style tab bar at the top, a "Now active:" profile
// switcher to its right, and the selected tab body below. Tab state lives in
// the URL hash (#/settings/<tab>) so back/forward navigation works.
// ============================================================================

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useJobMateData } from "../../hooks/useJobMateData";
import { jobMateStore } from "../../store/jobMateStore";
import { GeneralTab } from "./tabs/GeneralTab";
import { PersonalInfoTab } from "./tabs/PersonalInfoTab";
import { ProfessionalInfoTab } from "./tabs/ProfessionalInfoTab";
import { CredentialsTab } from "./tabs/CredentialsTab";
import { PrivacyTab } from "./tabs/PrivacyTab";

type SettingsTab = "general" | "personal" | "professional" | "credentials" | "privacy";

interface TabDef {
  id: SettingsTab;
  label: string;
}

const TABS: TabDef[] = [
  { id: "general", label: "General settings" },
  { id: "personal", label: "Personal info" },
  { id: "professional", label: "Professional info" },
  { id: "credentials", label: "Certificates & Credentials" },
  { id: "privacy", label: "Privacy & data" },
];

function parseTabFromHash(): SettingsTab {
  const hash = window.location.hash;
  const match = hash.match(/^#\/settings\/([a-z-]+)/);
  const slug = match?.[1];
  const found = TABS.find((t) => t.id === slug);
  return found ? found.id : "general";
}

export function SettingsPage() {
  const data = useJobMateData();
  const [activeTab, setActiveTab] = useState<SettingsTab>(parseTabFromHash);

  useEffect(() => {
    const onHashChange = () => setActiveTab(parseTabFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const selectTab = (tab: SettingsTab) => {
    window.location.hash = `#/settings/${tab}`;
    setActiveTab(tab);
  };

  if (!data) {
    return (
      <div className='px-8 pb-8'>
        <p className='text-secondary-text text-sm'>Loading settings…</p>
      </div>
    );
  }

  const profile = data.profiles[data.activeProfileId];
  const profiles = Object.values(data.profiles);

  return (
    <div className='px-8 pb-16'>
      {/* Tab bar + profile switcher */}
      <div className='mb-8 flex flex-wrap items-center justify-between gap-4'>
        <div className='bg-neutral-01 inline-flex items-center gap-1 rounded-lg p-1'>
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => selectTab(tab.id)}
                className={`rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "border-brand-border text-neutral-06 bg-app-background border shadow-sm dark:text-white"
                    : "text-neutral-04 hover:text-primary-text"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {profiles.length > 0 && (
          <div className='flex items-center gap-3'>
            <span className='text-secondary-text text-sm'>Now active:</span>
            <div className='relative'>
              <select
                value={data.activeProfileId}
                onChange={(e) => {
                  void jobMateStore.setActiveProfile(e.target.value);
                }}
                className='bg-app-foreground border-neutral-02 focus:ring-brand-accent/30 text-neutral-06 cursor-pointer appearance-none rounded-lg border py-2 pr-10 pl-4 text-sm font-medium focus:ring-2 focus:outline-none'
              >
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.documents.resumes[0]?.label ?? (p.label || "Untitled profile")}
                  </option>
                ))}
              </select>
              <ChevronDown className='text-neutral-06 pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2' />
            </div>
          </div>
        )}
      </div>

      {/* Tab body */}
      <div>
        {activeTab === "general" && <GeneralTab data={data} />}
        {activeTab === "personal" && <PersonalInfoTab profile={profile} />}
        {activeTab === "professional" && <ProfessionalInfoTab profile={profile} />}
        {activeTab === "credentials" && <CredentialsTab profile={profile} />}
        {activeTab === "privacy" && <PrivacyTab settings={data.settings} />}
      </div>
    </div>
  );
}

export default SettingsPage;
