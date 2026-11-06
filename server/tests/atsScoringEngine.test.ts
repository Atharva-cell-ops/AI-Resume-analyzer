import { describe, it, expect } from 'vitest';
import { PureAtsScoringEngine } from '../src/services/ats/scoringEngine.js';
import { evaluateKeywords } from '../src/services/ats/keywordMatcher.js';
import { evaluateSectionCompleteness } from '../src/services/ats/sectionCompletenessEvaluator.js';
import { evaluateFormattingParsability } from '../src/services/ats/formattingParsabilityEvaluator.js';
import { evaluateImpactQuantification } from '../src/services/ats/impactQuantificationEvaluator.js';
import { evaluateActionVerbs } from '../src/services/ats/actionVerbsEvaluator.js';
import { evaluateReadability } from '../src/services/ats/readabilityEvaluator.js';
import { calculateFleschReadingEase, simpleStem, tokenizeText, generateNgrams } from '../src/services/ats/nlpUtils.js';

const engine = new PureAtsScoringEngine();

const SAMPLE_STRONG_RESUME = `
Alex Morgan
alex.morgan@example.com • +1 (555) 234-5678 • San Francisco, CA
linkedin.com/in/alexmorgan • github.com/alexmorgan

PROFESSIONAL SUMMARY
Versatile Senior Full Stack Software Engineer with 5+ years of experience designing, architecting, and scaling high-performance web applications, distributed systems, and cloud microservices using React, TypeScript, Node.js, and Docker.

WORK EXPERIENCE
Senior Software Engineer — TechFlow Solutions (2022 – Present)
• Architected and deployed real-time event streaming pipeline using Node.js and Kafka, reducing latency by 42%.
• Led a high-performing squad of 5 engineers to deliver client dashboards using React and TypeScript, boosting customer retention by 18%.
• Optimized PostgreSQL database query execution plans and caching with Redis, reducing peak server load by 35%.

Software Engineer — Innovate Apps (2020 – 2022)
• Developed reusable UI component library in React and Tailwind CSS, accelerating frontend feature turnaround time by 25%.
• Implemented end-to-end automated testing pipelines with Playwright, decreasing production bug leakage by 30%.
• Automated deployment workflows using Docker, GitHub Actions, and AWS, cutting release times by 50%.

TECHNICAL PROJECTS
CloudMetrics — Distributed Monitoring Dashboard
• Constructed open-source telemetry platform handling over 500,000 daily events with PostgreSQL and Redis.
• Engineered responsive web interface using React, Next.js, and Tailwind CSS.

EDUCATION
University of California, Berkeley (2016 – 2020)
Bachelor of Science in Computer Science • GPA: 3.85 / 4.0

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, SQL, HTML5, CSS3
Frameworks: React, Next.js, Node.js, Express.js, Tailwind CSS
Databases & Cloud: PostgreSQL, Redis, Docker, Kubernetes, AWS, Git, CI/CD
`;

const SAMPLE_JOB_DESCRIPTION = `
We are looking for a Senior Full Stack Engineer proficient in React, TypeScript, Node.js, PostgreSQL, Docker, and AWS.
Responsibilities include building distributed systems, optimizing database queries, and leading CI/CD automation pipelines.
Experience with Redis and microservices is strongly preferred.
`;

describe('Pure ATS Scoring Engine — 32 Comprehensive Unit Tests', () => {
  // 1-5: NLP Utilities
  describe('NLP Utilities', () => {
    it('1. tokenizes text while preserving technical tokens like C++, C#, and Node.js', () => {
      const tokens = tokenizeText('Coding in C++, C#, and Node.js on .NET and CI/CD');
      expect(tokens).toContain('c++');
      expect(tokens).toContain('c#');
      expect(tokens).toContain('node.js');
      expect(tokens).toContain('.net');
      expect(tokens).toContain('ci/cd');
    });

    it('2. filters out standard English stopwords', () => {
      const tokens = tokenizeText('This is a test of the emergency broadcasting system');
      expect(tokens).not.toContain('this');
      expect(tokens).not.toContain('is');
      expect(tokens).not.toContain('a');
      expect(tokens).toContain('test');
      expect(tokens).toContain('emergency');
    });

    it('3. stems common English suffixes accurately', () => {
      expect(simpleStem('optimizing')).toBe('optimiz');
      expect(simpleStem('engineered')).toBe('engineer');
      expect(simpleStem('technologies')).toBe('technology');
    });

    it('4. generates n-grams up to trigrams', () => {
      const ngrams = generateNgrams(['software', 'engineer', 'react']);
      expect(ngrams).toContain('software engineer');
      expect(ngrams).toContain('software engineer react');
    });

    it('5. computes Flesch Reading Ease score within 0 to 100 range', () => {
      const ease = calculateFleschReadingEase('This is a very simple and clear sentence. We write short words.');
      expect(ease.score).toBeGreaterThan(60);
      expect(ease.label).toBeDefined();
    });
  });

  // 6-11: Keyword Matcher (40%)
  describe('Keyword Matcher (40% Weight)', () => {
    it('6. detects exact keyword matches between resume and job description', () => {
      const result = evaluateKeywords(SAMPLE_STRONG_RESUME, SAMPLE_JOB_DESCRIPTION);
      const matchedNames = result.matchedKeywords.map(k => k.keyword.toLowerCase());
      expect(matchedNames).toContain('react');
      expect(matchedNames).toContain('typescript');
      expect(matchedNames).toContain('node.js');
      expect(matchedNames).toContain('postgresql');
      expect(matchedNames).toContain('docker');
    });

    it('7. resolves synonyms (e.g. JS matches JavaScript, K8s matches Kubernetes)', () => {
      const resume = 'Expert in JS, K8s, and Postgres.';
      const jd = 'Looking for JavaScript, Kubernetes, and PostgreSQL developer.';
      const result = evaluateKeywords(resume, jd);
      const matchedNames = result.matchedKeywords.map(k => k.keyword);
      expect(matchedNames).toContain('JavaScript');
      expect(matchedNames).toContain('Kubernetes');
      expect(matchedNames).toContain('PostgreSQL');
    });

    it('8. flags missing critical keywords when not in resume', () => {
      const resume = 'Experienced in Python, Django, and MySQL.';
      const jd = 'Must know Docker, Kubernetes, GraphQL, and AWS.';
      const result = evaluateKeywords(resume, jd);
      const missingNames = result.missingKeywords.map(k => k.keyword);
      expect(missingNames).toContain('Docker');
      expect(missingNames).toContain('Kubernetes');
      expect(missingNames).toContain('AWS');
    });

    it('9. scores proportionally up to 40 points', () => {
      const result = evaluateKeywords(SAMPLE_STRONG_RESUME, SAMPLE_JOB_DESCRIPTION);
      expect(result.score).toBeGreaterThanOrEqual(30);
      expect(result.score).toBeLessThanOrEqual(40);
    });

    it('10. handles empty job description by matching against core industry taxonomy', () => {
      const result = evaluateKeywords(SAMPLE_STRONG_RESUME, '');
      expect(result.totalJdKeywords).toBeGreaterThan(0);
      expect(result.matchedCount).toBeGreaterThan(0);
      expect(result.score).toBeGreaterThan(0);
    });

    it('11. assigns critical importance to keywords repeated 3+ times in JD', () => {
      const jd = 'Docker is essential. We use Docker in production. Docker containers everywhere.';
      const result = evaluateKeywords('I know Docker.', jd);
      const docker = result.matchedKeywords.find(k => k.keyword === 'Docker');
      expect(docker?.importance).toBe('critical');
    });
  });

  // 12-16: Section Completeness (15%)
  describe('Section Completeness (15% Weight)', () => {
    it('12. awards full 15 points when all 5 standard sections are present', () => {
      const result = evaluateSectionCompleteness(SAMPLE_STRONG_RESUME);
      expect(result.score).toBe(15);
      expect(result.presentSections.length).toBe(5);
      expect(result.missingSections.length).toBe(0);
    });

    it('13. detects missing contact email or phone', () => {
      const text = 'John Doe. Summary: Dev. Experience: Coder. Education: BS CS. Skills: JS.';
      const result = evaluateSectionCompleteness(text);
      expect(result.missingSections.some(s => s.includes('Contact'))).toBe(true);
      expect(result.score).toBe(12);
    });

    it('14. detects missing professional summary', () => {
      const text = 'test@example.com 555-123-4567. Experience: Dev at Acme. Education: BS. Skills: Python.';
      const result = evaluateSectionCompleteness(text);
      expect(result.missingSections).toContain('Professional Summary');
    });

    it('15. detects missing work experience section', () => {
      const text = 'test@example.com 555-123-4567. Summary: Student. Education: BS CS. Skills: Java.';
      const result = evaluateSectionCompleteness(text);
      expect(result.missingSections).toContain('Work Experience');
    });

    it('16. detects missing education section', () => {
      const text = 'test@example.com 555-123-4567. Summary: Dev. Experience: Coder at Google. Skills: Go.';
      const result = evaluateSectionCompleteness(text);
      expect(result.missingSections).toContain('Education');
    });
  });

  // 17-20: Formatting & Parsability (15%)
  describe('Formatting & Parsability (15% Weight)', () => {
    it('17. gives high score for clean single-column text with valid dates', () => {
      const result = evaluateFormattingParsability(SAMPLE_STRONG_RESUME, 1, 'pdf');
      expect(result.score).toBe(15);
      expect(result.isSingleColumn).toBe(true);
      expect(result.issues.length).toBe(0);
    });

    it('18. penalizes multi-page length (>2 pages) for standard candidates', () => {
      const longText = 'word '.repeat(1500) + ' 2021 - Present';
      const result = evaluateFormattingParsability(longText, 4, 'pdf');
      expect(result.score).toBeLessThan(15);
      expect(result.issues.some(i => i.includes('too long'))).toBe(true);
    });

    it('19. flags missing chronological date patterns', () => {
      const text = 'Software engineer at Acme. Worked on apps. No dates anywhere.';
      const result = evaluateFormattingParsability(text, 1, 'pdf');
      expect(result.issues.some(i => i.includes('dates'))).toBe(true);
    });

    it('20. detects ASCII table borders and flags formatting warning', () => {
      const text = '| Experience | Company | Dates |\n| Senior Dev | Acme | 2021-2023 |';
      const result = evaluateFormattingParsability(text, 1, 'pdf');
      expect(result.isSingleColumn).toBe(false);
      expect(result.issues.some(i => i.includes('table'))).toBe(true);
    });
  });

  // 21-23: Impact & Quantification (10%)
  describe('Impact & Quantification (10% Weight)', () => {
    it('21. awards 10 points when over 45% of bullets contain metrics', () => {
      const result = evaluateImpactQuantification(SAMPLE_STRONG_RESUME);
      expect(result.score).toBe(10);
      expect(result.quantificationRatio).toBeGreaterThanOrEqual(0.45);
    });

    it('22. penalizes resumes with zero metrics in bullets', () => {
      const resume = `
        • Developed frontend code for customer login.
        • Fixed bug reports submitted by quality assurance.
        • Attended daily standup meetings and reviewed code.
      `;
      const result = evaluateImpactQuantification(resume);
      expect(result.quantifiedBulletsCount).toBe(0);
      expect(result.score).toBeLessThanOrEqual(2);
    });

    it('23. recognizes percentages, dollar values, multipliers, and scaling counts', () => {
      const resume = `
        • Increased sales by 45% year-over-year.
        • Managed $1.5M operating cloud budget.
        • Scaled application to 250,000 active users with 3x throughput.
      `;
      const result = evaluateImpactQuantification(resume);
      expect(result.quantifiedBulletsCount).toBe(3);
      expect(result.score).toBe(10);
    });
  });

  // 24-27: Action Verbs & Tone (10%)
  describe('Action Verbs & Tone (10% Weight)', () => {
    it('24. awards high score for strong active verb diversity', () => {
      const result = evaluateActionVerbs(SAMPLE_STRONG_RESUME);
      expect(result.strongVerbsCount).toBeGreaterThanOrEqual(5);
      expect(result.score).toBeGreaterThanOrEqual(8);
    });

    it('25. flags passive voice phrases like "helped with" and "responsible for"', () => {
      const text = 'Responsible for server monitoring. Helped with database updates. Assisted in testing.';
      const result = evaluateActionVerbs(text);
      expect(result.weakOrPassivePhrases.length).toBeGreaterThanOrEqual(2);
      expect(result.weakOrPassivePhrases.some(p => p.includes('responsible for'))).toBe(true);
    });

    it('26. flags repeated action verbs when used > 3 times', () => {
      const text = 'Developed app. Developed backend. Developed test. Developed pipeline.';
      const result = evaluateActionVerbs(text);
      expect(result.repeatedVerbs.some(r => r.verb === 'developed' && r.count === 4)).toBe(true);
    });

    it('27. handles text with no action verbs gracefully', () => {
      const text = 'The work was about code and features.';
      const result = evaluateActionVerbs(text);
      expect(result.strongVerbsCount).toBe(0);
      expect(result.score).toBeLessThanOrEqual(5);
    });
  });

  // 28-30: Readability & Length (10%)
  describe('Readability & Length (10% Weight)', () => {
    it('28. awards full score for optimal sentence length without cliches', () => {
      const result = evaluateReadability(SAMPLE_STRONG_RESUME);
      expect(result.score).toBeGreaterThanOrEqual(8);
      expect(result.detectedCliches.length).toBe(0);
    });

    it('29. detects empty buzzwords and cliches', () => {
      const text = 'I am a hard worker and team player who loves to think outside the box with synergy.';
      const result = evaluateReadability(text);
      expect(result.detectedCliches).toContain('hard worker');
      expect(result.detectedCliches).toContain('team player');
      expect(result.detectedCliches).toContain('think outside the box');
      expect(result.detectedCliches).toContain('synergy');
      expect(result.score).toBeLessThan(7);
    });

    it('30. penalizes excessively long run-on sentences (>28 words)', () => {
      const longSentence = 'We built a very extensive enterprise customer data storage system across several regional cloud zones using many different technologies and languages that were selected by various stakeholders over several months.';
      const result = evaluateReadability(longSentence);
      expect(result.averageSentenceLength).toBeGreaterThan(28);
      expect(result.score).toBeLessThan(10);
    });
  });

  // 31-32: Master Engine Integration & Suggestions
  describe('Master Engine End-to-End', () => {
    it('31. generates a high overall ATS score (85-100) for a well-matched technical resume', () => {
      const analysis = engine.scoreResume(SAMPLE_STRONG_RESUME, SAMPLE_JOB_DESCRIPTION);
      expect(analysis.overallScore).toBeGreaterThanOrEqual(85);
      expect(analysis.overallScore).toBeLessThanOrEqual(100);
      expect(analysis.breakdown.keywordMatch.score).toBeGreaterThan(30);
      expect(analysis.breakdown.sectionCompleteness.score).toBe(15);
      expect(analysis.breakdown.impactQuantification.score).toBe(10);
    });

    it('32. returns actionable suggestions ranked by potential score gain descending', () => {
      // Weak resume missing keywords and metrics
      const weakResume = 'John Doe. john@example.com 555-0100. Summary: I code. Experience: Worked on basic website. Skills: HTML.';
      const jd = 'Requires React, Docker, Kubernetes, AWS, TypeScript, PostgreSQL.';
      const analysis = engine.scoreResume(weakResume, jd);

      expect(analysis.suggestions.length).toBeGreaterThan(0);
      // Verify descending order
      for (let i = 0; i < analysis.suggestions.length - 1; i++) {
        expect(analysis.suggestions[i].potentialScoreGain).toBeGreaterThanOrEqual(
          analysis.suggestions[i + 1].potentialScoreGain
        );
      }
      expect(analysis.suggestions[0].title).toBeDefined();
      expect(analysis.suggestions[0].potentialScoreGain).toBeGreaterThan(0);
    });
  });
});
