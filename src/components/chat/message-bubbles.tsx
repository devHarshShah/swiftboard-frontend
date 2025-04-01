"use client";
import React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { cn } from "@/src/lib/utils";
import { motion } from "framer-motion";
import { MessageAttachment } from "./message-attachment";
import { MessageBubbleProps } from "@/src/types";

export function MessageBubble({
  message,
  isFirstInGroup,
  isLastInGroup,
  user,
  attachmentUrls,
  formatFileSize,
}: MessageBubbleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "flex",
        message.type === "user" ? "justify-end" : "justify-start",
        !isLastInGroup && message.type === "user" ? "mb-1" : "",
        !isLastInGroup && message.type === "bot" ? "mb-1" : "",
      )}
    >
      <div
        className={cn(
          "flex items-start max-w-[80%]",
          message.type === "user" ? "flex-row-reverse" : "flex-row",
        )}
      >
        {}
        {isFirstInGroup && (
          <div
            className={cn(
              "h-8 w-8 flex-shrink-0",
              message.type === "user" ? "ml-2" : "mr-2",
            )}
          >
            <Avatar className="h-8 w-8 border">
              {user?.avatar ? (
                <AvatarImage src={user.avatar} alt={user.name || "User"} />
              ) : (
                <AvatarFallback
                  className={cn(
                    message.type === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary",
                  )}
                >
                  {user?.name?.charAt(0).toUpperCase() ||
                    (message.type === "user" ? "Y" : "U")}
                </AvatarFallback>
              )}
            </Avatar>
          </div>
        )}
        {}
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
            isFirstInGroup && message.type === "user" ? "rounded-tr-sm" : "",
            isFirstInGroup && message.type === "bot" ? "rounded-tl-sm" : "",
            message.type === "user"
              ? "bg-primary text-primary-foreground"
              : "bg-muted border border-border/50",
          )}
        >
          {}
          {message.content && (
            <div className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </div>
          )}

          {}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment) => (
                <MessageAttachment
                  key={attachment.id}
                  attachment={attachment}
                  url={attachmentUrls[attachment.id]}
                  formatFileSize={formatFileSize}
                />
              ))}
            </div>
          )}

          {}
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
}
