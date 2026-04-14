// ============================================================================
// PersonalInfoTab — "My profile" section, inline-edit list
// ============================================================================
// Matches Figma: a single "My profile" section with a profile-picture row
// followed by one row per field. Each row is a label + value + Edit link;
// clicking Edit swaps to an inline input. Saves write through directly to
// jobMateStore — no draft/cancel dialog.
// ============================================================================

import { useRef, ChangeEvent } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../../../models/models";
import { jobMateStore } from "../../../store/jobMateStore";
import { InlineEditRow } from "../components/InlineEditRow";

interface PersonalInfoTabProps {
  profile: UserProfile;
}

export function PersonalInfoTab({ profile }: PersonalInfoTabProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const save = async (patch: Partial<UserProfile>) => {
    await jobMateStore.upsertProfile({ ...profile, ...patch });
  };

  const saveIdentity = async (patch: Partial<UserProfile["identity"]>) => {
    // Keep fullName in sync when first/last change so downstream consumers
    // that read identity.fullName don't drift.
    const nextIdentity = { ...profile.identity, ...patch };
    if ("firstName" in patch || "lastName" in patch) {
      nextIdentity.fullName = [nextIdentity.firstName, nextIdentity.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();
    }
    await save({ identity: nextIdentity });
  };

  const saveLocation = async (patch: Partial<UserProfile["location"]>) => {
    await save({ location: { ...profile.location, ...patch } });
  };

  const saveLinks = async (patch: Partial<UserProfile["links"]>) => {
    await save({ links: { ...profile.links, ...patch } });
  };

  const onPickPhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      toast.error("Profile picture must be under 15 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      void saveIdentity({ profilePictureUrl: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const deletePhoto = () => {
    void saveIdentity({ profilePictureUrl: undefined });
  };

  const fullNameValue = [profile.identity.firstName, profile.identity.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <section>
      <h2 className='text-primary-text mb-6 text-xl font-semibold'>My profile</h2>

      {/* Profile picture row */}
      <div className='border-brand-border flex items-start gap-5 border-b pb-6'>
        <div className='bg-button-col border-brand-border flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border'>
          {profile.identity.profilePictureUrl ? (
            <img
              src={profile.identity.profilePictureUrl}
              alt={profile.identity.fullName}
              className='h-full w-full object-cover'
            />
          ) : (
            <span className='text-secondary-text text-xl font-semibold'>
              {profile.identity.firstName?.[0]?.toUpperCase() ?? "?"}
            </span>
          )}
        </div>

        <div className='min-w-0 flex-1'>
          <div className='text-primary-text text-sm font-medium'>Profile picture</div>
          <div className='text-secondary-text mt-1 text-xs'>PNG, JPEG under 15MB</div>
        </div>

        <div className='flex shrink-0 items-center gap-2'>
          <button
            onClick={() => fileRef.current?.click()}
            className='text-primary-text bg-foreground border-brand-border hover:bg-button-col rounded-lg border px-4 py-2 text-sm font-medium transition-colors'
          >
            Upload new picture
          </button>
          {profile.identity.profilePictureUrl && (
            <button
              onClick={deletePhoto}
              className='text-primary-text bg-foreground border-brand-border hover:bg-button-col rounded-lg border px-4 py-2 text-sm font-medium transition-colors'
            >
              Delete
            </button>
          )}
          <input
            ref={fileRef}
            type='file'
            accept='image/jpeg,image/png'
            onChange={onPickPhoto}
            className='hidden'
          />
        </div>
      </div>

      {/* Field rows */}
      <InlineEditRow
        label='Full name'
        description='This wil be displayed on your profile.'
        value={fullNameValue}
        placeholder='Your full name'
        onSave={async (next) => {
          const [firstName, ...rest] = next.trim().split(/\s+/);
          await saveIdentity({
            firstName: firstName ?? "",
            lastName: rest.join(" "),
          });
        }}
      />

      <InlineEditRow
        label='Email address'
        description='Add at least one email address.'
        value={profile.identity.email}
        placeholder='you@example.com'
        type='email'
        onSave={(email) => saveIdentity({ email })}
      />

      <InlineEditRow
        label='Phone number'
        value={profile.identity.phone}
        placeholder='+1 555 000 0000'
        type='tel'
        onSave={(phone) => saveIdentity({ phone })}
      />

      <InlineEditRow
        label='Country'
        value={profile.location.country}
        placeholder='United States'
        onSave={(country) => saveLocation({ country })}
      />

      <InlineEditRow
        label='State'
        value={profile.location.state}
        placeholder='California'
        onSave={(state) => saveLocation({ state })}
      />

      <InlineEditRow
        label='House address'
        value={profile.location.address}
        placeholder='123 Main St'
        onSave={(address) => saveLocation({ address })}
      />

      <InlineEditRow
        label='Website URL'
        value={profile.links.website ?? ""}
        placeholder='https://yourname.com'
        type='url'
        onSave={(website) => saveLinks({ website })}
      />
    </section>
  );
}
