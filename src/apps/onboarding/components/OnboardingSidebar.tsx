import { AnimatePresence, motion } from "framer-motion";
import BrandBgPattern from "@/assets/svg/brand-bg-pattern.svg";
import noisePng from "@/assets/img/noise.png";
import { PersonalInfoIllustration } from "@/assets/svg/illustrations/PersonalInfoIllustration";
import { ProfessionalInfoIllustration } from "@/assets/svg/illustrations/ProfessionalInfoIllustration";
import { WorkExperienceIllustration } from "@/assets/svg/illustrations/WorkExperienceIllustration";
import { CertificateIllustration } from "@/assets/svg/illustrations/CertificateIllustration";

const STEP_ILLUSTRATIONS = [
  PersonalInfoIllustration,
  ProfessionalInfoIllustration,
  WorkExperienceIllustration,
  CertificateIllustration,
];

const STEPS = [
  { n: 1, title: "Personal Info", desc: "Provide your personal information." },
  { n: 2, title: "Professional Info", desc: "Provide your professional information." },
  { n: 3, title: "Work Experience", desc: "Tell us more about what you've worked on." },
  {
    n: 4,
    title: "Certificates & Credentials",
    desc: "Upload your academic/non-academic certificates.",
  },
];

interface Props {
  currentStep: number;
}

export function OnboardingSidebar({ currentStep }: Props) {
  const StepIllustration = STEP_ILLUSTRATIONS[currentStep - 1];

  return (
    <aside className='relative my-5 ml-8 flex w-[500px] shrink-0 flex-col overflow-hidden rounded-[20px] bg-[#4640DE]'>
      {/* Layer 1 — line pattern */}
      <div
        className='pointer-events-none absolute inset-0 select-none'
        style={{
          backgroundImage: `url(${BrandBgPattern})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Layer 2 — noise overlay */}
      <div
        aria-hidden='true'
        className='pointer-events-none absolute inset-0 select-none'
        style={{
          backgroundImage: `url(${noisePng})`,
          backgroundRepeat: "repeat",
          opacity: 0.11,
        }}
      />

      {/* Content */}
      <div className='relative z-10 flex h-full flex-col px-10 py-8'>
        {/* Brand */}
        <div className='mb-14 flex items-center gap-2'>
          <div className='flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] bg-white/90'>
            <div className='h-2 w-2 rounded-[1px] bg-[#4640DE]' />
          </div>
          <span className='text-lg font-semibold tracking-tight text-white'>JobMate AI</span>
        </div>

        {/* Headline */}
        <div className='mb-10'>
          <h1 className='text-neutral-01 mb-3 text-xl leading-tight'>Welcome to JobMate AI</h1>
          <p className='text-neutral-01 text-base leading-relaxed font-normal'>
            Follow the steps to create an account and get started.
          </p>
        </div>

        {/* Step list */}
        <nav className='flex flex-col gap-0'>
          {STEPS.map((step, i) => {
            const isActive = step.n === currentStep;
            const isCompleted = step.n < currentStep;
            const isLast = i === STEPS.length - 1;

            return (
              <div key={step.n} className='flex gap-4'>
                {/* Indicator column */}
                <div className='flex flex-col items-center'>
                  {/* Circle */}
                  <motion.div
                    initial={
                      isCompleted || isActive
                        ? {
                            backgroundColor: "#ffffff",
                            borderColor: "#ffffff",
                            scale: 1,
                            color: "#4640DE",
                          }
                        : {
                            backgroundColor: "rgba(255, 255, 255, 0)",
                            borderColor: "rgba(255,255,255,0.4)",
                            scale: 1,
                            color: "rgba(255,255,255,0.5)",
                          }
                    }
                    animate={
                      isCompleted || isActive
                        ? {
                            backgroundColor: "#ffffff",
                            borderColor: "#ffffff",
                            scale: 1,
                            color: "#4640DE",
                          }
                        : {
                            backgroundColor: "rgba(255, 255, 255, 0)",
                            borderColor: "rgba(255,255,255,0.4)",
                            scale: 1,
                            color: "rgba(255,255,255,0.5)",
                          }
                    }
                    transition={{ duration: 0.3, delay: isActive && !isCompleted ? 0.4 : 0 }}
                    className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold'
                  >
                    <AnimatePresence mode='wait' initial={false}>
                      {isCompleted ? (
                        // checkmark for completed steps
                        <motion.svg
                          key='check'
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{
                            duration: 0.2,
                          }}
                          className='h-4 w-4'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2.5}
                            d='M5 13l4 4L19 7'
                          />
                        </motion.svg>
                      ) : (
                        <motion.span
                          key='number'
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          {step.n}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Connector line */}
                  {!isLast && (
                    <div className='relative min-h-[70px] w-0.5 overflow-hidden bg-white/25'>
                      <motion.div
                        className='absolute inset-x-0 top-0 bg-white'
                        initial={{ height: 0 }}
                        animate={{ height: isCompleted ? "100%" : 0 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                      />
                    </div>
                  )}
                </div>

                {/* Text */}
                <div className='pb-8'>
                  <motion.p
                    initial={{ opacity: isActive || isCompleted ? 1 : 0.5 }}
                    animate={{ opacity: isActive || isCompleted ? 1 : 0.5 }}
                    transition={{ duration: 0.1, delay: isActive && !isCompleted ? 0.5 : 0 }}
                    className='text-neutral-01 text-base leading-tight font-semibold'
                  >
                    {step.title}
                  </motion.p>
                  <motion.p
                    initial={{ opacity: isActive || isCompleted ? 0.7 : 0.35 }}
                    animate={{ opacity: isActive || isCompleted ? 0.7 : 0.35 }}
                    transition={{ duration: 0.1, delay: isActive && !isCompleted ? 0.5 : 0 }}
                    className='text-neutral-02 mt-0.5 text-xs leading-relaxed'
                  >
                    {step.desc}
                  </motion.p>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Illustration */}
        <div className='mt-auto rounded-2xl'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0, x: 100, y: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -60, y: 30 }}
              transition={{ type: "spring", stiffness: 200, damping: 24 }}
            >
              <StepIllustration className='h-auto w-full' />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
}
