// models/Message.js

const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.ObjectId,
      ref: "Conversation",
      required: true,
    },
    sender: {
      // The sender is always a User (Student, Alumni, or Admin)
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: function () {
        return this.type === "text" || this.type === "system";
      },
    },
    type: {
      type: String,
      enum: ["text", "image", "file", "system"],
      default: "text",
    },
    attachments: [
      {
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        url: String,
      },
    ],
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    readBy: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: "User",
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    replyTo: {
      type: mongoose.Schema.ObjectId,
      ref: "Message",
    },
    edited: {
      type: Boolean,
      default: false,
    },
    editedAt: Date,
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Index for efficient querying
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });
MessageSchema.index({ status: 1 });

module.exports = mongoose.model("Message", MessageSchema);
