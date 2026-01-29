const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY, 
});


// Generate AI text response

async function generateResponse(history) {
  try {
    
    const contents = history.map((msg) => ({
      type: "text",
      text: msg.content || "", 
    }));

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents, 
    });

    return response.text || "No response from AI.";
  } catch (err) {
    console.error("Gemini API error:", err);
    return "AI service is temporarily unavailable.";
  }
}


// Generate embeddings/vector

async function generateVector(text) {
  try {
    if (!text || typeof text !== "string") {
      console.warn("Invalid text for embedding:", text);
      return null;
    }

    const response = await ai.models.embedContent({
      model: "gemini-embedding-001",
      contents: [
        {
          role: "user",
          parts: [{ text }],
        },
      ],
    });

    const vector = response?.embedding?.values;

    if (!vector || !vector.length) {
      console.error("Empty embedding returned:", response);
      return null;
    }

    return vector;
  } catch (err) {
    console.error("Error generating embedding:", err);
    return null;
  }
}



module.exports = {
  generateResponse,
  generateVector,
};
