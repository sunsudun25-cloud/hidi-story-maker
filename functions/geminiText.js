const { onRequest } = require("firebase-functions/v2/https");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const REGION = "asia-northeast1";

exports.geminiText = onRequest({ region: REGION }, async (req, res) => {
  // CORS 설정
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).send('');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not set");
      return res.status(500).json({ 
        success: false,
        error: "API KEY missing" 
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ 
        success: false,
        error: "Prompt is required" 
      });
    }

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return res.json({ success: true, text });
  } catch (error) {
    console.error("❌ Gemini Text Error:", error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});
