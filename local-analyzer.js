/**
 * Local NLP & Heuristic Engine for Resume Analysis.
 * Runs fully client-side to compute ATS match score, keyword density, active verbs, readability, and structural checklists.
 */

const LocalAnalyzer = {
    // English stop words to filter out when tokenizing keywords
    stopWords: new Set([
        'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves',
        'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
        'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are',
        'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an',
        'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about',
        'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up',
        'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when',
        'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no',
        'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don',
        'should', 'now', 'using', 'used', 'use', 'also', 'within', 'work', 'working', 'worked', 'well', 'etc'
    ]),

    // Action verbs to evaluate resume impact
    actionVerbs: new Set([
        'spearheaded', 'designed', 'architected', 'managed', 'implemented', 'optimized', 'increased', 'decreased',
        'reduced', 'led', 'developed', 'created', 'built', 'accelerated', 'accomplished', 'achieved', 'improved',
        'launched', 'maximized', 'restructured', 'upgraded', 'streamlined', 'pioneered', 'formulated', 'engineered',
        'overhauled', 'boosted', 'resolved', 'delivered', 'facilitated', 'coordinate', 'executed', 'mentored', 'trained'
    ]),

    // Standard high-value technical & soft keywords to detect
    industryKeywords: [
        'react', 'vue', 'angular', 'node', 'nodejs', 'express', 'python', 'django', 'flask', 'fastapi', 'javascript',
        'typescript', 'html', 'css', 'java', 'spring', 'kotlin', 'swift', 'flutter', 'dart', 'c++', 'c#', 'golang',
        'rust', 'ruby', 'rails', 'php', 'laravel', 'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch',
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'ci/cd', 'git', 'github', 'agile', 'scrum', 'jira',
        'graphql', 'rest', 'api', 'microservices', 'serverless', 'terraform', 'ansible', 'machine learning',
        'deep learning', 'nlp', 'data science', 'pytorch', 'tensorflow', 'pandas', 'numpy', 'scikit-learn', 'tableau',
        'powerbi', 'figma', 'ui/ux', 'product management', 'project management', 'devops', 'qa', 'testing', 'cypress',
        'jest', 'selenium', 'cybersecurity', 'cloud computing', 'linux', 'unix', 'saas', 'crm', 'seo', 'marketing'
    ],

    /**
     * Clean and tokenize a block of text.
     * @param {string} text 
     * @returns {string[]} An array of cleaned lowercase words.
     */
    tokenize(text) {
        if (!text) return [];
        return text.toLowerCase()
            .replace(/[^\w\s\-\#\+]/g, ' ') // Keep alphanumeric, whitespace, dashes, hashes, pluses (C++, C#, F#)
            .split(/\s+/)
            .filter(word => word.length > 1 && !this.stopWords.has(word));
    },

    /**
     * Extracts frequency counts of keywords from tokens.
     * @param {string[]} tokens 
     * @returns {Object} Map of keyword -> count.
     */
    getKeywordFrequencies(tokens) {
        const freq = {};
        tokens.forEach(token => {
            freq[token] = (freq[token] || 0) + 1;
        });
        return freq;
    },

    /**
     * Approximate syllable count of a word.
     * @param {string} word 
     * @returns {number}
     */
    countSyllables(word) {
        word = word.toLowerCase();
        if (word.length <= 3) return 1;
        word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
        word = word.replace(/^y/, '');
        const vowels = word.match(/[aeiouy]{1,2}/g);
        return vowels ? vowels.length : 1;
    },

    /**
     * Main analysis method.
     * @param {string} resumeText 
     * @param {string} jobDescription 
     * @returns {Object} Full analysis dashboard data.
     */
    analyze(resumeText, jobDescription = '') {
        const resumeTokens = this.tokenize(resumeText);
        const resumeFreq = this.getKeywordFrequencies(resumeTokens);
        const resumeWordCount = resumeText.trim().split(/\s+/).length;

        // 1. Structure Checklist
        const hasEmail = /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/.test(resumeText);
        const hasPhone = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/.test(resumeText);
        const hasLinkedIn = /linkedin\.com\/in\/[\w\-]+/i.test(resumeText);
        const hasGitHub = /github\.com\/[\w\-]+/i.test(resumeText);

        const lowerText = resumeText.toLowerCase();
        const structureScore = {
            experience: lowerText.includes('experience') || lowerText.includes('work history') || lowerText.includes('employment'),
            education: lowerText.includes('education') || lowerText.includes('academic') || lowerText.includes('university') || lowerText.includes('college'),
            skills: lowerText.includes('skills') || lowerText.includes('technologies') || lowerText.includes('expertise'),
            projects: lowerText.includes('projects') || lowerText.includes('portfolio') || lowerText.includes('personal work'),
            summary: lowerText.includes('summary') || lowerText.includes('profile') || lowerText.includes('objective') || lowerText.includes('about me')
        };

        // 2. Action Verbs analysis
        const foundActionVerbs = {};
        let actionVerbCount = 0;
        resumeTokens.forEach(token => {
            if (this.actionVerbs.has(token)) {
                foundActionVerbs[token] = (foundActionVerbs[token] || 0) + 1;
                actionVerbCount++;
            }
        });
        const actionVerbDensity = (actionVerbCount / resumeWordCount) * 100;

        // 3. Readability Index (Flesch-Kincaid approximation)
        const sentences = resumeText.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const sentenceCount = sentences.length || 1;
        const averageSentenceLength = resumeWordCount / sentenceCount;
        
        let totalSyllables = 0;
        resumeText.split(/\s+/).forEach(word => {
            totalSyllables += this.countSyllables(word);
        });
        const averageSyllablesPerWord = totalSyllables / (resumeWordCount || 1);

        // Flesch Reading Ease Formula
        let readingEase = 206.835 - (1.015 * averageSentenceLength) - (84.6 * averageSyllablesPerWord);
        readingEase = Math.max(0, Math.min(100, readingEase));

        let readabilityLabel = 'Optimized';
        let readabilityColor = 'var(--accent-emerald)';
        if (readingEase < 30) {
            readabilityLabel = 'Very Difficult';
            readabilityColor = 'var(--accent-rose)';
        } else if (readingEase < 50) {
            readabilityLabel = 'Difficult / Academic';
            readabilityColor = 'var(--accent-amber)';
        } else if (readingEase < 70) {
            readabilityLabel = 'Standard / Professional';
            readabilityColor = 'var(--accent-blue)';
        } else if (readingEase < 90) {
            readabilityLabel = 'Easy / conversational';
            readabilityColor = 'var(--accent-emerald)';
        }

        // 4. Job Description & Keyword Matching
        const jdTokens = this.tokenize(jobDescription);
        const jdFreq = this.getKeywordFrequencies(jdTokens);
        
        // Find important keywords in job description
        const jdKeywords = Object.keys(jdFreq).filter(word => {
            // Include word if it is an industry keyword or if it appears multiple times
            return this.industryKeywords.includes(word) || jdFreq[word] > 1;
        });

        const matchedKeywords = [];
        const missingKeywords = [];

        jdKeywords.forEach(keyword => {
            if (resumeFreq[keyword]) {
                matchedKeywords.push({ keyword, count: resumeFreq[keyword], jdCount: jdFreq[keyword] });
            } else {
                missingKeywords.push({ keyword, jdCount: jdFreq[keyword] });
            }
        });

        // If no Job Description is provided, match against top industry keywords
        if (!jobDescription.trim()) {
            this.industryKeywords.forEach(keyword => {
                if (resumeFreq[keyword]) {
                    matchedKeywords.push({ keyword, count: resumeFreq[keyword], jdCount: 1 });
                } else if (Math.random() > 0.8) { // Populate a small set of mock recommended keywords for empty JD
                    missingKeywords.push({ keyword, jdCount: 1 });
                }
            });
        }

        // Sort keywords
        matchedKeywords.sort((a, b) => b.count - a.count);
        missingKeywords.sort((a, b) => b.jdCount - a.jdCount);

        // 5. Scoring Math
        let matchScore = 0;
        
        // Heuristic weighting:
        // - Keyword matching: 50%
        // - Structural completeness: 20%
        // - Contact Information: 15%
        // - Formatting, Action Verbs & Readability: 15%
        
        // Match percentage calculation
        const keywordScore = jdKeywords.length > 0
            ? (matchedKeywords.length / jdKeywords.length) * 100
            : (matchedKeywords.length / 10) * 100; // Base rate against general industry terms

        const structureCompleteness = Object.values(structureScore).filter(Boolean).length / 5; // 0 to 1
        const contactScore = (hasEmail ? 40 : 0) + (hasPhone ? 30 : 0) + (hasLinkedIn ? 20 : 0) + (hasGitHub ? 10 : 0); // 0 to 100
        const formattingScore = Math.min(100, (actionVerbCount >= 5 ? 50 : actionVerbCount * 10) + (readingEase >= 40 && readingEase <= 80 ? 50 : 25));

        matchScore = Math.round(
            (Math.min(100, keywordScore) * 0.50) + 
            (structureCompleteness * 100 * 0.20) + 
            (contactScore * 0.15) + 
            (formattingScore * 0.15)
        );

        // Bound final score between 10 and 99 (never 100, always room to improve!)
        matchScore = Math.max(12, Math.min(98, matchScore));

        // 6. Generate Recommendations & Feedback
        const feedback = [];
        
        if (!hasEmail) {
            feedback.push({
                category: 'Contact Info',
                severity: 'high',
                title: 'Missing Email Address',
                desc: 'An email is critical for recruiters to reach out. Ensure it is prominently displayed in the header.'
            });
        }
        if (!hasPhone) {
            feedback.push({
                category: 'Contact Info',
                severity: 'medium',
                title: 'No Phone Number Found',
                desc: 'Some hiring systems filter out profiles that lack basic contact phone numbers. Consider adding one.'
            });
        }
        if (!hasLinkedIn) {
            feedback.push({
                category: 'Social Profile',
                severity: 'medium',
                title: 'Add LinkedIn Profile',
                desc: 'Over 85% of recruiters cross-reference resumes with LinkedIn profiles. Include a clean hyperlink.'
            });
        }

        // Structure feedbacks
        if (!structureScore.summary) {
            feedback.push({
                category: 'Resume Structure',
                severity: 'low',
                title: 'Add a Professional Summary',
                desc: 'A brief, 3-4 line summary at the top captures attention immediately and frames your career narrative.'
            });
        }
        if (!structureScore.projects && resumeTokens.length < 500) {
            feedback.push({
                category: 'Resume Structure',
                severity: 'medium',
                title: 'Include Technical Projects',
                desc: 'Adding a "Projects" section helps back up your skills with tangible, real-world examples.'
            });
        }

        // Action verb feedback
        if (actionVerbCount < 6) {
            feedback.push({
                category: 'Content Impact',
                severity: 'high',
                title: 'Low Action Verb Density',
                desc: `Found only ${actionVerbCount} powerful action verbs. Use dynamic verbs like "engineered", "streamlined", or "accelerated" to describe your achievements instead of "responsible for" or "helped with".`
            });
        } else {
            feedback.push({
                category: 'Content Impact',
                severity: 'low',
                title: 'Excellent Active Language',
                desc: `Great job! Your resume uses ${actionVerbCount} active phrasing tokens, helping your accomplishments stand out.`
            });
        }

        // Sentence length feedback
        if (averageSentenceLength > 24) {
            feedback.push({
                category: 'Readability',
                severity: 'medium',
                title: 'Sentences are Too Long',
                desc: `Your sentences average ${Math.round(averageSentenceLength)} words. Aim for 12-18 words to make it easier for ATS scanners and human recruiters to skim.`
            });
        }

        // Readability feedback
        if (readingEase < 40) {
            feedback.push({
                category: 'Readability',
                severity: 'medium',
                title: 'Highly Academic or Complex Text',
                desc: 'Your writing complexity is high. Simplify sentences and avoid dense jargon to improve clarity.'
            });
        }

        // Keyword density feedback
        if (missingKeywords.length > 0) {
            const topMissing = missingKeywords.slice(0, 3).map(k => `"${k.keyword}"`).join(', ');
            feedback.push({
                category: 'ATS Alignment',
                severity: 'high',
                title: 'Important Missing Keywords',
                desc: `Your resume is missing key terms requested in the job description: ${topMissing}. Weave these naturally into your experience or skills list.`
            });
        }

        // Populate mock custom bullet-point reviews based on found verbs
        // Let's parse sentences and look for weaker ones to suggest local rewrites
        const weakBulletPoints = [];
        sentences.forEach(sentence => {
            const trimmed = sentence.trim();
            if (trimmed.length > 25 && trimmed.length < 150) {
                const lowerSentence = trimmed.toLowerCase();
                const isWeak = lowerSentence.includes('responsible for') || 
                               lowerSentence.includes('helped') || 
                               lowerSentence.includes('assisted') || 
                               lowerSentence.includes('worked on') ||
                               (!Array.from(this.actionVerbs).some(verb => lowerSentence.includes(verb)));
                
                if (isWeak && weakBulletPoints.length < 4) {
                    // Try to suggest a rewrite based on the sentence
                    let suggestion = 'Rewrite this sentence using the Google XYZ Formula: Accomplished [X], as measured by [Y], by doing [Z]. Start with a strong action verb.';
                    if (lowerSentence.includes('responsible for')) {
                        suggestion = 'Replace "Responsible for..." with an active verb. Example: "Spearheaded design and delivery of..." instead of "Responsible for designing..."';
                    } else if (lowerSentence.includes('helped') || lowerSentence.includes('assisted')) {
                        suggestion = 'Instead of "Helped with...", use strong verbs like "Facilitated", "Collaborated on", or "Coordinated".';
                    }
                    weakBulletPoints.push({
                        original: trimmed,
                        suggestion: suggestion
                    });
                }
            }
        });

        // Fallback dummy suggestions if no weaker bullet points found
        if (weakBulletPoints.length === 0) {
            weakBulletPoints.push({
                original: "Responsible for managing the team and talking to stakeholders.",
                suggestion: "Spearheaded weekly stakeholder synchronization meetings, leading a cross-functional team of 5 to successfully deliver the roadmap 2 weeks ahead of schedule."
            });
            weakBulletPoints.push({
                original: "Helped write the front-end code using React and Javascript.",
                suggestion: "Architected modern React user interfaces, optimizing state management and rendering pathways, which reduced page loading times by 35%."
            });
        }

        return {
            overallScore: matchScore,
            wordCount: resumeWordCount,
            readingEase: Math.round(readingEase),
            readabilityLabel,
            readabilityColor,
            actionVerbCount,
            actionVerbDensity: actionVerbDensity.toFixed(1),
            contactInfo: {
                hasEmail,
                hasPhone,
                hasLinkedIn,
                hasGitHub
            },
            structureScore,
            matchedKeywords,
            missingKeywords,
            feedback,
            weakBulletPoints
        };
    }
};
