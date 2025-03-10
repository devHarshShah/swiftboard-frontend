import React from "react";
import ChatLayout from "@/src/components/chat/chat-layout";
import { Metadata } from "next";
import { WebSocketProvider } from "@/src/contexts/websocket-context";

export const metadata: Metadata = {
  title: "Chat Application",
  description:
    "Modern chat interface built with Next.js, TypeScript and Tailwind CSS",
};

export default function ChatPage() {
  return (
    <WebSocketProvider>
      <ChatLayout />
    </WebSocketProvider>
  );
}
