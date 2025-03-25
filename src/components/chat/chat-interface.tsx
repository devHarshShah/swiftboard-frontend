"use client";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import {
  Send,
  UserIcon,
  Phone,
  Video,
  Paperclip,
  MessageSquare,
  Smile,
  MoreVertical,
  Info,
  FileText,
  Star,
  X,
} from "lucide-react";
import { useWebSocket } from "@/src/contexts/websocket-context";
import { apiClient } from "@/src/lib/apiClient";
import { TeamMember, User } from "@/src/types/types";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { cn } from "@/src/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Badge } from "@/src/components/ui/badge";
import { debounce } from "lodash";

// Types for our chat messages
type MessageType = "user" | "bot";

interface Message {
  id: string;
  content: string;
  type: MessageType;
  timestamp: Date;
  status?: "sent" | "delivered" | "read";
  media?: { type: string; url: string }[];
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
  currentUser,
}: {
  userId: string;
  receiverId: string | null;
  user: TeamMember | null;
  currentUser: User | null;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [userOnline, setUserOnline] = useState(user?.status === "online");
  const [chatInfo, setChatInfo] = useState({ visible: false });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );
  const { chatSocket } = useWebSocket();

  // Group messages by date for better organization
  const getMessageDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
  };

  const groupedMessages = messages.reduce(
    (groups, message) => {
      const date = getMessageDate(message.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
      return groups;
    },
    {} as Record<string, Message[]>,
  );

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Typing indicator handlers
  const emitStartTyping = debounce(() => {
    if (chatSocket && receiverId) {
      chatSocket.emit("startTyping", {
        userId: userId,
        receiverId: receiverId,
      });
    }
  }, 300);

  const emitStopTyping = debounce(() => {
    if (chatSocket && receiverId) {
      chatSocket.emit("stopTyping", {
        userId: userId,
        receiverId: receiverId,
      });
    }
  }, 1000);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    // Handle typing indicator
    if (value.length > 0) {
      emitStartTyping();

      // Clear any existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      // Set a new timeout to stop typing
      const timeout = setTimeout(() => {
        emitStopTyping();
      }, 3000);

      setTypingTimeout(timeout);
    } else {
      emitStopTyping();
    }
  };

  // Setup WebSocket events and load messages when component mounts or receiverId changes
  useEffect(() => {
    // Only reset if we have a valid receiverId
    if (receiverId) {
      setMessages([]); // Clear existing messages
      setInput(""); // Clear input field
      setIsTyping(false); // Reset typing indicator
      setChatInfo({ visible: false });
    }

    if (!chatSocket || !receiverId) return;

    // Create room name using the same format as the backend
    const roomName = [userId, receiverId].sort().join("-");

    // Join new room
    chatSocket.emit("joinRoom", { userId, receiverId, roomName });

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
        status: "delivered",
      };

      // If it's a response from the other user, turn off typing indicator
      if (message.senderId !== userId) {
        setIsTyping(false);
      }

      // Add new message to the list
      setMessages((prevMessages) => {
        // Check if we already have this message to prevent duplicates
        if (prevMessages.some((msg) => msg.id === message.id)) {
          return prevMessages;
        }

        return [...prevMessages, newMessage];
      });
    };

    // Handle typing indicators
    const handleUserTyping = () => setIsTyping(true);
    const handleUserStoppedTyping = () => setIsTyping(false);

    // Listen for events
    chatSocket.on("joinRoomSuccess", handleJoinRoomSuccess);
    chatSocket.on("newMessage", handleNewMessage);
    chatSocket.on("userTyping", handleUserTyping);
    chatSocket.on("userStoppedTyping", handleUserStoppedTyping);
    chatSocket.on("userOnline", () => setUserOnline(true));
    chatSocket.on("userOffline", () => setUserOnline(false));

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
          status: "read",
        }));
        setMessages(formattedMessages);
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    };

    loadMessages();

    // Cleanup event listeners and timeouts when component unmounts
    return () => {
      emitStartTyping.cancel();
      emitStopTyping.cancel();
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      chatSocket.off("joinRoomSuccess", handleJoinRoomSuccess);
      chatSocket.off("newMessage", handleNewMessage);
      chatSocket.off("userTyping", handleUserTyping);
      chatSocket.off("userStoppedTyping", handleUserStoppedTyping);
      chatSocket.off("userOnline");
      chatSocket.off("userOffline");
    };
  }, [userId, receiverId, chatSocket]);

  const handleSendMessage = () => {
    if (input.trim() === "" || !chatSocket || !receiverId) return;

    // Create message payload for the backend
    const messagePayload = {
      text: input.trim(),
      sender: userId,
      receiver: receiverId,
    };

    // Clear input field immediately
    setInput("");

    // Cancel any typing indicators
    emitStopTyping();
    if (typingTimeout) {
      clearTimeout(typingTimeout);
      setTypingTimeout(null);
    }

    // Close emoji picker if open
    if (showEmojiPicker) {
      setShowEmojiPicker(false);
    }

    // Send message via chatSocket - the server will echo back the saved message
    // which will be added to our messages list in the newMessage handler
    chatSocket.emit("sendMessage", messagePayload);
  };

  // Handle file input change
  const handleFileInput = () => {
    // Implement file upload logic here
    console.log("File upload clicked");
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,.pdf,.doc,.docx";
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
        // Here you would typically upload the files to your server
        console.log("Files selected:", files);
      }
    };
    input.click();
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji: string) => {
    setInput((prev) => prev + emoji);
    inputRef.current?.focus();

    // Trigger typing indicator when adding emoji
    emitStartTyping();

    // Clear any existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set a new timeout to stop typing
    const timeout = setTimeout(() => {
      emitStopTyping();
    }, 3000);

    setTypingTimeout(timeout);
  };

  // Empty state when no receiver is selected
  if (!receiverId) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-gradient-to-b from-card to-background">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center p-8 text-center max-w-md"
        >
          <div className="rounded-full bg-primary/10 p-6 mb-6">
            <MessageSquare className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold mb-3">Welcome to SwiftChat</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Connect with your team members instantly. Choose a contact from the
            sidebar to start messaging or create a new conversation.
          </p>
          <Button className="bg-primary hover:bg-primary/90 rounded-full px-6">
            <UserIcon className="h-4 w-4 mr-2" />
            Start a new chat
          </Button>
        </motion.div>
      </div>
    );
  }

  const toggleChatInfo = () => {
    setChatInfo((prev) => ({ ...prev, visible: !prev.visible }));
  };

  return (
    <div className="flex h-full bg-background border-l border-border">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full">
        {/* Chat header */}
        <div className="border-b py-3 px-4 flex items-center justify-between bg-card/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Avatar className="h-10 w-10 border">
                {user?.avatar ? (
                  <AvatarImage src={user.avatar} alt={user?.name} />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              <div
                className={cn(
                  "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
                  userOnline ? "bg-green-500" : "bg-gray-300",
                )}
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-medium">{user?.name}</h2>
                <Badge
                  variant="outline"
                  className="h-5 px-1.5 text-xs bg-primary/10 text-primary border-primary/20"
                >
                  {user?.role || "Team Member"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {userOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8"
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Call</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8"
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Video call</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "rounded-full h-8 w-8",
                      chatInfo.visible && "bg-accent text-accent-foreground",
                    )}
                    onClick={toggleChatInfo}
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Chat info</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Chat messages */}
        <ScrollArea className="flex-1 py-6 px-4 bg-gradient-to-b from-background to-muted/20">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center max-w-sm"
              >
                <div className="rounded-full bg-primary/10 p-5 mb-4">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">
                  Start the conversation
                </h3>
                <p className="text-muted-foreground text-sm max-w-xs mb-6">
                  This is the beginning of your conversation with {user?.name}.
                  Say hello!
                </p>
                <Button
                  variant="outline"
                  className="rounded-full px-4"
                  onClick={() => {
                    setInput("Hi! How are you doing today?");
                    inputRef.current?.focus();
                  }}
                >
                  👋 Say hello
                </Button>
              </motion.div>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedMessages).map(([date, dateMessages]) => (
                <div key={date} className="space-y-4">
                  <div className="flex justify-center">
                    <div className="bg-muted/50 px-3 py-1 rounded-full text-xs text-muted-foreground">
                      {date}
                    </div>
                  </div>

                  {dateMessages.map((message, index) => {
                    // Determine if this message is part of a group
                    const prevMessage =
                      index > 0 ? dateMessages[index - 1] : null;
                    const nextMessage =
                      index < dateMessages.length - 1
                        ? dateMessages[index + 1]
                        : null;

                    const isFirstInGroup =
                      !prevMessage || prevMessage.type !== message.type;
                    const isLastInGroup =
                      !nextMessage || nextMessage.type !== message.type;

                    return (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className={cn(
                          "flex",
                          message.type === "user"
                            ? "justify-end"
                            : "justify-start",
                          !isLastInGroup && message.type === "user"
                            ? "mb-1"
                            : "",
                          !isLastInGroup && message.type === "bot"
                            ? "mb-1"
                            : "",
                        )}
                      >
                        <div
                          className={cn(
                            "flex items-start max-w-[80%]",
                            message.type === "user"
                              ? "flex-row-reverse"
                              : "flex-row",
                          )}
                        >
                          {/* Only show avatar for first message in group */}
                          {isFirstInGroup && (
                            <div
                              className={cn(
                                "h-8 w-8 flex-shrink-0",
                                message.type === "user" ? "ml-2" : "mr-2",
                              )}
                            >
                              <Avatar className="h-8 w-8 border">
                                {message.type === "user" ? (
                                  currentUser?.avatar ? (
                                    <AvatarImage
                                      src={currentUser.avatar}
                                      alt="You"
                                    />
                                  ) : (
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                      {currentUser?.name
                                        ?.charAt(0)
                                        .toUpperCase() || "Y"}
                                    </AvatarFallback>
                                  )
                                ) : user?.avatar ? (
                                  <AvatarImage
                                    src={user.avatar}
                                    alt={user.name}
                                  />
                                ) : (
                                  <AvatarFallback className="bg-primary/10 text-primary">
                                    {user?.name?.charAt(0).toUpperCase() || "U"}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                            </div>
                          )}
                          {/* Spacer for non-first messages in group */}
                          {!isFirstInGroup && (
                            <div
                              className={cn(
                                "h-8 w-8 flex-shrink-0",
                                message.type === "user" ? "ml-2" : "mr-2",
                              )}
                            />
                          )}

                          <div
                            className={cn(
                              "px-4 py-2.5 rounded-2xl",
                              isFirstInGroup && message.type === "user"
                                ? "rounded-tr-sm"
                                : "",
                              isFirstInGroup && message.type === "bot"
                                ? "rounded-tl-sm"
                                : "",
                              message.type === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted border border-border/50",
                            )}
                          >
                            <div className="text-sm whitespace-pre-wrap break-words">
                              {message.content}
                            </div>

                            {/* Only show timestamp for last message in group */}
                            {isLastInGroup && (
                              <div className="flex items-center mt-1 text-[10px] opacity-70 justify-end gap-1">
                                <span>
                                  {message.timestamp.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>

                                {message.type === "user" && (
                                  <>
                                    {message.status === "sent" && (
                                      <svg
                                        className="h-3 w-3"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M5 13L9 17L19 7"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    )}
                                    {message.status === "delivered" && (
                                      <svg
                                        className="h-3 w-3"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M2 13L6 17M6 17L16 7M10 17L20 7"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    )}
                                    {message.status === "read" && (
                                      <svg
                                        className="h-3 w-3 text-blue-400"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                      >
                                        <path
                                          d="M2 13L6 17M6 17L16 7M10 17L20 7"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                      </svg>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* Typing indicator */}
          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-start mt-2"
              >
                <div className="flex items-start">
                  <Avatar className="h-8 w-8 mr-2 border">
                    {user?.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.name} />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="px-4 py-2.5 rounded-2xl rounded-tl-sm bg-muted border border-border/50">
                    <div className="flex items-center space-x-1 h-5 px-1">
                      <motion.div
                        className="w-2 h-2 rounded-full bg-muted-foreground/60"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8 }}
                      />
                      <motion.div
                        className="w-2 h-2 rounded-full bg-muted-foreground/60"
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          delay: 0.2,
                        }}
                      />
                      <motion.div
                        className="w-2 h-2 rounded-full bg-muted-foreground/60"
                        animate={{ y: [0, -5, 0] }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.8,
                          delay: 0.4,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Chat input */}
        <div className="p-4 bg-card/80 backdrop-blur-sm border-t border-border">
          <div className="relative">
            <Input
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              className="flex-1 pr-24 pl-4 py-6 rounded-full bg-background border-muted shadow-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />

            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                    >
                      <Smile className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Emoji</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={handleFileInput}
                      className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                    >
                      <Paperclip className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Attach files</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                type="button"
                size="icon"
                onClick={handleSendMessage}
                disabled={input.trim() === ""}
                className="bg-primary hover:bg-primary/90 rounded-full h-8 w-8 ml-1"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            {/* Emoji picker */}
            <AnimatePresence>
              {showEmojiPicker && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-full right-0 mb-2 p-3 bg-card shadow-lg rounded-lg border border-border grid grid-cols-8 gap-2 w-64"
                >
                  {/* Simple emoji picker - in a real app you'd use a proper emoji picker library */}
                  {[
                    "😀",
                    "😂",
                    "😊",
                    "❤️",
                    "👍",
                    "🙏",
                    "🔥",
                    "⭐",
                    "🎉",
                    "🤔",
                    "😎",
                    "😢",
                    "👋",
                    "💪",
                    "✅",
                    "💯",
                    "🚀",
                    "💼",
                    "⏰",
                    "📱",
                    "💡",
                    "📊",
                    "✨",
                    "🎯",
                  ].map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-accent rounded-md"
                      onClick={() => handleEmojiSelect(emoji)}
                    >
                      {emoji}
                    </Button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Chat info panel */}
      <AnimatePresence>
        {chatInfo.visible && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-l border-border h-full bg-card overflow-hidden"
          >
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-medium">Chat Information</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={toggleChatInfo}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="flex flex-col items-center mb-5 text-center">
                  <Avatar className="h-20 w-20 mb-3 border-2 border-primary/10">
                    {user?.avatar ? (
                      <AvatarImage src={user.avatar} alt={user?.name} />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <h3 className="text-lg font-medium mb-1">{user?.name}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <div className="flex mt-4 space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full"
                    >
                      <Star className="h-4 w-4 mr-1" />
                      Favorite
                    </Button>
                    <Button size="sm" className="rounded-full bg-primary">
                      <FileText className="h-4 w-4 mr-1" />
                      View Profile
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 mt-3">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Shared Media</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="aspect-square bg-muted rounded-md"></div>
                      <div className="aspect-square bg-muted rounded-md"></div>
                      <div className="aspect-square bg-muted rounded-md"></div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium mb-2">Shared Files</h4>
                    <div className="space-y-2">
                      <div className="flex items-center p-2 rounded-md bg-muted/50 hover:bg-muted">
                        <FileText className="h-4 w-4 mr-2 text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            Project_Report.pdf
                          </p>
                          <p className="text-xs text-muted-foreground">
                            1.2 MB
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-border">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <MoreVertical className="h-4 w-4 mr-2" />
                      More options
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Clear chat history</DropdownMenuItem>
                    <DropdownMenuItem>Block user</DropdownMenuItem>
                    <DropdownMenuItem>Report a problem</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
