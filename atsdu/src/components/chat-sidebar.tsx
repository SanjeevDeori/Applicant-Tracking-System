"use client";

import { useChat } from "@/context/chat-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Plus, Search, Users } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { UserSelector } from "@/components/user-selector";

export function ChatSidebar() {
  const { rooms, currentRoom, setCurrentRoom, loading } = useChat();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // Get the other participant's name for display
  const getRoomDisplayName = (room: any) => {
    if (!user || !room.members || room.members.length === 0) return "Unknown";
    const otherMember = room.members.find(
      (member: any) => member._id !== user.id
    );
    return otherMember
      ? `${otherMember.firstName || ""} ${otherMember.lastName || ""}`.trim()
      : "Unknown";
  };

  const filteredRooms = rooms.filter((room) => {
    const displayName = getRoomDisplayName(room);
    return displayName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="w-full md:w-64 border-r border-border bg-card flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Messages</h2>
          <UserSelector />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
      </div>

      {/* Rooms List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <Users className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No conversations yet
            </p>
            <p className="text-xs text-muted-foreground">
              Start a conversation with someone
            </p>
          </div>
        ) : (
          filteredRooms.map((room) => (
            <button
              key={room._id}
              onClick={() => setCurrentRoom(room)}
              className={cn(
                "w-full text-left px-4 py-3 border-b border-border hover:bg-muted transition-colors",
                currentRoom?._id === room._id && "bg-muted"
              )}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {getRoomDisplayName(room)}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {room.lastMessageText ||
                      room.lastMessage?.text ||
                      "No messages"}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {room.unreadCount && room.unreadCount > 0 && (
                    <Badge variant="default" className="text-xs">
                      {room.unreadCount}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {room.lastMessageAt
                      ? new Date(room.lastMessageAt).toLocaleDateString()
                      : room.updatedAt
                      ? new Date(room.updatedAt).toLocaleDateString()
                      : "No date"}
                  </span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
