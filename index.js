require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const geminiUrl = process.env.BACKEND_GEMINI_URL;
const apiKey = process.env.GOOGLE_API_KEY;

if (!geminiUrl) {
  console.warn('WARNING: BACKEND_GEMINI_URL is not set. Set it in .env before starting.');
}
if (!apiKey) {
  console.warn('WARNING: GOOGLE_API_KEY is not set. Set it in .env before starting.');
}

function getTextFromCandidate(candidate) {
  if (!candidate) return null;

  if (typeof candidate.content === 'string' && candidate.content.trim()) {
    return candidate.content;
  }

  if (candidate.content && Array.isArray(candidate.content.parts)) {
    for (const part of candidate.content.parts) {
      if (typeof part.text === 'string' && part.text.trim()) {
        return part.text;
      }
    }
  }

  if (Array.isArray(candidate.content)) {
    for (const item of candidate.content) {
      if (typeof item.text === 'string' && item.text.trim()) {
        return item.text;
      }
      if (item.parts && Array.isArray(item.parts)) {
        for (const part of item.parts) {
          if (typeof part.text === 'string' && part.text.trim()) {
            return part.text;
          }
        }
      }
    }
  }

  return null;
}

function extractTextFromGeminiResponse(data) {
  if (!data) return null;

  if (data.candidates && Array.isArray(data.candidates)) {
    const text = getTextFromCandidate(data.candidates[0]);
    if (text) return text;
  }

  if (data.responses && Array.isArray(data.responses)) {
    for (const r of data.responses) {
      if (r.candidates && Array.isArray(r.candidates)) {
        const text = getTextFromCandidate(r.candidates[0]);
        if (text) return text;
      }
    }
  }

  if (data.output && Array.isArray(data.output)) {
    for (const item of data.output) {
      if (item.content && Array.isArray(item.content)) {
        for (const c of item.content) {
          if (typeof c.text === 'string' && c.text.trim().length > 0) {
            return c.text;
          }
          if (c.type === 'output_text' && typeof c.text === 'string') {
            return c.text;
          }
        }
      }
    }
  }

  if (data.output_text && typeof data.output_text === 'string') return data.output_text;
  if (typeof data.text === 'string') return data.text;

  return null;
}

app.post('/api/gemini', async (req, res) => {
  if (!geminiUrl || !apiKey) {
    return res.status(500).json({
      error: 'Server misconfigured. Set BACKEND_GEMINI_URL and GOOGLE_API_KEY in environment.'
    });
  }

  const input = req.body;
  if (!input || typeof input.question !== 'string' || !input.question.trim()) {
    return res.status(400).json({ error: 'Invalid body. Expecting { question: "..." }' });
  }

  const promptText = `Answer in 2 short sentences only: ${input.question}`;
  const geminiBody = {
    contents: [
      {
        parts: [
          {
            text: promptText
          }
        ]
      }
    ]
  };

  try {
    const response = await axios.post(geminiUrl, geminiBody, {
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey
      },
      timeout: 15000
    });

    const text = extractTextFromGeminiResponse(response.data);
    if (!text) {
      return res.status(502).json({
        error: 'Gemini response did not contain a recognized text field.',
        raw: response.data
      });
    }

    return res.type('text/plain').send(text);
  } catch (error) {
    console.error('Gemini backend request failed:', error.message || error);
    const status = error.response ? error.response.status : 500;
    const data = error.response ? error.response.data : null;
    return res.status(status).json({
      error: 'Failed to call Gemini backend API',
      details: data || error.message
    });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Gemini proxy server is running. Use POST /api/gemini.' });
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
