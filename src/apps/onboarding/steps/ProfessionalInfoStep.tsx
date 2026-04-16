import React from "react";
import { useForm } from "@tanstack/react-form";
import { Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { StepHeader } from "../components/StepHeader";
import { StepTopNav } from "../components/StepTopNav";
import { StepFooter } from "../components/StepFooter";
import { StepDivider } from "../components/StepDivider";
import SocialInput from "../components/ui/SocialInput";
import { GithubIcon, BehanceIcon, InstagramIcon, LinkedInIcon, XIcon } from "@/assets/svg/icons";

export interface ProfessionalInfoData {
  yearsOfExperience: string;
  skills: string;
  authorizedUS: boolean | null;
  salaryExpectation: string;
  twitter: string;
  github: string;
  behance: string;
  instagram: string;
}

type SocialPlatform = "twitter" | "github" | "behance" | "instagram";

const SOCIAL_LINKS: { platform: SocialPlatform; icon: React.ReactNode; placeholder: string }[] = [
  {
    platform: "twitter",
    icon: <XIcon className='text-neutral-06 size-5' />,
    placeholder: "X link",
  },
  {
    platform: "github",
    icon: <GithubIcon className='text-neutral-06 size-5' />,
    placeholder: "GitHub link",
  },
  {
    platform: "behance",
    icon: <BehanceIcon className='size-5 text-blue-600' />,
    placeholder: "Behance link",
  },
  {
    platform: "instagram",
    icon: <InstagramIcon className='size-5 text-pink-500' />,
    placeholder: "Instagram link",
  },
];

interface Props {
  defaultValues: ProfessionalInfoData;
  profileLabel: string;
  onBack: () => void;
  onContinue: (data: ProfessionalInfoData) => void;
  onSkip: () => void;
}

const baseInputStyles =
  "border-neutral-02 text-neutral-06 placeholder:text-neutral-04 focus-visible:border-brand-accent focus-visible:ring-brand-accent/30 h-auto rounded-lg bg-white px-4 py-3 text-base shadow-none placeholder:font-normal focus-visible:ring-2 transition-colors";

function FormTextField({
  form,
  name,
  label,
  placeholder,
  type = "text",
  validators,
  className,
}: any) {
  return (
    <form.Field name={name} validators={validators}>
      {(field: any) => {
        const hasError = field.state.meta.errors.length > 0;
        return (
          <div className={cn("flex flex-col gap-1.5", className)}>
            <label htmlFor={field.name} className='text-neutral-06 text-base font-medium'>
              {label}
            </label>
            <Input
              id={field.name}
              type={type}
              value={field.state.value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                field.handleChange(e.target.value)
              }
              onBlur={field.handleBlur}
              placeholder={placeholder}
              className={cn(
                baseInputStyles,
                hasError &&
                  "border-danger-400 focus-visible:border-danger-400 focus-visible:ring-danger-400/30",
              )}
            />
            {hasError && (
              <p className='text-danger-400 text-sm'>{field.state.meta.errors[0]?.toString()}</p>
            )}
          </div>
        );
      }}
    </form.Field>
  );
}

export function ProfessionalInfoStep({
  defaultValues,
  profileLabel,
  onBack,
  onContinue,
  onSkip,
}: Props) {
  const form = useForm({
    defaultValues,
    onSubmit: ({ value }) => onContinue(value),
  });

  return (
    <div>
      <StepTopNav onBack={onBack} profileLabel={profileLabel} />

      <StepHeader
        icon={<Briefcase className='text-brand-accent h-5 w-5' />}
        title='Professional Information'
        action={
          <button
            type='button'
            className='bg-neutral-01 border-neutral-02 text-neutral-06 flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-blue-50'
          >
            Import from LinkedIn
            <LinkedInIcon className='h-4 w-4 text-[#0076B2]' />
          </button>
        }
      />

      <form noValidate onSubmit={(e) => e.preventDefault()}>
        <div className='space-y-5'>
          <FormTextField
            form={form}
            name='yearsOfExperience'
            label='Years of experience'
            type='number'
            placeholder='Enter your years of experience'
          />

          <FormTextField
            form={form}
            name='skills'
            label='Skills'
            placeholder='List your primary skills'
          />

          <form.Field name='authorizedUS'>
            {(field: any) => (
              <div className='flex items-center justify-between'>
                <p className='text-neutral-06 text-base font-medium'>
                  Are you authorized to work in the US?
                </p>
                <div className='flex items-center gap-6'>
                  {([true, false] as const).map((val) => (
                    <label key={String(val)} className='flex cursor-pointer items-center gap-2'>
                      <input
                        type='radio'
                        checked={field.state.value === val}
                        onChange={() => field.handleChange(val)}
                        className='checked:bg-brand-accent checked:border-brand-accent focus:outline-brand-accent border-neutral-02 bg-neutral-01 size-5 cursor-pointer appearance-none rounded-full border transition-all duration-200 checked:bg-none checked:bg-clip-content checked:p-[4px]'
                      />
                      <span className='text-neutral-06 text-base'>{val ? "Yes" : "No"}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </form.Field>

          <FormTextField
            form={form}
            name='salaryExpectation'
            label="What's your salary expectations? (Give a range)"
            placeholder='e.g $1-$5K monthly'
          />
        </div>

        <StepDivider />

        <h3 className='text-neutral-06 mb-5 text-xl'>Social Media Links</h3>
        <div className='grid grid-cols-2 gap-4'>
          {SOCIAL_LINKS.map(({ platform, icon, placeholder }) => (
            <form.Field key={platform} name={platform}>
              {(field: any) => (
                <SocialInput
                  icon={icon}
                  placeholder={placeholder}
                  value={field.state.value}
                  onChange={field.handleChange}
                />
              )}
            </form.Field>
          ))}
        </div>

        <StepFooter onContinue={form.handleSubmit} onSkip={onSkip} />
      </form>
    </div>
  );
}
