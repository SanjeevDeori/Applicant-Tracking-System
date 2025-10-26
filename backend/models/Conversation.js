// models/Conversation.js

const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    // Optional: Link to a specific job or task if conversation started from an application
    jobId: {
      type: mongoose.Schema.ObjectId,
      ref: "Job",
      required: false,
    },
    taskId: {
      type: mongoose.Schema.ObjectId,
      ref: "Task",
      required: false,
    },
    // Conversation metadata
    title: {
      type: String,
      maxlength: 100,
    },
    type: {
      type: String,
      enum: ["direct", "group", "job", "task"],
      default: "direct",
    },
    // User-specific conversation settings
    userSettings: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
        isArchived: {
          type: Boolean,
          default: false,
        },
        isMuted: {
          type: Boolean,
          default: false,
        },
        lastReadMessage: {
          type: mongoose.Schema.ObjectId,
          ref: "Message",
        },
        lastReadAt: Date,
      },
    ],
    // Conversation status
    isActive: {
      type: Boolean,
      default: true,
    },
    // Last message preview for quick access
    lastMessage: {
      type: mongoose.Schema.ObjectId,
      ref: "Message",
    },
    lastMessageText: String,
    lastMessageAt: Date,
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for efficient querying
ConversationSchema.index({ members: 1 });
ConversationSchema.index({ updatedAt: -1 });
ConversationSchema.index({ lastMessageAt: -1 });
ConversationSchema.index({ "userSettings.user": 1 });

// Virtual for unread message count per user
ConversationSchema.virtual("unreadCount").get(function () {
  // This would be calculated based on lastReadMessage and total messages
  // Implementation depends on specific requirements
  return 0;
});

module.exports = mongoose.model("Conversation", ConversationSchema);
