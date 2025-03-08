"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Send, User, Bot, Paperclip, Mic, Image } from "lucide-react";
import { useWebSocket } from "@/contexts/websocket-context";

// Types for our chat messages
type MessageType = "user" | "bot";

interface Message {
  id: string;
  content: string;
  type: MessageType;
  timestamp: Date;
}

// Sample initial messages
const initialMessages: Message[] = [
  {
    id: "1",
    content: "Hello! How can I assist you today?",
    type: "bot",
    timestamp: new Date(Date.now() - 60000),
  },
];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { socket } = useWebSocket();

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus the input field when the component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("connect", () => {
      console.log("connected");
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    socket.on("onMessage", (data: any) => {
      // Add bot message
      const botMessage: Message = {
        id: Date.now().toString(),
        content: data.content,
        type: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);
    });

    return () => {
      socket.off("connect");
      socket.off("onMessage");
    };
  }, [socket]);

  const handleSendMessage = () => {
    if (input.trim() === "") return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      type: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate bot typing
    setIsTyping(true);

    socket?.emit("message", userMessage.content);
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
            <h2 className="font-semibold">ChatBot</h2>
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
