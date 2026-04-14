import { Plus, FileText } from "lucide-react";
import {
  Field,
  Input,
  DateInput,
  Select,
  Textarea,
  StepHeader,
  StepTopNav,
  StepFooter,
} from "../components/OnboardingPrimitives";
import BriefCase from "@/assets/svg/icons/BriefCaseIcon";

export interface WorkEntry {
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  skills: string;
  location: string;
  description: string;
}

export interface WorkExperienceData {
  entries: WorkEntry[];
}

const emptyEntry = (): WorkEntry => ({
  jobTitle: "",
  company: "",
  startDate: "",
  endDate: "",
  isCurrent: false,
  skills: "",
  location: "",
  description: "",
});

const COUNTRIES = [
  "Nigeria",
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "India",
  "South Africa",
  "Brazil",
  "Kenya",
  "Ghana",
  "Egypt",
  "UAE",
  "Netherlands",
  "Sweden",
  "Singapore",
  "Remote",
];

interface Props {
  data: WorkExperienceData;
  onChange: (data: WorkExperienceData) => void;
  onBack: () => void;
  onContinue: () => void;
  onSkip: () => void;
  profileLabel: string;
}

export function WorkExperienceStep({
  data,
  onChange,
  onBack,
  onContinue,
  onSkip,
  profileLabel,
}: Props) {
  const setEntry = (i: number, patch: Partial<WorkEntry>) => {
    const entries = data.entries.map((e, idx) => (idx === i ? { ...e, ...patch } : e));
    onChange({ entries });
  };

  return (
    <div>
      <StepTopNav onBack={onBack} profileLabel={profileLabel} />

      <StepHeader
        icon={<BriefCase className='text-primary-04 h-5 w-5' />}
        title='Work Experience'
        action={
          <button
            onClick={() => onChange({ entries: [...data.entries, emptyEntry()] })}
            className='flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'
          >
            Add new <Plus className='h-4 w-4' />
          </button>
        }
      />

      <div className='space-y-10'>
        {data.entries.map((entry, i) => (
          <div key={i} className='space-y-5'>
            {i > 0 && <div className='border-t border-gray-100 pt-6' />}

            <div className='grid grid-cols-2 gap-4'>
              <Field label='Job title'>
                <Input
                  value={entry.jobTitle}
                  onChange={(e) => setEntry(i, { jobTitle: e.target.value })}
                  placeholder='Enter job title'
                />
              </Field>
              <Field label='Company name'>
                <Input
                  value={entry.company}
                  onChange={(e) => setEntry(i, { company: e.target.value })}
                  placeholder='Enter the company name'
                />
              </Field>
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <Field label='Start date'>
                <DateInput
                  value={entry.startDate}
                  onChange={(e) => setEntry(i, { startDate: e.target.value })}
                  placeholder='Select a start date'
                />
              </Field>
              <Field label='End date'>
                <DateInput
                  value={entry.endDate}
                  onChange={(e) => setEntry(i, { endDate: e.target.value })}
                  placeholder='Select an end date'
                  disabled={entry.isCurrent}
                />
              </Field>
            </div>

            {/* Current role checkbox */}
            <label className='flex cursor-pointer items-center gap-3 select-none'>
              <div
                onClick={() => setEntry(i, { isCurrent: !entry.isCurrent, endDate: "" })}
                className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                  entry.isCurrent
                    ? "bg-brand-accent border-brand-accent"
                    : "border-gray-300 bg-white"
                }`}
              >
                {entry.isCurrent && (
                  <svg
                    className='h-3 w-3 text-white'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={3}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                )}
              </div>
              <span className='text-sm text-gray-700'>I am currently working in this role</span>
            </label>

            <Field label='Skills'>
              <Input
                value={entry.skills}
                onChange={(e) => setEntry(i, { skills: e.target.value })}
                placeholder='List your primary skills for this role'
              />
            </Field>

            <Field label='Location'>
              <Select
                value={entry.location}
                onChange={(e) => setEntry(i, { location: e.target.value })}
              >
                <option value=''>Select a country</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label='Description'>
              <Textarea
                value={entry.description}
                onChange={(e) => setEntry(i, { description: e.target.value })}
                placeholder='Describe this project, listing your tasks and responsibilities'
                rows={5}
              />
            </Field>
          </div>
        ))}
      </div>

      <StepFooter onContinue={onContinue} onSkip={onSkip} />
    </div>
  );
}
