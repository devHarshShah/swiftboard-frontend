"use client";
import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { MessageBubble } from "./message-bubbles";
import { TypingIndicator } from "./typing-indicator";
import { UploadIndicator } from "./upload-indicator";
import { ChatMessagesProps } from "@/src/types";

export function ChatMessages({
  messages,
  isTyping,
  isUploading,
  groupedMessages,
  user,
  currentUser,
  setInput,
  attachmentUrls,
  formatFileSize,
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, isUploading]);

  return (
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
            <h3 className="text-xl font-medium mb-2">Start the conversation</h3>
            <p className="text-muted-foreground text-sm max-w-xs mb-6">
              This is the beginning of your conversation with {user?.name}. Say
              hello!
            </p>
            <Button
              variant="outline"
              className="rounded-full px-4"
              onClick={() => {
                setInput("Hi! How are you doing today?");
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
                const prevMessage = index > 0 ? dateMessages[index - 1] : null;
                const nextMessage =
                  index < dateMessages.length - 1
                    ? dateMessages[index + 1]
                    : null;

                const isFirstInGroup =
                  !prevMessage || prevMessage.type !== message.type;
                const isLastInGroup =
                  !nextMessage || nextMessage.type !== message.type;

                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isFirstInGroup={isFirstInGroup}
                    isLastInGroup={isLastInGroup}
                    user={message.type === "user" ? currentUser : user}
                    attachmentUrls={attachmentUrls}
                    formatFileSize={formatFileSize}
                  />
                );
              })}
            </div>
          ))}
        </div>
      )}

      {}
      <AnimatePresence>
        {isTyping && <TypingIndicator user={user} />}
      </AnimatePresence>

      {}
      <AnimatePresence>{isUploading && <UploadIndicator />}</AnimatePresence>

      <div ref={messagesEndRef} />
    </ScrollArea>
  );
}
