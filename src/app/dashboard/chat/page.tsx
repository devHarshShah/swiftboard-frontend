import React from "react";
import ChatLayout from "@/src/components/chat/chat-layout";
import { WebSocketProvider } from "@/src/contexts/websocket-context";

export default function ChatPage() {
  return (
    <WebSocketProvider>
      <ChatLayout />
    </WebSocketProvider>
  );
}
