import { Plus, GraduationCap } from "lucide-react";
import {
  Field, DateInput, StepHeader, Divider,
} from "../components/OnboardingPrimitives";

export interface EducationEntry {
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
}

export interface CredentialEntry {
  issuer: string;
  name: string;
  startDate: string;
  endDate: string;
}

export interface CredentialsData {
  education: EducationEntry[];
  credentials: CredentialEntry[];
}

const emptyEdu   = (): EducationEntry   => ({ school: "", degree: "", startDate: "", endDate: "" });
const emptyCred  = (): CredentialEntry  => ({ issuer: "", name:   "", startDate: "", endDate: "" });

interface Props {
  data: CredentialsData;
  onChange: (data: CredentialsData) => void;
  onBack: () => void;
  onFinish: () => void;
  onSkip: () => void;
  profileLabel: string;
  saving: boolean;
}

export function CredentialsStep({ data, onChange, onBack, onFinish, onSkip, profileLabel, saving }: Props) {
  const setEdu = (i: number, k: keyof EducationEntry, v: string) => {
    const updated = data.education.map((e, idx) => idx === i ? { ...e, [k]: v } : e);
    onChange({ ...data, education: updated });
  };

  const setCred = (i: number, k: keyof CredentialEntry, v: string) => {
    const updated = data.credentials.map((c, idx) => idx === i ? { ...c, [k]: v } : c);
    onChange({ ...data, credentials: updated });
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
        icon={<GraduationCap className="w-5 h-5 text-accent" />}
        title="Certificates & Credentials"
      />

      {/* Academic */}
      <h3 className="text-base font-semibold text-gray-900 mb-5">Academic Qualifications</h3>
      <div className="space-y-6">
        {data.education.map((edu, i) => (
          <div key={i} className="space-y-4">
            {i > 0 && <div className="border-t border-gray-100 pt-4" />}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Institution name">
                <Input
                  value={edu.school}
                  onChange={(e) => setEdu(i, "school", e.target.value)}
                  placeholder="e.g UNILAG"
                />
              </Field>
              <Field label="Degree gotten">
                <Input
                  value={edu.degree}
                  onChange={(e) => setEdu(i, "degree", e.target.value)}
                  placeholder="e.g B.Sc Economics"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Start date">
                <DateInput
                  value={edu.startDate}
                  onChange={(e) => setEdu(i, "startDate", e.target.value)}
                  placeholder="Select a start date"
                />
              </Field>
              <Field label="End date">
                <DateInput
                  value={edu.endDate}
                  onChange={(e) => setEdu(i, "endDate", e.target.value)}
                  placeholder="Select an end date"
                />
              </Field>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => onChange({ ...data, education: [...data.education, emptyEdu()] })}
        className="mt-4 flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Add another certificate <Plus className="w-4 h-4" />
      </button>

      <Divider />

      {/* Non-academic */}
      <h3 className="text-base font-semibold text-gray-900 mb-5">Non-Academic Credentials</h3>
      <div className="space-y-6">
        {data.credentials.map((cred, i) => (
          <div key={i} className="space-y-4">
            {i > 0 && <div className="border-t border-gray-100 pt-4" />}
            <div className="grid grid-cols-2 gap-4">
              <Field label="Institution name">
                <Input
                  value={cred.issuer}
                  onChange={(e) => setCred(i, "issuer", e.target.value)}
                  placeholder="e.g Coursera"
                />
              </Field>
              <Field label="Certification gotten">
                <Input
                  value={cred.name}
                  onChange={(e) => setCred(i, "name", e.target.value)}
                  placeholder="e.g Google UX Design course"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Start date">
                <DateInput
                  value={cred.startDate}
                  onChange={(e) => setCred(i, "startDate", e.target.value)}
                  placeholder="Select a start date"
                />
              </Field>
              <Field label="End date">
                <DateInput
                  value={cred.endDate}
                  onChange={(e) => setCred(i, "endDate", e.target.value)}
                  placeholder="Select an end date"
                />
              </Field>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => onChange({ ...data, credentials: [...data.credentials, emptyCred()] })}
        className="mt-4 flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Add another credential <Plus className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-3 mt-10">
        <button
          onClick={onFinish}
          disabled={saving}
          className="px-8 py-3 bg-accent hover:bg-primary-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {saving ? "Saving…" : "Finish"}
        </button>
        <button
          onClick={onSkip}
          disabled={saving}
          className="px-8 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 rounded-lg text-sm font-medium transition-colors"
        >
          Skip this
        </button>
      </div>
    </div>
  );
}
