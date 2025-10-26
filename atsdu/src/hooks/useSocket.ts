"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/context/auth-context";
import { useChat } from "@/context/chat-context";

export function useSocket() {
  const { user, isAuthenticated } = useAuth();
  const {
    currentRoom,
    setCurrentRoom,
    sendMessage,
    loadMessages,
    loadConversations,
    messages,
    setMessages,
  } = useChat();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (isAuthenticated && user && !socketRef.current) {
      // Initialize socket connection
      const token = localStorage.getItem("token");
      socketRef.current = io(
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5020",
        {
          auth: {
            token,
          },
        }
      );

      const socket = socketRef.current;

      // Connection events
      socket.on("connect", () => {
        console.log("✅ Socket connected to server");
      });

      socket.on("disconnect", (reason) => {
        console.log("❌ Socket disconnected from server:", reason);
      });

      socket.on("error", (error) => {
        console.error("❌ Socket error:", error);
      });

      socket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error);
      });

      // Message events
      socket.on("newMessage", (data) => {
        console.log("New message received:", data);
        // Update messages in real-time
        if (currentRoom && data.conversationId === currentRoom._id) {
          // Ensure the message has proper sender information
          const messageWithSender = {
            ...data.message,
            sender: data.message.sender || {
              _id: data.message.senderId || "",
              firstName: "Unknown",
              lastName: "User",
            },
          };

          // Add the new message to the current messages
          setMessages((prev) => [...prev, messageWithSender]);
        }
        // Refresh conversations list to update last message
        loadConversations();
      });

      socket.on("message-status-update", (data) => {
        console.log("Message status update:", data);
        // Handle message status updates (delivered/read)
        if (currentRoom && data.conversationId === currentRoom._id) {
          loadMessages(currentRoom._id);
        }
      });

      // Typing indicators
      socket.on("user-typing", (data) => {
        console.log("User typing:", data);
        // Handle typing indicators
      });

      // User presence
      socket.on("user-online", (data) => {
        console.log("User online:", data);
      });

      socket.on("user-offline", (data) => {
        console.log("User offline:", data);
      });

      socket.on("user-presence-update", (data) => {
        console.log("User presence update:", data);
      });
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isAuthenticated, user, currentRoom, loadMessages, loadConversations]);

  // Join conversation room
  const joinConversation = (conversationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("join-conversation", conversationId);
    }
  };

  // Leave conversation room
  const leaveConversation = (conversationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("leave-conversation", conversationId);
    }
  };

  // Send typing indicator
  const sendTypingStart = (conversationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("typing-start", { conversationId });
    }
  };

  const sendTypingStop = (conversationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("typing-stop", { conversationId });
    }
  };

  // Mark message as delivered/read
  const markMessageDelivered = (messageId: string, conversationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("message-delivered", {
        messageId,
        conversationId,
      });
    }
  };

  const markMessageRead = (messageId: string, conversationId: string) => {
    if (socketRef.current) {
      socketRef.current.emit("message-read", { messageId, conversationId });
    }
  };

  // Update presence status
  const updatePresence = (status: "online" | "away" | "busy" | "offline") => {
    if (socketRef.current) {
      socketRef.current.emit("update-presence", { status });
    }
  };

  return {
    socket: socketRef.current,
    joinConversation,
    leaveConversation,
    sendTypingStart,
    sendTypingStop,
    markMessageDelivered,
    markMessageRead,
    updatePresence,
    isConnected: socketRef.current?.connected || false,
  };
}
