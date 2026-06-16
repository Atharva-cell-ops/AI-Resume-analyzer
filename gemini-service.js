/**
 * Gemini API Integration Service.
 * Performs direct browser-to-API requests to the Google Gemini API, returning structured JSON feedback.
 */

const GeminiService = {
    /**
     * Call the Gemini API.
     * @param {string} apiKey - User's Gemini API Key.
     * @param {string} resumeText - Extracted resume text.
     * @param {string} jobDescription - Target job description (optional).
     * @param {Object} imageObj - Optional image data object with { mimeType, base64 } (optional).
     * @returns {Promise<Object>} Structured analysis from Gemini.
     */
    async analyze(apiKey, resumeText, jobDescription = '', imageObj = null) {
        if (!apiKey) {
            throw new Error('API key is required for Gemini AI Analysis.');
        }

        const model = 'gemini-1.5-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const systemPrompt = `You are an expert ATS (Applicant Tracking System) Auditor and Elite Tech Recruiter.
Analyze the provided RESUME and optional JOB DESCRIPTION.
You must return a valid, parsable JSON response matching the schema specified below. Do not include any markdown backticks or explanations outside of the JSON.

JSON Schema:
{
  "atsScore": number (integer between 10 and 99 reflecting compatibility and strength),
  "summary": "string (brief executive overview of the resume)",
  "strengths": [
    {
      "title": "string (name of strength)",
      "description": "string (detailed rationale)"
    }
  ],
  "weaknesses": [
    {
      "title": "string (name of gap/weakness)",
      "description": "string (detailed explanation)",
      "severity": "string (either 'high', 'medium', or 'low')"
    }
  ],
  "missingSkills": [
    "string (highly relevant technical or soft skills missing for the job description)"
  ],
  "tailoredBulletPoints": [
    {
      "original": "string (reconstructed weak sentence or bullet from the resume)",
      "tailored": "string (supercharged, professional replacement utilizing Google's XYZ formula: Accomplished [X], measured by [Y], by doing [Z].)",
      "impactExplanation": "string (why this version is significantly better)"
    }
  ],
  "interviewPrep": [
    {
      "question": "string (behavioral, technical, or resume-specific interview question)",
      "category": "string (e.g. 'Behavioral', 'Technical', 'Resume Deep Dive')",
      "expectedAnswerSuggestion": "string (key talking points and structure the candidate should use based on their experience)"
    }
  ]
}`;

        const promptText = `
SYSTEM INSTRUCTION: Run a comprehensive resume audit and job matching analysis.
Return your response STRICTLY as a single JSON object fitting the schema above.

RESUME CONTENT:
---
${resumeText || 'See attached resume image file.'}
---

TARGET JOB DESCRIPTION (IF BLANK, ANALYZE GENERALLY FOR THE CANDIDATE'S FIELD):
---
${jobDescription || 'N/A - General Career Enhancement'}
---
`;

        const parts = [
            { text: systemPrompt },
            { text: promptText }
        ];

        if (imageObj && imageObj.base64 && imageObj.mimeType) {
            parts.push({
                inlineData: {
                    mimeType: imageObj.mimeType,
                    data: imageObj.base64
                }
            });
        }

        const requestBody = {
            contents: [
                {
                    parts: parts
                }
            ],
            generationConfig: {
                responseMimeType: "application/json",
                temperature: 0.2
            }
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                const errMsg = errData.error?.message || `HTTP error ${response.status}`;
                throw new Error(`Gemini API Error: ${errMsg}`);
            }

            const data = await response.json();
            
            // Extract the generated text
            const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!responseText) {
                throw new Error('Gemini API returned an empty response.');
            }

            // Parse the JSON
            const result = JSON.parse(responseText.trim());
            return result;
        } catch (error) {
            console.error('Error during Gemini API analysis:', error);
            throw error;
        }
    }
};
