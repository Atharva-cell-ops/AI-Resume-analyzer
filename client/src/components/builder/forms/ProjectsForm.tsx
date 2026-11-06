import React, { useState } from 'react';
import { useResume } from '../../../context/ResumeContext';
import { FolderGit2, Plus, Trash2, ArrowUp, ArrowDown, Sparkles, X } from 'lucide-react';
import { PerBulletHelper } from '../PerBulletHelper';

export const ProjectsForm: React.FC = () => {
  const {
    resumeData,
    addProject,
    updateProject,
    removeProject,
    reorderProjects,
    addProjectBullet,
    updateProjectBullet,
    removeProjectBullet
  } = useResume();

  const { projects } = resumeData;
  const [techInputs, setTechInputs] = useState<Record<string, string>>({});

  const handleAddTech = (projId: string, currentTechs: string[]) => {
    const inputVal = techInputs[projId]?.trim();
    if (!inputVal) return;
    if (!currentTechs.includes(inputVal)) {
      updateProject(projId, { technologies: [...currentTechs, inputVal] });
    }
    setTechInputs(prev => ({ ...prev, [projId]: '' }));
  };

  const handleRemoveTech = (projId: string, currentTechs: string[], indexToRemove: number) => {
    updateProject(projId, {
      technologies: currentTechs.filter((_, i) => i !== indexToRemove)
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-indigo-600" /> Technical Projects
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Showcase hands-on engineering, open-source work, and key applications you built.
          </p>
        </div>
        <button
          type="button"
          onClick={addProject}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-300 rounded-2xl bg-slate-50">
          <FolderGit2 className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No projects added yet.</p>
          <button
            type="button"
            onClick={addProject}
            className="mt-3 text-xs text-indigo-600 font-semibold hover:underline"
          >
            + Add Project
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map((proj, projIdx) => (
            <div
              key={proj.id}
              className="p-5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-4 hover:border-slate-300 transition"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="font-semibold text-slate-900 text-sm">
                  Project #{projIdx + 1}: {proj.name || 'Untitled Project'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={projIdx === 0}
                    onClick={() => reorderProjects(projIdx, projIdx - 1)}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition"
                    title="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={projIdx === projects.length - 1}
                    onClick={() => reorderProjects(projIdx, projIdx + 1)}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition"
                    title="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeProject(proj.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition ml-1"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Project Name <span className="text-indigo-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={proj.name}
                    onChange={(e) => updateProject(proj.id, { name: e.target.value })}
                    placeholder="e.g. Distributed Telemetry Platform"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-2xs transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Role / Scope
                  </label>
                  <input
                    type="text"
                    value={proj.role || ''}
                    onChange={(e) => updateProject(proj.id, { role: e.target.value })}
                    placeholder="e.g. Lead Developer / Creator"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-2xs transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Live Demo or Repository URL
                  </label>
                  <input
                    type="url"
                    value={proj.link || ''}
                    onChange={(e) => updateProject(proj.id, { link: e.target.value })}
                    placeholder="https://github.com/username/project"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-2xs transition"
                  />
                </div>

                {/* Technologies Tag Input */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Technologies Used (Press Enter to add tag)
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={techInputs[proj.id] || ''}
                      onChange={(e) => setTechInputs(prev => ({ ...prev, [proj.id]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTech(proj.id, proj.technologies);
                        }
                      }}
                      placeholder="e.g. React, PostgreSQL, Docker..."
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-2xs transition"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddTech(proj.id, proj.technologies)}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {proj.technologies.map((tech, techIdx) => (
                      <span
                        key={techIdx}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] bg-white text-slate-700 border border-slate-200 shadow-2xs font-medium"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => handleRemoveTech(proj.id, proj.technologies, techIdx)}
                          className="hover:text-rose-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bullet Points with Inline Helper */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Project Bullets & Impact
                  </label>
                  <button
                    type="button"
                    onClick={() => addProjectBullet(proj.id)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold transition"
                  >
                    + Add Bullet
                  </button>
                </div>

                <div className="space-y-3">
                  {proj.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs">
                      <div className="flex items-start gap-2">
                        <span className="text-slate-400 text-xs font-mono pt-2">#{bIdx + 1}</span>
                        <textarea
                          rows={2}
                          value={bullet}
                          onChange={(e) => updateProjectBullet(proj.id, bIdx, e.target.value)}
                          placeholder="Constructed, architected, or deployed..."
                          className="flex-1 bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 resize-y transition shadow-2xs"
                        />
                        {proj.bullets.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProjectBullet(proj.id, bIdx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                            title="Remove Bullet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Per-Bullet Helper */}
                      <PerBulletHelper
                        bulletText={bullet}
                        onApplyRewrite={(newText) => updateProjectBullet(proj.id, bIdx, newText)}
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

