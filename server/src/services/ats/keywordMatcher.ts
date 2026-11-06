import {
  TECH_SKILL_SYNONYMS,
  CANONICAL_SKILL_LOOKUP,
  KeywordMatch
} from '@ai-resume/shared';
import { tokenizeText, generateNgrams, simpleStem } from './nlpUtils.js';

export interface KeywordMatchAnalysis {
  score: number; // 0 to 40
  percentage: number;
  matchedCount: number;
  totalJdKeywords: number;
  matchedKeywords: KeywordMatch[];
  missingKeywords: KeywordMatch[];
}

export function evaluateKeywords(resumeText: string, jobDescriptionText: string): KeywordMatchAnalysis {
  const resumeTokens = tokenizeText(resumeText);
  const jdTokens = tokenizeText(jobDescriptionText);

  const resumeLower = resumeText.toLowerCase();
  const jdLower = jobDescriptionText.toLowerCase();

  // If JD is empty or too short, evaluate against general industry tech keywords
  const isJdEmpty = jdTokens.length < 5;

  const targetJdSkillsMap = new Map<string, { importance: KeywordMatch['importance']; freq: number; category: string }>();

  if (isJdEmpty) {
    // Fallback: evaluate against standard top tech skills
    TECH_SKILL_SYNONYMS.slice(0, 15).forEach(item => {
      targetJdSkillsMap.set(item.canonical, {
        importance: 'high',
        freq: 1,
        category: item.category
      });
    });
  } else {
    // 1. Detect taxonomy matches in Job Description
    for (const group of TECH_SKILL_SYNONYMS) {
      let freqInJd = 0;
      const canonicalRegex = new RegExp(`\\b${escapeRegExp(group.canonical)}\\b`, 'gi');
      freqInJd += (jdLower.match(canonicalRegex) || []).length;

      for (const syn of group.synonyms) {
        const synRegex = new RegExp(`\\b${escapeRegExp(syn)}\\b`, 'gi');
        freqInJd += (jdLower.match(synRegex) || []).length;
      }

      if (freqInJd > 0) {
        const importance: KeywordMatch['importance'] = freqInJd >= 3 ? 'critical' : freqInJd >= 2 ? 'high' : 'medium';
        targetJdSkillsMap.set(group.canonical, { importance, freq: freqInJd, category: group.category });
      }
    }

    // 2. Also extract high-frequency 2-gram domain phrases from JD (e.g. "software engineering", "unit tests")
    const jdBigrams = generateNgrams(jdTokens, 2).filter(ng => ng.split(' ').length === 2);
    const bigramFreq: Record<string, number> = {};
    for (const bg of jdBigrams) {
      bigramFreq[bg] = (bigramFreq[bg] || 0) + 1;
    }

    for (const [phrase, count] of Object.entries(bigramFreq)) {
      if (count >= 2 && !targetJdSkillsMap.has(phrase) && targetJdSkillsMap.size < 25) {
        targetJdSkillsMap.set(capitalizeWords(phrase), {
          importance: count >= 3 ? 'high' : 'medium',
          freq: count,
          category: 'practices'
        });
      }
    }
  }

  // Evaluate each target skill against resume
  const matchedKeywords: KeywordMatch[] = [];
  const missingKeywords: KeywordMatch[] = [];

  let weightedEarned = 0;
  let weightedTotal = 0;

  for (const [skillName, meta] of targetJdSkillsMap.entries()) {
    const weight = meta.importance === 'critical' ? 3 : meta.importance === 'high' ? 2 : 1;
    weightedTotal += weight;

    // Check if skill or its synonyms appear in resume
    const synGroup = TECH_SKILL_SYNONYMS.find(s => s.canonical.toLowerCase() === skillName.toLowerCase());
    let freqInResume = 0;

    const regexCanonical = new RegExp(`\\b${escapeRegExp(skillName)}\\b`, 'gi');
    freqInResume += (resumeLower.match(regexCanonical) || []).length;

    if (synGroup) {
      for (const syn of synGroup.synonyms) {
        const synRegex = new RegExp(`\\b${escapeRegExp(syn)}\\b`, 'gi');
        freqInResume += (resumeLower.match(synRegex) || []).length;
      }
    }

    const found = freqInResume > 0;
    const item: KeywordMatch = {
      keyword: skillName,
      category: meta.category,
      foundInResume: found,
      frequencyInJd: meta.freq,
      frequencyInResume: freqInResume,
      importance: meta.importance
    };

    if (found) {
      weightedEarned += weight;
      matchedKeywords.push(item);
    } else {
      missingKeywords.push(item);
    }
  }

  // Sort by importance
  const sortFn = (a: KeywordMatch, b: KeywordMatch) => {
    const impOrder = { critical: 3, high: 2, medium: 1 };
    return impOrder[b.importance] - impOrder[a.importance] || b.frequencyInJd - a.frequencyInJd;
  };
  matchedKeywords.sort(sortFn);
  missingKeywords.sort(sortFn);

  const percentage = weightedTotal > 0 ? Math.round((weightedEarned / weightedTotal) * 100) : 100;
  // Keyword score accounts for 40 points out of 100
  const score = Math.round((percentage / 100) * 40);

  return {
    score,
    percentage,
    matchedCount: matchedKeywords.length,
    totalJdKeywords: targetJdSkillsMap.size,
    matchedKeywords,
    missingKeywords
  };
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function capitalizeWords(str: string): string {
  return str.replace(/\b\w/g, l => l.toUpperCase());
}

