"use client";
import React, { useState } from "react";
import Sidebar from "./sidebar";
import ChatInterface from "./chat-interface";
import Cookies from "js-cookie";
import { User } from "@/src/types/types";

export default function ChatLayout() {
  const [activeConversation, setActiveConversation] = useState<User | null>(
    null,
  );

  const handleSelectConversation = (member: User) => {
    setActiveConversation(member);
  };

  const currentUserId = Cookies.get("userId") || "";
  const chatWithUserId = activeConversation?.id || null;

  return (
    <div className="flex h-[calc(100vh-80px)] bg-background text-foreground">
      <div className="hidden md:block md:w-1/4 lg:w-1/5 xl:w-1/6 h-full overflow-y-auto">
        <Sidebar onSelectConversation={handleSelectConversation} />
      </div>
      <div className="flex-1 h-full overflow-y-auto">
        <ChatInterface
          userId={currentUserId}
          receiverId={chatWithUserId}
          user={activeConversation}
        />
      </div>
    </div>
  );
}
