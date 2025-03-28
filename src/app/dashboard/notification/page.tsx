"use client";

import { useCallback, useEffect, useState } from "react";
import { useWebSocket } from "@/src/contexts/websocket-context";
import { useAppContext } from "@/src/contexts/app-context";
import { apiClient } from "@/src/lib/apiClient";
import { useToast } from "@/src/contexts/toast-context";
import { NotificationHeader } from "@/src/components/notifications/notification-header";
import { NotificationSidebar } from "@/src/components/notifications/notification-sidebar";
import { NotificationList } from "@/src/components/notifications/notification-list";
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_SOURCES,
  normalizeType,
  normalizePriority,
  normalizeSource,
} from "@/src/lib/notification-utils";
import type { Notification, ProcessedNotification } from "@/src/types/types";

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

  // Process notifications to normalize types and add computed properties
  const processNotification = useCallback(
    (notification: Notification): ProcessedNotification => {
      // Function to calculate time ago
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

        // Process data
        const processedData = data.map((n: Notification) => {
          // Apply defaults if missing
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
  }, [processNotification, showToast]);

  // Socket connection for real-time notifications
  useEffect(() => {
    if (!userId || !isNotificationConnected || !notificationSocket) return;

    notificationSocket.on("notification", (notification: Notification) => {
      const processedNotification = processNotification({
        ...notification,
        // Apply defaults if missing
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

  // Get notification categories for sidebar
  const categories = Object.keys(groupedNotifications).sort();

  return (
    <div className="mx-auto py-8 px-4 max-w-7xl">
      <NotificationHeader />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <NotificationSidebar
          categories={categories}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          getUnreadCount={getUnreadCount}
          filter={filter}
          setFilter={setFilter}
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
          clearAllNotifications={clearAllNotifications}
        />

        <NotificationList
          notifications={notifications}
          activeCategory={activeCategory}
          filter={filter}
          setFilter={setFilter}
          groupedNotifications={groupedNotifications}
          loading={loading}
          getUnreadCount={getUnreadCount}
          filterNotifications={filterNotifications}
          markAllAsRead={markAllAsRead}
          markAsRead={markAsRead}
          deleteNotification={deleteNotification}
        />
      </div>
    </div>
  );
}
