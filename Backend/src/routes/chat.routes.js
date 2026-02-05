const express = require('express');
const { authUser } = require('../middlewares/auth.middleware');
const { createChat, getChats, getChatMessages, sendMessage } = require('../controllers/chat.controller');

const router = express.Router();

// create new chat
router.post('/', authUser, createChat);

// get all chats for the user
router.get('/', authUser, getChats);

// get messages of a chat
router.get('/:chatId', authUser, getChatMessages);

// send a message
router.post('/:chatId/message', authUser, sendMessage);

module.exports = router;