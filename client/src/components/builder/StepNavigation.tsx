import React from 'react';
import { useResume } from '../../context/ResumeContext';
import { WIZARD_STEPS } from './WizardHeader';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

export const StepNavigation: React.FC = () => {
  const { currentStep, setCurrentStep } = useResume();

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === WIZARD_STEPS.length - 1;

  return (
    <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-8">
      <button
        type="button"
        disabled={isFirstStep}
        onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
        className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none text-slate-700 hover:text-slate-900 rounded-lg text-xs font-semibold shadow-xs transition"
      >
        <ChevronLeft className="w-4 h-4" /> Previous Step
      </button>

      <span className="text-xs text-slate-500 font-medium">
        Step {currentStep + 1} of {WIZARD_STEPS.length}
      </span>

      {!isLastStep ? (
        <button
          type="button"
          onClick={() => setCurrentStep(Math.min(WIZARD_STEPS.length - 1, currentStep + 1))}
          className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
        >
          Next Step <ChevronRight className="w-4 h-4" />
        </button>
      ) : (
        <div className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold">
          <Check className="w-4 h-4" /> All Steps Filled!
        </div>
      )}
    </div>
  );
};

