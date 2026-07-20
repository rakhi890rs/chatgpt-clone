const chatModel = require("../models/chat.model");
const messageModel = require("../models/message.model");
const aiService = require("../service/ai.service");

// Create a new chat
async function createChat(req, res) {
  try {
    const { title } = req.body;

    const chat = await chatModel.create({
      user: req.user._id,
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
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// Get all chats
async function getChats(req, res) {
  try {
    const chats = await chatModel
      .find({ user: req.user._id })
      .sort({ lastActivity: -1 });

    res.status(200).json({ chats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// Get messages of a chat
async function getChatMessages(req, res) {
  try {
    const { chatId } = req.params;

    const messages = await messageModel
      .find({ chat: chatId })
      .sort({ createdAt: 1 });

    res.status(200).json({ messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

// Send message
async function sendMessage(req, res) {
  const { chatId } = req.params;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      message: "Message is required",
    });
  }

  try {
    // Save user's message
    const userMessage = await messageModel.create({
      chat: chatId,
      user: req.user._id,
      content: message,
      role: "user",
    });

    // Send user message immediately
    res.status(201).json(userMessage);

    // Generate AI response
    const aiResponse = await aiService.generateResponse([
      {
        role: "user",
        content: message,
      },
    ]);

    // Save AI response
    await messageModel.create({
      chat: chatId,
      user: req.user._id,
      content: aiResponse,
      role: "model", // ✅ Changed from "ai" to "model"
    });

    // Optional Socket.IO
    // io.to(chatId).emit("ai-response", {
    //   chatId,
    //   content: aiResponse,
    // });

  } catch (err) {
    console.error("Send message error:", err);

    if (!res.headersSent) {
      res.status(500).json({
        message: "Internal server error",
      });
    }
  }
}

// Delete chat
async function deleteChat(req, res) {
  try {
    const { chatId } = req.params;

    const chat = await chatModel.findOne({
      _id: chatId,
      user: req.user._id,
    });

    if (!chat) {
      return res.status(404).json({
        message: "Chat not found",
      });
    }

    await messageModel.deleteMany({ chat: chatId });
    await chatModel.deleteOne({ _id: chatId });

    res.status(200).json({
      message: "Chat deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server error",
    });
  }
}

module.exports = {
  createChat,
  getChats,
  getChatMessages,
  sendMessage,
  deleteChat,
};