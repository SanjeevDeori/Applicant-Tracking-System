"use client";

import { useChat } from "@/context/chat-context";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  MessageCircle,
  Paperclip,
  Smile,
  MoreVertical,
  Edit,
  Trash2,
  Reply,
  Check,
  CheckCheck,
  Image as ImageIcon,
  File,
  Search,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSocket } from "@/hooks/useSocket";

export function ChatWindow() {
  const {
    currentRoom,
    messages,
    sendMessage,
    loading,
    editMessage,
    deleteMessage,
    archiveConversation,
    uploadFiles,
  } = useChat();
  const { user } = useAuth();
  const [messageText, setMessageText] = useState("");
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [replyingTo, setReplyingTo] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    joinConversation,
    leaveConversation,
    sendTypingStart,
    sendTypingStop,
    markMessageDelivered,
    markMessageRead,
    isConnected,
  } = useSocket();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket.io integration
  useEffect(() => {
    if (currentRoom && isConnected) {
      joinConversation(currentRoom._id);

      return () => {
        leaveConversation(currentRoom._id);
      };
    }
  }, [currentRoom, isConnected, joinConversation, leaveConversation]);

  // Handle typing indicators
  const handleTyping = () => {
    if (currentRoom && isConnected) {
      sendTypingStart(currentRoom._id);
      setIsTyping(true);

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStop(currentRoom._id);
        setIsTyping(false);
      }, 1000);
    }
  };

  // Mark messages as read when viewing
  useEffect(() => {
    if (currentRoom && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.sender._id !== user?.id) {
        markMessageRead(lastMessage._id, currentRoom._id);
      }
    }
  }, [currentRoom, messages, user, markMessageRead]);

  const handleSend = async () => {
    if (messageText.trim() || selectedFiles.length > 0) {
      let attachments = [];

      if (selectedFiles.length > 0) {
        try {
          attachments = await uploadFiles(selectedFiles);
        } catch (error) {
          console.error("Failed to upload files:", error);
          return;
        }
      }

      await sendMessage(
        messageText.trim(),
        selectedFiles.length > 0 ? "file" : "text",
        replyingTo?._id,
        attachments
      );

      setMessageText("");
      setSelectedFiles([]);
      setReplyingTo(null);
    }
  };

  const handleEdit = (messageId: string, currentText: string) => {
    setEditingMessage(messageId);
    setEditText(currentText);
  };

  const handleSaveEdit = async () => {
    if (editingMessage && editText.trim()) {
      await editMessage(editingMessage, editText);
      setEditingMessage(null);
      setEditText("");
    }
  };

  const handleDelete = async (messageId: string) => {
    if (confirm("Are you sure you want to delete this message?")) {
      await deleteMessage(messageId);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleArchive = async () => {
    if (currentRoom) {
      await archiveConversation(currentRoom._id, true);
    }
  };

  const handleUnarchive = async () => {
    if (currentRoom) {
      await archiveConversation(currentRoom._id, false);
    }
  };

  // Get the other participant's info for display
  const getOtherParticipant = () => {
    if (!currentRoom || !user || !currentRoom.members) return null;
    return currentRoom.members.find((member) => member._id !== user.id);
  };

  const otherParticipant = getOtherParticipant();

  if (!currentRoom) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Select a conversation to start messaging
          </p>
        </div>
      </div>
    );
  }

  const isArchived = currentRoom.userSettings?.find(
    (s) => s.user === user?.id
  )?.isArchived;

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {otherParticipant
                  ? `${otherParticipant.firstName.charAt(
                      0
                    )}${otherParticipant.lastName.charAt(0)}`
                  : "?"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">
                {otherParticipant
                  ? `${otherParticipant.firstName || ""} ${
                      otherParticipant.lastName || ""
                    }`.trim()
                  : "Unknown User"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentRoom.members ? currentRoom.members.length : 0}{" "}
                participants
                {currentRoom.unreadCount && currentRoom.unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {currentRoom.unreadCount}
                  </Badge>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={isArchived ? handleUnarchive : handleArchive}
            >
              {isArchived ? (
                <ArchiveRestore className="h-4 w-4" />
              ) : (
                <Archive className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="mt-3">
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages
            .filter((message) => !message.deleted)
            .filter(
              (message) =>
                !searchQuery ||
                message.text.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map((message) => {
              const isOwnMessage =
                message.sender && message.sender._id === user?.id;
              const isEditing = editingMessage === message._id;

              return (
                <div
                  key={message._id}
                  className={`flex ${
                    isOwnMessage ? "justify-end" : "justify-start"
                  } group`}
                >
                  <div className="max-w-xs lg:max-w-md">
                    {/* Reply to message */}
                    {message.replyTo && (
                      <div className="mb-2 p-2 bg-muted/50 rounded-lg border-l-2 border-primary">
                        <p className="text-xs text-muted-foreground">
                          Replying to{" "}
                          {message.replyTo.sender?.firstName || "Unknown"}
                        </p>
                        <p className="text-sm truncate">
                          {message.replyTo.text}
                        </p>
                      </div>
                    )}

                    {/* Message content */}
                    <div
                      className={cn(
                        "px-4 py-2 rounded-lg relative",
                        isOwnMessage
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <Input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="text-sm"
                          />
                          <div className="flex space-x-2">
                            <Button size="sm" onClick={handleSaveEdit}>
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingMessage(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm">{message.text}</p>

                          {/* Attachments */}
                          {message.attachments &&
                            message.attachments.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {message.attachments.map(
                                  (attachment, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center space-x-2 p-2 bg-background/20 rounded"
                                    >
                                      {attachment.mimetype.startsWith(
                                        "image/"
                                      ) ? (
                                        <ImageIcon className="h-4 w-4" />
                                      ) : (
                                        <File className="h-4 w-4" />
                                      )}
                                      <span className="text-xs truncate">
                                        {attachment.originalName}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            )}

                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center space-x-1">
                              <p className="text-xs opacity-70">
                                {new Date(message.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                              {message.edited && (
                                <span className="text-xs opacity-70">
                                  (edited)
                                </span>
                              )}
                              {isOwnMessage && (
                                <div className="flex items-center">
                                  {message.status === "read" ? (
                                    <CheckCheck className="h-3 w-3 text-primary" />
                                  ) : message.status === "delivered" ? (
                                    <CheckCheck className="h-3 w-3" />
                                  ) : (
                                    <Check className="h-3 w-3" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Message actions */}
                      {!isEditing && isOwnMessage && (
                        <div className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleEdit(message._id, message.text)
                              }
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(message._id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
        )}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex justify-start">
            <div className="bg-muted px-4 py-2 rounded-lg">
              <p className="text-sm text-muted-foreground">
                {typingUsers.map((user) => user.firstName).join(", ")}{" "}
                {typingUsers.length === 1 ? "is" : "are"} typing...
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Reply to message */}
      {replyingTo && (
        <div className="border-t border-border p-3 bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Reply className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Replying to {replyingTo.sender.firstName}
              </span>
              <span className="text-sm truncate max-w-xs">
                {replyingTo.text}
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setReplyingTo(null)}
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="border-t border-border p-3 bg-muted/50">
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 bg-background p-2 rounded-lg"
              >
                <File className="h-4 w-4" />
                <span className="text-sm truncate max-w-xs">{file.name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFile(index)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-border p-4">
        <div className="flex space-x-2">
          <div className="flex space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          <Input
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="flex-1"
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            size="sm"
            disabled={
              loading || (!messageText.trim() && selectedFiles.length === 0)
            }
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,application/pdf,.doc,.docx,.txt,.zip,.rar"
        />
      </div>
    </div>
  );
}
