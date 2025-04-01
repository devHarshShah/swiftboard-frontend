"use client";
import React, { useRef } from "react";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Send, Paperclip, Smile } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { AnimatePresence } from "framer-motion";
import { EmojiPicker } from "./emoji-picker";
import { MessageInputProps } from "@/src/types";

export function MessageInput({
  input,
  isUploading,
  showEmojiPicker,
  handleInputChange,
  handleSendMessage,
  handleFileInput,
  handleEmojiSelect,
  toggleEmojiPicker,
}: MessageInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
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
                  onClick={toggleEmojiPicker}
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

        {}
        <AnimatePresence>
          {showEmojiPicker && <EmojiPicker onEmojiSelect={handleEmojiSelect} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
