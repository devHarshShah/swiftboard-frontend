"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  Settings,
  CheckCheck,
  Clock,
  AlertCircle,
  MessageSquare,
  User,
  Filter,
  Trash2,
  RefreshCw,
  ArrowUpDown,
  FileText,
  Calendar,
  Zap,
} from "lucide-react";
import { useWebSocket } from "@/src/contexts/websocket-context";
import { useAppContext } from "@/src/contexts/app-context";
import { apiClient } from "@/src/lib/apiClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { cn } from "@/src/lib/utils";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useToast } from "@/src/contexts/toast-context";

// Define notification types and their display mappings
const NOTIFICATION_TYPES = {
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
const NOTIFICATION_PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

// Define notification sources
const NOTIFICATION_SOURCES = {
  WEB: "web",
  MOBILE: "mobile",
  EMAIL: "email",
  SYSTEM: "system",
  API: "api",
} as const;

// Type definitions
type NotificationType =
  (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];
type NotificationPriority =
  (typeof NOTIFICATION_PRIORITIES)[keyof typeof NOTIFICATION_PRIORITIES];
type NotificationSource =
  (typeof NOTIFICATION_SOURCES)[keyof typeof NOTIFICATION_SOURCES];

interface Notification {
  id: string;
  userId: string;
  message: string;
  type: string; // Will be converted to proper type
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: string;
  source?: string;
  priority?: string;
  title?: string;
  imageUrl?: string;
  actionUrl?: string;
  relatedEntityId?: string;
}

interface ProcessedNotification
  extends Omit<Notification, "type" | "priority" | "source"> {
  type: NotificationType;
  priority: NotificationPriority;
  source: NotificationSource;
  parsedCreatedAt: Date;
  timeAgo: string;
}

// Utility to normalize types from backend (e.g., TASK_ASSIGNED -> task_assigned)
const normalizeType = (type: string): NotificationType => {
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
const normalizePriority = (priority: string): NotificationPriority => {
  if (!priority) return NOTIFICATION_PRIORITIES.MEDIUM;

  const normalized = priority.toLowerCase();

  return Object.values(NOTIFICATION_PRIORITIES).includes(
    normalized as NotificationPriority,
  )
    ? (normalized as NotificationPriority)
    : NOTIFICATION_PRIORITIES.MEDIUM;
};

// Normalize source
const normalizeSource = (source: string): NotificationSource => {
  if (!source) return NOTIFICATION_SOURCES.SYSTEM;

  const normalized = source.toLowerCase();

  return Object.values(NOTIFICATION_SOURCES).includes(
    normalized as NotificationSource,
  )
    ? (normalized as NotificationSource)
    : NOTIFICATION_SOURCES.SYSTEM;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<ProcessedNotification[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");
  const [activeCategory, setActiveCategory] = useState("all");
  const { notificationSocket, isNotificationConnected } = useWebSocket();
  const { user } = useAppContext();
  const userId = user?.id;
  const { showToast } = useToast();

  // Get notification type details (icon, color, label)
  const getTypeDetails = (type: NotificationType) => {
    switch (type) {
      case NOTIFICATION_TYPES.MESSAGE:
        return {
          icon: <MessageSquare className="h-4 w-4" />,
          color: "bg-blue-100 text-blue-800 border-blue-200",
          label: "Message",
          bgHover: "hover:bg-secondary",
          bgActive: "bg-blue-50/70",
        };
      case NOTIFICATION_TYPES.ALERT:
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          color: "bg-red-100 text-red-800 border-red-200",
          label: "Alert",
          bgHover: "hover:bg-secondary",
          bgActive: "bg-red-50/70",
        };
      case NOTIFICATION_TYPES.REMINDER:
        return {
          icon: <Clock className="h-4 w-4" />,
          color: "bg-amber-100 text-amber-800 border-amber-200",
          label: "Reminder",
          bgHover: "hover:bg-secondary",
          bgActive: "bg-amber-50/70",
        };
      case NOTIFICATION_TYPES.MENTION:
        return {
          icon: <User className="h-4 w-4" />,
          color: "bg-purple-100 text-purple-800 border-purple-200",
          label: "Mention",
          bgHover: "hover:bg-secondary",
          bgActive: "bg-purple-50/70",
        };
      case NOTIFICATION_TYPES.TASK_ASSIGNED:
        return {
          icon: <FileText className="h-4 w-4" />,
          color: "bg-indigo-100 text-indigo-800 border-indigo-200",
          label: "Task Assigned",
          bgHover: "hover:bg-secondary",
          bgActive: "bg-indigo-50/70",
        };
      case NOTIFICATION_TYPES.TASK_COMPLETED:
        return {
          icon: <CheckCheck className="h-4 w-4" />,
          color: "bg-green-100 text-green-800 border-green-200",
          label: "Task Completed",
          bgHover: "hover:bg-secondary",
          bgActive: "bg-green-50/70",
        };
      case NOTIFICATION_TYPES.COMMENT:
        return {
          icon: <MessageSquare className="h-4 w-4" />,
          color: "bg-cyan-100 text-cyan-800 border-cyan-200",
          label: "Comment",
          bgHover: "hover:bg-secondary",
          bgActive: "bg-cyan-50/70",
        };
      case NOTIFICATION_TYPES.PROJECT_UPDATE:
        return {
          icon: <Calendar className="h-4 w-4" />,
          color: "bg-teal-100 text-teal-800 border-teal-200",
          label: "Project Update",
          bgHover: "hover:bg-secondary",
          bgActive: "bg-teal-50/70",
        };
      default:
        return {
          icon: <Bell className="h-4 w-4" />,
          color: "bg-gray-100 text-gray-800 border-gray-200",
          label: "System",
          bgHover: "hover:bg-secondary",
          bgActive: "bg-gray-50/70",
        };
    }
  };

  // Process notifications to normalize types and add computed properties
  const processNotification = useCallback(
    (notification: Notification): ProcessedNotification => {
      // Function to calculate time ago (moved inside useCallback)
      const getTimeAgo = (date: Date): string => {
        const now = new Date();
        const secondsAgo = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (secondsAgo < 60) return `${secondsAgo} seconds ago`;

        const minutesAgo = Math.floor(secondsAgo / 60);
        if (minutesAgo < 60)
          return `${minutesAgo} ${minutesAgo === 1 ? "minute" : "minutes"} ago`;

        const hoursAgo = Math.floor(minutesAgo / 60);
        if (hoursAgo < 24)
          return `${hoursAgo} ${hoursAgo === 1 ? "hour" : "hours"} ago`;

        const daysAgo = Math.floor(hoursAgo / 24);
        if (daysAgo < 7)
          return `${daysAgo} ${daysAgo === 1 ? "day" : "days"} ago`;

        const weeksAgo = Math.floor(daysAgo / 7);
        if (weeksAgo < 5)
          return `${weeksAgo} ${weeksAgo === 1 ? "week" : "weeks"} ago`;

        const monthsAgo = Math.floor(daysAgo / 30);
        if (monthsAgo < 12)
          return `${monthsAgo} ${monthsAgo === 1 ? "month" : "months"} ago`;

        const yearsAgo = Math.floor(daysAgo / 365);
        return `${yearsAgo} ${yearsAgo === 1 ? "year" : "years"} ago`;
      };

      const parsedCreatedAt = new Date(notification.createdAt);
      return {
        ...notification,
        type: normalizeType(notification.type),
        priority: normalizePriority(notification.priority || ""),
        source: normalizeSource(notification.source || ""),
        parsedCreatedAt,
        timeAgo: getTimeAgo(parsedCreatedAt),
      };
    },
    [],
  );

  // Group notifications by category
  const groupedNotifications = notifications.reduce(
    (acc, notification) => {
      const type = notification.type;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(notification);
      return acc;
    },
    {} as Record<string, ProcessedNotification[]>,
  );

  // Get unread count by category
  const getUnreadCount = (type: string) => {
    if (type === "all") {
      return notifications.filter((n) => !n.read).length;
    }
    return (groupedNotifications[type] || []).filter((n) => !n.read).length;
  };

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const response = await apiClient("/api/notifications");
        const data = await response.json();

        // Process sample data
        const processedData = data.map((n: Notification) => {
          // For demo purposes, randomly assign types if missing
          const rawType =
            n.type ||
            Object.values(NOTIFICATION_TYPES)[
              Math.floor(
                Math.random() * Object.values(NOTIFICATION_TYPES).length,
              )
            ];

          const rawPriority =
            n.priority ||
            Object.values(NOTIFICATION_PRIORITIES)[
              Math.floor(
                Math.random() * Object.values(NOTIFICATION_PRIORITIES).length,
              )
            ];

          const rawSource =
            n.source ||
            Object.values(NOTIFICATION_SOURCES)[
              Math.floor(
                Math.random() * Object.values(NOTIFICATION_SOURCES).length,
              )
            ];

          return processNotification({
            ...n,
            type: rawType,
            priority: rawPriority,
            source: rawSource,
          });
        });

        setNotifications(processedData);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
        showToast({
          variant: "error",
          title: "Error",
          description: "Failed to load notifications. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Socket connection for real-time notifications
  useEffect(() => {
    if (!userId || !isNotificationConnected || !notificationSocket) return;

    notificationSocket.on("notification", (notification: Notification) => {
      const processedNotification = processNotification({
        ...notification,
        // For demo purposes
        type:
          notification.type ||
          Object.values(NOTIFICATION_TYPES)[
            Math.floor(Math.random() * Object.values(NOTIFICATION_TYPES).length)
          ],
        priority:
          notification.priority ||
          Object.values(NOTIFICATION_PRIORITIES)[
            Math.floor(
              Math.random() * Object.values(NOTIFICATION_PRIORITIES).length,
            )
          ],
        source:
          notification.source ||
          Object.values(NOTIFICATION_SOURCES)[
            Math.floor(
              Math.random() * Object.values(NOTIFICATION_SOURCES).length,
            )
          ],
      });

      setNotifications((prev) => [processedNotification, ...prev]);

      // Show toast notification
      showToast({
        variant: "default",
        title: "New Notification",
        description: notification.message,
      });
    });

    return () => {
      notificationSocket.off("notification");
    };
  }, [
    userId,
    notificationSocket,
    isNotificationConnected,
    showToast,
    processNotification,
  ]);

  const markAsRead = (id: string) => {
    if (notificationSocket && isNotificationConnected) {
      notificationSocket.emit("readNotification", id);
    }

    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  };

  const markAllAsRead = (category?: string) => {
    const notificationsToMark =
      category && category !== "all"
        ? notifications.filter((n) => n.type === category && !n.read)
        : notifications.filter((n) => !n.read);

    if (notificationSocket && isNotificationConnected) {
      notificationsToMark.forEach((n) => {
        notificationSocket.emit("readNotification", n.id);
      });
    }

    setNotifications((prev) =>
      prev.map((notification) =>
        (!category || category === "all" || notification.type === category) &&
        !notification.read
          ? { ...notification, read: true }
          : notification,
      ),
    );

    showToast({
      variant: "success",
      title: "Success",
      description: `Marked ${notificationsToMark.length} notifications as read`,
    });
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id),
    );

    showToast({
      variant: "default",
      title: "Notification deleted",
      description: "The notification has been removed",
    });
  };

  const clearAllNotifications = (category?: string) => {
    if (category && category !== "all") {
      setNotifications((prev) => prev.filter((n) => n.type !== category));
      showToast({
        variant: "warning",
        title: "Notifications cleared",
        description: `All ${category} notifications have been cleared`,
      });
    } else {
      setNotifications([]);
      showToast({
        variant: "warning",
        title: "Notifications cleared",
        description: "All notifications have been cleared",
      });
    }
  };

  const filterNotifications = (notifications: ProcessedNotification[]) => {
    let filtered = [...notifications];

    // Filter by read/unread status
    if (filter === "unread") {
      filtered = filtered.filter((n) => !n.read);
    } else if (filter === "read") {
      filtered = filtered.filter((n) => n.read);
    }

    // Filter by time
    if (timeFilter === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter((n) => n.parsedCreatedAt >= today);
    } else if (timeFilter === "week") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter((n) => n.parsedCreatedAt >= weekAgo);
    } else if (timeFilter === "month") {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter((n) => n.parsedCreatedAt >= monthAgo);
    }

    return filtered;
  };

  // Format date for display
  const formatDate = (date: Date) => {
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

  // Get priority badge styling
  const getPriorityBadge = (priority: NotificationPriority) => {
    switch (priority) {
      case NOTIFICATION_PRIORITIES.HIGH:
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200 font-medium"
          >
            <Zap className="h-3 w-3 mr-1" />
            High Priority
          </Badge>
        );
      case NOTIFICATION_PRIORITIES.MEDIUM:
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200"
          >
            Medium
          </Badge>
        );
      case NOTIFICATION_PRIORITIES.LOW:
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Low
          </Badge>
        );
      default:
        return null;
    }
  };

  // Get notification categories for sidebar
  const categories = Object.keys(groupedNotifications).sort();

  return (
    <div className="mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            Notifications Center
          </h1>
          <p className="text-muted-foreground">
            Stay updated with your tasks, messages, and important updates
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="col-span-1">
          <Card className="sticky top-4">
            <CardHeader className="pb-3">
              <CardTitle>Notification Filters</CardTitle>
              <CardDescription>
                Filter your notifications by different criteria
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <h3 className="text-sm font-medium mb-2">Status</h3>
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All notifications</SelectItem>
                    <SelectItem value="unread">Unread only</SelectItem>
                    <SelectItem value="read">Read only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Time period</h3>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Filter by time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 days</SelectItem>
                    <SelectItem value="month">Last 30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-2">
                <h3 className="text-sm font-medium mb-3">Categories</h3>
                <ul className="space-y-1">
                  <li>
                    <Button
                      variant={activeCategory === "all" ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveCategory("all")}
                    >
                      <Bell className="h-4 w-4 mr-2 text-gray-500" />
                      <span>All notifications</span>
                      {getUnreadCount("all") > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                          {getUnreadCount("all")}
                        </Badge>
                      )}
                    </Button>
                  </li>
                  {categories.map((category) => {
                    const { icon, color } = getTypeDetails(
                      category as NotificationType,
                    );
                    const unreadCount = getUnreadCount(category);
                    return (
                      <li key={category}>
                        <Button
                          variant={
                            activeCategory === category ? "secondary" : "ghost"
                          }
                          className="w-full justify-start"
                          onClick={() => setActiveCategory(category)}
                        >
                          <div
                            className={`p-1 rounded-full ${color.split(" ")[0]} mr-2`}
                          >
                            {icon}
                          </div>
                          <span className="capitalize">
                            {category.replace(/_/g, " ")}
                          </span>
                          {unreadCount > 0 && (
                            <Badge variant="secondary" className="ml-auto">
                              {unreadCount}
                            </Badge>
                          )}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() =>
                  clearAllNotifications(
                    activeCategory !== "all" ? activeCategory : undefined,
                  )
                }
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {activeCategory === "all"
                  ? "Clear all notifications"
                  : `Clear ${activeCategory.replace(/_/g, " ")} notifications`}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Main Content */}
        <div className="col-span-1 md:col-span-3">
          <Card className="overflow-hidden">
            <CardHeader className="pb-0">
              <div className="flex flex-wrap justify-between items-center gap-2">
                <CardTitle className="capitalize">
                  {activeCategory === "all"
                    ? "All notifications"
                    : `${activeCategory.replace(/_/g, " ")} notifications`}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      markAllAsRead(
                        activeCategory !== "all" ? activeCategory : undefined,
                      )
                    }
                    className="text-primary"
                  >
                    <CheckCheck className="h-4 w-4 mr-1" />
                    Mark all as read
                  </Button>
                  <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="h-8 w-[130px]">
                      <Filter className="h-3.5 w-3.5 mr-1" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="unread">Unread</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <CardDescription>
                {activeCategory === "all"
                  ? `You have ${notifications.length} notifications (${getUnreadCount("all")} unread)`
                  : `You have ${groupedNotifications[activeCategory]?.length || 0} notifications in this category (${getUnreadCount(activeCategory)} unread)`}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <ScrollArea className="h-[560px] rounded-md">
                {loading ? (
                  <div className="p-4 space-y-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="flex gap-4 p-4 border-b">
                        <Skeleton className="w-10 h-10 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                          <div className="flex gap-2 mt-2">
                            <Skeleton className="h-5 w-16 rounded-full" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Notification list */}
                    {filterNotifications(
                      activeCategory === "all"
                        ? notifications
                        : groupedNotifications[activeCategory] || [],
                    ).length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-60 p-8 text-center text-muted-foreground">
                        <Bell className="h-12 w-12 mb-4 opacity-20" />
                        <p className="text-lg font-medium">
                          No notifications found
                        </p>
                        <p className="text-sm max-w-md mt-2">
                          {filter !== "all"
                            ? `Try changing your filter settings to see ${activeCategory === "all" ? "all" : activeCategory.replace(/_/g, " ")} notifications.`
                            : `You don't have any ${activeCategory === "all" ? "" : activeCategory.replace(/_/g, " ")} notifications yet.`}
                        </p>
                      </div>
                    ) : (
                      <div>
                        {filterNotifications(
                          activeCategory === "all"
                            ? notifications
                            : groupedNotifications[activeCategory] || [],
                        ).map((notification) => {
                          const { icon, color, bgHover, bgActive } =
                            getTypeDetails(notification.type);
                          return (
                            <div
                              key={notification.id}
                              className={cn(
                                "flex items-start gap-4 p-4 transition-colors border-b",
                                bgHover,
                                !notification.read ? bgActive : "",
                              )}
                            >
                              <div
                                className={cn(
                                  "p-2.5 rounded-full flex-shrink-0 border",
                                  color,
                                )}
                              >
                                {icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <p className="text-sm font-medium">
                                        {notification.message}
                                      </p>
                                      {!notification.read && (
                                        <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                                      )}
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 mt-1">
                                      {getPriorityBadge(notification.priority)}
                                      <Badge
                                        variant="outline"
                                        className="capitalize bg-gray-50 text-gray-700 border-gray-200"
                                      >
                                        {notification.type.replace(/_/g, " ")}
                                      </Badge>
                                      {notification.source && (
                                        <Badge
                                          variant="outline"
                                          className="capitalize bg-gray-50 text-gray-700 border-gray-200"
                                        >
                                          {notification.source}
                                        </Badge>
                                      )}
                                    </div>
                                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                                      <Clock className="h-3 w-3 mr-1" />
                                      <span
                                        title={formatDate(
                                          notification.parsedCreatedAt,
                                        )}
                                      >
                                        {notification.timeAgo}
                                      </span>
                                    </div>
                                  </div>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full"
                                      >
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="16"
                                          height="16"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        >
                                          <circle cx="12" cy="12" r="1" />
                                          <circle cx="12" cy="5" r="1" />
                                          <circle cx="12" cy="19" r="1" />
                                        </svg>
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      {!notification.read && (
                                        <DropdownMenuItem
                                          onClick={() =>
                                            markAsRead(notification.id)
                                          }
                                        >
                                          <CheckCheck className="h-4 w-4 mr-2" />
                                          Mark as read
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem>
                                        <ArrowUpDown className="h-4 w-4 mr-2" />
                                        View details
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={() =>
                                          deleteNotification(notification.id)
                                        }
                                        className="text-red-600"
                                      >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
