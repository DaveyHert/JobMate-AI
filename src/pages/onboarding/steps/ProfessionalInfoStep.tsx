import React from "react";
import { Briefcase } from "lucide-react";
import {
  Field,
  Input,
  Divider,
  StepHeader,
  StepTopNav,
  StepFooter,
} from "../components/OnboardingPrimitives";
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

type platform = "twitter" | "github" | "behance" | "instagram";

const SOCIAL_LINKS: { platform: platform; icon: React.ReactNode; placeholder: string }[] = [
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
  data: ProfessionalInfoData;
  onChange: (data: ProfessionalInfoData) => void;
  onBack: () => void;
  onContinue: () => void;
  onSkip: () => void;
  profileLabel: string;
}

export function ProfessionalInfoStep({
  data,
  onChange,
  onBack,
  onContinue,
  onSkip,
  profileLabel,
}: Props) {
  const set = (k: keyof ProfessionalInfoData) => (v: string) => onChange({ ...data, [k]: v });

  return (
    <div>
      <StepTopNav onBack={onBack} profileLabel={profileLabel} />

      <StepHeader
        icon={<Briefcase className='text-accent h-5 w-5' />}
        title='Professional Information'
        action={
          <button className='flex items-center gap-2 rounded-lg border border-blue-200 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50'>
            Import from LinkedIn
            <LinkedInIcon className='h-4 w-4' />
          </button>
        }
      />

      <div className='space-y-5'>
        <Field label='Years of experience'>
          <Input
            type='number'
            min={0}
            value={data.yearsOfExperience}
            onChange={(e) => set("yearsOfExperience")(e.target.value)}
            onKeyDown={(e) => {
              if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
            }}
            placeholder='Enter your years of experience'
          />
        </Field>

        <Field label='Skills'>
          <Input
            value={data.skills}
            onChange={(e) => set("skills")(e.target.value)}
            placeholder='List your primary skills'
          />
        </Field>

        <div className='flex items-center justify-between'>
          <p className='text-neutral-06 mb-3 text-sm font-medium'>
            Are you authorized to work in the US?
          </p>

          <div className='flex items-center gap-6'>
            {[true, false].map((val) => (
              <label key={String(val)} className='flex cursor-pointer items-center gap-2'>
                <input
                  type='radio'
                  checked={data.authorizedUS === val}
                  onChange={() => onChange({ ...data, authorizedUS: val })}
                  className='checked:bg-accent checked:border-accent focus:outline-accent size-5 cursor-pointer appearance-none rounded-full border border-[#D4D4D4] bg-[#FAFAFA] transition-all duration-200 checked:bg-none checked:bg-clip-content checked:p-[4px]'
                />
                <span className='text-neutral-06 text-sm'>{val ? "Yes" : "No"}</span>
              </label>
            ))}
          </div>
        </div>

        <Field label="What's your salary expectations? (Give a range)">
          <Input
            value={data.salaryExpectation}
            onChange={(e) => set("salaryExpectation")(e.target.value)}
            placeholder='e.g $1-$5K monthly'
          />
        </Field>
      </div>

      <Divider />

      <h3 className='text-neutral-06 mb-5 text-xl'>Social Media Links</h3>
      <div className='grid grid-cols-2 gap-4'>
        {SOCIAL_LINKS.map(({ platform, icon, placeholder }) => (
          <SocialInput
            key={platform}
            icon={icon}
            placeholder={placeholder}
            value={data[platform]}
            onChange={set(platform)}
          />
        ))}
      </div>

      <StepFooter onContinue={onContinue} onSkip={onSkip} />
    </div>
  );
}
