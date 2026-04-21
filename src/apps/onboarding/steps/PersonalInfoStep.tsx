import { useForm, type AnyFieldApi } from "@tanstack/react-form";

// tanstack-form's FormApi generic is declared `in out` (invariant), so a
// concrete `useForm<X>()` return cannot be assigned to any wider form type.
// For shared helper components that only forward props to form.Field/Subscribe,
// `any` is the documented escape hatch.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FormApi = any;
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StepHeader } from "../components/StepHeader";
import { StepFooter } from "../components/StepFooter";
import { UserIcon } from "@/assets/svg/icons";
import { COUNTRIES, PHONE_CODES } from "@/data/geo";
import { cn } from "@/lib/utils"; // Shadcn's standard clsx + twMerge utility

export interface PersonalInfoData {
  email: string;
  phoneCode: string;
  phone: string;
  firstName: string;
  lastName: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  address: string;
  website: string;
  profileLabel: string;
}

interface Props {
  defaultValues: PersonalInfoData;
  onContinue: (data: PersonalInfoData) => void;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 1. Centralize base styles
// const baseInputStyles =
//   "border-neutral-02  focus-visible:border-brand-accent focus-visible:ring-brand-accent/30 h-auto rounded-lg bg-white px-4 py-3 shadow-none focus-visible:ring-2 transition-colors h-auto";

// 2. Reusable Component with clsx/cn for dynamic states
interface FormTextFieldProps {
  form: FormApi;
  name: string;
  label: string;
  placeholder: string;
  type?: string;
  validators?: { onSubmit?: (args: { value: string }) => string | undefined };
  optional?: boolean;
  className?: string;
}

function FormTextField({
  form,
  name,
  label,
  placeholder,
  type = "text",
  validators,
  optional = false,
  className,
}: FormTextFieldProps) {
  return (
    <form.Field name={name} validators={validators}>
      {(field: AnyFieldApi) => {
        const hasError = field.state.meta.errors.length > 0;

        return (
          <div className={cn("flex flex-col gap-1.5", className)}>
            <label htmlFor={field.name} className='text-neutral-06 text-base font-medium'>
              {label}{" "}
              {optional && <span className='text-neutral-04 ml-1 font-normal'>(optional)</span>}
            </label>
            <Input
              id={field.name}
              type={type}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder={placeholder}
              className={
                hasError
                  ? "border-danger-400 focus-visible:border-danger-400 focus-visible:ring-danger-400/30"
                  : ""
              }
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

export function PersonalInfoStep({ defaultValues, onContinue }: Props) {
  const form = useForm({
    defaultValues,
    onSubmit: ({ value }) => onContinue(value),
  });

  return (
    <div>
      <div className='mb-8'>
        <h1 className='text-neutral-07 mb-2 text-3xl font-medium'>Create an Account</h1>
        <p className='text-neutral-06 text-base'>Fill in the fields below to create an account.</p>
      </div>

      <StepHeader
        icon={<UserIcon className='text-primary-04 h-5 w-5' />}
        title='Personal Information'
      />

      <form noValidate onSubmit={(e) => e.preventDefault()}>
        <div className='space-y-5'>
          <FormTextField
            form={form}
            name='profileLabel'
            label='What role are you applying for?'
            placeholder='e.g. Product Designer, Software Engineer'
          />

          <div className='grid grid-cols-2 gap-4'>
            <FormTextField
              form={form}
              name='email'
              label='Email address'
              type='email'
              placeholder='Enter your email address'
              validators={{
                onSubmit: ({ value }: { value: string }) => {
                  if (!value) return "Email is required";
                  if (!emailRegex.test(value)) return "Enter a valid email address";
                },
              }}
            />

            {/* Phone — composite: code select + Shadcn Input */}
            <div className='flex flex-col gap-1.5'>
              <label className='text-neutral-06 text-base font-medium'>Phone number</label>
              <div className='border-neutral-02 focus-within:border-brand-accent focus-within:ring-brand-accent/30 flex items-stretch overflow-hidden rounded-lg border bg-white transition-colors focus-within:ring-2'>
                <form.Field name='phoneCode'>
                  {(field: AnyFieldApi) => (
                    <Select value={field.state.value} onValueChange={field.handleChange}>
                      <SelectTrigger className='border-neutral-02 bg-neutral-01 text-neutral-06 !h-auto w-auto shrink-0 cursor-pointer rounded-none border-0 border-r text-base shadow-none focus-visible:ring-0'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PHONE_CODES.map((p) => (
                          <SelectItem key={p.code} value={p.code}>
                            {p.code}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </form.Field>
                <form.Field name='phone'>
                  {(field) => (
                    <Input
                      type='tel'
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      placeholder='Enter your phone number'
                      className='h-auto flex-1 rounded-none border-0 bg-transparent px-4 py-3 text-base shadow-none focus-visible:ring-0'
                    />
                  )}
                </form.Field>
              </div>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <FormTextField
              form={form}
              name='firstName'
              label='First name'
              placeholder='Enter your first name'
            />
            <FormTextField
              form={form}
              name='lastName'
              label='Last name'
              placeholder='Enter your last name'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <form.Field name='country'>
              {(field) => (
                <div className='flex flex-col gap-1.5'>
                  <label className='text-neutral-06 text-base font-medium'>Country</label>
                  <Select value={field.state.value} onValueChange={field.handleChange}>
                    <SelectTrigger
                      className='data-placeholder:text-neutral-04 w-full data-placeholder:text-sm'
                      size='lg'
                    >
                      <SelectValue placeholder='Select a country' />
                    </SelectTrigger>
                    <SelectContent className='h-full'>
                      {COUNTRIES.map((code) => (
                        <SelectItem key={code} value={code}>
                          {code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <FormTextField
              form={form}
              name='state'
              label='State'
              placeholder='What state do you stay in?'
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <FormTextField
              form={form}
              name='city'
              label='City'
              placeholder="What's the name of your city?"
            />
            <FormTextField
              form={form}
              name='postalCode'
              label='Postal code'
              placeholder='Enter your postal code'
            />
          </div>

          <FormTextField
            form={form}
            name='address'
            label='House address'
            placeholder="What's your street name & house number?"
          />

          <FormTextField
            form={form}
            name='website'
            label='Website URL'
            type='url'
            placeholder='Please enter the URL of your general website'
            optional
          />
        </div>

        <form.Subscribe
          selector={(s) =>
            !!s.values.email &&
            !!s.values.firstName &&
            !!s.values.lastName &&
            !!s.values.profileLabel
          }
        >
          {(isValid) => <StepFooter onContinue={form.handleSubmit} continueDisabled={!isValid} />}
        </form.Subscribe>
      </form>
    </div>
  );
}
