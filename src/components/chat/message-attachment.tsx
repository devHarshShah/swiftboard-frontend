"use client";
import React from "react";
import Image from "next/image";
import { FileText, FileSpreadsheet, FileImage, File } from "lucide-react";

interface Attachment {
  id: string;
  filename: string;
  contentType: string;
  fileSize: number;
  url?: string;
  fetchingUrl?: boolean;
}

interface MessageAttachmentProps {
  attachment: Attachment;
  url?: string;
  formatFileSize: (size: number) => string;
}

export function MessageAttachment({
  attachment,
  url,
  formatFileSize,
}: MessageAttachmentProps) {
  const getFileIcon = (contentType: string = "") => {
    if (contentType.includes("pdf")) {
      return <FileText className="h-6 w-6 text-red-500" />;
    }
    if (contentType.includes("word") || contentType.includes("doc")) {
      return <FileText className="h-6 w-6 text-blue-500" />;
    }
    if (contentType.includes("sheet") || contentType.includes("excel")) {
      return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
    }
    if (contentType.includes("image")) {
      return <FileImage className="h-6 w-6 text-purple-500" />;
    }
    return <File className="h-6 w-6 text-gray-500" />;
  };

  if (!url) {
    return (
      <div className="flex items-center p-2 rounded-md bg-muted/50 animate-pulse">
        <div className="h-10 w-10 rounded-md bg-muted"></div>
        <div className="ml-2 flex-1">
          <div className="h-4 w-24 bg-muted rounded mb-1"></div>
          <div className="h-3 w-16 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const isImage = attachment.contentType?.includes("image");

  if (isImage) {
    return (
      <div className="max-w-[200px] rounded-md overflow-hidden">
        <Image
          src={url}
          alt={attachment.filename}
          width={200}
          height={200}
          className="w-full h-auto object-cover cursor-pointer"
          onClick={() => window.open(url, "_blank")}
        />
        <div className="text-xs px-2 py-1 bg-background/80 truncate">
          {attachment.filename}
        </div>
      </div>
    );
  } else {
    return (
      <div
        className="flex items-center p-2 rounded-md bg-muted/30 hover:bg-muted cursor-pointer"
        onClick={() => window.open(url, "_blank")}
      >
        {getFileIcon(attachment.contentType)}
        <div className="ml-2 flex-1 min-w-0">
          <p className="text-xs font-medium truncate">{attachment.filename}</p>
          <p className="text-xs text-muted-foreground">
            {formatFileSize(attachment.fileSize)}
          </p>
        </div>
      </div>
    );
  }
}
