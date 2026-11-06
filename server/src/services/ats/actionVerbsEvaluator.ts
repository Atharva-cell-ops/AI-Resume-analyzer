import { ACTION_VERBS, WEAK_PASSIVE_VERBS } from '@ai-resume/shared';
import { tokenizeText } from './nlpUtils.js';

export interface ActionVerbsToneAnalysis {
  score: number; // 0 to 10
  percentage: number;
  strongVerbsCount: number;
  weakOrPassivePhrases: string[];
  repeatedVerbs: { verb: string; count: number }[];
}

export function evaluateActionVerbs(text: string): ActionVerbsToneAnalysis {
  const tokens = tokenizeText(text);
  const lower = text.toLowerCase();

  // 1. Count strong action verbs
  const verbFreq: Record<string, number> = {};
  let totalStrongVerbOccurrences = 0;

  for (const token of tokens) {
    if (ACTION_VERBS.has(token)) {
      verbFreq[token] = (verbFreq[token] || 0) + 1;
      totalStrongVerbOccurrences++;
    }
  }

  const distinctVerbsCount = Object.keys(verbFreq).length;

  // 2. Detect weak or passive phrases
  const weakOrPassivePhrases: string[] = [];
  for (const weak of Array.from(WEAK_PASSIVE_VERBS)) {
    const regex = new RegExp(`\\b${weak}\\b`, 'gi');
    const matches = lower.match(regex);
    if (matches && matches.length > 0) {
      weakOrPassivePhrases.push(`${weak} (${matches.length}x)`);
    }
  }

  // 3. Repeated Verbs Check (any action verb used > 3 times)
  const repeatedVerbs: { verb: string; count: number }[] = [];
  for (const [verb, count] of Object.entries(verbFreq)) {
    if (count > 3) {
      repeatedVerbs.push({ verb, count });
    }
  }

  // Scoring logic (max 10 points)
  let score = 0;

  // Action verb diversity: up to 6 points
  if (distinctVerbsCount >= 8) score += 6;
  else if (distinctVerbsCount >= 5) score += 5;
  else if (distinctVerbsCount >= 3) score += 3;
  else if (distinctVerbsCount >= 1) score += 2;
  else score += 1;

  // Passive voice penalty: up to 2 points
  if (weakOrPassivePhrases.length === 0) {
    score += 2;
  } else if (weakOrPassivePhrases.length <= 2) {
    score += 1;
  }

  // Repetition penalty: up to 2 points
  if (repeatedVerbs.length === 0) {
    score += 2;
  } else if (repeatedVerbs.length <= 1) {
    score += 1;
  }

  score = Math.max(1, Math.min(10, score));
  const percentage = Math.round((score / 10) * 100);

  return {
    score,
    percentage,
    strongVerbsCount: distinctVerbsCount,
    weakOrPassivePhrases,
    repeatedVerbs
  };
}

