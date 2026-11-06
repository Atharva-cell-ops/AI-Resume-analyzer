import { AtsSuggestion, AtsScoreBreakdown, KeywordMatch } from '@ai-resume/shared';

export function generateActionableSuggestions(
  breakdown: AtsScoreBreakdown,
  missingKeywords: KeywordMatch[]
): AtsSuggestion[] {
  const suggestions: AtsSuggestion[] = [];

  // 1. Missing Critical / High Keywords
  if (missingKeywords.length > 0) {
    const criticalMissing = missingKeywords.filter(k => k.importance === 'critical');
    const highMissing = missingKeywords.filter(k => k.importance === 'high');

    const topKeywordsToRecommend = [...criticalMissing, ...highMissing].slice(0, 4);

    if (topKeywordsToRecommend.length > 0) {
      const names = topKeywordsToRecommend.map(k => `"${k.keyword}"`).join(', ');
      const estimatedGain = Math.min(12, topKeywordsToRecommend.length * 3);

      suggestions.push({
        id: 'sugg-missing-keywords',
        category: 'keyword',
        severity: 'critical',
        title: `Inject Top Target Keywords (${names})`,
        description: `Your targeted job description heavily emphasizes ${names}. Integrating these directly into your technical skills and project descriptions could raise your ATS score significantly.`,
        potentialScoreGain: estimatedGain
      });
    }
  }

  // 2. Section Completeness Suggestions
  if (breakdown.sectionCompleteness.missingSections.length > 0) {
    const missing = breakdown.sectionCompleteness.missingSections.join(', ');
    const gain = breakdown.sectionCompleteness.missingSections.length * 3;

    suggestions.push({
      id: 'sugg-missing-sections',
      category: 'structure',
      severity: 'critical',
      title: `Add Missing Essential Sections (${missing})`,
      description: `ATS parsers expect standard sections. Ensure you have dedicated sections for ${missing}.`,
      potentialScoreGain: gain
    });
  }

  // 3. Impact & Quantification Suggestions
  if (breakdown.impactQuantification.quantificationRatio < 0.35) {
    const gain = Math.max(3, 10 - breakdown.impactQuantification.score);
    suggestions.push({
      id: 'sugg-quantification',
      category: 'impact',
      severity: 'warning',
      title: 'Quantify Accomplishments with Numbers & Percentages',
      description: `Only ${breakdown.impactQuantification.percentage}% of your bullet points contain quantifiable numbers. Recruiter OCR algorithms favor metrics like "% performance gain", "$ budget", or "X users/team members".`,
      potentialScoreGain: gain
    });
  }

  // 4. Action Verbs & Tone Suggestions
  if (breakdown.actionVerbsTone.weakOrPassivePhrases.length > 0) {
    const sample = breakdown.actionVerbsTone.weakOrPassivePhrases.slice(0, 2).join(', ');
    suggestions.push({
      id: 'sugg-weak-verbs',
      category: 'verbs',
      severity: 'warning',
      title: 'Replace Passive Phrasing with Dynamic Action Verbs',
      description: `Found passive phrases like ${sample}. Replace them with strong active verbs like "Architected", "Spearheaded", or "Streamlined".`,
      potentialScoreGain: 3
    });
  }

  if (breakdown.actionVerbsTone.repeatedVerbs.length > 0) {
    const repeated = breakdown.actionVerbsTone.repeatedVerbs.map(r => `"${r.verb}" (${r.count}x)`).join(', ');
    suggestions.push({
      id: 'sugg-repeated-verbs',
      category: 'verbs',
      severity: 'tip',
      title: 'Diversify Repeated Action Verbs',
      description: `You repeated verbs multiple times: ${repeated}. Use synonyms to demonstrate a broader range of leadership and technical execution.`,
      potentialScoreGain: 2
    });
  }

  // 5. Readability & Cliches
  if (breakdown.readabilityLength.detectedCliches.length > 0) {
    const clichesList = breakdown.readabilityLength.detectedCliches.map(c => `"${c}"`).join(', ');
    suggestions.push({
      id: 'sugg-cliches',
      category: 'readability',
      severity: 'tip',
      title: 'Remove Overused Buzzwords & Clichés',
      description: `Found buzzwords like ${clichesList}. Modern ATS scoring and senior hiring managers prefer tangible proof over generic self-descriptions.`,
      potentialScoreGain: 2
    });
  }

  // 6. Formatting Issues
  if (breakdown.formattingParsability.issues.length > 0) {
    const issueDesc = breakdown.formattingParsability.issues[0];
    suggestions.push({
      id: 'sugg-formatting',
      category: 'structure',
      severity: 'warning',
      title: 'Resolve Formatting & Parsability Warnings',
      description: issueDesc,
      potentialScoreGain: Math.max(2, 15 - breakdown.formattingParsability.score)
    });
  }

  // Sort descending by potentialScoreGain
  suggestions.sort((a, b) => b.potentialScoreGain - a.potentialScoreGain);

  return suggestions;
}

