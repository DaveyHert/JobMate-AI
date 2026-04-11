import { Plus, FileText } from "lucide-react";
import { Field, Input, DateInput, Select, Textarea, StepHeader } from "../components/OnboardingPrimitives";

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
  "Nigeria", "United States", "United Kingdom", "Canada", "Australia",
  "Germany", "France", "India", "South Africa", "Brazil", "Kenya",
  "Ghana", "Egypt", "UAE", "Netherlands", "Sweden", "Singapore",
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

export function WorkExperienceStep({ data, onChange, onBack, onContinue, onSkip, profileLabel }: Props) {
  const setEntry = (i: number, patch: Partial<WorkEntry>) => {
    const entries = data.entries.map((e, idx) => idx === i ? { ...e, ...patch } : e);
    onChange({ entries });
  };

  return (
    <div>
      {/* Top nav */}
      <div className="flex items-center justify-between mb-8">
        <button onClick={onBack} className="p-1 text-gray-500 hover:text-gray-800 transition-colors" aria-label="Back">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        {profileLabel && (
          <div className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700">
            {profileLabel}
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>

      <StepHeader
        icon={<FileText className="w-5 h-5 text-accent" />}
        title="Work Experience"
        action={
          <button
            onClick={() => onChange({ entries: [...data.entries, emptyEntry()] })}
            className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Add new <Plus className="w-4 h-4" />
          </button>
        }
      />

      <div className="space-y-10">
        {data.entries.map((entry, i) => (
          <div key={i} className="space-y-5">
            {i > 0 && <div className="border-t border-gray-100 pt-6" />}

            <div className="grid grid-cols-2 gap-4">
              <Field label="Job title">
                <Input
                  value={entry.jobTitle}
                  onChange={(e) => setEntry(i, { jobTitle: e.target.value })}
                  placeholder="Enter job title"
                />
              </Field>
              <Field label="Company name">
                <Input
                  value={entry.company}
                  onChange={(e) => setEntry(i, { company: e.target.value })}
                  placeholder="Enter the company name"
                />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Start date">
                <DateInput
                  value={entry.startDate}
                  onChange={(e) => setEntry(i, { startDate: e.target.value })}
                  placeholder="Select a start date"
                />
              </Field>
              <Field label="End date">
                <DateInput
                  value={entry.endDate}
                  onChange={(e) => setEntry(i, { endDate: e.target.value })}
                  placeholder="Select an end date"
                  disabled={entry.isCurrent}
                />
              </Field>
            </div>

            {/* Current role checkbox */}
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() => setEntry(i, { isCurrent: !entry.isCurrent, endDate: "" })}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                  entry.isCurrent ? "bg-accent border-accent" : "border-gray-300 bg-white"
                }`}
              >
                {entry.isCurrent && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-sm text-gray-700">I am currently working in this role</span>
            </label>

            <Field label="Skills">
              <Input
                value={entry.skills}
                onChange={(e) => setEntry(i, { skills: e.target.value })}
                placeholder="List your primary skills for this role"
              />
            </Field>

            <Field label="Location">
              <Select
                value={entry.location}
                onChange={(e) => setEntry(i, { location: e.target.value })}
              >
                <option value="">Select a country</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Select>
            </Field>

            <Field label="Description">
              <Textarea
                value={entry.description}
                onChange={(e) => setEntry(i, { description: e.target.value })}
                placeholder="Describe this project, listing your tasks and responsibilities"
                rows={5}
              />
            </Field>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 mt-10">
        <button
          onClick={onContinue}
          className="px-8 py-3 bg-accent hover:bg-primary-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Continue
        </button>
        <button
          onClick={onSkip}
          className="px-8 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 rounded-lg text-sm font-medium transition-colors"
        >
          Skip this
        </button>
      </div>
    </div>
  );
}
