// routes/chat.js

const express = require("express");
const {
  getConversations,
  startConversation,
  getMessages,
  sendMessage,
  getUsers,
  editMessage,
  deleteMessage,
  toggleArchive,
  markAsRead,
  searchMessages,
} = require("../controllers/chatController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// All chat routes must be protected (SRF-3.5.1)
router.use(protect);

// User management for chat
router.route("/users").get(getUsers);

// Conversation management
router.route("/conversations").get(getConversations);
router.route("/conversations/:recipientId").post(startConversation); // Initiate conversation
router.route("/conversations/:conversationId/archive").put(toggleArchive);
router.route("/conversations/:conversationId/read").put(markAsRead);

// Message management
router.route("/messages").post(sendMessage);
router.route("/messages/:conversationId").get(getMessages);
router.route("/messages/:messageId").put(editMessage).delete(deleteMessage);

// Search functionality
router.route("/search").get(searchMessages);

module.exports = router;
