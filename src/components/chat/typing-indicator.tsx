"use client";
import React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { motion } from "framer-motion";
import { TeamMember } from "@/src/types/types";

interface TypingIndicatorProps {
  user: TeamMember | null;
}

export function TypingIndicator({ user }: TypingIndicatorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex justify-start mt-2"
    >
      <div className="flex items-start">
        <Avatar className="h-8 w-8 mr-2 border">
          {user?.avatar ? (
            <AvatarImage src={user.avatar} alt={user?.name || "User"} />
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
  );
}
