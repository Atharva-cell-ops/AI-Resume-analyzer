import React, { useState } from 'react';
import { useResume } from '../context/ResumeContext';
import { WizardHeader } from '../components/builder/WizardHeader';
import { StepNavigation } from '../components/builder/StepNavigation';
import { LivePreview } from '../components/builder/LivePreview';

import { PersonalInfoForm } from '../components/builder/forms/PersonalInfoForm';
import { SummaryForm } from '../components/builder/forms/SummaryForm';
import { ExperienceForm } from '../components/builder/forms/ExperienceForm';
import { EducationForm } from '../components/builder/forms/EducationForm';
import { ProjectsForm } from '../components/builder/forms/ProjectsForm';
import { SkillsForm } from '../components/builder/forms/SkillsForm';
import { CertificationsForm } from '../components/builder/forms/CertificationsForm';
import { AchievementsForm } from '../components/builder/forms/AchievementsForm';

import { Edit3, Eye } from 'lucide-react';

export const ResumeBuilderPage: React.FC = () => {
  const { currentStep } = useResume();
  const [mobileTab, setMobileTab] = useState<'form' | 'preview'>('form');

  const renderCurrentForm = () => {
    switch (currentStep) {
      case 0:
        return <PersonalInfoForm />;
      case 1:
        return <SummaryForm />;
      case 2:
        return <ExperienceForm />;
      case 3:
        return <EducationForm />;
      case 4:
        return <ProjectsForm />;
      case 5:
        return <SkillsForm />;
      case 6:
        return <CertificationsForm />;
      case 7:
        return <AchievementsForm />;
      default:
        return <PersonalInfoForm />;
    }
  };

  return (
    <div className="flex flex-col flex-1">
      {/* Wizard Header Bar */}
      <WizardHeader />

      {/* Mobile Tab Toggle */}
      <div className="lg:hidden flex border-b border-slate-200 bg-white p-2">
        <button
          type="button"
          onClick={() => setMobileTab('form')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
            mobileTab === 'form' ? 'bg-indigo-600 text-white font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Edit3 className="w-4 h-4" /> Edit Content
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
            mobileTab === 'preview' ? 'bg-indigo-600 text-white font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Eye className="w-4 h-4" /> Live Preview
        </button>
      </div>

      {/* Side-by-Side Builder Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 max-w-[1600px] w-full mx-auto">
        {/* Form Column (7 cols on lg) */}
        <div
          className={`lg:col-span-7 flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs ${
            mobileTab === 'preview' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          <div>{renderCurrentForm()}</div>
          <StepNavigation />
        </div>

        {/* Live Preview Column (5 cols on lg, sticky) */}
        <div
          className={`lg:col-span-5 sticky top-40 h-[calc(100vh-180px)] ${
            mobileTab === 'form' ? 'hidden lg:block' : 'block h-[85vh]'
          }`}
        >
          <LivePreview />
        </div>
      </div>
    </div>
  );
};

