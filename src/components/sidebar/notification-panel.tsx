"use client";
import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import io, { Socket } from "socket.io-client";
import { useAppContext } from "@/src/contexts/app-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Button } from "@/src/components/ui/button";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Avatar } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { apiClient } from "@/src/lib/apiClient";
import { Notification } from "@/src/types";

export function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [socket, setSocket] = useState<typeof Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [open, setOpen] = useState(false);
  const { user } = useAppContext();
  const userId = user?.id;

  // Fetch initial notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await apiClient("/api/notifications");
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((n: Notification) => !n.read).length);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  // Socket connection setup
  useEffect(() => {
    if (!userId) return;

    const socketInstance = io("http://localhost:8000/notification", {
      query: { userId },
    });

    socketInstance.on("connect", () => {
      console.log("Connected to notification system");
    });

    socketInstance.on("notification", (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Handle opening popover
  useEffect(() => {
    if (open && socket && unreadCount > 0) {
      // Emit read event for all unread notifications
      notifications
        .filter((n) => !n.read)
        .forEach((n) => {
          socket.emit("readNotification", n.id);
        });
    }
  }, [open, socket, notifications, unreadCount]);

  const markAllAsRead = () => {
    if (socket) {
      // Emit read event for all unread notifications
      notifications
        .filter((n) => !n.read)
        .forEach((n) => {
          socket.emit("readNotification", n.id);
        });
    }

    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true })),
    );
    setUnreadCount(0);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Open notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
              <Bell className="h-12 w-12 mb-2 opacity-20" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-1">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-start gap-3 p-3 hover:bg-muted/50 transition-colors border-gray-300 border-b ${
                    !notification.read ? "bg-muted/30" : ""
                  }`}
                >
                  <Avatar className="h-8 w-8 bg-primary/10 flex justify-center items-center">
                    <Bell className="h-4 w-4 text-primary" />
                  </Avatar>
                  <div className="space-y-1">
                    {/* <p className="text-sm font-medium leading-none">
                      {notification.title}
                    </p> */}
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.createdAt
                        ? new Date(notification.createdAt).toLocaleTimeString()
                        : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
