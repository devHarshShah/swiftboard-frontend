"use client";
import React, { useState } from "react";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/src/components/ui/avatar";
import { Button } from "@/src/components/ui/button";
import { X, Mail, ImageIcon, File } from "lucide-react";
import { motion } from "framer-motion";
import { MessageAttachment } from "./message-attachment";
import Image from "next/image";
import { ChatInfoPanelProps } from "@/src/types";

export function ChatInfoPanel({
  user,
  messages,
  attachmentUrls,
  formatFileSize,
  onClose,
}: ChatInfoPanelProps) {
  const [activeTab, setActiveTab] = useState("profile");

  const imageAttachments = messages
    .flatMap(
      (msg) =>
        msg.attachments?.filter((att) => att.contentType?.includes("image")) ||
        [],
    )
    .filter((att) => attachmentUrls[att.id]);

  const fileAttachments = messages
    .flatMap(
      (msg) =>
        msg.attachments?.filter((att) => !att.contentType?.includes("image")) ||
        [],
    )
    .filter((att) => attachmentUrls[att.id]);

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="w-80 border-l border-border h-full bg-background flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-sm font-medium">Chat Info</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-7 w-7"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs
        defaultValue="profile"
        className="flex-1 flex flex-col"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-3 px-4 py-2">
          <TabsTrigger value="profile" className="text-xs">
            Profile
          </TabsTrigger>
          <TabsTrigger value="media" className="text-xs">
            Media
          </TabsTrigger>
          <TabsTrigger value="files" className="text-xs">
            Files
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          <TabsContent value="profile" className="p-4 pt-6">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                {user?.avatar ? (
                  <AvatarImage src={user.avatar} alt={user?.name} />
                ) : (
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                )}
              </Avatar>

              <h2 className="text-xl font-medium mb-1">{user?.name}</h2>
              <p className="text-sm text-muted-foreground mb-6">
                {user?.role || "Team Member"}
              </p>

              <div className="w-full space-y-4">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{user?.email}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="media" className="p-4 space-y-4">
            <h3 className="text-sm font-medium mb-3">Shared Media</h3>
            {imageAttachments.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {imageAttachments.map((att) => (
                  <div
                    key={att.id}
                    className="aspect-square rounded-md overflow-hidden bg-muted cursor-pointer"
                    onClick={() =>
                      window.open(attachmentUrls[att.id], "_blank")
                    }
                  >
                    <Image
                      src={attachmentUrls[att.id]}
                      alt={att.filename}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <ImageIcon className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No media shared yet
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="files" className="p-4 space-y-4">
            <h3 className="text-sm font-medium mb-3">Shared Files</h3>
            {fileAttachments.length > 0 ? (
              <div className="space-y-2">
                {fileAttachments.map((att) => (
                  <MessageAttachment
                    key={att.id}
                    attachment={att}
                    url={attachmentUrls[att.id]}
                    formatFileSize={formatFileSize}
                  />
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <File className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No files shared yet
                </p>
              </div>
            )}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </motion.div>
  );
}
