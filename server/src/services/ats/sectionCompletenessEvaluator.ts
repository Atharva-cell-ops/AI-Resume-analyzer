export interface SectionCompletenessAnalysis {
  score: number; // 0 to 15
  percentage: number;
  presentSections: string[];
  missingSections: string[];
}

export function evaluateSectionCompleteness(text: string): SectionCompletenessAnalysis {
  const lower = text.toLowerCase();

  const presentSections: string[] = [];
  const missingSections: string[] = [];

  // 1. Contact Section (Email & Phone)
  const hasEmail = /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/.test(text);
  const hasPhone = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(text);

  if (hasEmail && hasPhone) {
    presentSections.push('Contact Information');
  } else {
    missingSections.push('Contact Information (Email & Phone)');
  }

  // 2. Summary
  const hasSummary =
    lower.includes('summary') ||
    lower.includes('profile') ||
    lower.includes('objective') ||
    lower.includes('about me');

  if (hasSummary) {
    presentSections.push('Professional Summary');
  } else {
    missingSections.push('Professional Summary');
  }

  // 3. Work Experience
  const hasExperience =
    lower.includes('experience') ||
    lower.includes('work history') ||
    lower.includes('employment') ||
    lower.includes('professional experience');

  if (hasExperience) {
    presentSections.push('Work Experience');
  } else {
    missingSections.push('Work Experience');
  }

  // 4. Education
  const hasEducation =
    lower.includes('education') ||
    lower.includes('academic') ||
    lower.includes('university') ||
    lower.includes('bachelor') ||
    lower.includes('master') ||
    lower.includes('degree');

  if (hasEducation) {
    presentSections.push('Education');
  } else {
    missingSections.push('Education');
  }

  // 5. Skills
  const hasSkills =
    lower.includes('skills') ||
    lower.includes('technologies') ||
    lower.includes('competencies') ||
    lower.includes('technical expertise');

  if (hasSkills) {
    presentSections.push('Skills');
  } else {
    missingSections.push('Skills');
  }

  const scorePerSection = 3; // 5 * 3 = 15 points
  const score = presentSections.length * scorePerSection;
  const percentage = Math.round((presentSections.length / 5) * 100);

  return {
    score,
    percentage,
    presentSections,
    missingSections
  };
}

