import React, { useState } from 'react';
import { useResume } from '../../../context/ResumeContext';
import { Wrench, Plus, Trash2, X, Sparkles } from 'lucide-react';

export const SkillsForm: React.FC = () => {
  const {
    resumeData,
    addSkillCategory,
    updateSkillCategoryName,
    removeSkillCategory,
    addSkillItem,
    removeSkillItem
  } = useResume();

  const { skills } = resumeData;
  const [skillInputs, setSkillInputs] = useState<Record<number, string>>({});

  const handleAdd = (catIdx: number) => {
    const val = skillInputs[catIdx]?.trim();
    if (!val) return;
    addSkillItem(catIdx, val);
    setSkillInputs(prev => ({ ...prev, [catIdx]: '' }));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-600" /> Technical Skills
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Group your skills into clear categories. ATS parsers match keywords heavily from this section (40% match weight).
          </p>
        </div>
        <button
          type="button"
          onClick={addSkillCategory}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      <div className="space-y-5">
        {skills.map((cat, catIdx) => (
          <div
            key={catIdx}
            className="p-5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3 hover:border-slate-300 transition"
          >
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                value={cat.category}
                onChange={(e) => updateSkillCategoryName(catIdx, e.target.value)}
                placeholder="Category Name (e.g. Languages, Cloud & DevOps)"
                className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-2xs transition"
              />
              {skills.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSkillCategory(catIdx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Add skill input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInputs[catIdx] || ''}
                onChange={(e) => setSkillInputs(prev => ({ ...prev, [catIdx]: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAdd(catIdx);
                  }
                }}
                placeholder="Type skill & press Enter (e.g. TypeScript, Docker, PostgreSQL)..."
                className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-2xs transition"
              />
              <button
                type="button"
                onClick={() => handleAdd(catIdx)}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold shadow-2xs transition"
              >
                Add Skill
              </button>
            </div>

            {/* Skill tags list */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {cat.items.map((skill, sIdx) => (
                <span
                  key={sIdx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-white text-slate-700 border border-slate-200 shadow-2xs font-medium hover:border-slate-300 transition"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkillItem(catIdx, sIdx)}
                    className="hover:text-rose-600 transition ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

