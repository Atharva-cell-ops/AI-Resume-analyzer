import React, { useState } from 'react';
import { useResume } from '../context/ResumeContext';
import { AtsAnalysisResult, KeywordMatch, AtsSuggestion } from '@ai-resume/shared';
import {
  Sparkles,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  FileCheck,
  RefreshCw,
  Search,
  BookOpen,
  Zap,
  Target
} from 'lucide-react';

const SAMPLE_JD = `Senior Full Stack Software Engineer

About the Role:
We are seeking an experienced Full Stack Engineer to build high-scale, resilient cloud services and client applications. 

Key Requirements:
• 4+ years of professional software engineering experience with React, TypeScript, and modern JavaScript.
• Strong backend experience building RESTful APIs and microservices in Node.js or Express.js.
• Proficient with relational databases, specifically PostgreSQL, query optimization, and Redis caching.
• Solid background in containerization with Docker, Kubernetes, and automated CI/CD pipelines with GitHub Actions.
• Hands-on experience with cloud infrastructure on AWS (EC2, S3, RDS).
• Experience implementing automated unit testing and end-to-end testing with Playwright or Jest.
`;

export const AtsAnalyzerPage: React.FC = () => {
  const { resumeData } = useResume();
  const [activeTab, setActiveTab] = useState<'draft' | 'upload'>('draft');
  const [jobDescription, setJobDescription] = useState(SAMPLE_JD);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AtsAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError('Please provide a job description to score against.');
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);

      let response: Response;

      if (activeTab === 'upload') {
        if (!uploadedFile) {
          setError('Please select or drop a PDF or DOCX resume file.');
          setIsAnalyzing(false);
          return;
        }

        const formData = new FormData();
        formData.append('resume', uploadedFile);
        formData.append('jobDescription', jobDescription);

        response = await fetch('/api/ats/upload-and-analyze', {
          method: 'POST',
          body: formData
        });
      } else {
        response = await fetch('/api/ats/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jobDescription,
            resumeContent: resumeData
          })
        });
      }

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error?.message || 'ATS analysis failed');
      }

      setResult(data.data);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze resume.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 border-emerald-500 bg-emerald-50';
    if (score >= 65) return 'text-blue-700 border-blue-500 bg-blue-50';
    if (score >= 50) return 'text-amber-700 border-amber-500 bg-amber-50';
    return 'text-rose-700 border-rose-500 bg-rose-50';
  };

  const getScoreVerdict = (score: number) => {
    if (score >= 85) return 'High Pass Probability — Strong Keyword & Metric Alignment';
    if (score >= 70) return 'Good Alignment — Minor Keyword & Formatting Refinements Needed';
    if (score >= 55) return 'Moderate Match — Missing Several Priority Keywords or Quantified Results';
    return 'Low ATS Compatibility — Critical Keywords and Sections Missing';
  };

  return (
    <div className="max-w-[1600px] w-full mx-auto p-4 sm:p-6 space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
            <Zap className="w-3.5 h-3.5 text-indigo-600" /> Deterministic Rule-Based ATS Scoring
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            ATS Resume Match &amp; Optimization Engine
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Simulate recruiter applicant tracking system parsing with 40% keyword weighting, section completeness, formatting parsability, and metric impact analysis.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setJobDescription(SAMPLE_JD);
            setResult(null);
          }}
          className="self-start sm:self-center px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-semibold shadow-xs transition"
        >
          Reset Sample Data
        </button>
      </div>

      {/* Input Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Resume Source (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" /> 1. Select Resume Source
              </h2>
              {/* Tab Switcher */}
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('draft')}
                  className={`px-3 py-1 rounded font-semibold transition ${
                    activeTab === 'draft' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Current Draft
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`px-3 py-1 rounded font-semibold transition ${
                    activeTab === 'upload' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Upload File
                </button>
              </div>
            </div>

            {activeTab === 'draft' ? (
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">
                    Active Draft: <strong className="text-slate-900 font-bold">{resumeData.personalInfo.fullName || 'Untitled'}</strong>
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {resumeData.experience.length} roles • {resumeData.skills.length} skill groups
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Your live builder draft will be analyzed directly, incorporating all recent wizard edits and per-bullet refinements.
                </p>
                <div className="text-[11px] text-indigo-700 font-mono bg-indigo-50 p-2 rounded border border-indigo-100">
                  Ready to evaluate: {resumeData.personalInfo.email}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 hover:border-indigo-500/60 rounded-xl bg-slate-50/50 cursor-pointer transition">
                  <UploadCloud className="w-8 h-8 text-indigo-500 mb-2" />
                  <span className="text-xs font-semibold text-slate-700">
                    {uploadedFile ? uploadedFile.name : 'Click to browse or drop resume file'}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-1">Accepts PDF or DOCX (Max 5MB)</span>
                  <input
                    type="file"
                    accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setUploadedFile(e.target.files[0]);
                    }}
                  />
                </label>
                {uploadedFile && (
                  <div className="flex items-center justify-between text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-medium">
                    <span>File: {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
                    <button
                      type="button"
                      onClick={() => setUploadedFile(null)}
                      className="text-rose-600 hover:underline font-semibold"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>Deterministic pure parser</span>
            <span>Zero paid AI dependency</span>
          </div>
        </div>

        {/* Right Column: Job Description (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600" /> 2. Target Job Description
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {jobDescription.split(/\s+/).filter(Boolean).length} words
              </span>
            </div>
            <textarea
              rows={8}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description or role requirements here..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 resize-y transition font-mono leading-relaxed shadow-2xs"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            {error && <span className="text-xs text-rose-600 font-medium">{error}</span>}
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={handleAnalyze}
              className="w-full sm:w-auto ml-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Resume...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Compute ATS Match Score
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Analysis Results View */}
      {result && (
        <div className="space-y-8 animate-fadeIn pt-4">
          {/* Main Score Hero Card */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col md:flex-row items-center gap-8">
            {/* Circular Score Badge */}
            <div
              className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center shrink-0 ${getScoreColor(
                result.overallScore
              )}`}
            >
              <span className="text-4xl font-extrabold tracking-tighter">{result.overallScore}</span>
              <span className="text-[11px] font-bold uppercase tracking-wider mt-0.5">/ 100 ATS</span>
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-600" /> Evaluation Summary
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
                {getScoreVerdict(result.overallScore)}
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                Scored across 6 deterministic dimensions: 40% keyword match against JD tokens and synonyms, 15% structural completeness, 15% formatting parsability, 10% quantified impact, 10% action verb dynamics, and 10% readability.
              </p>
            </div>
          </div>

          {/* 6 Dimensions Breakdown Grid */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" /> Dimension Breakdown
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 1. Keyword Match (40 pts) */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-900">Keyword Match</span>
                  <span className="font-bold text-indigo-600">
                    {result.breakdown.keywordMatch.score} / 40 pts
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/40">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${result.breakdown.keywordMatch.percentage}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>Matched: {result.breakdown.keywordMatch.matchedCount}</span>
                  <span>Total Target: {result.breakdown.keywordMatch.totalJdKeywords}</span>
                </div>
              </div>

              {/* 2. Section Completeness (15 pts) */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-900">Section Completeness</span>
                  <span className="font-bold text-indigo-600">
                    {result.breakdown.sectionCompleteness.score} / 15 pts
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/40">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${result.breakdown.sectionCompleteness.percentage}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>{result.breakdown.sectionCompleteness.presentSections.length} of 5 sections</span>
                  <span>
                    {result.breakdown.sectionCompleteness.missingSections.length === 0
                      ? 'All standard sections'
                      : `${result.breakdown.sectionCompleteness.missingSections.length} missing`}
                  </span>
                </div>
              </div>

              {/* 3. Formatting & Parsability (15 pts) */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-900">Formatting &amp; Parsability</span>
                  <span className="font-bold text-indigo-600">
                    {result.breakdown.formattingParsability.score} / 15 pts
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/40">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${result.breakdown.formattingParsability.percentage}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>Single-column: {result.breakdown.formattingParsability.isSingleColumn ? 'Yes' : 'No'}</span>
                  <span>Pages: ~{result.breakdown.formattingParsability.pageCountEstimate}</span>
                </div>
              </div>

              {/* 4. Impact & Quantification (10 pts) */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-900">Impact &amp; Metrics</span>
                  <span className="font-bold text-indigo-600">
                    {result.breakdown.impactQuantification.score} / 10 pts
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/40">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${result.breakdown.impactQuantification.percentage}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>
                    {result.breakdown.impactQuantification.quantifiedBulletsCount} of{' '}
                    {result.breakdown.impactQuantification.totalBulletsCount} bullets with metrics
                  </span>
                  <span>{result.breakdown.impactQuantification.percentage}% ratio</span>
                </div>
              </div>

              {/* 5. Action Verbs & Tone (10 pts) */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-900">Action Verbs &amp; Tone</span>
                  <span className="font-bold text-indigo-600">
                    {result.breakdown.actionVerbsTone.score} / 10 pts
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/40">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${result.breakdown.actionVerbsTone.percentage}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>{result.breakdown.actionVerbsTone.strongVerbsCount} strong verbs</span>
                  <span>
                    {result.breakdown.actionVerbsTone.weakOrPassivePhrases.length > 0
                      ? `${result.breakdown.actionVerbsTone.weakOrPassivePhrases.length} passive`
                      : 'Zero passive voice'}
                  </span>
                </div>
              </div>

              {/* 6. Readability & Length (10 pts) */}
              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2 shadow-2xs">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-900">Readability &amp; Length</span>
                  <span className="font-bold text-indigo-600">
                    {result.breakdown.readabilityLength.score} / 10 pts
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/40">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${result.breakdown.readabilityLength.percentage}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>Ease: {result.breakdown.readabilityLength.readingEaseScore} ({result.breakdown.readabilityLength.readingEaseLabel})</span>
                  <span>Avg: {result.breakdown.readabilityLength.averageSentenceLength} words/sentence</span>
                </div>
              </div>
            </div>
          </div>

          {/* Keywords Inspection: Matched vs Missing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Keywords */}
            <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Matched Keywords ({result.matchedKeywords.length})
                </h4>
              </div>
              {result.matchedKeywords.length === 0 ? (
                <p className="text-xs text-slate-500">No overlapping keywords found with the job description.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto">
                  {result.matchedKeywords.map((k, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200"
                    >
                      {k.keyword}
                      <span className="text-[10px] text-emerald-600 font-mono">({k.frequencyInResume}x)</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Missing Keywords */}
            <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-rose-700 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-600" /> Missing Target Keywords ({result.missingKeywords.length})
                </h4>
              </div>
              {result.missingKeywords.length === 0 ? (
                <p className="text-xs text-emerald-700 font-medium">All key targeted skills were detected in your resume!</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 max-h-56 overflow-y-auto">
                  {result.missingKeywords.map((k, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        k.importance === 'critical'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : k.importance === 'high'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {k.keyword}
                      <span className="text-[9px] uppercase font-bold tracking-wider opacity-75">
                        {k.importance}
                      </span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actionable Suggestions Ranked by Score Gain */}
          <div className="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" /> Actionable Improvements (Ranked by Score Gain)
            </h3>
            <div className="space-y-3">
              {result.suggestions.map((sugg) => (
                <div
                  key={sugg.id}
                  className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-300 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{sugg.title}</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                        {sugg.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      {sugg.description}
                    </p>
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-xs font-bold shadow-2xs">
                    <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                    <span>+{sugg.potentialScoreGain} pts potential gain</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

