import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepFooterProps {
  onBack?: () => void;
  onContinue: () => void;
  onSkip?: () => void;
  continueDisabled?: boolean;
  continueLabel?: string;
}

export function StepFooter({
  onBack,
  onContinue,
  onSkip,
  continueDisabled,
  continueLabel = "Continue",
}: StepFooterProps) {
  return (
    <div className='mt-10 flex items-center gap-3'>
      {onBack && (
        <Button
          type='button'
          variant='ghost'
          onClick={onBack}
          aria-label='Go back'
          className='gap-1 text-gray-500 hover:text-gray-800'
        >
          <ChevronLeft className='h-5 w-5' />
          <span className='text-sm font-semibold'>Back</span>
        </Button>
      )}
      <Button
        type='button'
        onClick={onContinue}
        disabled={continueDisabled}
        className='bg-brand-accent hover:bg-brand-600 disabled:bg-brand-accent/40 cursor-pointer px-8 py-3 text-white disabled:cursor-not-allowed'
        size='lg'
      >
        {continueLabel}
      </Button>
      {onSkip && (
        <Button
          type='button'
          variant='outline'
          onClick={onSkip}
          className='bg-neutral-01 text-neutral-06 border-neutral-02 cursor-pointer px-8 py-3'
          size='lg'
        >
          Skip this
        </Button>
      )}
    </div>
  );
}
