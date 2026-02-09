const express = require('express');
const { authUser } = require("../middlewares/auth.middleware");
const { createChat, getChats } = require("../controllers/chat.controller"); // import getChats

const router = express.Router();

// Create a new chat
router.post('/', authUser, createChat);

// Get all chats for the user
router.get('/', authUser, getChats);

module.exports = router;