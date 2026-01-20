const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

async function generateResponse(history) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: history,
    });

    return response.text || "No response from AI.";
  } catch (err) {
    if (err?.status === 429) {
      return "⚠️ AI quota exceeded. Please try again in a moment.";
    }

    console.error("Gemini API error:", err);
    return "❌ AI service is temporarily unavailable.";
  }
}

module.exports = { generateResponse };
