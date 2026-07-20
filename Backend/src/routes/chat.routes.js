const express = require('express');
const { authUser } = require("../middlewares/auth.middleware");
const {
  createChat,
  getChats,
  getChatMessages,
  sendMessage,
  deleteChat,
} = require("../controllers/chat.controller");

const router = express.Router();

// Create a new chat
router.post('/', authUser, createChat);

// Get all chats
router.get('/', authUser, getChats);

// Get messages of a chat
router.get('/:chatId', authUser, getChatMessages);

// Send message
router.post('/:chatId', authUser, sendMessage);

// Delete chat
router.delete('/:chatId', authUser, deleteChat);

module.exports = router;