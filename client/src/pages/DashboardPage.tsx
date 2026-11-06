import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useResume } from '../context/ResumeContext';
import { apiFetch } from '../services/api';
import { TemplateId, ResumeData } from '@ai-resume/shared';
import {
  FileText,
  Plus,
  Edit3,
  Copy,
  Trash2,
  GitBranch,
  History,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  X,
  RotateCcw,
  Check,
  AlertCircle,
  Eye
} from 'lucide-react';

interface ResumeListItem {
  id: string;
  title: string;
  templateId: TemplateId;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
  atsReports?: {
    overallScore: number;
    createdAt: string;
  }[];
}

interface VersionItem {
  id: string;
  versionNumber: number;
  changeSummary: string | null;
  content: ResumeData;
  createdAt: string;
}

interface DashboardPageProps {
  onNavigateToBuilder: () => void;
  onNavigateToAnalyzer: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToBuilder,
  onNavigateToAnalyzer
}) => {
  const { user } = useAuth();
  const { loadResume, resetToTemplate } = useResume();

  const [resumes, setResumes] = useState<ResumeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [tailorModalResume, setTailorModalResume] = useState<ResumeListItem | null>(null);
  const [tailorJobTitle, setTailorJobTitle] = useState('');
  const [tailorCompany, setTailorCompany] = useState('');
  const [tailorJd, setTailorJd] = useState('');
  const [isTailoring, setIsTailoring] = useState(false);

  // Versions Modal state
  const [versionsModalResume, setVersionsModalResume] = useState<ResumeListItem | null>(null);
  const [versionsList, setVersionsList] = useState<VersionItem[]>([]);
  const [selectedVersionA, setSelectedVersionA] = useState<VersionItem | null>(null);
  const [selectedVersionB, setSelectedVersionB] = useState<VersionItem | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const fetchResumes = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiFetch<ResumeListItem[]>('/resumes');
      if (res.success && res.data) {
        setResumes(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load resumes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, [user]);

  const handleCreateNew = async () => {
    try {
      const res = await apiFetch<any>('/resumes', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Untitled Resume',
          templateId: 'ats-classic'
        })
      });
      if (res.success && res.data?.id) {
        await loadResume(res.data.id);
        onNavigateToBuilder();
      }
    } catch (err) {
      console.error('Failed to create resume:', err);
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await apiFetch<any>(`/resumes/${id}/duplicate`, { method: 'POST' });
      if (res.success) {
        fetchResumes();
      }
    } catch (err) {
      console.error('Failed to duplicate resume:', err);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await apiFetch(`/resumes/${id}`, { method: 'DELETE' });
      if (res.success) {
        setResumes(prev => prev.filter(r => r.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete resume:', err);
    }
  };

  const handleOpenVersionsModal = async (resume: ResumeListItem) => {
    setVersionsModalResume(resume);
    try {
      const res = await apiFetch<VersionItem[]>(`/resumes/${resume.id}/versions`);
      if (res.success && res.data) {
        setVersionsList(res.data);
        if (res.data.length >= 2) {
          setSelectedVersionA(res.data[1]); // previous
          setSelectedVersionB(res.data[0]); // current
        } else if (res.data.length === 1) {
          setSelectedVersionA(res.data[0]);
          setSelectedVersionB(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load versions:', err);
    }
  };

  const handleRestoreVersion = async (versionNumber: number) => {
    if (!versionsModalResume) return;
    if (!window.confirm(`Restore version ${versionNumber}? This will create a new current version.`)) return;

    try {
      setIsRestoring(true);
      const res = await apiFetch(`/resumes/${versionsModalResume.id}/versions/${versionNumber}/restore`, {
        method: 'POST'
      });
      if (res.success) {
        await loadResume(versionsModalResume.id);
        setVersionsModalResume(null);
        fetchResumes();
        onNavigateToBuilder();
      }
    } catch (err) {
      console.error('Failed to restore version:', err);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleTailorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tailorModalResume || !tailorJd.trim()) return;

    try {
      setIsTailoring(true);
      const res = await apiFetch<any>(`/resumes/${tailorModalResume.id}/tailor`, {
        method: 'POST',
        body: JSON.stringify({
          jobTitle: tailorJobTitle,
          company: tailorCompany,
          jobDescription: tailorJd
        })
      });

      if (res.success && res.data?.tailoredResume) {
        await loadResume(res.data.tailoredResume.id);
        setTailorModalResume(null);
        fetchResumes();
        onNavigateToAnalyzer();
      }
    } catch (err) {
      console.error('Failed to tailor resume:', err);
    } finally {
      setIsTailoring(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center space-y-4 animate-fadeIn">
        <div className="p-4 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-2xl w-16 h-16 mx-auto flex items-center justify-center shadow-xs">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Save &amp; Track Your Resumes in the Cloud</h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Please register or sign in to save multiple resume versions, tailor resumes for specific job descriptions, and view side-by-side diff comparisons.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] w-full mx-auto p-4 sm:p-6 space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
            <GitBranch className="w-3.5 h-3.5 text-indigo-600" /> Multi-Version Persistence &amp; Tailoring
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Resume Management Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize resumes, inspect latest ATS scores, branch versions for target companies, and compare version differences.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition self-start sm:self-center"
        >
          <Plus className="w-4 h-4" /> Create New Resume
        </button>
      </div>

      {/* Resume Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 text-sm">Loading your resumes...</div>
      ) : resumes.length === 0 ? (
        <div className="p-12 text-center border-2 border-dashed border-slate-300 rounded-2xl bg-white space-y-4 shadow-xs">
          <FileText className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">No saved resumes found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You don't have any resumes saved in your account yet. Create your first resume using our multi-step builder.
          </p>
          <button
            type="button"
            onClick={handleCreateNew}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            + Create Resume Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map(resume => {
            const latestScore = resume.atsReports?.[0]?.overallScore;

            return (
              <div
                key={resume.id}
                className="p-5 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl flex flex-col justify-between space-y-4 shadow-xs transition group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition truncate">
                      {resume.title}
                    </h3>
                    <span className="shrink-0 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      v{resume.currentVersion}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-4">
                    <span className="px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200 font-medium">
                      {resume.templateId}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      {new Date(resume.updatedAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Latest ATS Score Indicator */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-slate-600 font-medium">Latest ATS Match:</span>
                    {latestScore !== undefined ? (
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          latestScore >= 75
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : latestScore >= 50
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {latestScore} / 100
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Not scored yet</span>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={async () => {
                        await loadResume(resume.id);
                        onNavigateToBuilder();
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-xs font-semibold transition"
                      title="Edit in Resume Builder"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-indigo-600" /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => setTailorModalResume(resume)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium border border-slate-200/60 transition"
                      title="Tailor this resume for a specific job description"
                    >
                      <GitBranch className="w-3.5 h-3.5 text-indigo-600" /> Tailor
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenVersionsModal(resume)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      title="Version History & Diff"
                    >
                      <History className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicate(resume.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      title="Duplicate Resume"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(resume.id, resume.title)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tailor for Job Modal */}
      {tailorModalResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-xl p-6 bg-white border border-slate-200 rounded-2xl shadow-xl">
            <button
              type="button"
              onClick={() => setTailorModalResume(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <GitBranch className="w-5 h-5 text-indigo-600" />
              <h2 className="text-lg font-bold text-slate-900">Tailor Resume for a Specific Job</h2>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Clones <strong className="text-slate-800 font-semibold">{tailorModalResume.title}</strong> into a dedicated tailored branch and scores it directly against your target role.
            </p>

            <form onSubmit={handleTailorSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    required
                    value={tailorCompany}
                    onChange={(e) => setTailorCompany(e.target.value)}
                    placeholder="e.g. Google / Stripe / Netflix"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-2xs transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={tailorJobTitle}
                    onChange={(e) => setTailorJobTitle(e.target.value)}
                    placeholder="e.g. Senior Full Stack Engineer"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 shadow-2xs transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Description Text</label>
                <textarea
                  rows={6}
                  required
                  value={tailorJd}
                  onChange={(e) => setTailorJd(e.target.value)}
                  placeholder="Paste the target job description here..."
                  className="w-full bg-white border border-slate-300 rounded-lg p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 font-mono resize-y shadow-2xs transition"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setTailorModalResume(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTailoring}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                >
                  {isTailoring ? 'Branching & Scoring...' : 'Create Tailored Resume & Score'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Version History & Side-by-Side Diff Modal */}
      {versionsModalResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-5xl h-[85vh] p-6 bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col">
            <button
              type="button"
              onClick={() => setVersionsModalResume(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <div className="flex items-center gap-2 mb-1">
                <History className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  Version History &amp; Side-by-Side Diff: {versionsModalResume.title}
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                Compare changes between snapshots or restore an earlier version at any time.
              </p>
            </div>

            {/* Version Selectors Bar */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-slate-600 font-medium">Version A (Baseline):</span>
                  <select
                    value={selectedVersionA?.versionNumber || ''}
                    onChange={(e) => {
                      const v = versionsList.find(x => x.versionNumber === parseInt(e.target.value, 10));
                      setSelectedVersionA(v || null);
                    }}
                    className="bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 text-xs outline-none shadow-2xs"
                  >
                    {versionsList.map(v => (
                      <option key={v.id} value={v.versionNumber}>
                        v{v.versionNumber} ({new Date(v.createdAt).toLocaleDateString()}) - {v.changeSummary || 'Snapshot'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-600 font-medium">Version B (Comparison):</span>
                  <select
                    value={selectedVersionB?.versionNumber || ''}
                    onChange={(e) => {
                      const v = versionsList.find(x => x.versionNumber === parseInt(e.target.value, 10));
                      setSelectedVersionB(v || null);
                    }}
                    className="bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 text-xs outline-none shadow-2xs"
                  >
                    {versionsList.map(v => (
                      <option key={v.id} value={v.versionNumber}>
                        v{v.versionNumber} ({new Date(v.createdAt).toLocaleDateString()}) - {v.changeSummary || 'Snapshot'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedVersionA && selectedVersionA.versionNumber !== versionsModalResume.currentVersion && (
                <button
                  type="button"
                  disabled={isRestoring}
                  onClick={() => handleRestoreVersion(selectedVersionA.versionNumber)}
                  className="flex items-center gap-1 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold shadow-2xs transition"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-700" /> Restore v{selectedVersionA.versionNumber}
                </button>
              )}
            </div>

            {/* Side-by-Side Diff Viewport */}
            <div className="flex-1 overflow-auto grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
              {/* Column A */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 overflow-y-auto">
                <div className="sticky top-0 bg-slate-50 pb-2 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">
                    Version {selectedVersionA?.versionNumber || 'A'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {selectedVersionA?.changeSummary || 'Baseline'}
                  </span>
                </div>
                {selectedVersionA ? (
                  <div className="space-y-4 text-xs text-slate-700 font-mono">
                    <div>
                      <div className="text-[11px] font-bold text-indigo-700 mb-1">SUMMARY</div>
                      <p className="bg-white border border-slate-200/80 p-2.5 rounded leading-relaxed">
                        {selectedVersionA.content.summary || '(Empty)'}
                      </p>
                    </div>

                    <div>
                      <div className="text-[11px] font-bold text-indigo-700 mb-1">
                        EXPERIENCE ({selectedVersionA.content.experience?.length || 0} roles)
                      </div>
                      <div className="space-y-2">
                        {selectedVersionA.content.experience?.map((exp, i) => (
                          <div key={i} className="bg-white border border-slate-200/80 p-2.5 rounded space-y-1">
                            <div className="font-bold text-slate-900">{exp.position} at {exp.company}</div>
                            <ul className="list-disc list-inside text-slate-600 text-[11px]">
                              {exp.bullets?.map((b, bi) => <li key={bi}>{b}</li>)}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-bold text-indigo-700 mb-1">SKILLS</div>
                      <div className="bg-white border border-slate-200/80 p-2.5 rounded space-y-1">
                        {selectedVersionA.content.skills?.map((cat, i) => (
                          <div key={i}>
                            <strong>{cat.category}: </strong>
                            <span>{cat.items?.join(', ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 text-xs">No version selected</div>
                )}
              </div>

              {/* Column B */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 overflow-y-auto">
                <div className="sticky top-0 bg-slate-50 pb-2 border-b border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">
                    Version {selectedVersionB?.versionNumber || 'B'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {selectedVersionB?.changeSummary || 'Comparison'}
                  </span>
                </div>
                {selectedVersionB ? (
                  <div className="space-y-4 text-xs text-slate-700 font-mono">
                    <div>
                      <div className="text-[11px] font-bold text-indigo-700 mb-1">SUMMARY</div>
                      <p className="bg-white border border-slate-200/80 p-2.5 rounded leading-relaxed">
                        {selectedVersionB.content.summary || '(Empty)'}
                      </p>
                    </div>

                    <div>
                      <div className="text-[11px] font-bold text-indigo-700 mb-1">
                        EXPERIENCE ({selectedVersionB.content.experience?.length || 0} roles)
                      </div>
                      <div className="space-y-2">
                        {selectedVersionB.content.experience?.map((exp, i) => (
                          <div key={i} className="bg-white border border-slate-200/80 p-2.5 rounded space-y-1">
                            <div className="font-bold text-slate-900">{exp.position} at {exp.company}</div>
                            <ul className="list-disc list-inside text-slate-600 text-[11px]">
                              {exp.bullets?.map((b, bi) => <li key={bi}>{b}</li>)}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] font-bold text-indigo-700 mb-1">SKILLS</div>
                      <div className="bg-white border border-slate-200/80 p-2.5 rounded space-y-1">
                        {selectedVersionB.content.skills?.map((cat, i) => (
                          <div key={i}>
                            <strong>{cat.category}: </strong>
                            <span>{cat.items?.join(', ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-500 text-xs">No version selected</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

