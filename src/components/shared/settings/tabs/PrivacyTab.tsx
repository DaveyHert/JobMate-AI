// ============================================================================
// PrivacyTab — data sharing, activity, security, data export/delete
// ============================================================================
// Grouped cards following the Figma layout (Image 7): each section is a
// bordered card with a header row and multiple toggle rows separated by
// dashed dividers. Toggles write through updateSettings live.
// ============================================================================

import { Download, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { JobMateSettings } from "@/models/models";
import { jobMateStore } from "@/store/jobMateStore";

interface PrivacyTabProps {
  settings: JobMateSettings;
}

export function PrivacyTab({ settings }: PrivacyTabProps) {
  const update = (patch: Partial<JobMateSettings>) => {
    void jobMateStore.updateSettings(patch);
  };

  const exportData = async () => {
    const data = await jobMateStore.getData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jobmate-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const wipeData = () => {
    toast("Wipe all data?", {
      description:
        "This will permanently delete your profile, applications, and settings on this device.",
      action: {
        label: "Wipe",
        onClick: async () => {
          if (typeof chrome !== "undefined" && chrome.storage?.local) {
            await chrome.storage.local.clear();
          } else {
            localStorage.clear();
          }
          window.location.reload();
        },
      },
      cancel: { label: "Cancel", onClick: () => {} },
    });
  };

  return (
    <div className='space-y-8'>
      {/* Data sharing preferences */}
      <Section
        title='Data sharing preferences'
        description='Control how JobMate uses your data to improve the product.'
      >
        <Row
          label='Share anonymized usage data'
          description='Helps improve matching and autofill accuracy. No personal info is ever shared.'
        >
          <Toggle
            checked={settings.allowDataSharing}
            onChange={(allowDataSharing) => update({ allowDataSharing })}
          />
        </Row>
        <Divider />
        <Row
          label='Personalized experience'
          description='Use your application history to tailor suggestions.'
        >
          <Toggle
            checked={settings.personalizedExperience}
            onChange={(personalizedExperience) => update({ personalizedExperience })}
          />
        </Row>
      </Section>

      {/* Activity & history */}
      <Section
        title='Activity & history'
        description='Control what JobMate remembers about your activity.'
      >
        <Row
          label='Email notifications'
          description='Weekly goal reminders, application updates, and product news.'
        >
          <Toggle
            checked={settings.emailNotifications}
            onChange={(emailNotifications) => update({ emailNotifications })}
          />
        </Row>
        <Divider />
        <Row
          label='Require review before filling'
          description='Never autofill a form without showing you the proposed values first.'
        >
          <Toggle
            checked={settings.requireReviewBeforeFill}
            onChange={(requireReviewBeforeFill) => update({ requireReviewBeforeFill })}
          />
        </Row>
      </Section>

      {/* Security & access */}
      <Section title='Security & access' description='Keep your account safe.'>
        <Row label='Login alerts' description='Email me when there is a sign-in from a new device.'>
          <Toggle
            checked={settings.loginAlerts}
            onChange={(loginAlerts) => update({ loginAlerts })}
          />
        </Row>
      </Section>

      {/* Your data */}
      <Section
        title='Your data'
        description='Download everything JobMate stores about you, or wipe it.'
      >
        <div className='flex flex-wrap gap-3 px-5 py-5'>
          <button
            onClick={exportData}
            className='text-primary-text bg-app-foreground border-brand-border hover:bg-brand-btn flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors'
          >
            <Download className='h-4 w-4' />
            Export my data
          </button>
          <button
            onClick={wipeData}
            className='text-danger-400 bg-app-foreground border-danger-400/30 hover:bg-danger-400/10 flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors'
          >
            <Trash2 className='h-4 w-4' />
            Delete everything
          </button>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className='mb-4'>
        <h2 className='text-primary-text text-xl font-semibold'>{title}</h2>
        {description && <p className='text-secondary-text mt-1 text-sm'>{description}</p>}
      </div>
      <div className='border-brand-border bg-app-foreground rounded-lg border'>{children}</div>
    </section>
  );
}

function Row({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className='flex items-center gap-4 px-5 py-5'>
      <div className='min-w-0 flex-1'>
        <div className='text-primary-text text-sm font-medium'>{label}</div>
        {description && <div className='text-secondary-text mt-1 text-xs'>{description}</div>}
      </div>
      <div className='shrink-0'>{children}</div>
    </div>
  );
}

function Divider() {
  return <div className='border-brand-border mx-5 border-t border-dashed' />;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-brand-accent" : "bg-brand-btn border-brand-border border"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}
