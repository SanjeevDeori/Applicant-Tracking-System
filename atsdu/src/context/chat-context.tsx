"use client";

import type React from "react";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "./auth-context";

export interface ChatMessage {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  };
  text: string;
  type: "text" | "image" | "file" | "system";
  status: "sent" | "delivered" | "read";
  attachments?: Array<{
    filename: string;
    originalName: string;
    mimetype: string;
    size: number;
    url: string;
  }>;
  readBy?: Array<{
    user: string;
    readAt: string;
  }>;
  replyTo?: {
    _id: string;
    text: string;
    sender: {
      _id: string;
      firstName: string;
      lastName: string;
    };
  };
  edited?: boolean;
  editedAt?: string;
  deleted?: boolean;
  deletedAt?: string;
  createdAt: string;
  conversationId: string;
}

export interface ChatRoom {
  _id: string;
  members: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
  }>;
  type: "direct" | "group" | "job" | "task";
  title?: string;
  lastMessage?: ChatMessage;
  lastMessageText?: string;
  lastMessageAt?: string;
  unreadCount?: number;
  userSettings?: Array<{
    user: string;
    isArchived: boolean;
    isMuted: boolean;
    lastReadMessage?: string;
    lastReadAt?: string;
  }>;
  updatedAt: string;
}

interface ChatContextType {
  rooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  messages: ChatMessage[];
  loading: boolean;
  setCurrentRoom: (room: ChatRoom) => void;
  setMessages: (
    messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])
  ) => void;
  sendMessage: (
    content: string,
    type?: string,
    replyTo?: string,
    attachments?: any[]
  ) => Promise<void>;
  loadMessages: (conversationId: string, params?: any) => void;
  loadConversations: (params?: any) => void;
  startConversation: (
    recipientId: string,
    type?: string,
    jobId?: string,
    taskId?: string
  ) => Promise<void>;
  editMessage: (messageId: string, text: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  archiveConversation: (
    conversationId: string,
    archived: boolean
  ) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  searchMessages: (
    query: string,
    conversationId?: string
  ) => Promise<ChatMessage[]>;
  uploadFiles: (files: File[]) => Promise<any[]>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = useCallback(async (params?: any) => {
    try {
      setLoading(true);
      const response = await apiClient.getConversations(params);
      if (response.success) {
        // Ensure proper data structure
        const conversations = response.data.map((conv: any) => ({
          ...conv,
          members: conv.members || [],
          lastMessage: conv.lastMessage || null,
          unreadCount: conv.unreadCount || 0,
        }));
        setRooms(conversations);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMessages = useCallback(
    async (conversationId: string, params?: any) => {
      try {
        setLoading(true);
        const response = await apiClient.getMessages(conversationId, params);
        if (response.success) {
          // Ensure proper data structure for messages
          const messages = response.data.map((msg: any) => ({
            ...msg,
            sender: msg.sender || {
              _id: msg.senderId || "",
              firstName: "Unknown",
              lastName: "User",
            },
            text: msg.text || "",
            createdAt: msg.createdAt || new Date().toISOString(),
          }));
          setMessages(messages);
        }
      } catch (error) {
        console.error("Failed to load messages:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const sendMessage = useCallback(
    async (
      content: string,
      type: string = "text",
      replyTo?: string,
      attachments?: any[]
    ) => {
      if (!currentRoom) return;

      try {
        const response = await apiClient.sendMessage(
          currentRoom._id,
          content,
          type,
          replyTo,
          attachments
        );
        if (response.success) {
          // Add the new message to the current messages
          setMessages((prev) => [...prev, response.data]);

          // Update the conversation in the rooms list to reflect the new message
          setRooms((prev) =>
            prev.map((room) =>
              room._id === currentRoom._id
                ? {
                    ...room,
                    lastMessage: response.data,
                    lastMessageText: response.data.text,
                    lastMessageAt: response.data.createdAt,
                    updatedAt: response.data.createdAt,
                  }
                : room
            )
          );
        }
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    },
    [currentRoom]
  );

  const startConversation = useCallback(
    async (
      recipientId: string,
      type: string = "direct",
      jobId?: string,
      taskId?: string
    ) => {
      try {
        setLoading(true);
        const response = await apiClient.startConversation(
          recipientId,
          type,
          jobId,
          taskId
        );
        if (response.success) {
          // Add the new conversation to the rooms list
          setRooms((prev) => [response.data, ...prev]);
          setCurrentRoom(response.data);
        }
      } catch (error) {
        console.error("Failed to start conversation:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Load messages when current room changes
  useEffect(() => {
    if (currentRoom) {
      loadMessages(currentRoom._id);
    }
  }, [currentRoom, loadMessages]);

  const editMessage = useCallback(async (messageId: string, text: string) => {
    try {
      const response = await apiClient.editMessage(messageId, text);
      if (response.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? {
                  ...msg,
                  text,
                  edited: true,
                  editedAt: new Date().toISOString(),
                }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Failed to edit message:", error);
    }
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const response = await apiClient.deleteMessage(messageId);
      if (response.success) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId
              ? { ...msg, deleted: true, deletedAt: new Date().toISOString() }
              : msg
          )
        );
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  }, []);

  const archiveConversation = useCallback(
    async (conversationId: string, archived: boolean) => {
      try {
        const response = await apiClient.archiveConversation(
          conversationId,
          archived
        );
        if (response.success) {
          setRooms((prev) =>
            prev.map((room) =>
              room._id === conversationId
                ? {
                    ...room,
                    userSettings: room.userSettings?.map((setting) =>
                      setting.user === user?.id
                        ? { ...setting, isArchived: archived }
                        : setting
                    ),
                  }
                : room
            )
          );
        }
      } catch (error) {
        console.error("Failed to archive conversation:", error);
      }
    },
    [user]
  );

  const markAsRead = useCallback(async (conversationId: string) => {
    try {
      const response = await apiClient.markConversationAsRead(conversationId);
      if (response.success) {
        setRooms((prev) =>
          prev.map((room) =>
            room._id === conversationId ? { ...room, unreadCount: 0 } : room
          )
        );
      }
    } catch (error) {
      console.error("Failed to mark conversation as read:", error);
    }
  }, []);

  const searchMessages = useCallback(
    async (query: string, conversationId?: string) => {
      try {
        const response = await apiClient.searchMessages(query, conversationId);
        return response.success ? response.data : [];
      } catch (error) {
        console.error("Failed to search messages:", error);
        return [];
      }
    },
    []
  );

  const uploadFiles = useCallback(async (files: File[]) => {
    try {
      const response = await apiClient.uploadFiles(files);
      return response.success ? response.data : [];
    } catch (error) {
      console.error("Failed to upload files:", error);
      return [];
    }
  }, []);

  return (
    <ChatContext.Provider
      value={{
        rooms,
        currentRoom,
        messages,
        loading,
        setCurrentRoom,
        setMessages,
        sendMessage,
        loadMessages,
        loadConversations,
        startConversation,
        editMessage,
        deleteMessage,
        archiveConversation,
        markAsRead,
        searchMessages,
        uploadFiles,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
