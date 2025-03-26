"use client";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
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
  File,
  FileSpreadsheet,
  FileImage,
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
import Image from "next/image";

type MessageType = "user" | "bot";

interface Attachment {
  id: string;
  filename: string;
  contentType: string;
  fileSize: number;
  url?: string;
  fetchingUrl?: boolean; // Add this field to track if we're already fetching the URL
}

interface Message {
  id: string;
  content: string;
  type: MessageType;
  timestamp: Date;
  status?: "sent" | "delivered" | "read";
  media?: { type: string; url: string }[];
  attachments?: Attachment[];
}

// Type for messages from the backend
interface ServerMessage {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  createdAt: string;
  attachments?: Attachment[];
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
  const [isUploading, setIsUploading] = useState(false);
  const [attachmentUrls, setAttachmentUrls] = useState<Record<string, string>>(
    {},
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );
  const { chatSocket } = useWebSocket();

  // Group messages by date for better organization
  const getMessageDate = useCallback((date: Date) => {
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
  }, []);

  // Memoize the groupedMessages to prevent recalculations
  const groupedMessages = useMemo(() => {
    return messages.reduce(
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
  }, [messages, getMessageDate]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Typing indicator handlers
  const emitStartTyping = useCallback(() => {
    const debouncedEmit = debounce(() => {
      if (chatSocket && receiverId) {
        chatSocket.emit("startTyping", {
          userId: userId,
          receiverId: receiverId,
        });
      }
    }, 300);

    debouncedEmit();
    return debouncedEmit;
  }, [chatSocket, receiverId, userId]);

  const emitStopTyping = useCallback(() => {
    const debouncedEmit = debounce(() => {
      if (chatSocket && receiverId) {
        chatSocket.emit("stopTyping", {
          userId: userId,
          receiverId: receiverId,
        });
      }
    }, 1000);

    debouncedEmit();
    return debouncedEmit;
  }, [chatSocket, receiverId, userId]);

  // Handle input changes
  // Handle input changes
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
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
        const newTimeout = setTimeout(() => {
          emitStopTyping();
        }, 3000);

        setTypingTimeout(newTimeout);
      } else {
        emitStopTyping();
      }
    },
    [emitStartTyping, emitStopTyping, typingTimeout], // Remove typingTimeout from dependencies
  );

  // Memoize the fetchAttachmentUrl function to maintain stable reference
  const fetchAttachmentUrl = useCallback(
    async (attachmentId: string) => {
      // Skip if we already have the URL
      if (attachmentUrls[attachmentId]) return;

      try {
        // First check if the attachment URL is already in our messages
        const attachmentWithUrl = messages.flatMap(
          (msg) =>
            msg.attachments?.filter(
              (att) => att.id === attachmentId && "s3Url" in att,
            ) || [],
        )[0];

        if (attachmentWithUrl && "s3Url" in attachmentWithUrl) {
          // If we already have the S3 URL in the message data, use it directly
          setAttachmentUrls((prev) => ({
            ...prev,
            [attachmentId]: attachmentWithUrl.s3Url as string,
          }));
          return;
        }

        // Otherwise fetch it from the API
        const response = await apiClient(
          `/api/messages/attachments/${attachmentId}`,
        );
        const data = await response.json();

        if (data.url || data.s3Url) {
          setAttachmentUrls((prev) => ({
            ...prev,
            [attachmentId]: data.url || data.s3Url,
          }));
        }
      } catch (error) {
        console.error(
          `Failed to fetch URL for attachment ${attachmentId}:`,
          error,
        );
      }
    },
    [attachmentUrls, messages],
  );

  useEffect(() => {
    if (receiverId) {
      setMessages([]); // Clear existing messages
      setInput(""); // Clear input field
      setIsTyping(false); // Reset typing indicator
      setChatInfo({ visible: false });
    }

    if (!chatSocket || !receiverId) return;

    const roomName = [userId, receiverId].sort().join("-");

    chatSocket.emit("joinRoom", { userId, receiverId, roomName });

    interface JoinRoomSuccessData {
      roomName: string;
    }

    const handleJoinRoomSuccess = (data: JoinRoomSuccessData) => {
      console.log(`Successfully joined room: ${data.roomName}`);
    };

    const handleNewMessage = (message: ServerMessage) => {
      const newMessage: Message = {
        id: message.id,
        content: message.text,
        type: message.senderId === userId ? "user" : "bot",
        timestamp: new Date(message.createdAt),
        status: "delivered",
        attachments: message.attachments
          ? message.attachments.map((att) => ({
              ...att,
              fetchingUrl: false, // Initialize the tracking field
            }))
          : undefined,
      };

      if (message.senderId !== userId) {
        setIsTyping(false);
      }

      setMessages((prevMessages) => {
        if (prevMessages.some((msg) => msg.id === message.id)) {
          return prevMessages;
        }

        return [...prevMessages, newMessage];
      });
    };

    const handleUserTyping = () => setIsTyping(true);
    const handleUserStoppedTyping = () => setIsTyping(false);

    chatSocket.on("joinRoomSuccess", handleJoinRoomSuccess);
    chatSocket.on("newMessage", handleNewMessage);
    chatSocket.on("userTyping", handleUserTyping);
    chatSocket.on("userStoppedTyping", handleUserStoppedTyping);
    chatSocket.on("userOnline", () => setUserOnline(true));
    chatSocket.on("userOffline", () => setUserOnline(false));

    const loadMessages = async () => {
      try {
        const response = await apiClient(
          `/api/messages/${userId}/${receiverId}`,
        );
        const data = await response.json();

        // Format messages based on actual API response structure

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedMessages = data.map((msg: any) => ({
          id: msg.id,
          content: msg.text, // API returns 'text', map to 'content' for our component
          type: msg.senderId === userId ? "user" : "bot",
          timestamp: new Date(msg.createdAt),
          status: "read",
          attachments: msg.attachments
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              msg.attachments.map((att: any) => ({
                id: att.id,
                filename: att.filename,
                contentType: att.contentType || att.fileType, // Handle both contentType and fileType
                fileSize: att.fileSize,
                fetchingUrl: false, // Initialize the tracking field
              }))
            : undefined,
          // Store additional sender/receiver info if needed
          senderInfo: msg.sender,
          receiverInfo: msg.receiver,
        }));

        setMessages(formattedMessages);
      } catch (error) {
        console.error("Failed to load messages:", error);
      }
    };

    loadMessages();

    // Cleanup event listeners and timeouts when component unmounts
    return () => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, receiverId, chatSocket]);

  // Replace the attachments useEffect with a more reliable implementation
  useEffect(() => {
    // Skip if no messages
    if (messages.length === 0) return;

    // Get a list of all attachments needing URLs
    const attachmentsNeedingUrls: string[] = [];

    messages.forEach((msg) => {
      if (!msg.attachments) return;

      msg.attachments.forEach((att) => {
        // Don't refetch URLs we already have or are currently fetching
        if (!attachmentUrls[att.id] && !att.fetchingUrl) {
          att.fetchingUrl = true; // Mark as fetching without triggering re-render
          attachmentsNeedingUrls.push(att.id);
        }
      });
    });

    // Fetch all needed attachment URLs
    attachmentsNeedingUrls.forEach((id) => {
      fetchAttachmentUrl(id);
    });
  }, [messages, fetchAttachmentUrl, attachmentUrls]);

  const handleSendMessage = useCallback(() => {
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

    // Send message via chatSocket
    chatSocket.emit("sendMessage", messagePayload);
  }, [
    input,
    chatSocket,
    receiverId,
    userId,
    emitStopTyping,
    typingTimeout,
    showEmojiPicker,
  ]);

  // Handle file uploads
  const handleFileInput = useCallback(() => {
    // Create file input element
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,.pdf,.doc,.docx";
    input.multiple = true;

    // When files are selected
    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0 || !receiverId) return;

      try {
        // Show upload indicator
        setIsUploading(true);

        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          // Create form data
          const formData = new FormData();
          formData.append("file", file);
          formData.append("senderId", userId);
          formData.append("receiverId", receiverId);

          // Send to our Next.js API proxy
          const response = await apiClient("/api/messages/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error("Upload failed");
          }
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      } finally {
        setIsUploading(false);
      }
    };

    // Open file selection dialog
    input.click();
  }, [receiverId, userId]);

  // Helper functions for file icons and sizes
  const getFileIcon = useCallback((contentType: string = "") => {
    if (contentType.includes("pdf")) {
      return <FileText className="h-6 w-6 text-red-500" />;
    }
    if (contentType.includes("word") || contentType.includes("doc")) {
      return <FileText className="h-6 w-6 text-blue-500" />;
    }
    if (contentType.includes("sheet") || contentType.includes("excel")) {
      return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
    }
    if (contentType.includes("image")) {
      return <FileImage className="h-6 w-6 text-purple-500" />;
    }
    return <File className="h-6 w-6 text-gray-500" />;
  }, []);

  const formatFileSize = useCallback((bytes: number) => {
    if (!bytes) return "0 Bytes";
    if (bytes < 1024) return bytes + " Bytes";
    if (bytes < 1048576) return Math.round(bytes / 1024) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  }, []);

  // Use useCallback to memoize the renderAttachment function
  const renderAttachment = useCallback(
    (attachment: Attachment) => {
      const url = attachmentUrls[attachment.id];

      if (!url) {
        return (
          <div className="flex items-center p-2 rounded-md bg-muted/50 animate-pulse">
            <div className="h-10 w-10 rounded-md bg-muted"></div>
            <div className="ml-2 flex-1">
              <div className="h-4 w-24 bg-muted rounded mb-1"></div>
              <div className="h-3 w-16 bg-muted rounded"></div>
            </div>
          </div>
        );
      }

      const isImage = attachment.contentType?.includes("image");

      if (isImage) {
        return (
          <div className="max-w-[200px] rounded-md overflow-hidden">
            <Image
              src={url}
              alt={attachment.filename}
              width={200}
              height={200}
              className="w-full h-auto object-cover cursor-pointer"
              onClick={() => window.open(url, "_blank")}
            />
            <div className="text-xs px-2 py-1 bg-background/80 truncate">
              {attachment.filename}
            </div>
          </div>
        );
      } else {
        return (
          <div
            className="flex items-center p-2 rounded-md bg-muted/30 hover:bg-muted cursor-pointer"
            onClick={() => window.open(url, "_blank")}
          >
            {getFileIcon(attachment.contentType)}
            <div className="ml-2 flex-1 min-w-0">
              <p className="text-xs font-medium truncate">
                {attachment.filename}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(attachment.fileSize)}
              </p>
            </div>
          </div>
        );
      }
    },
    [attachmentUrls, getFileIcon, formatFileSize],
  );

  // Handle emoji selection
  const handleEmojiSelect = useCallback(
    (emoji: string) => {
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
    },
    [emitStartTyping, emitStopTyping, typingTimeout],
  );

  const toggleChatInfo = useCallback(() => {
    setChatInfo((prev) => ({ ...prev, visible: !prev.visible }));
  }, []);

  // Create memoized version of the chat info panel
  const renderChatInfoPanel = useMemo(() => {
    if (!chatInfo.visible || !user) return null;

    return (
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
                <Button size="sm" variant="outline" className="rounded-full">
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
                  {messages
                    .filter((msg) =>
                      msg.attachments?.some((att) =>
                        att.contentType?.includes("image"),
                      ),
                    )
                    .slice(0, 6)
                    .map((msg) => {
                      const imageAttachment = msg.attachments?.find((att) =>
                        att.contentType?.includes("image"),
                      );
                      if (!imageAttachment) return null;

                      return (
                        <div
                          key={imageAttachment.id}
                          className="aspect-square bg-muted rounded-md overflow-hidden relative"
                        >
                          {attachmentUrls[imageAttachment.id] ? (
                            <Image
                              src={attachmentUrls[imageAttachment.id]}
                              alt=""
                              className="w-full h-auto object-cover cursor-pointer"
                              width={200}
                              height={200}
                              onClick={() =>
                                window.open(
                                  attachmentUrls[imageAttachment.id],
                                  "_blank",
                                )
                              }
                            />
                          ) : (
                            <div className="w-full h-full animate-pulse" />
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Shared Files</h4>
                <div className="space-y-2">
                  {messages
                    .filter((msg) =>
                      msg.attachments?.some(
                        (att) => !att.contentType?.includes("image"),
                      ),
                    )
                    .slice(0, 3)
                    .map((msg) => {
                      const fileAttachment = msg.attachments?.find(
                        (att) => !att.contentType?.includes("image"),
                      );
                      if (!fileAttachment) return null;

                      return (
                        <div
                          key={fileAttachment.id}
                          className="flex items-center p-2 rounded-md bg-muted/50 hover:bg-muted cursor-pointer"
                          onClick={() => {
                            if (attachmentUrls[fileAttachment.id]) {
                              window.open(
                                attachmentUrls[fileAttachment.id],
                                "_blank",
                              );
                            }
                          }}
                        >
                          {getFileIcon(fileAttachment.contentType)}
                          <div className="flex-1 min-w-0 ml-2">
                            <p className="text-xs font-medium truncate">
                              {fileAttachment.filename}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(fileAttachment.fileSize)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
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
    );
  }, [
    chatInfo.visible,
    user,
    messages,
    attachmentUrls,
    toggleChatInfo,
    getFileIcon,
    formatFileSize,
  ]);

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
                            {/* Message text content */}
                            {message.content && (
                              <div className="text-sm whitespace-pre-wrap break-words">
                                {message.content}
                              </div>
                            )}

                            {/* Attachments */}
                            {message.attachments &&
                              message.attachments.length > 0 && (
                                <div
                                  className={cn(
                                    "mt-2 space-y-2",
                                    !message.content && "mt-0",
                                  )}
                                >
                                  {message.attachments.map((attachment) => (
                                    <div key={attachment.id}>
                                      {renderAttachment(attachment)}
                                    </div>
                                  ))}
                                </div>
                              )}

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

          {/* File upload progress indicator */}
          <AnimatePresence>
            {isUploading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-end mt-2"
              >
                <div className="bg-primary/20 text-primary rounded-full px-4 py-1.5 text-xs">
                  <div className="flex items-center">
                    <div className="animate-spin mr-2">
                      <svg className="h-3 w-3" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    </div>
                    Uploading file...
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
              disabled={isUploading}
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
                      disabled={isUploading}
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
                      disabled={isUploading}
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
                disabled={input.trim() === "" || isUploading}
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
        {chatInfo.visible && renderChatInfoPanel}
      </AnimatePresence>
    </div>
  );
}
