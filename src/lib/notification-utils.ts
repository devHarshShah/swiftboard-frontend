import React from "react";
import {
  Bell,
  CheckCheck,
  Clock,
  AlertCircle,
  MessageSquare,
  User,
  Calendar,
  Zap,
  FileText,
} from "lucide-react";
import { ReactNode } from "react";

export const NOTIFICATION_TYPES = {
  MESSAGE: "message",
  ALERT: "alert",
  REMINDER: "reminder",
  MENTION: "mention",
  TASK_ASSIGNED: "task_assigned",
  TASK_COMPLETED: "task_completed",
  COMMENT: "comment",
  SYSTEM: "system",
  PROJECT_UPDATE: "project_update",
} as const;

// Define notification priorities
export const NOTIFICATION_PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

// Define notification sources
export const NOTIFICATION_SOURCES = {
  WEB: "web",
  MOBILE: "mobile",
  EMAIL: "email",
  SYSTEM: "system",
  API: "api",
} as const;

// TypeScript type definitions
export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];
export type NotificationPriority =
  (typeof NOTIFICATION_PRIORITIES)[keyof typeof NOTIFICATION_PRIORITIES];
export type NotificationSource =
  (typeof NOTIFICATION_SOURCES)[keyof typeof NOTIFICATION_SOURCES];

// Utility to normalize types from backend (e.g., TASK_ASSIGNED -> task_assigned)
export const normalizeType = (type: string): NotificationType => {
  if (!type) return NOTIFICATION_TYPES.SYSTEM;

  // Convert SNAKE_CASE to snake_case
  const normalized = type.toLowerCase();

  // Check if it's a valid type, otherwise default to system
  return Object.values(NOTIFICATION_TYPES).includes(
    normalized as NotificationType,
  )
    ? (normalized as NotificationType)
    : NOTIFICATION_TYPES.SYSTEM;
};

// Normalize priority
export const normalizePriority = (priority: string): NotificationPriority => {
  if (!priority) return NOTIFICATION_PRIORITIES.MEDIUM;

  const normalized = priority.toLowerCase();

  return Object.values(NOTIFICATION_PRIORITIES).includes(
    normalized as NotificationPriority,
  )
    ? (normalized as NotificationPriority)
    : NOTIFICATION_PRIORITIES.MEDIUM;
};

// Normalize source
export const normalizeSource = (source: string): NotificationSource => {
  if (!source) return NOTIFICATION_SOURCES.SYSTEM;

  const normalized = source.toLowerCase();

  return Object.values(NOTIFICATION_SOURCES).includes(
    normalized as NotificationSource,
  )
    ? (normalized as NotificationSource)
    : NOTIFICATION_SOURCES.SYSTEM;
};

// Format date for display
export const formatDate = (date: Date) => {
  const notifDate = new Date(date);
  return notifDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year:
      notifDate.getFullYear() !== new Date().getFullYear()
        ? "numeric"
        : undefined,
    hour: "numeric",
    minute: "numeric",
  });
};

// Get notification type details (icon, color, label)
export const getTypeDetails = (
  type: NotificationType,
): {
  icon: ReactNode;
  color: string;
  label: string;
  bgHover: string;
  bgActive: string;
} => {
  switch (type) {
    case NOTIFICATION_TYPES.MESSAGE:
      return {
        icon: React.createElement(MessageSquare, { className: "h-4 w-4" }),
        color: "bg-blue-100 text-blue-800 border-blue-200",
        label: "Message",
        bgHover: "hover:bg-secondary",
        bgActive: "bg-blue-50/70",
      };
    case NOTIFICATION_TYPES.ALERT:
      return {
        icon: React.createElement(AlertCircle, { className: "h-4 w-4" }),
        color: "bg-red-100 text-red-800 border-red-200",
        label: "Alert",
        bgHover: "hover:bg-secondary",
        bgActive: "bg-red-50/70",
      };
    case NOTIFICATION_TYPES.REMINDER:
      return {
        icon: React.createElement(Clock, { className: "h-4 w-4" }),
        color: "bg-amber-100 text-amber-800 border-amber-200",
        label: "Reminder",
        bgHover: "hover:bg-secondary",
        bgActive: "bg-amber-50/70",
      };
    case NOTIFICATION_TYPES.MENTION:
      return {
        icon: React.createElement(User, { className: "h-4 w-4" }),
        color: "bg-purple-100 text-purple-800 border-purple-200",
        label: "Mention",
        bgHover: "hover:bg-secondary",
        bgActive: "bg-purple-50/70",
      };
    case NOTIFICATION_TYPES.TASK_ASSIGNED:
      return {
        icon: React.createElement(FileText, { className: "h-4 w-4" }),
        color: "bg-indigo-100 text-indigo-800 border-indigo-200",
        label: "Task Assigned",
        bgHover: "hover:bg-secondary",
        bgActive: "bg-indigo-50/70",
      };
    case NOTIFICATION_TYPES.TASK_COMPLETED:
      return {
        icon: React.createElement(CheckCheck, { className: "h-4 w-4" }),
        color: "bg-green-100 text-green-800 border-green-200",
        label: "Task Completed",
        bgHover: "hover:bg-secondary",
        bgActive: "bg-green-50/70",
      };
    case NOTIFICATION_TYPES.COMMENT:
      return {
        icon: React.createElement(MessageSquare, { className: "h-4 w-4" }),
        color: "bg-cyan-100 text-cyan-800 border-cyan-200",
        label: "Comment",
        bgHover: "hover:bg-secondary",
        bgActive: "bg-cyan-50/70",
      };
    case NOTIFICATION_TYPES.PROJECT_UPDATE:
      return {
        icon: React.createElement(Calendar, { className: "h-4 w-4" }),
        color: "bg-teal-100 text-teal-800 border-teal-200",
        label: "Project Update",
        bgHover: "hover:bg-secondary",
        bgActive: "bg-teal-50/70",
      };
    default:
      return {
        icon: React.createElement(Bell, { className: "h-4 w-4" }),
        color: "bg-gray-100 text-gray-800 border-gray-200",
        label: "System",
        bgHover: "hover:bg-secondary",
        bgActive: "bg-gray-50/70",
      };
  }
};

// Get priority badge styling
export const getPriorityBadge = (priority: NotificationPriority) => {
  switch (priority) {
    case NOTIFICATION_PRIORITIES.HIGH:
      return {
        className: "bg-red-50 text-red-700 border-red-200 font-medium",
        icon: React.createElement(Zap, { className: "h-3 w-3 mr-1" }),
        label: "High Priority",
      };
    case NOTIFICATION_PRIORITIES.MEDIUM:
      return {
        className: "bg-amber-50 text-amber-700 border-amber-200",
        icon: null,
        label: "Medium",
      };
    case NOTIFICATION_PRIORITIES.LOW:
      return {
        className: "bg-green-50 text-green-700 border-green-200",
        icon: null,
        label: "Low",
      };
    default:
      return {
        className: "",
        icon: null,
        label: "",
      };
  }
};
