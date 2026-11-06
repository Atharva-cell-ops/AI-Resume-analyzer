import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, AlertTriangle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { apiFetch } from '../../services/api';

interface BulletAnalysis {
  wordCount: number;
  hasActionVerb: boolean;
  hasWeakVerb: boolean;
  detectedWeakVerb?: string;
  hasMetric: boolean;
  isTooLong: boolean;
  status: 'excellent' | 'needs-metric' | 'needs-action-verb' | 'too-long' | 'weak-verb';
  feedback: string[];
  suggestedVerbs: string[];
  recommendedRewrite?: string;
}

interface PerBulletHelperProps {
  bulletText: string;
  onApplyRewrite: (newText: string) => void;
}

export const PerBulletHelper: React.FC<PerBulletHelperProps> = ({ bulletText, onApplyRewrite }) => {
  const [analysis, setAnalysis] = useState<BulletAnalysis | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!bulletText.trim()) {
      setAnalysis(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const res = await apiFetch<BulletAnalysis>('/ats/bullet-helper', {
          method: 'POST',
          body: JSON.stringify({ bullet: bulletText })
        });
        if (res.success && res.data) {
          setAnalysis(res.data);
        }
      } catch (err) {
        console.warn('Bullet analysis error', err);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [bulletText]);

  if (!bulletText.trim() || !analysis) {
    return null;
  }

  const getStatusBadge = () => {
    if (analysis.status === 'excellent') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Strong Bullet
        </span>
      );
    }
    if (analysis.status === 'weak-verb') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
          <AlertCircle className="w-3 h-3 text-rose-600" /> Weak Verb Detected
        </span>
      );
    }
    if (analysis.status === 'too-long') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
          <AlertTriangle className="w-3 h-3 text-amber-600" /> &gt; 2 Lines ({analysis.wordCount} words)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
        <Sparkles className="w-3 h-3 text-blue-600" /> Needs Metric
      </span>
    );
  };

  return (
    <div className="mt-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getStatusBadge()}
          <span className="text-[11px] text-slate-500 font-medium">{analysis.wordCount} words</span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1 transition"
        >
          {isOpen ? 'Hide Guidance' : 'ATS Guidance'}
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className="mt-2 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2.5 animate-fadeIn">
          {analysis.feedback.length > 0 && (
            <div className="space-y-1">
              {analysis.feedback.map((tip, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-slate-700">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          )}

          {/* Action Verbs Suggestion Chips */}
          <div>
            <div className="text-[11px] text-slate-600 font-semibold mb-1.5">Insert Strong Action Verb:</div>
            <div className="flex flex-wrap gap-1.5">
              {analysis.suggestedVerbs.map(verb => (
                <button
                  key={verb}
                  type="button"
                  onClick={() => {
                    const words = bulletText.split(/\s+/);
                    words[0] = verb;
                    onApplyRewrite(words.join(' '));
                  }}
                  className="px-2.5 py-0.5 bg-white hover:bg-indigo-50 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 border border-slate-200 rounded text-[11px] font-medium shadow-xs transition"
                >
                  {verb}
                </button>
              ))}
            </div>
          </div>

          {/* Recommended Rewrite */}
          {analysis.recommendedRewrite && (
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-3">
              <div className="text-slate-600 italic text-[11px] truncate">
                💡 Try: "{analysis.recommendedRewrite}"
              </div>
              <button
                type="button"
                onClick={() => onApplyRewrite(analysis.recommendedRewrite!)}
                className="shrink-0 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-medium shadow-xs transition"
              >
                Apply Fix
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

