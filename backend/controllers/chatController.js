// controllers/chatController.js

const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const path = require("path");
const fs = require("fs");

// @desc    Get all conversations for the logged-in user with pagination and filtering
// @route   GET /api/chat/conversations
// @access  Private (All authenticated users)
exports.getConversations = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type, archived } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = { members: { $in: [req.user.id] } };

    if (type) {
      query.type = type;
    }

    // Handle archived conversations
    if (archived === "true") {
      query["userSettings.user"] = req.user.id;
      query["userSettings.isArchived"] = true;
    } else if (archived === "false") {
      query.$or = [
        { "userSettings.user": { $ne: req.user.id } },
        { "userSettings.isArchived": { $ne: true } },
      ];
    }

    const conversations = await Conversation.find(query)
      .populate("members", "firstName lastName profileImageUrl")
      .populate("lastMessage", "text type createdAt")
      .populate("userSettings.user", "firstName lastName")
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Calculate unread counts for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conversation) => {
        const userSettings = conversation.userSettings.find(
          (setting) => setting.user.toString() === req.user.id
        );

        let unreadCount = 0;
        if (userSettings && userSettings.lastReadMessage) {
          unreadCount = await Message.countDocuments({
            conversationId: conversation._id,
            _id: { $gt: userSettings.lastReadMessage },
            sender: { $ne: req.user.id },
            deleted: { $ne: true },
          });
        } else {
          unreadCount = await Message.countDocuments({
            conversationId: conversation._id,
            sender: { $ne: req.user.id },
            deleted: { $ne: true },
          });
        }

        // Ensure proper data structure for frontend
        const conversationObj = conversation.toObject();

        return {
          ...conversationObj,
          unreadCount,
          // Ensure members are properly populated
          members: conversationObj.members || [],
          // Ensure lastMessage is properly populated
          lastMessage: conversationObj.lastMessage || null,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: conversationsWithUnread.length,
      data: conversationsWithUnread,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: conversationsWithUnread.length === parseInt(limit),
      },
    });
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
    const { jobId, taskId, type = "direct" } = req.body;

    if (senderId === recipientId) {
      return res.status(400).json({
        success: false,
        error: "Cannot start a conversation with yourself.",
      });
    }

    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({
        success: false,
        error: "Recipient not found.",
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      members: { $all: [senderId, recipientId] },
      type: type,
    }).populate("members", "firstName lastName profileImageUrl");

    // If no conversation exists, create a new one
    if (!conversation) {
      const conversationData = {
        members: [senderId, recipientId],
        type: type,
        userSettings: [{ user: senderId }, { user: recipientId }],
      };

      if (jobId) conversationData.jobId = jobId;
      if (taskId) conversationData.taskId = taskId;

      conversation = await Conversation.create(conversationData);

      // Re-fetch to populate members for consistency
      conversation = await Conversation.findById(conversation._id)
        .populate("members", "firstName lastName profileImageUrl")
        .populate("userSettings.user", "firstName lastName");
    }

    res.status(200).json({ success: true, data: conversation });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all messages for a specific conversation ID with pagination and search
// @route   GET /api/chat/messages/:conversationId
// @access  Private (Conversation members only)
exports.getMessages = async (req, res, next) => {
  try {
    const conversationId = req.params.conversationId;
    const { page = 1, limit = 50, search, type, before } = req.query;
    const skip = (page - 1) * limit;

    // 1. Verify user is part of the conversation
    const conversation = await Conversation.findById(conversationId);
    if (
      !conversation ||
      !conversation.members.some((m) => m.toString() === req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to view this conversation.",
      });
    }

    // 2. Build query
    let query = {
      conversationId,
      deleted: { $ne: true },
    };

    if (search) {
      query.text = { $regex: search, $options: "i" };
    }

    if (type) {
      query.type = type;
    }

    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    // 3. Fetch messages with pagination
    const messages = await Message.find(query)
      .populate("sender", "firstName lastName profileImageUrl")
      .populate("replyTo", "text sender")
      .sort({ createdAt: 1 }) // Oldest first for proper chat display
      .skip(skip)
      .limit(parseInt(limit));

    // 4. Get total count for pagination
    const totalMessages = await Message.countDocuments(query);

    // 5. Mark messages as read for this user
    await Message.updateMany(
      {
        conversationId,
        sender: { $ne: req.user.id },
        "readBy.user": { $ne: req.user.id },
      },
      {
        $push: { readBy: { user: req.user.id } },
        $set: { status: "read" },
      }
    );

    // 6. Update user's last read message in conversation
    if (messages.length > 0) {
      const lastMessageId = messages[0]._id;
      await Conversation.updateOne(
        {
          _id: conversationId,
          "userSettings.user": req.user.id,
        },
        {
          $set: {
            "userSettings.$.lastReadMessage": lastMessageId,
            "userSettings.$.lastReadAt": new Date(),
          },
        }
      );
    }

    res.status(200).json({
      success: true,
      count: messages.length,
      total: totalMessages,
      data: messages, // Already sorted oldest first
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: skip + messages.length < totalMessages,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Send a new message with enhanced features
// @route   POST /api/chat/messages
// @access  Private (Conversation members only)
exports.sendMessage = async (req, res, next) => {
  try {
    const {
      conversationId,
      text,
      type = "text",
      replyTo,
      attachments,
    } = req.body;
    const sender = req.user.id;

    // 1. Verify conversation exists and user is a member
    const conversation = await Conversation.findById(conversationId);
    if (
      !conversation ||
      !conversation.members.some((m) => m.toString() === sender)
    ) {
      return res.status(403).json({
        success: false,
        error: "Cannot send message: Not authorized or conversation invalid.",
      });
    }

    // 2. Validate message content
    if (!text && (!attachments || attachments.length === 0)) {
      return res.status(400).json({
        success: false,
        error: "Message must contain text or attachments.",
      });
    }

    // 3. Create the message
    const messageData = {
      conversationId,
      sender,
      text,
      type,
      status: "sent",
    };

    if (replyTo) {
      messageData.replyTo = replyTo;
    }

    if (attachments && attachments.length > 0) {
      messageData.attachments = attachments;
    }

    const message = await Message.create(messageData);

    // 4. Populate the message for response
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "firstName lastName profileImageUrl")
      .populate("replyTo", "text sender");

    // 5. Update conversation with last message info
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
      lastMessageText: text,
      lastMessageAt: new Date(),
      updatedAt: Date.now(),
    });

    // 6. Emit real-time event (if Socket.io is available)
    if (req.io) {
      // Emit to all members of the conversation except the sender
      // (sender already has the message from the API response)
      conversation.members.forEach((memberId) => {
        if (memberId.toString() !== sender) {
          req.io.to(`user_${memberId}`).emit("newMessage", {
            message: populatedMessage,
            conversationId,
          });
        }
      });
    }

    res.status(201).json({ success: true, data: populatedMessage });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all users for chat with search and filtering
// @route   GET /api/chat/users
// @access  Private (All authenticated users)
exports.getUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    let query = {
      _id: { $ne: req.user.id },
      role: { $ne: "admin" },
    };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select("firstName lastName email role profileImageUrl")
      .skip(skip)
      .limit(parseInt(limit));

    const totalUsers = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total: totalUsers,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: skip + users.length < totalUsers,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Edit a message
// @route   PUT /api/chat/messages/:messageId
// @access  Private (Message sender only)
exports.editMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: "Message not found.",
      });
    }

    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to edit this message.",
      });
    }

    if (message.deleted) {
      return res.status(400).json({
        success: false,
        error: "Cannot edit deleted message.",
      });
    }

    message.text = text;
    message.edited = true;
    message.editedAt = new Date();
    await message.save();

    const populatedMessage = await Message.findById(messageId).populate(
      "sender",
      "firstName lastName profileImageUrl"
    );

    res.status(200).json({
      success: true,
      data: populatedMessage,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a message
// @route   DELETE /api/chat/messages/:messageId
// @access  Private (Message sender only)
exports.deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        error: "Message not found.",
      });
    }

    if (message.sender.toString() !== userId) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this message.",
      });
    }

    message.deleted = true;
    message.deletedAt = new Date();
    await message.save();

    res.status(200).json({
      success: true,
      message: "Message deleted successfully.",
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Archive/Unarchive a conversation
// @route   PUT /api/chat/conversations/:conversationId/archive
// @access  Private (Conversation members only)
exports.toggleArchive = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { archived } = req.body;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (
      !conversation ||
      !conversation.members.some((m) => m.toString() === userId)
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to modify this conversation.",
      });
    }

    await Conversation.updateOne(
      {
        _id: conversationId,
        "userSettings.user": userId,
      },
      {
        $set: {
          "userSettings.$.isArchived": archived,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: `Conversation ${
        archived ? "archived" : "unarchived"
      } successfully.`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark conversation as read
// @route   PUT /api/chat/conversations/:conversationId/read
// @access  Private (Conversation members only)
exports.markAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (
      !conversation ||
      !conversation.members.some((m) => m.toString() === userId)
    ) {
      return res.status(403).json({
        success: false,
        error: "Not authorized to modify this conversation.",
      });
    }

    // Get the latest message in the conversation
    const latestMessage = await Message.findOne({ conversationId }).sort({
      createdAt: -1,
    });

    if (latestMessage) {
      // Update user's last read message
      await Conversation.updateOne(
        {
          _id: conversationId,
          "userSettings.user": userId,
        },
        {
          $set: {
            "userSettings.$.lastReadMessage": latestMessage._id,
            "userSettings.$.lastReadAt": new Date(),
          },
        }
      );

      // Mark all messages as read
      await Message.updateMany(
        {
          conversationId,
          sender: { $ne: userId },
          "readBy.user": { $ne: userId },
        },
        {
          $push: { readBy: { user: userId } },
          $set: { status: "read" },
        }
      );
    }

    res.status(200).json({
      success: true,
      message: "Conversation marked as read.",
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Search messages across all conversations
// @route   GET /api/chat/search
// @access  Private (All authenticated users)
exports.searchMessages = async (req, res, next) => {
  try {
    const { q, conversationId, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    const userId = req.user.id;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: "Search query is required.",
      });
    }

    // Build query for conversations user is part of
    let conversationQuery = { members: { $in: [userId] } };
    if (conversationId) {
      conversationQuery._id = conversationId;
    }

    const userConversations = await Conversation.find(conversationQuery).select(
      "_id"
    );

    const conversationIds = userConversations.map((conv) => conv._id);

    // Search messages
    const messages = await Message.find({
      conversationId: { $in: conversationIds },
      text: { $regex: q, $options: "i" },
      deleted: { $ne: true },
    })
      .populate("sender", "firstName lastName profileImageUrl")
      .populate("conversationId", "members")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalMessages = await Message.countDocuments({
      conversationId: { $in: conversationIds },
      text: { $regex: q, $options: "i" },
      deleted: { $ne: true },
    });

    res.status(200).json({
      success: true,
      count: messages.length,
      total: totalMessages,
      data: messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: skip + messages.length < totalMessages,
      },
    });
  } catch (err) {
    next(err);
  }
};
