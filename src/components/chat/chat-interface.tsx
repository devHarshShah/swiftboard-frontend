"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Avatar } from "@/src/components/ui/avatar";
import { Card } from "@/src/components/ui/card";
import {
  Send,
  User,
  Bot,
  Paperclip,
  Mic,
  Image,
  MessageSquare,
} from "lucide-react";
import { useWebSocket } from "@/src/contexts/websocket-context";
import { apiClient } from "@/src/lib/apiClient";
import { User as KanbanUser } from "@/src/types/types";

// Types for our chat messages
type MessageType = "user" | "bot";

interface Message {
  id: string;
  content: string;
  type: MessageType;
  timestamp: Date;
}

// Type for messages from the backend
interface ServerMessage {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
}

export default function ChatInterface({
  userId,
  receiverId,
  user,
}: {
  userId: string;
  receiverId: string | null;
  user: KanbanUser | null;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { socket } = useWebSocket();

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Setup WebSocket events and load messages when component mounts or receiverId changes
  useEffect(() => {
    // Only reset if we have a valid receiverId
    if (receiverId) {
      setMessages([]); // Clear existing messages
      setInput(""); // Clear input field
      setIsTyping(false); // Reset typing indicator
      setIsSending(false); // Reset sending state
    }

    if (!socket || !receiverId) return;

    // Create room name using the same format as the backend
    const roomName = [userId, receiverId].sort().join("-");

    // Join new room
    socket.emit("joinRoom", { userId, receiverId, roomName });

    // Handle successful room join
    interface JoinRoomSuccessData {
      roomName: string;
    }

    const handleJoinRoomSuccess = (data: JoinRoomSuccessData) => {
      console.log(`Successfully joined room: ${data.roomName}`);
    };

    // Handle incoming messages
    const handleNewMessage = (message: ServerMessage) => {
      // Convert server message to our message format
      const newMessage: Message = {
        id: message.id,
        content: message.text,
        type: message.senderId === userId ? "user" : "bot",
        timestamp: new Date(message.createdAt),
      };

      // If this is a message sent by the current user, turn off sending state
      if (message.senderId === userId) {
        setIsSending(false);
        // If it was a user message, turn on typing indicator for response
        setIsTyping(true);
        // Set a timeout to turn off typing if no response comes
        setTimeout(() => {
          setIsTyping(false);
        }, 30000); // 30 seconds timeout
      } else {
        // If it's a response, turn off typing indicator
        setIsTyping(false);
      }

      // Add new message to the list (without removing any temporary messages)
      setMessages((prevMessages) => {
        // Check if we already have this message to prevent duplicates
        if (prevMessages.some((msg) => msg.id === message.id)) {
          return prevMessages;
        }

        return [...prevMessages, newMessage];
      });
    };

    // Listen for events
    socket.on("joinRoomSuccess", handleJoinRoomSuccess);
    socket.on("newMessage", handleNewMessage);

    // Load previous messages for this conversation
    const loadMessages = async () => {
      try {
        const response = await apiClient(
          `/api/messages/${userId}/${receiverId}`,
        );
        const data = await response.json();
        const formattedMessages = data.map((msg: ServerMessage) => ({
          id: msg.id,
          content: msg.text,
          type: msg.senderId === userId ? "user" : "bot",
          timestamp: new Date(msg.createdAt),
        }));
        setMessages(formattedMessages);
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    };

    loadMessages();

    // Cleanup event listeners when component unmounts or receiverId changes
    return () => {
      socket.off("joinRoomSuccess", handleJoinRoomSuccess);
      socket.off("newMessage", handleNewMessage);
    };
  }, [userId, receiverId, socket]);

  const handleSendMessage = () => {
    if (input.trim() === "" || !socket || !receiverId || isSending) return;

    // Set sending state to prevent multiple sends
    setIsSending(true);

    // Create message payload for the backend
    const messagePayload = {
      text: input.trim(),
      sender: userId,
      receiver: receiverId,
    };

    // Clear input field immediately
    setInput("");

    // Send message via socket
    socket.emit("sendMessage", messagePayload);
  };

  // Handle file input change
  const handleFileInput = () => {
    // Implement file upload logic here
    console.log("File upload clicked");
  };

  // Handle voice input
  const handleVoiceInput = () => {
    // Implement voice recording logic here
    console.log("Voice input clicked");
  };

  // Empty state when no receiver is selected
  if (!receiverId) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-muted/20">
        <div className="flex flex-col items-center justify-center p-8 text-center max-w-md">
          <div className="rounded-full bg-primary/10 p-6 mb-4">
            <MessageSquare className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">
            No conversation selected
          </h2>
          <p className="text-muted-foreground mb-6">
            Choose a contact from the sidebar to start chatting or create a new
            conversation.
          </p>
          <Button className="bg-primary hover:bg-primary/90">
            Start a new chat
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="border-b py-3 px-4 flex items-center justify-between bg-card shadow-sm">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 bg-primary/90">
            <Bot className="text-primary-foreground h-10 w-10" />
          </Avatar>
          <div>
            <h2 className="font-semibold text-base">{user?.name}</h2>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
        <div>
          <Button variant="ghost" size="sm" className="rounded-full">
            <Image className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-custom bg-muted/10">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-4">
            <div className="rounded-full bg-primary/10 p-4 mb-3">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium">Start the conversation</h3>
            <p className="text-muted-foreground text-sm max-w-xs mt-1">
              Send a message to begin chatting with {user?.name}
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-start max-w-[80%] ${
                  message.type === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <Avatar
                  className={`h-8 w-8 ${
                    message.type === "user"
                      ? "ml-2 bg-primary"
                      : "mr-2 bg-secondary"
                  }`}
                >
                  {message.type === "user" ? (
                    <User className="text-primary-foreground h-8 w-8" />
                  ) : (
                    <Bot className="text-secondary-foreground h-8 w-8" />
                  )}
                </Avatar>
                <Card
                  className={`px-4 py-3 ${
                    message.type === "user"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card text-card-foreground shadow-sm"
                  }`}
                >
                  <div className="text-sm">{message.content}</div>
                  <div className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </Card>
              </div>
            </div>
          ))
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start max-w-[80%]">
              <Avatar className="h-8 w-8 mr-2 bg-secondary">
                <Bot className="text-secondary-foreground h-5 w-5" />
              </Avatar>
              <Card className="px-4 py-3 bg-card text-card-foreground shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"></div>
                  <div
                    className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </Card>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat input */}
      <div className="border-t p-4 bg-card">
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={handleFileInput}
            className="rounded-full"
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={handleVoiceInput}
            className="rounded-full"
          >
            <Mic className="h-5 w-5" />
          </Button>
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-full bg-muted/50"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            type="button"
            size="icon"
            onClick={handleSendMessage}
            disabled={input.trim() === "" || isSending}
            className="bg-primary hover:bg-primary/90 rounded-full"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
