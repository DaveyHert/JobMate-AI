import { Plus, GraduationCap } from "lucide-react";
import {
  Field,
  Input,
  DateInput,
  Divider,
  StepHeader,
  StepTopNav,
  StepFooter,
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

const emptyEdu = (): EducationEntry => ({ school: "", degree: "", startDate: "", endDate: "" });
const emptyCred = (): CredentialEntry => ({ issuer: "", name: "", startDate: "", endDate: "" });

interface Props {
  data: CredentialsData;
  onChange: (data: CredentialsData) => void;
  onBack: () => void;
  onFinish: () => void;
  onSkip: () => void;
  profileLabel: string;
  saving: boolean;
}

export function CredentialsStep({
  data,
  onChange,
  onBack,
  onFinish,
  onSkip,
  profileLabel,
  saving,
}: Props) {
  const setEdu = (i: number, k: keyof EducationEntry, v: string) => {
    const updated = data.education.map((e, idx) => (idx === i ? { ...e, [k]: v } : e));
    onChange({ ...data, education: updated });
  };

  const setCred = (i: number, k: keyof CredentialEntry, v: string) => {
    const updated = data.credentials.map((c, idx) => (idx === i ? { ...c, [k]: v } : c));
    onChange({ ...data, credentials: updated });
  };

  return (
    <div>
      <StepTopNav onBack={onBack} profileLabel={profileLabel} />

      <StepHeader
        icon={<GraduationCap className='text-brand-accent h-5 w-5' />}
        title='Certificates & Credentials'
      />

      {/* Academic */}
      <h3 className='mb-5 text-base font-semibold text-gray-900'>Academic Qualifications</h3>
      <div className='space-y-6'>
        {data.education.map((edu, i) => (
          <div key={i} className='space-y-4'>
            {i > 0 && <div className='border-t border-gray-100 pt-4' />}
            <div className='grid grid-cols-2 gap-4'>
              <Field label='Institution name'>
                <Input
                  value={edu.school}
                  onChange={(e) => setEdu(i, "school", e.target.value)}
                  placeholder='e.g UNILAG'
                />
              </Field>
              <Field label='Degree gotten'>
                <Input
                  value={edu.degree}
                  onChange={(e) => setEdu(i, "degree", e.target.value)}
                  placeholder='e.g B.Sc Economics'
                />
              </Field>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <Field label='Start date'>
                <DateInput
                  value={edu.startDate}
                  onChange={(e) => setEdu(i, "startDate", e.target.value)}
                  placeholder='Select a start date'
                />
              </Field>
              <Field label='End date'>
                <DateInput
                  value={edu.endDate}
                  onChange={(e) => setEdu(i, "endDate", e.target.value)}
                  placeholder='Select an end date'
                />
              </Field>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => onChange({ ...data, education: [...data.education, emptyEdu()] })}
        className='mt-4 flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'
      >
        Add another certificate <Plus className='h-4 w-4' />
      </button>

      <Divider />

      {/* Non-academic */}
      <h3 className='mb-5 text-base font-semibold text-gray-900'>Non-Academic Credentials</h3>
      <div className='space-y-6'>
        {data.credentials.map((cred, i) => (
          <div key={i} className='space-y-4'>
            {i > 0 && <div className='border-t border-gray-100 pt-4' />}
            <div className='grid grid-cols-2 gap-4'>
              <Field label='Institution name'>
                <Input
                  value={cred.issuer}
                  onChange={(e) => setCred(i, "issuer", e.target.value)}
                  placeholder='e.g Coursera'
                />
              </Field>
              <Field label='Certification gotten'>
                <Input
                  value={cred.name}
                  onChange={(e) => setCred(i, "name", e.target.value)}
                  placeholder='e.g Google UX Design course'
                />
              </Field>
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <Field label='Start date'>
                <DateInput
                  value={cred.startDate}
                  onChange={(e) => setCred(i, "startDate", e.target.value)}
                  placeholder='Select a start date'
                />
              </Field>
              <Field label='End date'>
                <DateInput
                  value={cred.endDate}
                  onChange={(e) => setCred(i, "endDate", e.target.value)}
                  placeholder='Select an end date'
                />
              </Field>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => onChange({ ...data, credentials: [...data.credentials, emptyCred()] })}
        className='mt-4 flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50'
      >
        Add another credential <Plus className='h-4 w-4' />
      </button>

      <StepFooter
        onContinue={onFinish}
        onSkip={onSkip}
        continueLabel={saving ? "Saving…" : "Finish"}
        continueDisabled={saving}
      />
    </div>
  );
}
