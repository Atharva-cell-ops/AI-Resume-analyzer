import { describe, it, expect } from 'vitest';
import { analyzeBulletText } from '../src/controllers/bulletHelperController.js';

describe('Bullet Helper Engine (Deterministic NLP)', () => {
  it('detects strong action verbs and quantified metrics', () => {
    const bullet = 'Architected and deployed a distributed messaging pipeline with Node.js and Kafka, reducing latency by 42%.';
    const result = analyzeBulletText(bullet);

    expect(result.hasActionVerb).toBe(true);
    expect(result.hasMetric).toBe(true);
    expect(result.hasWeakVerb).toBe(false);
    expect(result.isTooLong).toBe(false);
    expect(result.status).toBe('excellent');
  });

  it('flags weak passive phrasing like "helped with" or "assisted"', () => {
    const bullet = 'Helped with website testing and customer queries.';
    const result = analyzeBulletText(bullet);

    expect(result.hasWeakVerb).toBe(true);
    expect(result.status).toBe('weak-verb');
    expect(result.feedback.length).toBeGreaterThan(0);
    expect(result.recommendedRewrite).toBeDefined();
  });

  it('flags bullets missing numbers/metrics', () => {
    const bullet = 'Engineered frontend modules using React and TypeScript for client portals.';
    const result = analyzeBulletText(bullet);

    expect(result.hasActionVerb).toBe(true);
    expect(result.hasMetric).toBe(false);
    expect(result.status).toBe('needs-metric');
    expect(result.feedback.some(f => f.includes('quantifiable metrics'))).toBe(true);
  });

  it('flags bullets exceeding 2 lines (>24 words)', () => {
    const bullet = 'Spearheaded multiple complex cross functional engineering initiatives across three business units and worked closely with product management and design teams to build scalable responsive frontends for internal and external enterprise customers globally.';
    const result = analyzeBulletText(bullet);

    expect(result.isTooLong).toBe(true);
    expect(result.feedback.some(f => f.includes('exceeds 2 lines'))).toBe(true);
  });
});

