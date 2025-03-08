import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Search, Plus, Settings, User, MessageSquare } from "lucide-react";

// Types for our chat conversations
interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: Date;
  unread: number;
}

// Sample conversations
const initialConversations: Conversation[] = [
  {
    id: "1",
    name: "Customer Support",
    lastMessage: "Hello! How can I assist you today?",
    timestamp: new Date(Date.now() - 5 * 60000),
    unread: 0,
  },
  {
    id: "2",
    name: "Sales Team",
    lastMessage: "Thank you for your inquiry about our premium plans.",
    timestamp: new Date(Date.now() - 65 * 60000),
    unread: 2,
  },
  {
    id: "3",
    name: "Technical Support",
    lastMessage: "Have you tried restarting your device?",
    timestamp: new Date(Date.now() - 240 * 60000),
    unread: 0,
  },
];

export default function Sidebar({
  onSelectConversation,
}: {
  onSelectConversation: (id: string) => void;
}) {
  const [conversations, setConversations] =
    useState<Conversation[]>(initialConversations);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeConversation, setActiveConversation] = useState("1");

  // Filter conversations based on search query
  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Handle selecting a conversation
  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);

    // Mark conversation as read
    setConversations(
      conversations.map((conv) =>
        conv.id === id ? { ...conv, unread: 0 } : conv,
      ),
    );

    // Call the parent component's handler
    onSelectConversation(id);
  };

  // Format time stamp
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="h-full flex flex-col bg-sidebar-background border-r border-sidebar-border">
      {/* Sidebar header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Messages</h2>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Conversation filters */}
      <div className="px-2 py-2 border-b border-sidebar-border">
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" className="flex-1 justify-start">
            <MessageSquare className="h-4 w-4 mr-2" />
            All
          </Button>
          <Button variant="ghost" size="sm" className="flex-1 justify-start">
            <User className="h-4 w-4 mr-2" />
            Unread
            <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {conversations.reduce((acc, conv) => acc + conv.unread, 0)}
            </span>
          </Button>
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto scrollbar-show-on-hover">
        {filteredConversations.length > 0 ? (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-3 cursor-pointer hover:bg-sidebar-accent/40 ${
                activeConversation === conversation.id
                  ? "bg-sidebar-accent"
                  : ""
              }`}
              onClick={() => handleSelectConversation(conversation.id)}
            >
              <div className="flex items-start space-x-3">
                <Avatar className="h-10 w-10 flex-shrink-0 flex justify-center items-center">
                  {conversation.name.charAt(0)}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`font-medium truncate ${conversation.unread > 0 ? "font-semibold" : ""}`}
                    >
                      {conversation.name}
                    </h3>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                      {formatTimestamp(conversation.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm truncate text-muted-foreground">
                    {conversation.lastMessage}
                  </p>
                </div>
                {conversation.unread > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0">
                    {conversation.unread}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
            <Search className="h-12 w-12 mb-2 opacity-20" />
            <p>No conversations found</p>
            <p className="text-sm">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  );
}
