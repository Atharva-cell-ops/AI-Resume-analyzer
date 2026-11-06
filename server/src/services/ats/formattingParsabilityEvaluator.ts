export interface FormattingParsabilityAnalysis {
  score: number; // 0 to 15
  percentage: number;
  issues: string[];
  isSingleColumn: boolean;
  pageCountEstimate: number;
}

export function evaluateFormattingParsability(
  text: string,
  pageCount = 1,
  fileType: 'pdf' | 'docx' | 'txt' | 'json' = 'pdf'
): FormattingParsabilityAnalysis {
  const issues: string[] = [];
  let score = 15;

  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Estimated Page Count based on standard single-column density
  const estimatedPages = Math.max(1, Math.ceil(wordCount / 450));
  const finalPageCount = Math.max(pageCount, estimatedPages);

  // 2. Length check: over 2 pages or disproportionately long
  if (finalPageCount > 2) {
    score -= 4;
    issues.push(`Resume length estimate (${finalPageCount} pages) is too long for typical screening. Target 1 page for under 5 years of experience or 2 pages for senior roles.`);
  } else if (wordCount < 150) {
    score -= 5;
    issues.push('Resume content is extremely brief (<150 words). Provide deeper details on roles and projects.');
  }

  // 3. Valid Chronological Date Format Detection
  // Matches patterns like "2020 - 2022", "2021 - Present", "Jan 2022 – Present", "05/2021 - 08/2023"
  const datePattern = /\b(?:19|20)\d{2}\s*(?:-|–|to)\s*(?:(?:19|20)\d{2}|present|current)\b|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(?:19|20)\d{2}\b/i;
  const hasValidDates = datePattern.test(text);

  if (!hasValidDates) {
    score -= 3;
    issues.push('Could not detect standard chronological dates (e.g., "2021 – Present" or "Jan 2020 – 2023"). ATS parsers need structured dates to calculate years of experience.');
  }

  // 4. File Type Check
  if (fileType !== 'pdf' && fileType !== 'docx' && fileType !== 'json') {
    score -= 3;
    issues.push('Unsupported file format. Always submit standard PDF or DOCX files for ATS systems.');
  }

  // 5. Check for table-like formatting artifacts
  const hasAsciiTable = /\|.*\|.*\|/.test(text) || /\+[-+]+\+/.test(text);
  const isSingleColumn = !hasAsciiTable;

  if (hasAsciiTable) {
    score -= 3;
    issues.push('Detected table border artifacts. Complex tables confuse ATS OCR scanners; use clean single-column bullet points instead.');
  }

  score = Math.max(0, Math.min(15, score));
  const percentage = Math.round((score / 15) * 100);

  return {
    score,
    percentage,
    issues,
    isSingleColumn,
    pageCountEstimate: finalPageCount
  };
}

