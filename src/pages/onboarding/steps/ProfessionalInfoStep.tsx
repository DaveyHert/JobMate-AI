import { Briefcase } from "lucide-react";
import { Field, Input, Divider, StepHeader, StepTopNav, StepFooter } from "../components/OnboardingPrimitives";

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

interface Props {
  data: ProfessionalInfoData;
  onChange: (data: ProfessionalInfoData) => void;
  onBack: () => void;
  onContinue: () => void;
  onSkip: () => void;
  profileLabel: string;
}

const SocialInput = ({
  icon,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) => (
  <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-3 bg-white focus-within:ring-2 focus-within:ring-accent/30 focus-within:border-accent transition-colors">
    <span className="shrink-0">{icon}</span>
    <input
      type="url"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="flex-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent"
    />
  </div>
);

// Simple brand icons as inline SVGs / emoji stand-ins
const XIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const GithubIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);
const BehanceIcon = () => (
  <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.345-1.05.6-1.69.76-.63.16-1.31.24-2.02.24H0V4.503h6.938zm-.34 5.75c.585 0 1.07-.14 1.44-.41.37-.27.555-.7.555-1.28 0-.31-.057-.57-.17-.78-.11-.2-.27-.37-.47-.5-.19-.12-.42-.2-.67-.25-.25-.04-.52-.06-.8-.06H3.3v3.28h3.298zm.157 6.18c.307 0 .602-.03.883-.09.28-.06.53-.16.737-.32.21-.15.378-.36.505-.62.13-.25.19-.57.19-.96 0-.76-.22-1.31-.64-1.62-.43-.31-.99-.47-1.69-.47H3.3v4.08h3.455zm9.1-8.42c1.0 0 1.85.22 2.56.67.7.45 1.2 1.15 1.5 2.1H15.1c-.1-.5-.32-.87-.65-1.1-.33-.23-.74-.34-1.22-.34-.34 0-.63.05-.88.16-.24.1-.44.24-.6.41-.16.18-.28.39-.36.63-.08.24-.12.5-.12.78h5.86c.02-.12.03-.24.03-.36V9.31c0-.77-.13-1.46-.4-2.06-.26-.6-.63-1.1-1.09-1.51-.46-.41-1.01-.72-1.63-.93-.62-.2-1.3-.31-2.03-.31-1.34 0-2.51.34-3.5 1.01-.99.67-1.63 1.74-1.95 3.21h1.89c.15-.55.38-1 .69-1.35.32-.34.72-.57 1.2-.69v-.01z" />
  </svg>
);
const InstagramIcon = () => (
  <svg className="w-5 h-5 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

export function ProfessionalInfoStep({ data, onChange, onBack, onContinue, onSkip, profileLabel }: Props) {
  const set = (k: keyof ProfessionalInfoData) => (v: string) =>
    onChange({ ...data, [k]: v });

  return (
    <div>
      <StepTopNav onBack={onBack} profileLabel={profileLabel} />

      <StepHeader
        icon={<Briefcase className="w-5 h-5 text-accent" />}
        title="Professional Information"
        action={
          <button className="flex items-center gap-2 px-4 py-2 border border-blue-200 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
            Import from LinkedIn
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </button>
        }
      />

      <div className="space-y-5">
        <Field label="Years of experience">
          <Input
            type="number"
            min={0}
            value={data.yearsOfExperience}
            onChange={(e) => set("yearsOfExperience")(e.target.value)}
            onKeyDown={(e) => {
              if (["e", "E", "+", "-", "."].includes(e.key)) e.preventDefault();
            }}
            placeholder="Enter your years of experience"
          />
        </Field>

        <Field label="Skills">
          <Input
            value={data.skills}
            onChange={(e) => set("skills")(e.target.value)}
            placeholder="List your primary skills"
          />
        </Field>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-3">Are you authorized to work in the US?</p>
          <div className="flex items-center gap-6">
            {[true, false].map((val) => (
              <label key={String(val)} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={data.authorizedUS === val}
                  onChange={() => onChange({ ...data, authorizedUS: val })}
                  className="w-4 h-4 accent-accent"
                />
                <span className="text-sm text-gray-700">{val ? "Yes" : "No"}</span>
              </label>
            ))}
          </div>
        </div>

        <Field label="What's your salary expectations? (Give a range)">
          <Input
            value={data.salaryExpectation}
            onChange={(e) => set("salaryExpectation")(e.target.value)}
            placeholder="e.g $1-$5K monthly"
          />
        </Field>
      </div>

      <Divider />

      <h3 className="text-base font-semibold text-gray-900 mb-5">Social Media Links</h3>
      <div className="grid grid-cols-2 gap-4">
        <SocialInput icon={<XIcon />} placeholder="X link" value={data.twitter} onChange={set("twitter")} />
        <SocialInput icon={<GithubIcon />} placeholder="GitHub link" value={data.github} onChange={set("github")} />
        <SocialInput icon={<BehanceIcon />} placeholder="Behance link" value={data.behance} onChange={set("behance")} />
        <SocialInput icon={<InstagramIcon />} placeholder="Instagram link" value={data.instagram} onChange={set("instagram")} />
      </div>

      <StepFooter onContinue={onContinue} onSkip={onSkip} />
    </div>
  );
}
