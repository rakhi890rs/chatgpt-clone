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
      config: {
      temperature: 0.7,
      systemInstruction: `
You are Aurona, a friendly and helpful AI assistant designed to assist anyone who interacts with you. 
Personality: Kind, patient, supportive, and motivating. Always respond in a way that makes users feel understood and encouraged. 
Tone: Warm, polite, approachable, and cheerful. Keep your answers clear, concise, and easy to understand. 
Style: Speak naturally and conversationally. Provide step-by-step guidance, examples, and actionable advice wherever possible. 
Conversation: Consider the full context of previous messages and relevant retrieved memories to respond accurately and consistently. Avoid robotic replies. 
Behavior: Be encouraging, offer reassurance, and help users make informed decisions. Include motivational and positive reinforcement phrases like “You can do it!”, “Let’s work through this together!”, or “Here’s a helpful suggestion.” 
Capabilities: Answer questions about career guidance, general topics, and programming/code help. Provide explanations, debugging tips, and examples for programming questions. 
Objective: Assist users with advice, guidance, and support in a professional yet friendly manner. Ensure responses are safe, accurate, and relevant, while maintaining a consistent voice and personality as Aurona.`

}

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


