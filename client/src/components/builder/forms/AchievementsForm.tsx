import React from 'react';
import { useResume } from '../../../context/ResumeContext';
import { Trophy, Plus, Trash2 } from 'lucide-react';

export const AchievementsForm: React.FC = () => {
  const { resumeData, addAchievement, updateAchievement, removeAchievement } = useResume();
  const { achievements } = resumeData;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-indigo-600" /> Honors & Achievements
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Awards, hackathon wins, patents, publications, or competitive rankings.
          </p>
        </div>
        <button
          type="button"
          onClick={addAchievement}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" /> Add Honor
        </button>
      </div>

      {achievements.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-300 rounded-2xl bg-slate-50">
          <Trophy className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No achievements added yet.</p>
          <button
            type="button"
            onClick={addAchievement}
            className="mt-3 text-xs text-indigo-600 font-semibold hover:underline"
          >
            + Add Achievement
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className="p-5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3 hover:border-slate-300 transition"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="text-xs font-semibold text-slate-900">
                  {ach.title || 'New Achievement'}
                </span>
                <button
                  type="button"
                  onClick={() => removeAchievement(ach.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition"
                  title="Delete Achievement"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Honor / Award Title <span className="text-indigo-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={ach.title}
                    onChange={(e) => updateAchievement(ach.id, { title: e.target.value })}
                    placeholder="e.g. 1st Place — National AI Hackathon 2023"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-2xs transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date / Year
                  </label>
                  <input
                    type="text"
                    value={ach.date || ''}
                    onChange={(e) => updateAchievement(ach.id, { date: e.target.value })}
                    placeholder="e.g. 2023"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-2xs transition"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Description & Significance <span className="text-indigo-600">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={ach.description}
                    onChange={(e) => updateAchievement(ach.id, { description: e.target.value })}
                    placeholder="Describe what you accomplished and the scale (e.g. built within 24 hours among 150 competing teams)..."
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 resize-y shadow-2xs transition"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

