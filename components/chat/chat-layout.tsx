"use client";
import React, { useState } from "react";
import Sidebar from "./sidebar";
import ChatInterface from "./chat-interface";

export default function ChatLayout() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeConversation, setActiveConversation] = useState("1");

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    // You could load different messages here based on the conversation ID
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-background text-foreground">
      {/* Sidebar - takes 1/4 of the screen on larger devices, collapses on mobile */}
      <div className="hidden md:block md:w-1/4 lg:w-1/5 xl:w-1/6 h-full overflow-y-auto">
        <Sidebar onSelectConversation={handleSelectConversation} />
      </div>

      {/* Chat Interface - takes remaining space */}
      <div className="flex-1 h-full overflow-y-auto">
        <ChatInterface />
      </div>
    </div>
  );
}
