"use client";
import React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import { Phone, Video, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { ChatHeaderProps } from "@/src/types";

export function ChatHeader({
  user,
  userOnline,
  chatInfoVisible,
  toggleChatInfo,
}: ChatHeaderProps) {
  return (
    <div className="border-b py-3 px-4 flex items-center justify-between bg-card/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Avatar className="h-10 w-10 border">
            {user?.avatar ? (
              <AvatarImage src={user.avatar} alt={user?.name} />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            )}
          </Avatar>
          <div
            className={cn(
              "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
              userOnline ? "bg-green-500" : "bg-gray-300",
            )}
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-medium">{user?.name}</h2>
            <Badge
              variant="outline"
              className="h-5 px-1.5 text-xs bg-primary/10 text-primary border-primary/20"
            >
              {user?.role || "Team Member"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {userOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8"
              >
                <Phone className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Call</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8"
              >
                <Video className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Video call</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-full h-8 w-8",
                  chatInfoVisible && "bg-accent text-accent-foreground",
                )}
                onClick={toggleChatInfo}
              >
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Chat info</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
