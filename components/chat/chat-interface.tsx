"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Send, User, Bot, Paperclip, Mic, Image } from "lucide-react";
import { useWebSocket } from "@/contexts/websocket-context";
import { apiClient } from "@/lib/apiClient";

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
}: {
  userId: string;
  receiverId: string;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [temporaryMessageId, setTemporaryMessageId] = useState<string | null>(
    null,
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { socket } = useWebSocket();

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Setup WebSocket events and load messages when component mounts or receiverId changes
  useEffect(() => {
    setMessages([]); // Clear existing messages
    setInput(""); // Clear input field
    setIsTyping(false); // Reset typing indicator

    if (!socket || !receiverId) return;

    // Create room name using the same format as the backend
    const roomName = [userId, receiverId].sort().join("-");

    // Join new room
    socket.emit("joinRoom", { userId, receiverId, roomName });

    // Handle successful room join
    // Define interface for join room success data
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

      // If this is the expected message (matches our temporary ID), remove typing indicator
      if (temporaryMessageId && message.senderId === userId) {
        setIsTyping(false);
        setTemporaryMessageId(null);
      }

      // Add new message to the list
      setMessages((prevMessages) => {
        // Filter out temporary message if this is the corresponding real message
        const filteredMessages = prevMessages.filter(
          (msg) => msg.id !== `temp-${message.id}`,
        );
        return [...filteredMessages, newMessage];
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
  }, [userId, receiverId, socket, temporaryMessageId]);

  const handleSendMessage = () => {
    if (input.trim() === "" || !socket) return;

    // Generate temporary message ID
    const tempId = `temp-${Date.now()}`;
    setTemporaryMessageId(tempId);

    // Add temporary message immediately to UI
    const tempMessage: Message = {
      id: tempId,
      content: input.trim(),
      type: "user",
      timestamp: new Date(),
    };

    setMessages((prevMessages) => [...prevMessages, tempMessage]);

    // Create message payload for the backend
    const messagePayload = {
      text: input.trim(),
      sender: userId,
      receiver: receiverId,
    };

    // Send message via socket
    socket.emit("sendMessage", messagePayload);

    // Clear input field
    setInput("");

    // Show typing indicator for response
    setIsTyping(true);
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

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="border-b py-3 px-4 flex items-center justify-between bg-card">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8 bg-primary">
            <Bot className="text-primary-foreground h-8 w-8" />
          </Avatar>
          <div>
            <h2 className="font-semibold">Chat with {receiverId}</h2>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>
        <div>
          <Button variant="ghost" size="sm">
            <Image className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-custom">
        {messages.map((message) => (
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
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-card-foreground"
                }`}
              >
                <div>{message.content}</div>
                <div className="text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </Card>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start max-w-[80%]">
              <Avatar className="h-8 w-8 mr-2 bg-secondary">
                <Bot className="text-secondary-foreground h-8 w-8" />
              </Avatar>
              <Card className="px-4 py-3 bg-card text-card-foreground">
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
          >
            <Paperclip className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            onClick={handleVoiceInput}
          >
            <Mic className="h-5 w-5" />
          </Button>
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
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
            disabled={input.trim() === ""}
            className="bg-primary hover:bg-primary/90"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
