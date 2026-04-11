import { AnimatePresence, motion } from "framer-motion";
import patternBg from "../../../assets/svgs/pattern-background.svg";
import noisePng from "../../../assets/img/noise.png";
import { PersonalInfoIllustration } from "../../../assets/illustrations/PersonalInfoIllustration";
import { ProfessionalInfoIllustration } from "../../../assets/illustrations/ProfessionalInfoIllustration";
import { WorkExperienceIllustration } from "../../../assets/illustrations/WorkExperienceIllustration";
import { CertificateIllustration } from "../../../assets/illustrations/CertificateIllustration";

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
    <aside className='relative w-[500px] shrink-0 bg-[#4640DE] flex flex-col overflow-hidden rounded-[20px] m-5'>
      {/* Layer 1 — line pattern */}
      <div
        className='absolute inset-0 pointer-events-none select-none'
        style={{
          backgroundImage: `url(${patternBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Layer 2 — noise overlay */}
      <div
        aria-hidden='true'
        className='absolute inset-0 pointer-events-none select-none'
        style={{
          backgroundImage: `url(${noisePng})`,
          backgroundRepeat: "repeat",
          opacity: 0.11,
        }}
      />

      {/* Content */}
      <div className='relative z-10 flex flex-col h-full px-10 py-8'>
        {/* Brand */}
        <div className='flex items-center gap-2 mb-14'>
          <div className='w-5 h-5 rounded-[4px] bg-white/90 flex items-center justify-center shrink-0'>
            <div className='w-2 h-2 bg-[#4640DE] rounded-[1px]' />
          </div>
          <span className='text-white text-lg font-semibold tracking-tight'>JobMate AI</span>
        </div>

        {/* Headline */}
        <div className='mb-10'>
          <h1 className='text-neutral-01 text-xl leading-tight mb-3'>Welcome to JobMate AI</h1>
          <p className='text-white/70 text-sm leading-relaxed'>
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
                    animate={
                      isCompleted || isActive
                        ? { backgroundColor: "#ffffff", borderColor: "#ffffff", scale: 1 }
                        : {
                            backgroundColor: "transparent",
                            borderColor: "rgba(255,255,255,0.4)",
                            scale: 1,
                          }
                    }
                    transition={{ duration: 0.3 }}
                    className='w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold shrink-0'
                    style={{ color: isCompleted || isActive ? "#4640DE" : "rgba(255,255,255,0.5)" }}
                  >
                    <AnimatePresence mode='wait' initial={false}>
                      {isCompleted ? (
                        <motion.svg
                          key='check'
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className='w-4 h-4'
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
                    <div className='relative w-0.5  min-h-[70px] bg-white/25 overflow-hidden'>
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
                    animate={{ opacity: isActive || isCompleted ? 1 : 0.5 }}
                    transition={{ duration: 0.3 }}
                    className='text-sm font-semibold leading-tight text-white'
                  >
                    {step.title}
                  </motion.p>
                  <motion.p
                    animate={{ opacity: isActive || isCompleted ? 0.7 : 0.35 }}
                    transition={{ duration: 0.3 }}
                    className='text-xs mt-0.5 leading-relaxed text-white'
                  >
                    {step.desc}
                  </motion.p>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Illustration */}
        <div className='mt-auto rounded-2xl overflow-hidden'>
          <AnimatePresence mode='wait' initial={false}>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <StepIllustration className='w-full h-auto' />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
}
