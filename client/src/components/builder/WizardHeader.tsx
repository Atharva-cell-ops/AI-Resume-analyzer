import React from 'react';
import { useResume } from '../../context/ResumeContext';
import {
  User,
  FileText,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Wrench,
  Award,
  Trophy,
  Check,
  CloudUpload,
  RefreshCw,
  Trash2,
  Sparkles
} from 'lucide-react';

export const WIZARD_STEPS = [
  { id: 0, label: 'Personal', icon: User },
  { id: 1, label: 'Summary', icon: FileText },
  { id: 2, label: 'Experience', icon: Briefcase },
  { id: 3, label: 'Education', icon: GraduationCap },
  { id: 4, label: 'Projects', icon: FolderGit2 },
  { id: 5, label: 'Skills', icon: Wrench },
  { id: 6, label: 'Certs', icon: Award },
  { id: 7, label: 'Honors', icon: Trophy }
];

export const WizardHeader: React.FC = () => {
  const { currentStep, setCurrentStep, saveStatus, resumeTitle, setResumeTitle, clearAllData, loadSampleData } = useResume();

  const progressPercent = Math.round(((currentStep + 1) / WIZARD_STEPS.length) * 100);

  return (
    <div className="bg-white/95 border-b border-slate-200 px-4 sm:px-6 py-3.5 sticky top-16 z-30 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
        {/* Resume Title Input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={resumeTitle}
            onChange={(e) => setResumeTitle(e.target.value)}
            className="bg-transparent text-base font-bold text-slate-900 hover:bg-slate-100 focus:bg-white px-2.5 py-1 rounded-lg border border-transparent focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
            placeholder="Resume Title"
          />
        </div>

        {/* Quick Actions & Autosave Status */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Clear all resume fields to a blank canvas?')) {
                clearAllData();
              }
            }}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-200 px-2.5 py-1 rounded-lg transition"
            title="Clear all fields"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">Clear Blank</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Load sample professional data into the builder?')) {
                loadSampleData();
              }
            }}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-lg transition"
            title="Load sample demo data"
          >
            <Sparkles className="w-3 h-3 text-indigo-600" />
            <span className="hidden sm:inline">Load Sample</span>
          </button>

          {/* Autosave Status Badge */}
          {saveStatus === 'saving' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving draft...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              <Check className="w-3.5 h-3.5" /> Autosaved
            </span>
          )}
          {saveStatus === 'unsaved' && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
              <CloudUpload className="w-3.5 h-3.5" /> Unsaved draft
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mb-3 border border-slate-200/40">
        <div
          className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Steps Navigation Bar */}
      <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-1 pt-0.5">
        {WIZARD_STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setCurrentStep(step.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : isCompleted
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100/70'
                  : 'bg-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{step.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

