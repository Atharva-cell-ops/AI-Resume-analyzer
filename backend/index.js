require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');

app.post('/api/enhance', async (req, res) => {
  try {
    const { text, position } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Prompt construction
    const prompt = `You are an expert resume writer. Please enhance the following work experience description for a ${position || 'professional'} role. Make it ATS-friendly, impactful, and action-oriented using strong verbs. Keep it concise, returning ONLY the enhanced bullet points without any conversational text or markdown formatting outside of the bullet points.

Original text:
${text}

Enhanced bullet points:`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const enhancedText = response.text();

    res.json({ enhancedText: enhancedText.trim() });
  } catch (error) {
    console.error('Error enhancing text:', error);
    res.status(500).json({ error: 'Failed to enhance text' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
