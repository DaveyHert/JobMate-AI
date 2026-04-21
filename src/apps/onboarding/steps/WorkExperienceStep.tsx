import React from "react";
import { useForm, type AnyFieldApi } from "@tanstack/react-form";

// tanstack-form's FormApi generic is declared `in out` (invariant), so a
// concrete `useForm<X>()` return cannot be assigned to any wider form type.
// For shared helper components that only forward props to form.Field/Subscribe,
// `any` is the documented escape hatch.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormApi = any;
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StepHeader } from "../components/StepHeader";
import { StepTopNav } from "../components/StepTopNav";
import { StepFooter } from "../components/StepFooter";
import { DatePicker } from "../components/DatePicker";
import BriefCase from "@/assets/svg/icons/BriefCaseIcon";
import { COUNTRIES } from "@/data/geo";

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

interface Props {
  defaultValues: WorkExperienceData;
  profileLabel: string;
  onBack: () => void;
  onContinue: (data: WorkExperienceData) => void;
  onSkip: () => void;
}

const baseInputStyles =
  "border-neutral-02 text-neutral-06 placeholder:text-neutral-04 focus-visible:border-brand-accent focus-visible:ring-brand-accent/30 h-auto rounded-lg bg-white px-4 py-3 text-base shadow-none placeholder:font-normal focus-visible:ring-2 transition-colors";

// For simple text inputs within each entry row
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
            <label htmlFor={field.name} className='text-neutral-06 text-base font-medium'>
              {label}
            </label>
            <Input
              id={field.name}
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

export function WorkExperienceStep({
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
        icon={<BriefCase className='text-primary-04 h-5 w-5' />}
        title='Work Experience'
        action={
          <form.Field name='entries' mode='array'>
            {(field: AnyFieldApi) => (
              <Button
                type='button'
                variant='outline'
                size='lg'
                onClick={() => field.pushValue(emptyEntry())}
              >
                Add new <Plus className='h-4 w-4' />
              </Button>
            )}
          </form.Field>
        }
      />

      <form noValidate onSubmit={(e) => e.preventDefault()}>
        <form.Field name='entries' mode='array'>
          {(entriesField: AnyFieldApi) => (
            <div className='space-y-10'>
              {(entriesField.state.value as WorkEntry[]).map((_, i) => (
                <div key={i} className='space-y-5'>
                  {i > 0 && <div className='border-t border-gray-100 pt-6' />}

                  <div className='grid grid-cols-2 gap-4'>
                    <EntryTextField
                      form={form}
                      name={`entries[${i}].jobTitle`}
                      label='Job title'
                      placeholder='Enter job title'
                    />
                    <EntryTextField
                      form={form}
                      name={`entries[${i}].company`}
                      label='Company name'
                      placeholder='Enter the company name'
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <form.Field name={`entries[${i}].startDate`}>
                      {(field: AnyFieldApi) => (
                        <div className='flex flex-col gap-1.5'>
                          <label className='text-neutral-06 text-base font-medium'>
                            Start date
                          </label>
                          <DatePicker
                            value={field.state.value}
                            onChange={field.handleChange}
                            onBlur={field.handleBlur}
                            placeholder='Select a start date'
                          />
                        </div>
                      )}
                    </form.Field>
                    <form.Field name={`entries[${i}].endDate`}>
                      {(field: AnyFieldApi) => (
                        <form.Subscribe<boolean>
                          selector={(s) =>
                            !!(s.values as WorkExperienceData).entries[i]?.isCurrent
                          }
                        >
                          {(isCurrent) => (
                            <div className='flex flex-col gap-1.5'>
                              <label className='text-neutral-06 text-base font-medium'>
                                End date
                              </label>
                              <DatePicker
                                value={field.state.value}
                                onChange={field.handleChange}
                                onBlur={field.handleBlur}
                                placeholder='Select an end date'
                                disabled={isCurrent}
                              />
                            </div>
                          )}
                        </form.Subscribe>
                      )}
                    </form.Field>
                  </div>

                  <form.Field name={`entries[${i}].isCurrent`}>
                    {(field: AnyFieldApi) => (
                      <label className='flex cursor-pointer items-center gap-3 select-none'>
                        <div
                          role='checkbox'
                          aria-checked={field.state.value}
                          tabIndex={0}
                          onClick={() => {
                            field.handleChange(!field.state.value);
                            if (!field.state.value) form.setFieldValue(`entries[${i}].endDate`, "");
                          }}
                          onKeyDown={(e: React.KeyboardEvent) => {
                            if (e.key === " " || e.key === "Enter") {
                              e.preventDefault();
                              field.handleChange(!field.state.value);
                            }
                          }}
                          className={cn(
                            "flex h-5 w-5 items-center justify-center rounded border-2 transition-colors",
                            field.state.value
                              ? "border-brand-accent bg-brand-accent"
                              : "border-neutral-02 bg-white",
                          )}
                        >
                          {field.state.value && (
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
                        <span className='text-neutral-06 text-base'>
                          I am currently working in this role
                        </span>
                      </label>
                    )}
                  </form.Field>

                  <EntryTextField
                    form={form}
                    name={`entries[${i}].skills`}
                    label='Skills'
                    placeholder='List your primary skills for this role'
                  />

                  <form.Field name={`entries[${i}].location`}>
                    {(field: AnyFieldApi) => (
                      <div className='flex flex-col gap-1.5'>
                        <label className='text-neutral-06 text-base font-medium'>Location</label>
                        <Select value={field.state.value} onValueChange={field.handleChange}>
                          <SelectTrigger
                            className={cn(
                              baseInputStyles,
                              "data-placeholder:text-neutral-04 w-full",
                            )}
                          >
                            <SelectValue placeholder='Select a country' />
                          </SelectTrigger>
                          <SelectContent>
                            {COUNTRIES.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </form.Field>

                  <form.Field name={`entries[${i}].description`}>
                    {(field: AnyFieldApi) => (
                      <div className='flex flex-col gap-1.5'>
                        <label
                          htmlFor={field.name}
                          className='text-neutral-06 text-base font-medium'
                        >
                          Description
                        </label>
                        <Textarea
                          id={field.name}
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          onBlur={field.handleBlur}
                          placeholder='Describe this project, listing your tasks and responsibilities'
                          rows={5}
                          className={cn(baseInputStyles, "min-h-0 resize-none")}
                        />
                      </div>
                    )}
                  </form.Field>
                </div>
              ))}
            </div>
          )}
        </form.Field>

        <StepFooter onContinue={form.handleSubmit} onSkip={onSkip} />
      </form>
    </div>
  );
}
