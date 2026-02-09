const chatModel = require('../models/chat.model');
const messageModel = require('../models/message.model');
const aiService = require('../service/ai.service'); // your AI service

// Create a new chat
async function createChat(req, res) {
  const { title } = req.body;
  const user = req.user;

  const chat = await chatModel.create({
    user: user._id,
    title,
  });

  res.status(201).json({
    message: "Chat created successfully",
    chat: {
      _id: chat._id,
      title: chat.title,
      lastActivity: chat.lastActivity,
    },
  });
}

// Get all chats for the user
async function getChats(req, res) {
  const chats = await chatModel.find({ user: req.user._id }).sort({ lastActivity: -1 });
  res.json({ chats });
}

// Get all messages of a chat
async function getChatMessages(req, res) {
  const chatId = req.params.chatId;
  const messages = await messageModel.find({ chat: chatId }).sort({ createdAt: 1 });
  res.json({ messages });
}

// Send a message and generate AI response
async function sendMessage(req, res) {
  const chatId = req.params.chatId;
  const { message } = req.body;

  if (!message) return res.status(400).json({ message: "Message is required" });

  try {
    // Save user message
    const userMessage = await messageModel.create({
      chat: chatId,
      user: req.user._id,
      content: message,
      role: "user",
    });

    // ✅ Respond to frontend immediately with the user's message
    res.status(201).json(userMessage);

    // Generate AI response in background (non-blocking)
    const aiResponseText = await aiService.generateResponse([
      { role: "user", content: message }
    ]);

    // Save AI response
    await messageModel.create({
      chat: chatId,
      user: req.user._id,
      content: aiResponseText,
      role: "ai",
    });

    // Optional: use WebSockets to send AI response instantly to frontend
    // e.g., socket.emit("ai-response", { chat: chatId, content: aiResponseText });

  } catch (err) {
    console.error("Send message error:", err);
    // If user message failed, send error
    if (!res.headersSent) {
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = {
  createChat,
  getChats,
  getChatMessages,
  sendMessage,
};