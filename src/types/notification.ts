import { BaseEntity } from "./common";

// Import notification constants from your utils
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_SOURCES,
} from "../lib/notification-utils";

export type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];
export type NotificationPriority =
  (typeof NOTIFICATION_PRIORITIES)[keyof typeof NOTIFICATION_PRIORITIES];
export type NotificationSource =
  (typeof NOTIFICATION_SOURCES)[keyof typeof NOTIFICATION_SOURCES];

export interface Notification extends BaseEntity {
  userId: string;
  message: string;
  type: string; // Will be converted to proper type
  read: boolean;
  category?: string;
  source?: string;
  priority?: string;
  title?: string;
  imageUrl?: string;
  actionUrl?: string;
  relatedEntityId?: string;
}

export interface ProcessedNotification
  extends Omit<Notification, "type" | "priority" | "source"> {
  type: NotificationType;
  priority: NotificationPriority;
  source: NotificationSource;
  parsedCreatedAt: Date;
  timeAgo: string;
}

// Component props
export interface EmptyNotificationsProps {
  filter: string;
  activeCategory: string;
}

export interface NotificationItemProps {
  notification: ProcessedNotification;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
}

export interface NotificationListProps {
  notifications: ProcessedNotification[];
  activeCategory: string;
  filter: string;
  setFilter: (filter: string) => void;
  groupedNotifications: Record<string, ProcessedNotification[]>;
  loading: boolean;
  getUnreadCount: (category: string) => number;
  filterNotifications: (
    notifications: ProcessedNotification[],
  ) => ProcessedNotification[];
  markAllAsRead: (category?: string) => void;
  markAsRead: (id: string) => void;
  deleteNotification: (id: string) => void;
}

export interface NotificationSidebarProps {
  categories: string[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  getUnreadCount: (category: string) => number;
  filter: string;
  setFilter: (filter: string) => void;
  timeFilter: string;
  setTimeFilter: (filter: string) => void;
  clearAllNotifications: (category?: string) => void;
}
