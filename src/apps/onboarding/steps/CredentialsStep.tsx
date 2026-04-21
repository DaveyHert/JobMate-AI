import React from "react";
import { useForm, type AnyFieldApi } from "@tanstack/react-form";

// tanstack-form's FormApi generic is declared `in out` (invariant), so a
// concrete `useForm<X>()` return cannot be assigned to any wider form type.
// For shared helper components that only forward props to form.Field/Subscribe,
// `any` is the documented escape hatch.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormApi = any;
import { Plus, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StepHeader } from "../components/StepHeader";
import { StepTopNav } from "../components/StepTopNav";
import { StepFooter } from "../components/StepFooter";
import { StepDivider } from "../components/StepDivider";
import { DatePicker } from "../components/DatePicker";

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
  defaultValues: CredentialsData;
  profileLabel: string;
  onBack: () => void;
  onFinish: (data: CredentialsData) => void;
  onSkip: () => void;
  saving: boolean;
}

const baseInputStyles =
  "border-neutral-02 text-neutral-06 placeholder:text-neutral-04 focus-visible:border-brand-accent focus-visible:ring-brand-accent/30 h-auto rounded-lg bg-white px-4 py-3 text-base shadow-none placeholder:font-normal focus-visible:ring-2 transition-colors";

interface EntryTextFieldProps {
  form: FormApi;
  name: string;
  label: string;
  placeholder: string;
  className?: string;
}

function EntryTextField({ form, name, label, placeholder, className }: EntryTextFieldProps) {
  return (
    <form.Field name={name}>
      {(field: AnyFieldApi) => {
        const hasError = field.state.meta.errors.length > 0;
        return (
          <div className={cn("flex flex-col gap-1.5", className)}>
            <label htmlFor={field.name} className='text-base font-medium text-neutral-06'>{label}</label>
            <Input
              id={field.name}
              value={field.state.value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder={placeholder}
              className={cn(baseInputStyles, hasError && "border-danger-400 focus-visible:border-danger-400 focus-visible:ring-danger-400/30")}
            />
            {hasError && <p className='text-sm text-danger-400'>{field.state.meta.errors[0]?.toString()}</p>}
          </div>
        );
      }}
    </form.Field>
  );
}

export function CredentialsStep({ defaultValues, profileLabel, onBack, onFinish, onSkip, saving }: Props) {
  const form = useForm({
    defaultValues,
    onSubmit: ({ value }) => onFinish(value),
  });

  return (
    <div>
      <StepTopNav onBack={onBack} profileLabel={profileLabel} />

      <StepHeader
        icon={<GraduationCap className='text-brand-accent h-5 w-5' />}
        title='Certificates & Credentials'
      />

      <form noValidate onSubmit={(e) => e.preventDefault()}>
        <h3 className='mb-5 text-base font-semibold text-neutral-07'>Academic Qualifications</h3>

        <form.Field name='education' mode='array'>
          {(eduField: AnyFieldApi) => (
            <>
              <div className='space-y-6'>
                {(eduField.state.value as EducationEntry[]).map((_, i) => (
                  <div key={i} className='space-y-4'>
                    {i > 0 && <div className='border-t border-gray-100 pt-4' />}
                    <div className='grid grid-cols-2 gap-4'>
                      <EntryTextField form={form} name={`education[${i}].school`} label='Institution name' placeholder='e.g UNILAG' />
                      <EntryTextField form={form} name={`education[${i}].degree`} label='Degree gotten' placeholder='e.g B.Sc Economics' />
                    </div>
                    <div className='grid grid-cols-2 gap-4'>
                      <form.Field name={`education[${i}].startDate`}>
                        {(field: AnyFieldApi) => (
                          <div className='flex flex-col gap-1.5'>
                            <label className='text-base font-medium text-neutral-06'>Start date</label>
                            <DatePicker value={field.state.value} onChange={field.handleChange} onBlur={field.handleBlur} placeholder='Select a start date' />
                          </div>
                        )}
                      </form.Field>
                      <form.Field name={`education[${i}].endDate`}>
                        {(field: AnyFieldApi) => (
                          <div className='flex flex-col gap-1.5'>
                            <label className='text-base font-medium text-neutral-06'>End date</label>
                            <DatePicker value={field.state.value} onChange={field.handleChange} onBlur={field.handleBlur} placeholder='Select an end date' />
                          </div>
                        )}
                      </form.Field>
                    </div>
                  </div>
                ))}
              </div>
              <Button type='button' variant='outline' className='mt-4 cursor-pointer' onClick={() => eduField.pushValue(emptyEdu())}>
                Add another certificate <Plus className='h-4 w-4' />
              </Button>
            </>
          )}
        </form.Field>

        <StepDivider />

        <h3 className='mb-5 text-base font-semibold text-neutral-07'>Non-Academic Credentials</h3>

        <form.Field name='credentials' mode='array'>
          {(credField: AnyFieldApi) => (
            <>
              <div className='space-y-6'>
                {(credField.state.value as CredentialEntry[]).map((_, i) => (
                  <div key={i} className='space-y-4'>
                    {i > 0 && <div className='border-t border-gray-100 pt-4' />}
                    <div className='grid grid-cols-2 gap-4'>
                      <EntryTextField form={form} name={`credentials[${i}].issuer`} label='Institution name' placeholder='e.g Coursera' />
                      <EntryTextField form={form} name={`credentials[${i}].name`} label='Certification gotten' placeholder='e.g Google UX Design course' />
                    </div>
                    <div className='grid grid-cols-2 gap-4'>
                      <form.Field name={`credentials[${i}].startDate`}>
                        {(field: AnyFieldApi) => (
                          <div className='flex flex-col gap-1.5'>
                            <label className='text-base font-medium text-neutral-06'>Start date</label>
                            <DatePicker value={field.state.value} onChange={field.handleChange} onBlur={field.handleBlur} placeholder='Select a start date' />
                          </div>
                        )}
                      </form.Field>
                      <form.Field name={`credentials[${i}].endDate`}>
                        {(field: AnyFieldApi) => (
                          <div className='flex flex-col gap-1.5'>
                            <label className='text-base font-medium text-neutral-06'>End date</label>
                            <DatePicker value={field.state.value} onChange={field.handleChange} onBlur={field.handleBlur} placeholder='Select an end date' />
                          </div>
                        )}
                      </form.Field>
                    </div>
                  </div>
                ))}
              </div>
              <Button type='button' variant='outline' className='mt-4 cursor-pointer' onClick={() => credField.pushValue(emptyCred())}>
                Add another credential <Plus className='h-4 w-4' />
              </Button>
            </>
          )}
        </form.Field>

        <StepFooter
          onContinue={form.handleSubmit}
          onSkip={onSkip}
          continueLabel={saving ? "Saving…" : "Finish"}
          continueDisabled={saving}
        />
      </form>
    </div>
  );
}
