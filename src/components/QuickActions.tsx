import React from "react";
import { Eye, Target, PenTool, Brain, FileText } from "lucide-react";

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
      icon: Eye,
      label: "Auto Fill Form",
      onClick: onAutoFill,
      disabled: isLoading,
      iconColor: "text-[#1C4ED8]",
      iconBg: "bg-[#BFDBFE] dark:bg-[#152245]",
    },
    {
      icon: FileText,
      label: "Generate Cover Letter",
      onClick: onGenerateCoverLetter,
      iconColor: "text-[#3BA44F]",
      iconBg: "bg-[#C3F7D2] dark:bg-[#122A29]",
    },
    {
      icon: Target,
      label: "Analyze Job Fit",
      onClick: onAnalyzeJobFit,
      iconColor: "text-[#C2410B]",
      iconBg: "bg-[#FED7AA] dark:bg-[#302120]",
    },
    {
      icon: Target,
      label: "Track This Application",
      onClick: onTrackApplication,
      disabled: isLoading,
      iconColor: "text-[#B91C1C]",
      iconBg: "bg-[#FCA5A5]",
    },
    {
      icon: PenTool,
      label: "Tailor Resume",
      onClick: onTailorResume,
      iconColor: "text-[#7E22CE]",
      iconBg: "bg-[#E9D5FF]",
    },
    {
      icon: Brain,
      label: "Generate Answer",
      onClick: onGenerateAnswer,
      iconColor: "text-[#0E7490]",
      iconBg: "bg-[#A5F3FC]",
    },
  ];

  return (
    <div className='quick-actions-control'>
      <h3 className='text-base pl-2 font-medium mb-1.5 text-[#343435] dark:text-[#F3F4F6] font-poppins'>
        Quick Actions
      </h3>

      <div className='grid grid-cols-3 gap-4 mb-4 bg-white dark:bg-[#1F2937] border dark:border-[#374151] rounded-[10px] px-3 py-4'>
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            disabled={action.disabled}
            className='btn-primary'
          >
            <div
              className={` w-8 h-8 flex items-center justify-center p-1.5 rounded-full  ${action.iconBg}`}
              style={{ boxShadow: "inset 0px 1px 3px rgba(0, 0, 0, 0.1)" }}
            >
              <action.icon className={`w-8 h-8  ${action.iconColor}`} />
            </div>
            <span className='text-xs block my-1 font-medium'>
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
