"use client";
import React from "react";
import { Button } from "@/src/components/ui/button";
import { motion } from "framer-motion";
import { EmojiPickerProps } from "@/src/types";

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  // Common emojis for quick access
  const emojis = [
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
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="absolute bottom-full right-0 mb-2 p-3 bg-card shadow-lg rounded-lg border border-border grid grid-cols-8 gap-2 w-64"
    >
      {emojis.map((emoji) => (
        <Button
          key={emoji}
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-accent rounded-md"
          onClick={() => onEmojiSelect(emoji)}
        >
          {emoji}
        </Button>
      ))}
    </motion.div>
  );
}
