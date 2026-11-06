import React from 'react';
import { useResume } from '../../../context/ResumeContext';
import { FileText, Lightbulb, Check } from 'lucide-react';

export const SummaryForm: React.FC = () => {
  const { resumeData, updateSummary } = useResume();
  const { summary } = resumeData;

  const charCount = summary.length;
  const wordCount = summary.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="border-b border-slate-200 pb-3">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" /> Professional Summary
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          A targeted 3–4 sentence executive summary at the top captures recruiter interest and seeds ATS keyword indexing.
        </p>
      </div>

      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Summary Pitch
          </label>
          <div className="text-xs text-slate-500">
            <span className={wordCount > 65 ? 'text-amber-600 font-semibold' : 'text-slate-600'}>
              {wordCount} words
            </span>{' '}
            / {charCount} chars (Optimal: 40–60 words)
          </div>
        </div>

        <textarea
          rows={5}
          value={summary}
          onChange={(e) => updateSummary(e.target.value)}
          placeholder="e.g. Versatile Senior Full Stack Software Engineer with 5+ years of experience designing high-scale distributed systems and enterprise React applications. Proven track record of reducing latency by 40% and leading high-performing engineering squads..."
          className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition leading-relaxed resize-y shadow-xs"
        />
      </div>

      <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-800">
          <Lightbulb className="w-4 h-4 text-indigo-600" /> ATS Optimization Tips for Summaries:
        </div>
        <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
          <li>State your professional title and years of experience within the first 10 words.</li>
          <li>Mention 3 to 4 core technical competencies directly aligned with your target job description.</li>
          <li>Avoid generic fluff like &ldquo;hard worker looking for a challenging role&rdquo;; lead with quantifiable impact.</li>
        </ul>
      </div>
    </div>
  );
};

