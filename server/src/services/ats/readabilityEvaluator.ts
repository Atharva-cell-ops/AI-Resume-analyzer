import { CLICHE_PHRASES } from '@ai-resume/shared';
import { calculateFleschReadingEase } from './nlpUtils.js';

export interface ReadabilityLengthAnalysis {
  score: number; // 0 to 10
  percentage: number;
  readingEaseScore: number;
  readingEaseLabel: string;
  averageSentenceLength: number;
  detectedCliches: string[];
}

export function evaluateReadability(text: string): ReadabilityLengthAnalysis {
  const { score: readingEaseScore, label: readingEaseLabel } = calculateFleschReadingEase(text);

  const sentences = text
    .split(/[.!?\r\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 5);

  const words = text.trim().split(/\s+/).filter(Boolean);

  const avgSentenceLength = Math.round(words.length / (sentences.length || 1));

  // Detect cliches / buzzwords
  const lower = text.toLowerCase();
  const detectedCliches: string[] = [];

  for (const cliche of CLICHE_PHRASES) {
    const regex = new RegExp(`\\b${cliche}\\b`, 'i');
    if (regex.test(lower)) {
      detectedCliches.push(cliche);
    }
  }

  let score = 10;

  // Reading ease penalty: if too dense (<30)
  if (readingEaseScore < 25) {
    score -= 2;
  } else if (readingEaseScore < 35) {
    score -= 1;
  }

  // Sentence length penalty (optimal is 10-24 words)
  if (avgSentenceLength > 30) {
    score -= 3;
  } else if (avgSentenceLength > 25) {
    score -= 1;
  } else if (avgSentenceLength < 6) {
    score -= 2;
  }

  // Cliche penalty (1 point deduction per cliche up to 4)
  score -= Math.min(4, detectedCliches.length);

  score = Math.max(1, Math.min(10, score));
  const percentage = Math.round((score / 10) * 100);

  return {
    score,
    percentage,
    readingEaseScore,
    readingEaseLabel,
    averageSentenceLength: avgSentenceLength,
    detectedCliches
  };
}
