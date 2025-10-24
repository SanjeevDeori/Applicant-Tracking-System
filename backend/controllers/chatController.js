// controllers/chatController.js

const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

// @desc    Get all conversations for the logged-in user
// @route   GET /api/chat/conversations
// @access  Private (All authenticated users)
exports.getConversations = async (req, res, next) => {
    try {
        const conversations = await Conversation.find({
            members: { $in: [req.user.id] } // Find conversations where the user is a member
        })
        .populate('members', 'firstName lastName profileImageUrl') // Show who the conversation is with
        .sort({ updatedAt: -1 });

        res.status(200).json({ success: true, count: conversations.length, data: conversations });
    } catch (err) {
        next(err);
    }
};

// @desc    Start or retrieve a conversation with a specific user
// @route   POST /api/chat/conversations/:recipientId
// @access  Private (All authenticated users)
exports.startConversation = async (req, res, next) => {
    try {
        const recipientId = req.params.recipientId;
        const senderId = req.user.id;
        
        if (senderId === recipientId) {
            return res.status(400).json({ success: false, error: 'Cannot start a conversation with yourself.' });
        }

        // Check if conversation already exists (must handle both [A, B] and [B, A] ordering)
        let conversation = await Conversation.findOne({
            members: { $all: [senderId, recipientId] }
        })
        .populate('members', 'firstName lastName profileImageUrl');

        // If no conversation exists, create a new one
        if (!conversation) {
            conversation = await Conversation.create({
                members: [senderId, recipientId],
                // Optional: add logic here to link to a Job/Task if the conversation started from an application/request
            });
            // Re-fetch to populate members for consistency
            conversation = await Conversation.findById(conversation._id)
                .populate('members', 'firstName lastName profileImageUrl');
        }

        res.status(200).json({ success: true, data: conversation });
    } catch (err) {
        next(err);
    }
};

// @desc    Get all messages for a specific conversation ID
// @route   GET /api/chat/messages/:conversationId
// @access  Private (Conversation members only)
exports.getMessages = async (req, res, next) => {
    try {
        const conversationId = req.params.conversationId;

        // 1. Verify user is part of the conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.members.some(m => m.toString() === req.user.id)) {
            return res.status(403).json({ success: false, error: 'Not authorized to view this conversation.' });
        }

        // 2. Fetch messages
        const messages = await Message.find({ conversationId })
            .populate('sender', 'firstName lastName')
            .sort({ createdAt: 1 }); // Oldest message first

        res.status(200).json({ success: true, count: messages.length, data: messages });
    } catch (err) {
        next(err);
    }
};

// @desc    Send a new message
// @route   POST /api/chat/messages
// @access  Private (Conversation members only)
exports.sendMessage = async (req, res, next) => {
    try {
        const { conversationId, text } = req.body;
        const sender = req.user.id;

        // 1. Verify conversation exists and user is a member
        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.members.some(m => m.toString() === sender)) {
            return res.status(403).json({ success: false, error: 'Cannot send message: Not authorized or conversation invalid.' });
        }

        // 2. Create the message
        const message = await Message.create({
            conversationId,
            sender,
            text
        });
        
        // 3. Update conversation timestamp to float to the top of the user's list
        await Conversation.findByIdAndUpdate(conversationId, { updatedAt: Date.now() });

        res.status(201).json({ success: true, data: message });
    } catch (err) {
        next(err);
    }
};