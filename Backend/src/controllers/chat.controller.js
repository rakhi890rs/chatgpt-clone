const chatModel = require('../models/chat.model');
const messageModel = require('../models/message.model');
const aiService = require('../service/ai.service'); // your AI service

// Existing: create a new chat
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

// NEW: get all chats for the current user
async function getChats(req, res) {
  const chats = await chatModel.find({ user: req.user._id }).sort({ lastActivity: -1 });
  res.json({ chats });
}

// NEW: get all messages of a chat
async function getChatMessages(req, res) {
  const chatId = req.params.chatId;
  const messages = await messageModel.find({ chat: chatId }).sort({ createdAt: 1 });
  res.json({ messages });
}

// NEW: send a message and get AI response
async function sendMessage(req, res) {
  const chatId = req.params.chatId;
  const { message } = req.body;

  if (!message) return res.status(400).json({ message: "Message is required" });

  // Save user message
  const userMessage = await messageModel.create({
    chat: chatId,
    user: req.user._id,
    content: message,
    role: "user",
  });

  // Generate AI response (you can call your aiService here)
  const aiResponseText = await aiService.generateResponse([{ role: "user", content: message }]);

  // Save AI response
  const aiMessage = await messageModel.create({
    chat: chatId,
    user: req.user._id,
    content: aiResponseText,
    role: "ai",
  });

  res.json({ response: aiResponseText });
}

module.exports = {
  createChat,
  getChats,
  getChatMessages,
  sendMessage,
};