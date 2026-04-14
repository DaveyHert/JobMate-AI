import { Field, Input, Select, StepHeader, StepFooter } from "../components/OnboardingPrimitives";
import { UserIcon } from "@/assets/svg/icons";

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
  data: PersonalInfoData;
  onChange: (data: PersonalInfoData) => void;
  onContinue: () => void;
}

const PHONE_CODES = [
  { code: "+1", label: "+1  (US/CA)" },
  { code: "+44", label: "+44 (UK)" },
  { code: "+234", label: "+234 (NG)" },
  { code: "+27", label: "+27 (ZA)" },
  { code: "+49", label: "+49 (DE)" },
  { code: "+33", label: "+33 (FR)" },
  { code: "+91", label: "+91 (IN)" },
  { code: "+61", label: "+61 (AU)" },
  { code: "+55", label: "+55 (BR)" },
  { code: "+971", label: "+971 (AE)" },
];

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
  "New Zealand",
  "Ireland",
  "Portugal",
  "Spain",
  "Italy",
  "Poland",
  "Ukraine",
  "Pakistan",
  "Bangladesh",
  "Philippines",
  "Indonesia",
  "Malaysia",
  "Mexico",
  "Argentina",
  "Chile",
  "Colombia",
];

const set =
  (data: PersonalInfoData, onChange: Props["onChange"]) =>
  (k: keyof PersonalInfoData) =>
  (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...data, [k]: e.target.value });

export function PersonalInfoStep({ data, onChange, onContinue }: Props) {
  const s = set(data, onChange);
  const isValid = !!data.email && !!data.firstName && !!data.lastName && !!data.profileLabel;

  return (
    <div>
      <div className='mb-8'>
        <h1 className='mb-2 text-3xl font-bold text-gray-900'>Create an Account</h1>
        <p className='text-sm text-gray-500'>Fill in the fields below to create an account.</p>
      </div>

      <StepHeader
        icon={<UserIcon className='text-primary-04 h-5 w-5' />}
        title='Personal Information'
      />

      <div className='space-y-5'>
        {/* Profile label — collected here so sidebar steps 2-4 can show it */}
        <Field label='What role are you applying for?'>
          <Input
            value={data.profileLabel}
            onChange={s("profileLabel")}
            placeholder='e.g. Product Designer, Software Engineer'
          />
        </Field>

        <div className='grid grid-cols-2 gap-4'>
          <Field label='Email address'>
            <Input
              type='email'
              value={data.email}
              onChange={s("email")}
              placeholder='Enter your email address'
            />
          </Field>

          <Field label='Phone number'>
            <div className='focus-within:ring-brand-accent/30 focus-within:border-brand-accent flex items-stretch overflow-hidden rounded-lg border border-gray-200 bg-white transition-colors focus-within:ring-2'>
              <select
                value={data.phoneCode}
                onChange={s("phoneCode")}
                className='bg-neutral-01 shrink-0 cursor-pointer appearance-none border-r border-gray-200 py-3 pl-3 text-sm text-gray-900 focus:outline-none'
                style={{
                  paddingRight: "28px",
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 6px center",
                  backgroundSize: "14px",
                }}
              >
                {PHONE_CODES.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.code}
                  </option>
                ))}
              </select>
              <input
                type='tel'
                value={data.phone}
                onChange={s("phone")}
                placeholder='Enter your phone number'
                className='min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none'
              />
            </div>
          </Field>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <Field label='First name'>
            <Input
              value={data.firstName}
              onChange={s("firstName")}
              placeholder='Enter your first name'
            />
          </Field>
          <Field label='Last name'>
            <Input
              value={data.lastName}
              onChange={s("lastName")}
              placeholder='Enter your last name'
            />
          </Field>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <Field label='Country'>
            <Select value={data.country} onChange={s("country")}>
              <option value=''>Select a country</option>
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
          <Field label='State'>
            <Input
              value={data.state}
              onChange={s("state")}
              placeholder='What state do you stay in?'
            />
          </Field>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <Field label='City'>
            <Input
              value={data.city}
              onChange={s("city")}
              placeholder="What's the name of your city?"
            />
          </Field>
          <Field label='Postal code'>
            <Input
              value={data.postalCode}
              onChange={s("postalCode")}
              placeholder='Enter your postal code'
            />
          </Field>
        </div>

        <Field label='House address'>
          <Input
            value={data.address}
            onChange={s("address")}
            placeholder="What's your street name & house number?"
          />
        </Field>

        <Field label='Website URL' optional>
          <Input
            type='url'
            value={data.website}
            onChange={s("website")}
            placeholder='Please enter the URL of your general website'
          />
        </Field>
      </div>

      <StepFooter onContinue={onContinue} continueDisabled={!isValid} />
    </div>
  );
}
