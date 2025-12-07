const { onRequest } = require("firebase-functions/v2/https");

const REGION = "asia-northeast1";

exports.geminiText = onRequest({ region: REGION }, async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(204).send("");

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("❌ Missing GEMINI_API_KEY");
      return res.status(500).json({ success: false, error: "API KEY missing" });
    }

    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, error: "Prompt is required" });
    }

    // Use OpenAI-compatible endpoint with Gemini API
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gemini-2.0-flash-exp",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: prompt },
          ],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("❌ Gemini API Error:", error);
      return res.status(response.status).json({ success: false, error });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
      return res.status(500).json({ success: false, error: "No response from Gemini" });
    }

    return res.json({ success: true, text });
  } catch (err) {
    console.error("❌ Gemini Server Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
});
