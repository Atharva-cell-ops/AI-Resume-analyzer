import React, { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { ResumeRenderer } from '../templates/ResumeRenderer';
import { TemplateId } from '@ai-resume/shared';
import { API_BASE, getStoredToken } from '../../services/api';
import {
  ShieldCheck,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  FileDown,
  Loader2,
  Check
} from 'lucide-react';

export const LivePreview: React.FC = () => {
  const { resumeData, templateId, setTemplateId, activeResumeId } = useResume();
  const [zoom, setZoom] = useState<number>(100);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const templates: { id: TemplateId; label: string; desc: string }[] = [
    { id: 'ats-classic', label: 'Classic ATS', desc: 'Serif, standard uppercase headers' },
    { id: 'ats-modern', label: 'Modern ATS', desc: 'Clean geometric sans, high contrast' },
    { id: 'ats-minimal', label: 'Minimal ATS', desc: 'Max density, 1-page fit' }
  ];

  const handleDownload = async (format: 'pdf' | 'docx') => {
    try {
      if (format === 'pdf') setIsExportingPdf(true);
      else setIsExportingDocx(true);
      setExportSuccess(null);

      const endpoint = `${API_BASE}/export/${format}`;
      const payload = {
        resumeId: activeResumeId || undefined,
        content: resumeData,
        templateId
      };

      const token = getStoredToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Export failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const rawName = resumeData.personalInfo.fullName?.trim() || 'Resume';
      const safeName = rawName.replace(/[^a-zA-Z0-9_\-]/g, '_');
      a.download = `${safeName}_ATS_Resume.${format}`;

      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExportSuccess(`Downloaded ${format.toUpperCase()}`);
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (error) {
      console.error(`Failed to export ${format}:`, error);
      alert(`Export failed. Please check backend server.`);
    } finally {
      setIsExportingPdf(false);
      setIsExportingDocx(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
      {/* Top Preview Controls Bar */}
      <div className="p-3 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        {/* Template Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          {templates.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTemplateId(t.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                templateId === t.id
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          {exportSuccess && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold animate-fadeIn">
              <Check className="w-3.5 h-3.5" /> {exportSuccess}
            </span>
          )}

          <button
            type="button"
            disabled={isExportingPdf || isExportingDocx}
            onClick={() => handleDownload('pdf')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs transition"
          >
            {isExportingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            <span>Export PDF</span>
          </button>

          <button
            type="button"
            disabled={isExportingPdf || isExportingDocx}
            onClick={() => handleDownload('docx')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-lg text-xs font-semibold shadow-xs transition"
          >
            {isExportingDocx ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
            <span>Export DOCX</span>
          </button>
        </div>
      </div>

      {/* Sub Bar with ATS Compliance & Zoom */}
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
        <div className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Single Column • 100% Selectable Text • ATS Safe
        </div>

        <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-xs">
          <button
            type="button"
            onClick={() => setZoom(prev => Math.max(60, prev - 10))}
            className="p-1 text-slate-500 hover:text-slate-800 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <span className="text-[11px] font-mono text-slate-700 px-1">{zoom}%</span>
          <button
            type="button"
            onClick={() => setZoom(prev => Math.min(130, prev + 10))}
            className="p-1 text-slate-500 hover:text-slate-800 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(100)}
            className="p-1 text-slate-500 hover:text-slate-800 transition ml-1"
            title="Reset Zoom"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Live Canvas Viewport */}
      <div className="flex-1 overflow-auto p-4 sm:p-6 bg-slate-100/90 flex justify-center items-start">
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out'
          }}
          className="shadow-md border border-slate-200/80 rounded-sm overflow-hidden"
        >
          <ResumeRenderer data={resumeData} templateId={templateId} />
        </div>
      </div>
    </div>
  );
};
