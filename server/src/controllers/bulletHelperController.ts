import { Request, Response, NextFunction } from 'express';
import { ACTION_VERBS, WEAK_PASSIVE_VERBS } from '@ai-resume/shared';
import { ApiResponse } from '@ai-resume/shared';

export interface BulletAnalysisResult {
  bullet: string;
  wordCount: number;
  hasActionVerb: boolean;
  detectedActionVerb?: string;
  hasWeakVerb: boolean;
  detectedWeakVerb?: string;
  hasMetric: boolean;
  detectedMetrics: string[];
  isTooLong: boolean;
  isTooShort: boolean;
  status: 'excellent' | 'needs-metric' | 'needs-action-verb' | 'too-long' | 'weak-verb';
  feedback: string[];
  suggestedVerbs: string[];
  recommendedRewrite?: string;
}

export function analyzeBulletText(bullet: string): BulletAnalysisResult {
  const trimmed = bullet.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const feedback: string[] = [];
  const suggestedVerbs: string[] = [
    'Architected', 'Spearheaded', 'Optimized', 'Streamlined', 'Engineered', 'Accelerated', 'Delivered'
  ];

  // 1. Action Verb Detection (Check first 1-2 words)
  const firstWord = words[0]?.toLowerCase().replace(/[^\w]/g, '') || '';
  const firstTwoWords = `${words[0] || ''} ${words[1] || ''}`.toLowerCase().replace(/[^\w\s]/g, '');

  let hasActionVerb = ACTION_VERBS.has(firstWord);
  let detectedActionVerb = hasActionVerb ? words[0] : undefined;

  // 2. Weak/Passive Verb Detection
  let hasWeakVerb = false;
  let detectedWeakVerb: string | undefined;

  for (const weak of Array.from(WEAK_PASSIVE_VERBS)) {
    if (trimmed.toLowerCase().startsWith(weak) || firstTwoWords === weak || firstWord === weak) {
      hasWeakVerb = true;
      detectedWeakVerb = weak;
      break;
    }
  }

  // 3. Metric / Quantification Detection
  // Matches percentages (40%), currency ($50k), numbers with plus (150+), multipliers (3x), or integers >= 2
  const metricRegex = /(\b\d+(?:\.\d+)?%|\$\d+(?:,\d+)*(?:\.\d+)?[kmbKMB]?|\b\d+[xX]\b|\b\d+\+\b|\b\d+\b(?:\s+(?:users|clients|engineers|microservices|servers|requests|ms|seconds|hours|days|percent|reduction|increase|growth|retention)))/g;
  const metricMatches = trimmed.match(metricRegex) || [];
  const hasMetric = metricMatches.length > 0;

  // 4. Length Analysis
  // Standard single-column resume bullet: 12-22 words fits in 1 to 2 lines. Over 24 words spans >2 lines.
  const isTooLong = wordCount > 24;
  const isTooShort = wordCount > 0 && wordCount < 6;

  // Generate feedback
  if (hasWeakVerb) {
    feedback.push(`Contains passive phrasing ("${detectedWeakVerb}"). Replace with a strong active verb like "Spearheaded" or "Architected".`);
  } else if (!hasActionVerb && wordCount > 0) {
    feedback.push(`Start with a powerful action verb (e.g., "${suggestedVerbs.slice(0, 3).join('", "')}").`);
  }

  if (!hasMetric && wordCount >= 6) {
    feedback.push('Missing quantifiable metrics. Quantify your achievement using percentages, latency reductions, numbers of users, or team size.');
  }

  if (isTooLong) {
    feedback.push(`Bullet is ${wordCount} words (exceeds 2 lines). Trim non-essential filler words to keep it punchy.`);
  }

  if (isTooShort) {
    feedback.push('Bullet is too brief. Elaborate on the technique used and the positive business impact.');
  }

  // Determine primary status
  let status: BulletAnalysisResult['status'] = 'excellent';
  if (hasWeakVerb) status = 'weak-verb';
  else if (!hasActionVerb) status = 'needs-action-verb';
  else if (!hasMetric) status = 'needs-metric';
  else if (isTooLong) status = 'too-long';

  // Rule-based deterministic rewrite recommendation
  let recommendedRewrite: string | undefined;
  if (hasWeakVerb && detectedWeakVerb) {
    const remainingText = trimmed.slice(detectedWeakVerb.length).trim().replace(/^(with|on|to|for|in|the|a)\s+/i, '');
    const chosenVerb = suggestedVerbs[Math.floor(Math.random() * suggestedVerbs.length)];
    recommendedRewrite = `${chosenVerb} ${remainingText}${!hasMetric ? ', resulting in 20% improved performance' : ''}.`;
  }

  return {
    bullet: trimmed,
    wordCount,
    hasActionVerb,
    detectedActionVerb,
    hasWeakVerb,
    detectedWeakVerb,
    hasMetric,
    detectedMetrics: metricMatches,
    isTooLong,
    isTooShort,
    status,
    feedback,
    suggestedVerbs,
    recommendedRewrite
  };
}

export async function handleBulletHelper(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { bullet } = req.body;
    if (!bullet || typeof bullet !== 'string') {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'bullet string is required'
        }
      });
      return;
    }

    const analysis = analyzeBulletText(bullet);

    const response: ApiResponse<BulletAnalysisResult> = {
      success: true,
      data: analysis
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

