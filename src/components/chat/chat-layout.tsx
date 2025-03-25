"use client";
import React, { useState } from "react";
import Sidebar from "./sidebar";
import ChatInterface from "./chat-interface";
import { TeamMember } from "@/src/types/types";
import { useAppContext } from "@/src/contexts/app-context";

export default function ChatLayout() {
  const [activeConversation, setActiveConversation] =
    useState<TeamMember | null>(null);

  const { user } = useAppContext();

  const handleSelectConversation = (member: TeamMember) => {
    setActiveConversation(member);
  };

  const currentUserId = user?.id || "";
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
          currentUser={user}
        />
      </div>
    </div>
  );
}
