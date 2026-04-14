import React from "react";
import {
  AddIcon,
  AiPenIcon,
  FormSparkleIcon,
  TargetIcon,
  FileIcon,
  BrainIcon,
} from "../assets/svg/icons";

interface QuickAction {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  iconColor: string;
  iconBg: string;
}

interface QuickActionsProps {
  onAutoFill: () => void;
  onGenerateCoverLetter: () => void;
  onAnalyzeJobFit: () => void;
  onTrackApplication: () => void;
  onTailorResume: () => void;
  onGenerateAnswer: () => void;
  isLoading: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onAutoFill,
  onGenerateCoverLetter,
  onAnalyzeJobFit,
  onTrackApplication,
  onTailorResume,
  onGenerateAnswer,
  isLoading,
}) => {
  const actions: QuickAction[] = [
    {
      icon: FormSparkleIcon,
      label: "Auto Fill Form",
      onClick: onAutoFill,
      disabled: isLoading,
      iconColor: "text-[#1C4ED8]",
      iconBg: "bg-[#BFDBFE] dark:bg-[#152245]",
    },
    {
      icon: FileIcon,
      label: "Generate Cover Letter",
      onClick: onGenerateCoverLetter,
      iconColor: "text-[#3BA44F]",
      iconBg: "bg-[#C3F7D2] dark:bg-[#122A29]",
    },
    {
      icon: TargetIcon,
      label: "Analyze Job Fit",
      onClick: onAnalyzeJobFit,
      iconColor: "text-[#C2410B]",
      iconBg: "bg-[#FED7AA] dark:bg-[#302120]",
    },
    {
      icon: AddIcon,
      label: "Track This Application",
      onClick: onTrackApplication,
      disabled: isLoading,
      iconColor: "text-[#B91C1C]",
      iconBg: "bg-[#FCA5A5]",
    },
    {
      icon: AiPenIcon,
      label: "Tailor Resume",
      onClick: onTailorResume,
      iconColor: "text-[#7E22CE]",
      iconBg: "bg-[#E9D5FF]",
    },
    {
      icon: BrainIcon,
      label: "Generate Answer",
      onClick: onGenerateAnswer,
      iconColor: "text-[#0E7490]",
      iconBg: "bg-[#A5F3FC]",
    },
  ];

  return (
    <div className='quick-actions-control'>
      <h3 className='text-primary-text font-poppins mb-1.5 pl-2 text-base font-medium'>
        Quick Actions
      </h3>

      <div className='bg-foreground border-brand-border mb-4 grid grid-cols-3 gap-4 rounded-[10px] border px-3 py-4'>
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            disabled={action.disabled}
            className='btn-primary'
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full p-[4.5px] ${action.iconBg}`}
              style={{ boxShadow: "inset 0px 1px 3px rgba(0, 0, 0, 0.1)" }}
            >
              <action.icon className={`h-6 w-6 ${action.iconColor}`} />
            </div>
            <span className='my-1 block text-xs font-medium'>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
