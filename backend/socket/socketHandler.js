// socket/socketHandler.js

const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

// Store active users and their socket connections
const activeUsers = new Map();

// Socket.io authentication middleware
const authenticateSocket = async (socket, next) => {
  try {
    const token =
      socket.handshake.auth.token ||
      socket.handshake.headers.authorization?.split(" ")[1];

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    // For Alumni: ensure they are approved
    if (user.role === "alumni" && !user.isApproved) {
      return next(
        new Error("Authentication error: Alumni account pending approval")
      );
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token"));
  }
};

// Socket.io event handlers
const setupSocketHandlers = (io) => {
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    console.log(
      `User ${socket.user.firstName} connected with socket ${socket.id}`
    );

    // Store user connection
    activeUsers.set(socket.userId, {
      socketId: socket.id,
      user: socket.user,
      connectedAt: new Date(),
    });

    // Join user to their personal room for notifications
    socket.join(`user_${socket.userId}`);

    // Handle joining conversation rooms
    socket.on("join-conversation", async (conversationId) => {
      try {
        // Verify user is part of the conversation
        const conversation = await Conversation.findById(conversationId);
        if (
          !conversation ||
          !conversation.members.some((m) => m.toString() === socket.userId)
        ) {
          socket.emit("error", {
            message: "Not authorized to join this conversation",
          });
          return;
        }

        socket.join(conversationId);
        socket.emit("joined-conversation", { conversationId });

        // Notify other members that user is online
        socket.to(conversationId).emit("user-online", {
          userId: socket.userId,
          user: {
            firstName: socket.user.firstName,
            lastName: socket.user.lastName,
          },
        });
      } catch (error) {
        socket.emit("error", { message: "Failed to join conversation" });
      }
    });

    // Handle leaving conversation rooms
    socket.on("leave-conversation", (conversationId) => {
      socket.leave(conversationId);
      socket.emit("left-conversation", { conversationId });

      // Notify other members that user is offline
      socket.to(conversationId).emit("user-offline", {
        userId: socket.userId,
      });
    });

    // Handle typing indicators
    socket.on("typing-start", (data) => {
      const { conversationId } = data;
      socket.to(conversationId).emit("user-typing", {
        userId: socket.userId,
        user: {
          firstName: socket.user.firstName,
          lastName: socket.user.lastName,
        },
        isTyping: true,
      });
    });

    socket.on("typing-stop", (data) => {
      const { conversationId } = data;
      socket.to(conversationId).emit("user-typing", {
        userId: socket.userId,
        user: {
          firstName: socket.user.firstName,
          lastName: socket.user.lastName,
        },
        isTyping: false,
      });
    });

    // Handle message delivery confirmation
    socket.on("message-delivered", async (data) => {
      try {
        const { messageId, conversationId } = data;

        // Update message status to delivered
        await Message.findByIdAndUpdate(messageId, {
          status: "delivered",
        });

        // Notify sender that message was delivered
        socket.to(conversationId).emit("message-status-update", {
          messageId,
          status: "delivered",
          userId: socket.userId,
        });
      } catch (error) {
        socket.emit("error", { message: "Failed to update message status" });
      }
    });

    // Handle message read confirmation
    socket.on("message-read", async (data) => {
      try {
        const { messageId, conversationId } = data;

        // Update message status to read
        await Message.findByIdAndUpdate(messageId, {
          $push: { readBy: { user: socket.userId } },
          status: "read",
        });

        // Notify sender that message was read
        socket.to(conversationId).emit("message-status-update", {
          messageId,
          status: "read",
          userId: socket.userId,
        });
      } catch (error) {
        socket.emit("error", { message: "Failed to update message status" });
      }
    });

    // Handle user presence updates
    socket.on("update-presence", (data) => {
      const { status } = data; // 'online', 'away', 'busy', 'offline'

      // Update user status in active users
      if (activeUsers.has(socket.userId)) {
        activeUsers.get(socket.userId).status = status;
      }

      // Broadcast status update to all user's conversations
      socket.broadcast.emit("user-presence-update", {
        userId: socket.userId,
        user: {
          firstName: socket.user.firstName,
          lastName: socket.user.lastName,
        },
        status,
      });
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`User ${socket.user.firstName} disconnected`);

      // Remove from active users
      activeUsers.delete(socket.userId);

      // Notify all conversations that user is offline
      socket.broadcast.emit("user-offline", {
        userId: socket.userId,
      });
    });
  });

  return io;
};

// Helper function to get online users
const getOnlineUsers = () => {
  return Array.from(activeUsers.values());
};

// Helper function to check if user is online
const isUserOnline = (userId) => {
  return activeUsers.has(userId);
};

// Helper function to send notification to user
const sendNotificationToUser = (io, userId, notification) => {
  io.to(`user_${userId}`).emit("notification", notification);
};

// Helper function to broadcast to conversation
const broadcastToConversation = (io, conversationId, event, data) => {
  io.to(conversationId).emit(event, data);
};

module.exports = {
  setupSocketHandlers,
  getOnlineUsers,
  isUserOnline,
  sendNotificationToUser,
  broadcastToConversation,
};
