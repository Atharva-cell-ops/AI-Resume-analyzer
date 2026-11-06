import { STOP_WORDS } from '@ai-resume/shared';

/**
 * Tokenizes text, preserving technical tokens like C++, C#, .NET, Node.js, CI/CD
 */
export function tokenizeText(text: string): string[] {
  if (!text) return [];

  // Protect tech tokens
  const normalized = text
    .replace(/c\+\+/gi, 'cpp_token')
    .replace(/c\#/gi, 'csharp_token')
    .replace(/\.net/gi, 'dotnet_token')
    .replace(/node\.js/gi, 'nodejs_token')
    .replace(/next\.js/gi, 'nextjs_token')
    .replace(/vue\.js/gi, 'vuejs_token')
    .replace(/ci\/cd/gi, 'cicd_token')
    .toLowerCase();

  // Split on non-word characters except underscores and hyphens
  const rawTokens = normalized
    .replace(/[^\w\s\-]/g, ' ')
    .split(/\s+/)
    .map(t => {
      if (t === 'cpp_token') return 'c++';
      if (t === 'csharp_token') return 'c#';
      if (t === 'dotnet_token') return '.net';
      if (t === 'nodejs_token') return 'node.js';
      if (t === 'nextjs_token') return 'next.js';
      if (t === 'vuejs_token') return 'vue.js';
      if (t === 'cicd_token') return 'ci/cd';
      return t;
    })
    .filter(token => token.length > 1 && !STOP_WORDS.has(token));

  return rawTokens;
}

/**
 * Generate N-grams (1-gram, 2-gram, 3-gram) for multi-word phrase matching
 */
export function generateNgrams(tokens: string[], maxN = 3): string[] {
  const ngrams: string[] = [];
  for (let n = 1; n <= maxN; n++) {
    for (let i = 0; i <= tokens.length - n; i++) {
      ngrams.push(tokens.slice(i, i + n).join(' '));
    }
  }
  return ngrams;
}

/**
 * Basic stemmer rule to group common inflections (e.g. optimizing, optimized, optimization -> optimiz)
 */
export function simpleStem(word: string): string {
  const w = word.toLowerCase();
  if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y';
  if (w.endsWith('es') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('ing') && w.length > 5) return w.slice(0, -3);
  if (w.endsWith('ed') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('tion') && w.length > 6) return w.slice(0, -4);
  if (w.endsWith('ment') && w.length > 6) return w.slice(0, -4);
  if (w.endsWith('s') && !w.endsWith('ss') && w.length > 3) return w.slice(0, -1);
  return w;
}

/**
 * Counts syllables in an English word
 */
export function countSyllables(word: string): number {
  const w = word.toLowerCase().trim();
  if (w.length <= 3) return 1;
  const cleaned = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
  const matches = cleaned.match(/[aeiouy]{1,2}/g);
  return matches ? matches.length : 1;
}

/**
 * Calculates Flesch Reading Ease score (0 to 100)
 */
export function calculateFleschReadingEase(text: string): { score: number; label: string } {
  const sentences = text
    .split(/[.!?\r\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 5);
  const sentenceCount = sentences.length || 1;

  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length || 1;

  let totalSyllables = 0;
  for (const word of words) {
    totalSyllables += countSyllables(word);
  }

  const avgSentenceLength = wordCount / sentenceCount;
  const avgSyllablesPerWord = totalSyllables / wordCount;

  // Formula: 206.835 - (1.015 * ASL) - (84.6 * ASW)
  let score = 206.835 - (1.015 * avgSentenceLength) - (84.6 * avgSyllablesPerWord);
  score = Math.max(0, Math.min(100, Math.round(score)));

  let label = 'Standard / Professional';
  if (score >= 70) label = 'Very Easy & Skimmable';
  else if (score >= 55) label = 'Standard Professional';
  else if (score >= 40) label = 'Complex & Technical';
  else label = 'Dense & Academic';

  return { score, label };
}
