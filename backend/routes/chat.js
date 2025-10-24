// routes/chat.js

const express = require('express');
const { 
    getConversations,
    startConversation,
    getMessages,
    sendMessage
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth'); 

const router = express.Router();

// All chat routes must be protected (SRF-3.5.1)
router.use(protect);

// Conversation management
router.route('/conversations')
    .get(getConversations);

router.route('/conversations/:recipientId')
    .post(startConversation); // Initiate conversation

// Message management
router.route('/messages')
    .post(sendMessage);

router.route('/messages/:conversationId')
    .get(getMessages);

module.exports = router;