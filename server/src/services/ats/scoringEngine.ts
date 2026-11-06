import {
  AtsAnalysisResult,
  AtsScoreBreakdown,
  KeywordMatch,
  AtsSuggestion,
  ResumeData
} from '@ai-resume/shared';
import { evaluateKeywords } from './keywordMatcher.js';
import { evaluateSectionCompleteness } from './sectionCompletenessEvaluator.js';
import { evaluateFormattingParsability } from './formattingParsabilityEvaluator.js';
import { evaluateImpactQuantification } from './impactQuantificationEvaluator.js';
import { evaluateActionVerbs } from './actionVerbsEvaluator.js';
import { evaluateReadability } from './readabilityEvaluator.js';
import { generateActionableSuggestions } from './suggestionGenerator.js';

export interface IAtsScoringEngine {
  scoreResume(
    resumeText: string,
    jobDescription: string,
    options?: { pageCount?: number; fileType?: 'pdf' | 'docx' | 'txt' | 'json' }
  ): AtsAnalysisResult;
}

export class PureAtsScoringEngine implements IAtsScoringEngine {
  public scoreResume(
    resumeText: string,
    jobDescription: string,
    options: { pageCount?: number; fileType?: 'pdf' | 'docx' | 'txt' | 'json' } = {}
  ): AtsAnalysisResult {
    const pageCount = options.pageCount || 1;
    const fileType = options.fileType || 'pdf';

    // 1. Keyword Match (40%)
    const kwAnalysis = evaluateKeywords(resumeText, jobDescription);

    // 2. Section Completeness (15%)
    const sectAnalysis = evaluateSectionCompleteness(resumeText);

    // 3. Formatting & Parsability (15%)
    const fmtAnalysis = evaluateFormattingParsability(resumeText, pageCount, fileType);

    // 4. Impact & Quantification (10%)
    const impactAnalysis = evaluateImpactQuantification(resumeText);

    // 5. Action Verbs & Tone (10%)
    const verbAnalysis = evaluateActionVerbs(resumeText);

    // 6. Readability & Length (10%)
    const readAnalysis = evaluateReadability(resumeText);

    // Combine breakdown
    const breakdown: AtsScoreBreakdown = {
      keywordMatch: {
        score: kwAnalysis.score,
        percentage: kwAnalysis.percentage,
        matchedCount: kwAnalysis.matchedCount,
        totalJdKeywords: kwAnalysis.totalJdKeywords
      },
      sectionCompleteness: {
        score: sectAnalysis.score,
        percentage: sectAnalysis.percentage,
        presentSections: sectAnalysis.presentSections,
        missingSections: sectAnalysis.missingSections
      },
      formattingParsability: {
        score: fmtAnalysis.score,
        percentage: fmtAnalysis.percentage,
        issues: fmtAnalysis.issues,
        isSingleColumn: fmtAnalysis.isSingleColumn,
        pageCountEstimate: fmtAnalysis.pageCountEstimate
      },
      impactQuantification: {
        score: impactAnalysis.score,
        percentage: impactAnalysis.percentage,
        quantifiedBulletsCount: impactAnalysis.quantifiedBulletsCount,
        totalBulletsCount: impactAnalysis.totalBulletsCount,
        quantificationRatio: impactAnalysis.quantificationRatio
      },
      actionVerbsTone: {
        score: verbAnalysis.score,
        percentage: verbAnalysis.percentage,
        strongVerbsCount: verbAnalysis.strongVerbsCount,
        weakOrPassivePhrases: verbAnalysis.weakOrPassivePhrases,
        repeatedVerbs: verbAnalysis.repeatedVerbs
      },
      readabilityLength: {
        score: readAnalysis.score,
        percentage: readAnalysis.percentage,
        readingEaseScore: readAnalysis.readingEaseScore,
        readingEaseLabel: readAnalysis.readingEaseLabel,
        averageSentenceLength: readAnalysis.averageSentenceLength,
        detectedCliches: readAnalysis.detectedCliches
      }
    };

    // Calculate total score (0 to 100)
    const rawScore =
      breakdown.keywordMatch.score +
      breakdown.sectionCompleteness.score +
      breakdown.formattingParsability.score +
      breakdown.impactQuantification.score +
      breakdown.actionVerbsTone.score +
      breakdown.readabilityLength.score;

    const overallScore = Math.max(0, Math.min(100, Math.round(rawScore)));

    // Generate prioritized suggestions
    const suggestions = generateActionableSuggestions(breakdown, kwAnalysis.missingKeywords);

    return {
      overallScore,
      breakdown,
      matchedKeywords: kwAnalysis.matchedKeywords,
      missingKeywords: kwAnalysis.missingKeywords,
      suggestions,
      analyzedAt: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const atsScoringEngine = new PureAtsScoringEngine();

