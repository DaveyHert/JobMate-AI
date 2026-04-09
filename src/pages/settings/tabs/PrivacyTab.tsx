// ============================================================================
// PrivacyTab — data sharing, activity, security, data export/delete
// ============================================================================
// Grouped cards following the Figma layout (Image 7): each section is a
// bordered card with a header row and multiple toggle rows separated by
// dashed dividers. Toggles write through updateSettings live.
// ============================================================================

import { Download, Trash2 } from "lucide-react";
import type { JobMateSettings } from "../../../models/models";
import { jobMateStore } from "../../../store/jobMateStore";

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

  const wipeData = async () => {
    if (
      !window.confirm(
        "This will permanently delete your JobMate profile, applications, and settings on this device. Continue?"
      )
    ) {
      return;
    }
    if (typeof chrome !== "undefined" && chrome.storage?.local) {
      await chrome.storage.local.clear();
    } else {
      localStorage.clear();
    }
    window.location.reload();
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
            onChange={(personalizedExperience) =>
              update({ personalizedExperience })
            }
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
            onChange={(requireReviewBeforeFill) =>
              update({ requireReviewBeforeFill })
            }
          />
        </Row>
      </Section>

      {/* Security & access */}
      <Section
        title='Security & access'
        description='Keep your account safe.'
      >
        <Row
          label='Login alerts'
          description='Email me when there is a sign-in from a new device.'
        >
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
            className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-text bg-foreground border border-border-col rounded-lg hover:bg-button-col transition-colors'
          >
            <Download className='w-4 h-4' />
            Export my data
          </button>
          <button
            onClick={wipeData}
            className='flex items-center gap-2 px-4 py-2 text-sm font-medium text-danger-500 bg-foreground border border-danger-500/30 rounded-lg hover:bg-danger-500/10 transition-colors'
          >
            <Trash2 className='w-4 h-4' />
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
        <h2 className='text-xl font-semibold text-primary-text'>{title}</h2>
        {description && (
          <p className='text-sm text-secondary-text mt-1'>{description}</p>
        )}
      </div>
      <div className='border border-border-col rounded-lg bg-foreground'>
        {children}
      </div>
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
      <div className='flex-1 min-w-0'>
        <div className='text-sm font-medium text-primary-text'>{label}</div>
        {description && (
          <div className='text-xs text-secondary-text mt-1'>{description}</div>
        )}
      </div>
      <div className='shrink-0'>{children}</div>
    </div>
  );
}

function Divider() {
  return <div className='border-t border-dashed border-border-col mx-5' />;
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? "bg-accent" : "bg-button-col border border-border-col"
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
