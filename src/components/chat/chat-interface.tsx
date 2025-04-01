"use client";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { useWebSocket } from "@/src/contexts/websocket-context";
import { apiClient } from "@/src/lib/apiClient";
import { TeamMember, User } from "@/src/types";
import { AnimatePresence } from "framer-motion";
import { debounce } from "lodash";

import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { MessageInput } from "./message-input";
import { ChatEmptyState } from "./chat-empty-state";
import { TypingIndicator } from "./typing-indicator";
import { UploadIndicator } from "./upload-indicator";
import { ChatInfoPanel } from "./chat-info-panel";
import {
  Message,
  ServerMessage,
  Attachment,
  MessageApiResponse,
} from "@/src/types/chat";

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
  const [chatInfoVisible, setChatInfoVisible] = useState(false);
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInput(value);

      if (value.length > 0) {
        emitStartTyping();

        if (typingTimeout) {
          clearTimeout(typingTimeout);
        }

        const newTimeout = setTimeout(() => {
          emitStopTyping();
        }, 3000);

        setTypingTimeout(newTimeout);
      } else {
        emitStopTyping();
      }
    },
    [emitStartTyping, emitStopTyping, typingTimeout],
  );

  const fetchAttachmentUrl = useCallback(
    async (attachmentId: string) => {
      if (attachmentUrls[attachmentId]) return;

      try {
        const attachmentWithUrl = messages.flatMap(
          (msg) =>
            msg.attachments?.filter(
              (att) => att.id === attachmentId && "s3Url" in att,
            ) || [],
        )[0];

        if (attachmentWithUrl && "s3Url" in attachmentWithUrl) {
          setAttachmentUrls((prev) => ({
            ...prev,
            [attachmentId]: attachmentWithUrl.s3Url as string,
          }));
          return;
        }

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
      setMessages([]);
      setInput(""); // Clear input field
      setIsTyping(false); // Reset typing indicator
      setChatInfoVisible(false);
    }

    if (!chatSocket || !receiverId) return;

    const roomName = [userId, receiverId].sort().join("-");
    chatSocket.emit("joinRoom", { userId, receiverId, roomName });

    const handleJoinRoomSuccess = (data: { roomName: string }) => {
      console.log(`Successfully joined room: ${data.roomName}`);
    };

    const handleNewMessage = (message: ServerMessage) => {
      if (
        (message.senderId === userId && message.receiverId === receiverId) ||
        (message.senderId === receiverId && message.receiverId === userId)
      ) {
        const newMessage: Message = {
          id: message.id,
          content: message.text,
          type: message.senderId === userId ? "user" : "bot",
          timestamp: new Date(message.createdAt),
          status: "delivered",
          attachments: message.attachments
            ? message.attachments.map((att) => ({
                ...att,
                fetchingUrl: false,
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
      }
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

        const formattedMessages = (data as MessageApiResponse[]).map((msg) => {
          const message: Message = {
            id: msg.id,
            content: msg.text,
            type: msg.senderId === userId ? "user" : "bot",
            timestamp: new Date(msg.createdAt),
            status: "read",
            attachments: msg.attachments
              ? msg.attachments.map((att) => {
                  const attachment: Attachment = {
                    id: att.id,
                    filename: att.filename,
                    contentType: att.contentType || att.fileType || "", // Handle both contentType and fileType
                    fileSize: att.fileSize,
                    fetchingUrl: false, // Initialize the tracking field
                    s3Url: att.s3Url,
                  };
                  return attachment;
                })
              : undefined,
            // Store additional sender/receiver info if needed
            senderInfo: msg.sender,
            receiverInfo: msg.receiver,
          };

          return message;
        });

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
  }, [userId, receiverId, chatSocket]);

  useEffect(() => {
    if (messages.length === 0) return;

    const attachmentsNeedingUrls: string[] = [];

    messages.forEach((msg) => {
      if (!msg.attachments) return;

      msg.attachments.forEach((att) => {
        if (!attachmentUrls[att.id] && !att.fetchingUrl) {
          att.fetchingUrl = true;
          attachmentsNeedingUrls.push(att.id);
        }
      });
    });

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

  const handleFileInput = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*,.pdf,.doc,.docx";
    input.multiple = true;

    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files || files.length === 0 || !receiverId) return;

      try {
        setIsUploading(true);

        for (let i = 0; i < files.length; i++) {
          const file = files[i];

          const formData = new FormData();
          formData.append("file", file);
          formData.append("senderId", userId);
          formData.append("receiverId", receiverId);

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

    input.click();
  }, [receiverId, userId]);

  const formatFileSize = useCallback((bytes: number) => {
    if (!bytes) return "0 Bytes";
    if (bytes < 1024) return bytes + " Bytes";
    if (bytes < 1048576) return Math.round(bytes / 1024) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  }, []);

  const handleEmojiSelect = useCallback(
    (emoji: string) => {
      setInput((prev) => prev + emoji);
      inputRef.current?.focus();

      emitStartTyping();

      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      const timeout = setTimeout(() => {
        emitStopTyping();
      }, 3000);

      setTypingTimeout(timeout);
    },
    [emitStartTyping, emitStopTyping, typingTimeout],
  );

  const toggleChatInfo = useCallback(() => {
    setChatInfoVisible((prev) => !prev);
  }, []);

  const handleSayHello = useCallback(() => {
    setInput("Hi! How are you doing today?");
    inputRef.current?.focus();
  }, []);

  if (!receiverId) {
    return <ChatEmptyState type="welcome" />;
  }

  return (
    <div className="flex h-full bg-background border-l border-border">
      {}
      <div className="flex-1 flex flex-col h-full">
        {}
        <ChatHeader
          user={user}
          userOnline={userOnline}
          chatInfoVisible={chatInfoVisible}
          toggleChatInfo={toggleChatInfo}
        />

        {}
        <ScrollArea className="flex-1 py-6 px-4 bg-gradient-to-b from-background to-muted/20">
          {messages.length === 0 ? (
            <ChatEmptyState
              type="start-conversation"
              userName={user?.name || "this user"}
              onSayHello={handleSayHello}
            />
          ) : (
            <ChatMessages
              groupedMessages={groupedMessages}
              attachmentUrls={attachmentUrls}
              messages={messages}
              isTyping={isTyping}
              isUploading={isUploading}
              user={user}
              currentUser={currentUser}
              setInput={setInput}
              formatFileSize={formatFileSize}
            />
          )}

          {}
          <AnimatePresence>
            {isTyping && <TypingIndicator user={user} />}
          </AnimatePresence>

          {}
          <AnimatePresence>
            {isUploading && <UploadIndicator />}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </ScrollArea>

        {}
        <MessageInput
          input={input}
          handleInputChange={handleInputChange}
          handleSendMessage={handleSendMessage}
          handleEmojiSelect={handleEmojiSelect}
          handleFileInput={handleFileInput}
          isUploading={isUploading}
          showEmojiPicker={showEmojiPicker}
          toggleEmojiPicker={() => setShowEmojiPicker(!showEmojiPicker)}
          setInput={setInput}
        />
      </div>

      {}
      <AnimatePresence>
        {chatInfoVisible && (
          <ChatInfoPanel
            user={user}
            messages={messages}
            attachmentUrls={attachmentUrls}
            formatFileSize={formatFileSize}
            onClose={toggleChatInfo}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
