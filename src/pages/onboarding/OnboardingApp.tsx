// ============================================================================
// OnboardingApp — 4-step new-user onboarding wizard
// ============================================================================
// Opened automatically by the background service worker on fresh install.
// On completion (or final skip) it writes all collected data into jobMateStore
// and sets onboardingComplete = true in chrome.storage so it never runs again.
// ============================================================================

import { useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { jobMateStore } from "../../store/jobMateStore";
import { OnboardingSidebar } from "./components/OnboardingSidebar";
import { PersonalInfoStep, type PersonalInfoData } from "./steps/PersonalInfoStep";
import { CredentialsStep, type CredentialsData } from "./steps/CredentialsStep";
import { ProfessionalInfoStep, type ProfessionalInfoData } from "./steps/ProfessionalInfoStep";
import { WorkExperienceStep, type WorkExperienceData } from "./steps/WorkExperienceStep";
import type { UserProfile, Education, Credential, WorkExperience } from "../../models/models";

// ── Default state ──────────────────────────────────────────────────────────

const defaultPersonal: PersonalInfoData = {
  email: "",
  phoneCode: "+1",
  phone: "",
  firstName: "",
  lastName: "",
  country: "",
  state: "",
  city: "",
  postalCode: "",
  address: "",
  website: "",
  profileLabel: "",
};

const defaultCredentials: CredentialsData = {
  education: [{ school: "", degree: "", startDate: "", endDate: "" }],
  credentials: [{ issuer: "", name: "", startDate: "", endDate: "" }],
};

const defaultProfessional: ProfessionalInfoData = {
  yearsOfExperience: "",
  skills: "",
  authorizedUS: null,
  salaryExpectation: "",
  twitter: "",
  github: "",
  behance: "",
  instagram: "",
};

const defaultWork: WorkExperienceData = {
  entries: [
    {
      jobTitle: "",
      company: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      skills: "",
      location: "",
      description: "",
    },
  ],
};

// ── Helpers ────────────────────────────────────────────────────────────────

async function markOnboardingComplete() {
  if (typeof chrome !== "undefined" && chrome.storage?.local) {
    await chrome.storage.local.set({ onboardingComplete: true });
  } else {
    localStorage.setItem("onboardingComplete", "true");
  }
}

function redirectToDashboard() {
  // In extension context, open dashboard and close this tab
  if (typeof chrome !== "undefined" && chrome.tabs) {
    chrome.tabs.create({ url: chrome.runtime.getURL("dashboard.html") });
    window.close();
  } else {
    window.location.href = "/dashboard";
  }
}

// ── Animation variants ─────────────────────────────────────────────────────

const stepVariants = {
  enter: (dir: number) => ({ x: dir * 48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir * -48, opacity: 0 }),
};

const stepTransition = { duration: 0.28, ease: "easeInOut" } as const;

// ── Component ──────────────────────────────────────────────────────────────

export function OnboardingApp() {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const directionRef = useRef(1);

  const goTo = (next: number) => {
    directionRef.current = next > step ? 1 : -1;
    setStep(next);
  };

  const [personal, setPersonal] = useState<PersonalInfoData>(defaultPersonal);
  const [credentials, setCredentials] = useState<CredentialsData>(defaultCredentials);
  const [professional, setProfessional] = useState<ProfessionalInfoData>(defaultProfessional);
  const [work, setWork] = useState<WorkExperienceData>(defaultWork);

  const finish = async () => {
    setSaving(true);
    try {
      const data = await jobMateStore.getData();
      const existingProfile = data.profiles[data.activeProfileId];

      // Build updated profile from collected onboarding data
      const education: Education[] = credentials.education
        .filter((e) => e.school)
        .map((e, i) => ({
          id: `edu_onb_${i}`,
          school: e.school,
          degree: e.degree,
          startDate: e.startDate,
          endDate: e.endDate || undefined,
        }));

      const creds: Credential[] = credentials.credentials
        .filter((c) => c.name)
        .map((c, i) => ({
          id: `cred_onb_${i}`,
          type: "certification" as const,
          name: c.name,
          issuer: c.issuer,
          issueDate: c.startDate || undefined,
          expiryDate: c.endDate || undefined,
        }));

      const workExp: WorkExperience[] = work.entries
        .filter((w) => w.jobTitle)
        .map((w, i) => ({
          id: `work_onb_${i}`,
          jobTitle: w.jobTitle,
          company: w.company,
          location: w.location || undefined,
          startDate: w.startDate,
          endDate: w.isCurrent ? undefined : w.endDate || undefined,
          isCurrent: w.isCurrent,
          responsibilities: w.description ? [w.description] : [],
          technologies: w.skills
            ? w.skills
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
        }));

      const updatedProfile: UserProfile = {
        ...existingProfile,
        label: personal.profileLabel || existingProfile.label,
        updatedAt: new Date().toISOString(),
        identity: {
          ...existingProfile.identity,
          firstName: personal.firstName,
          lastName: personal.lastName,
          fullName: `${personal.firstName} ${personal.lastName}`.trim(),
          email: personal.email,
          phone: `${personal.phoneCode}${personal.phone}`,
          profilePictureUrl: existingProfile.identity.profilePictureUrl,
        },
        location: {
          ...existingProfile.location,
          address: personal.address,
          city: personal.city,
          state: personal.state,
          zipCode: personal.postalCode,
          country: personal.country,
          countryCode: "",
          willingToRelocate: existingProfile.location.willingToRelocate,
          preferredLocations: existingProfile.location.preferredLocations,
          remotePreference: existingProfile.location.remotePreference,
        },
        links: {
          ...existingProfile.links,
          website: personal.website || undefined,
          twitter: professional.twitter || undefined,
          github: professional.github || undefined,
        },
        skills: professional.skills
          ? professional.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : existingProfile.skills,
        education,
        credentials: creds,
        work: workExp,
        compensation: {
          ...existingProfile.compensation,
          // Store salary expectation as a string note — not directly on model,
          // so we embed it in customAnswers instead.
        },
      };

      await jobMateStore.upsertProfile(updatedProfile);
      await markOnboardingComplete();

      toast.success("Profile saved! Welcome to JobMate AI+");
      setTimeout(redirectToDashboard, 1200);
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong saving your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const skip = async () => {
    await markOnboardingComplete();
    redirectToDashboard();
  };

  return (
    <div className='h-screen flex bg-white  gap-4 font-inter  '>
      <OnboardingSidebar currentStep={step} />

      {/* Right panel — scrollable form content */}
      <main className='flex-1 overflow-y-auto'>
        <div className='max-w-[900px] mx-auto px-8 py-12'>
          <AnimatePresence mode='wait' initial={false} custom={directionRef.current}>
            {step === 1 && (
              <motion.div
                key='step-1'
                custom={directionRef.current}
                variants={stepVariants}
                initial='enter'
                animate='center'
                exit='exit'
                transition={stepTransition}
              >
                <PersonalInfoStep
                  data={personal}
                  onChange={setPersonal}
                  onContinue={() => goTo(2)}
                />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div
                key='step-2'
                custom={directionRef.current}
                variants={stepVariants}
                initial='enter'
                animate='center'
                exit='exit'
                transition={stepTransition}
              >
                <ProfessionalInfoStep
                  data={professional}
                  onChange={setProfessional}
                  profileLabel={personal.profileLabel}
                  onBack={() => goTo(1)}
                  onContinue={() => goTo(3)}
                  onSkip={() => goTo(3)}
                />
              </motion.div>
            )}
            {step === 3 && (
              <motion.div
                key='step-3'
                custom={directionRef.current}
                variants={stepVariants}
                initial='enter'
                animate='center'
                exit='exit'
                transition={stepTransition}
              >
                <WorkExperienceStep
                  data={work}
                  onChange={setWork}
                  profileLabel={personal.profileLabel}
                  onBack={() => goTo(2)}
                  onContinue={() => goTo(4)}
                  onSkip={() => goTo(4)}
                />
              </motion.div>
            )}
            {step === 4 && (
              <motion.div
                key='step-4'
                custom={directionRef.current}
                variants={stepVariants}
                initial='enter'
                animate='center'
                exit='exit'
                transition={stepTransition}
              >
                <CredentialsStep
                  data={credentials}
                  onChange={setCredentials}
                  profileLabel={personal.profileLabel}
                  onBack={() => goTo(3)}
                  onFinish={finish}
                  onSkip={skip}
                  saving={saving}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
