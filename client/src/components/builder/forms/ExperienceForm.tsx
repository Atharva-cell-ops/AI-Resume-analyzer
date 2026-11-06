import React from 'react';
import { useResume } from '../../../context/ResumeContext';
import { Briefcase, Plus, Trash2, ArrowUp, ArrowDown, Sparkles } from 'lucide-react';
import { PerBulletHelper } from '../PerBulletHelper';

export const ExperienceForm: React.FC = () => {
  const {
    resumeData,
    addExperience,
    updateExperience,
    removeExperience,
    reorderExperience,
    addExperienceBullet,
    updateExperienceBullet,
    removeExperienceBullet
  } = useResume();

  const { experience } = resumeData;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" /> Work Experience
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            List your roles in reverse chronological order. Use action verbs and quantifiable metrics for high ATS scoring.
          </p>
        </div>
        <button
          type="button"
          onClick={addExperience}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" /> Add Role
        </button>
      </div>

      {experience.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-300 rounded-2xl bg-slate-50">
          <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No work experience entries yet.</p>
          <button
            type="button"
            onClick={addExperience}
            className="mt-3 text-xs text-indigo-600 font-semibold hover:underline"
          >
            + Add your first work experience
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {experience.map((exp, expIdx) => (
            <div
              key={exp.id}
              className="p-5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-4 hover:border-slate-300 transition"
            >
              {/* Card Header & Reordering Controls */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="font-semibold text-slate-900 text-sm">
                  Role #{expIdx + 1}: {exp.position || 'Untitled Role'}{' '}
                  {exp.company ? `at ${exp.company}` : ''}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={expIdx === 0}
                    onClick={() => reorderExperience(expIdx, expIdx - 1)}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={expIdx === experience.length - 1}
                    onClick={() => reorderExperience(expIdx, expIdx + 1)}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeExperience(exp.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition ml-1"
                    title="Delete Role"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Position and Company Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Job Title / Position <span className="text-indigo-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={exp.position}
                    onChange={(e) => updateExperience(exp.id, { position: e.target.value })}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-2xs transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company Name <span className="text-indigo-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, { company: e.target.value })}
                    placeholder="e.g. Google / Microsoft / Acme Corp"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-2xs transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={exp.location || ''}
                    onChange={(e) => updateExperience(exp.id, { location: e.target.value })}
                    placeholder="San Francisco, CA or Remote"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-2xs transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(exp.id, { startDate: e.target.value })}
                      placeholder="e.g. 2022"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-2xs transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="text"
                      disabled={exp.current}
                      value={exp.current ? 'Present' : exp.endDate}
                      onChange={(e) => updateExperience(exp.id, { endDate: e.target.value })}
                      placeholder="e.g. 2024"
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 disabled:opacity-40 shadow-2xs transition"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id={`current-${exp.id}`}
                  checked={exp.current || false}
                  onChange={(e) => updateExperience(exp.id, { current: e.target.checked, endDate: e.target.checked ? 'Present' : '' })}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor={`current-${exp.id}`} className="text-xs text-slate-600 cursor-pointer">
                  I currently work here
                </label>
              </div>

              {/* Bullet Points with Inline Helper */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Key Accomplishments (Bullet Points)
                  </label>
                  <button
                    type="button"
                    onClick={() => addExperienceBullet(exp.id)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition"
                  >
                    + Add Bullet
                  </button>
                </div>

                <div className="space-y-3">
                  {exp.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
                      <div className="flex items-start gap-2">
                        <span className="text-slate-400 text-xs font-mono pt-2">#{bIdx + 1}</span>
                        <textarea
                          rows={2}
                          value={bullet}
                          onChange={(e) => updateExperienceBullet(exp.id, bIdx, e.target.value)}
                          placeholder="Architected, engineered, or deployed..."
                          className="flex-1 bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 resize-y transition shadow-2xs"
                        />
                        {exp.bullets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeExperienceBullet(exp.id, bIdx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                            title="Remove Bullet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Per-Bullet Helper Component */}
                      <PerBulletHelper
                        bulletText={bullet}
                        onApplyRewrite={(newText) => updateExperienceBullet(exp.id, bIdx, newText)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

