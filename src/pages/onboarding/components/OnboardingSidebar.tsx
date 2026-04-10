import patternBg from "../../../assets/svgs/pattern-background.svg";

const STEPS = [
  { n: 1, title: "Personal Info",               desc: "Provide your personal information." },
  { n: 2, title: "Certificates & Credentials",  desc: "Upload your academic/non-academic certificates." },
  { n: 3, title: "Professional Info",           desc: "Provide your professional information." },
  { n: 4, title: "Work Experience",             desc: "Tell us more about what you've worked on." },
];

interface Props {
  currentStep: number;
}

export function OnboardingSidebar({ currentStep }: Props) {
  return (
    <aside className="relative w-[420px] shrink-0 bg-[#4640DE] flex flex-col overflow-hidden">
      {/* Pattern background */}
      <img
        src={patternBg}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none select-none"
      />

      <div className="relative z-10 flex flex-col h-full px-10 py-10">
        {/* Brand */}
        <div className="flex items-center gap-2 mb-14">
          <div className="w-5 h-5 rounded-[4px] bg-white/90 flex items-center justify-center shrink-0">
            <div className="w-2 h-2 bg-[#4640DE] rounded-[1px]" />
          </div>
          <span className="text-white text-lg font-semibold tracking-tight">JobMate AI</span>
        </div>

        {/* Headline */}
        <div className="mb-10">
          <h1 className="text-white text-3xl font-bold leading-tight mb-3">
            Welcome to JobMate AI
          </h1>
          <p className="text-white/70 text-sm leading-relaxed">
            Follow the steps to create an account and get started.
          </p>
        </div>

        {/* Step list */}
        <nav className="flex flex-col gap-0">
          {STEPS.map((step, i) => {
            const isActive    = step.n === currentStep;
            const isCompleted = step.n < currentStep;
            const isLast      = i === STEPS.length - 1;

            return (
              <div key={step.n} className="flex gap-4">
                {/* Indicator column */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold shrink-0 transition-colors ${
                      isCompleted
                        ? "bg-white border-white text-[#4640DE]"
                        : isActive
                        ? "bg-white border-white text-[#4640DE]"
                        : "bg-transparent border-white/40 text-white/50"
                    }`}
                  >
                    {step.n}
                  </div>
                  {!isLast && (
                    <div
                      className={`w-0.5 flex-1 my-1 min-h-[28px] ${
                        isCompleted ? "bg-white" : "bg-white/25"
                      }`}
                    />
                  )}
                </div>

                {/* Text */}
                <div className="pb-7">
                  <p
                    className={`text-sm font-semibold leading-tight ${
                      isActive || isCompleted ? "text-white" : "text-white/50"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p
                    className={`text-xs mt-0.5 ${
                      isActive || isCompleted ? "text-white/70" : "text-white/35"
                    }`}
                  >
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Illustration card */}
        <div className="mt-auto bg-white/10 border border-white/20 rounded-2xl p-6 flex items-center justify-center min-h-[180px]">
          {/* Decorative placeholder that matches design spirit */}
          <div className="relative w-full flex items-end justify-center gap-4">
            {/* Floating lines */}
            <div className="absolute left-4 top-2 flex flex-col gap-2 opacity-50">
              <div className="h-0.5 w-12 bg-white/60 rounded" />
              <div className="h-0.5 w-8 bg-white/40 rounded" />
              <div className="h-0.5 w-14 bg-white/30 rounded" />
            </div>
            {/* Central figure silhouette */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-white/30 border-2 border-white/50" />
              <div className="w-16 h-20 rounded-t-xl bg-white/20 border-2 border-white/40" />
            </div>
            {/* Floating dots */}
            <div className="absolute right-4 bottom-4 flex gap-2 opacity-60">
              <div className="w-2 h-2 rounded-full bg-white/50" />
              <div className="w-2 h-2 rounded-full bg-white/30" />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
