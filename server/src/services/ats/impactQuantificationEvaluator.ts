export interface ImpactQuantificationAnalysis {
  score: number; // 0 to 10
  percentage: number;
  quantifiedBulletsCount: number;
  totalBulletsCount: number;
  quantificationRatio: number;
}

export function evaluateImpactQuantification(text: string): ImpactQuantificationAnalysis {
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  // Check if explicit bullet points (starting with •, -, *, >) exist
  const explicitBullets = lines
    .filter(l => /^[•\-\*\>]\s+/.test(l))
    .map(l => l.replace(/^[•\-\*\>]\s+/, ''));

  let bullets: string[] = [];
  if (explicitBullets.length > 0) {
    bullets = explicitBullets;
  } else {
    // If no explicit bullet characters, take substantive accomplishment lines
    bullets = lines.filter(line => {
      const upper = line.toUpperCase();
      return (
        line.length > 20 &&
        line.length < 300 &&
        !upper.includes('SUMMARY') &&
        !upper.includes('EXPERIENCE') &&
        !upper.includes('EDUCATION') &&
        !upper.includes('SKILLS') &&
        !line.includes('@')
      );
    });
  }

  const totalBulletsCount = bullets.length || 1;

  // Metric pattern matches: percentages, currencies, multipliers, counts with nouns
  const metricRegex = /(\b\d+(?:\.\d+)?%|\$\d+(?:,\d+)*(?:\.\d+)?[kmbKMB]?|\b\d+[xX]\b|\b\d+\+\b|\b\d+\b(?:\s+(?:users|clients|engineers|microservices|servers|requests|ms|seconds|hours|days|percent|reduction|increase|growth|retention|events|nodes)))/i;

  let quantifiedCount = 0;
  for (const b of bullets) {
    if (metricRegex.test(b)) {
      quantifiedCount++;
    }
  }

  const ratio = bullets.length > 0 ? quantifiedCount / bullets.length : 0;
  let score = 0;

  if (ratio >= 0.45) score = 10;
  else if (ratio >= 0.35) score = 8;
  else if (ratio >= 0.25) score = 6;
  else if (ratio >= 0.15) score = 4;
  else if (ratio > 0) score = 2;
  else score = 1;

  return {
    score,
    percentage: Math.round(ratio * 100),
    quantifiedBulletsCount: quantifiedCount,
    totalBulletsCount: bullets.length,
    quantificationRatio: parseFloat(ratio.toFixed(2))
  };
}
