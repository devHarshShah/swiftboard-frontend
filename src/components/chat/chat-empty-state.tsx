"use client";
import React from "react";
import { Button } from "@/src/components/ui/button";
import { MessageSquare, UserIcon } from "lucide-react";
import { motion } from "framer-motion";
import { ChatEmptyStateProps } from "@/src/types";

export function ChatEmptyState({
  type,
  userName,
  onSayHello,
}: ChatEmptyStateProps) {
  if (type === "welcome") {
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
          This is the beginning of your conversation with {userName}. Say hello!
        </p>
        <Button
          variant="outline"
          className="rounded-full px-4"
          onClick={onSayHello}
        >
          👋 Say hello
        </Button>
      </motion.div>
    </div>
  );
}
