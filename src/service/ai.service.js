const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

// Generate AI text response
async function generateResponse(history) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: history,
    });

    return response.text || "No response from AI.";
  } catch (err) {
    if (err?.status === 429)
      return "AI quota exceeded. Please try again in a moment.";

    console.error("Gemini API error:", err);
    return "AI service is temporarily unavailable.";
  }
}

async function generateVector(content) {
  try {
    // ✅ Pass as an array of strings
    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
        requests: [{ text: content }], 
    });

    // ✅ Correct path to embedding
    const vector = response?.data?.[0]?.embedding;

    if (!Array.isArray(vector) || vector.length === 0) {
      console.error("Invalid embedding response:", response);
      throw new Error("Embedding vector missing or empty");
    }

    return vector;
  } catch (err) {
    console.error("Error generating embedding:", err);
    // fallback vector (won't crash Pinecone if you add safety check)
    return Array(768).fill(0);
  }
}



module.exports = {
  generateResponse,
  generateVector,
};
