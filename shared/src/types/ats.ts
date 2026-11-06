export interface KeywordMatch {
  keyword: string;
  category?: string;
  foundInResume: boolean;
  frequencyInJd: number;
  frequencyInResume: number;
  importance: 'critical' | 'high' | 'medium';
}

export interface AtsScoreBreakdown {
  keywordMatch: {
    score: number; // 0 - 40
    percentage: number;
    matchedCount: number;
    totalJdKeywords: number;
  };
  sectionCompleteness: {
    score: number; // 0 - 15
    percentage: number;
    presentSections: string[];
    missingSections: string[];
  };
  formattingParsability: {
    score: number; // 0 - 15
    percentage: number;
    issues: string[];
    isSingleColumn: boolean;
    pageCountEstimate: number;
  };
  impactQuantification: {
    score: number; // 0 - 10
    percentage: number;
    quantifiedBulletsCount: number;
    totalBulletsCount: number;
    quantificationRatio: number;
  };
  actionVerbsTone: {
    score: number; // 0 - 10
    percentage: number;
    strongVerbsCount: number;
    weakOrPassivePhrases: string[];
    repeatedVerbs: { verb: string; count: number }[];
  };
  readabilityLength: {
    score: number; // 0 - 10
    percentage: number;
    readingEaseScore: number;
    readingEaseLabel: string;
    averageSentenceLength: number;
    detectedCliches: string[];
  };
}

export interface AtsSuggestion {
  id: string;
  category: 'keyword' | 'impact' | 'verbs' | 'structure' | 'readability';
  severity: 'critical' | 'warning' | 'tip';
  title: string;
  description: string;
  potentialScoreGain: number;
}

export interface AtsAnalysisResult {
  overallScore: number; // 0 - 100
  breakdown: AtsScoreBreakdown;
  matchedKeywords: KeywordMatch[];
  missingKeywords: KeywordMatch[];
  suggestions: AtsSuggestion[];
  analyzedAt: string;
}

