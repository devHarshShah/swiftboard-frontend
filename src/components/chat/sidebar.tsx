import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import {
  Search,
  Plus,
  Settings,
  Users,
  FileText,
  X,
  MoreHorizontal,
  Bell,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/src/components/ui/dropdown-menu";
import { apiClient } from "@/src/lib/apiClient";
import { useAppContext } from "@/src/contexts/app-context";
import { useWebSocket } from "@/src/contexts/websocket-context";
import { TeamMember, TeamMemberResponse } from "@/src/types/user";
import { cn } from "@/src/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

export default function Sidebar({
  onSelectConversation,
  activeConversationId,
}: {
  onSelectConversation: (user: TeamMember) => void;
  activeConversationId?: string; // Add this prop to track the active conversation
}) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeConversation, setActiveConversation] = useState(
    activeConversationId || "",
  );
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showSearch, setShowSearch] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Use context instead of cookies
  const { activeTeam, user: currentUser } = useAppContext();
  const { chatSocket } = useWebSocket();
  const teamId = activeTeam?.id;

  // Fetch unread message counts using WebSockets
  const fetchUnreadMessageCounts = useCallback(() => {
    if (!chatSocket || !currentUser?.id) return;

    chatSocket.emit("getUnreadCounts", { userId: currentUser.id });
  }, [chatSocket, currentUser?.id]);

  // Listen for unread counts from WebSocket
  useEffect(() => {
    if (!chatSocket) return;

    const handleUnreadCounts = (counts: Record<string, number>) => {
      setMembers((prev) =>
        prev.map((member) => ({
          ...member,
          // Keep the unread count at 0 if the conversation is active
          unreadCount:
            member.id === activeConversation ? 0 : counts[member.id] || 0,
        })),
      );
    };

    chatSocket.on("unreadCounts", handleUnreadCounts);

    return () => {
      chatSocket.off("unreadCounts", handleUnreadCounts);
    };
  }, [chatSocket, activeConversation]);

  // Update activeConversation when the prop changes
  useEffect(() => {
    if (activeConversationId) {
      setActiveConversation(activeConversationId);

      // Mark messages as read when conversation becomes active
      if (chatSocket && currentUser?.id) {
        chatSocket.emit("markMessagesAsRead", {
          userId: currentUser.id,
          senderId: activeConversationId,
        });
      }

      // Clear unread messages for the active conversation
      setMembers((prev) =>
        prev.map((m) =>
          m.id === activeConversationId ? { ...m, unreadCount: 0 } : m,
        ),
      );
    }
  }, [activeConversationId, chatSocket, currentUser?.id]);

  // Improved online status tracking
  useEffect(() => {
    if (!chatSocket || !currentUser?.id) return;

    const handleUserStatus = (data: { userId: string }) => {
      console.log("User Status Event:", data);

      // Ensure we have a valid user ID
      if (!data.userId || data.userId === "undefined") {
        console.warn("Invalid user ID received:", data.userId);
        return;
      }

      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        updated.add(data.userId);
        return updated;
      });

      setMembers((prev) =>
        prev.map((member) =>
          member.id === data.userId ? { ...member, status: "online" } : member,
        ),
      );
    };

    const handleUserOffline = (data: { userId: string }) => {
      console.log("User Offline Event:", data);

      if (!data.userId || data.userId === "undefined") {
        console.warn("Invalid user ID received for offline:", data.userId);
        return;
      }

      setOnlineUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(data.userId);
        return updated;
      });

      setMembers((prev) =>
        prev.map((member) =>
          member.id === data.userId
            ? {
                ...member,
                status: "offline",
                lastActive: new Date(),
              }
            : member,
        ),
      );
    };

    // Handle new message notification
    const handleNewMessage = (message: {
      senderId: string;
      receiverId: string;
    }) => {
      // Only update unread count if message is for current user and not from current user
      // AND if the conversation with the sender is not currently active
      if (
        message.receiverId === currentUser.id &&
        message.senderId !== currentUser.id &&
        message.senderId !== activeConversation // Don't increment if conversation is active
      ) {
        setMembers((prev) =>
          prev.map((member) =>
            member.id === message.senderId
              ? { ...member, unreadCount: (member.unreadCount || 0) + 1 }
              : member,
          ),
        );
      }
    };

    // Improved connection handling
    const requestOnlineUsers = () => {
      if (currentUser.id) {
        chatSocket.emit("userOnline", { userId: currentUser.id });
        chatSocket.emit("getOnlineUsers");

        // Also fetch unread counts on connection
        fetchUnreadMessageCounts();
      }
    };

    // Handle the response with all online users
    const handleOnlineUsers = (users: string[]) => {
      console.log(
        "Verified Online Users:",
        users.filter((id) => id && id !== "undefined"),
      );

      const validOnlineUsers = users.filter((id) => id && id !== "undefined");
      const onlineSet = new Set(validOnlineUsers);

      setOnlineUsers(onlineSet);

      // Update all members with their online status
      setMembers((prev) =>
        prev.map((member) => ({
          ...member,
          status: onlineSet.has(member.id) ? "online" : "offline",
        })),
      );
    };

    // Subscribe to events
    chatSocket.on("userOnline", handleUserStatus);
    chatSocket.on("userOffline", handleUserOffline);
    chatSocket.on("newMessage", handleNewMessage);
    chatSocket.on("onlineUsers", handleOnlineUsers);
    chatSocket.on("connect", requestOnlineUsers);

    // Initial request on mount
    requestOnlineUsers();

    return () => {
      chatSocket.off("userOnline", handleUserStatus);
      chatSocket.off("userOffline", handleUserOffline);
      chatSocket.off("newMessage", handleNewMessage);
      chatSocket.off("onlineUsers", handleOnlineUsers);
      chatSocket.off("connect", requestOnlineUsers);
    };
  }, [
    chatSocket,
    currentUser?.id,
    activeConversation,
    fetchUnreadMessageCounts,
  ]);

  // Fetch members and their statuses
  useEffect(() => {
    const fetchMembers = async () => {
      if (!teamId) return;

      setIsLoading(true);
      try {
        const response = await apiClient(`/api/teams/${teamId}/members`);
        const data = (await response.json()) as TeamMemberResponse[];

        // Filter out the current user from the list
        const filteredData = data.filter(
          (member: TeamMemberResponse) => member.user.id !== currentUser?.id,
        );

        // Use the onlineUsers set to determine who's online
        const teamMembers: TeamMember[] = filteredData.map(
          (member: TeamMemberResponse) => {
            const userId = member.user.id;
            const isOnline = onlineUsers.has(userId);

            return {
              id: userId,
              name: member.user.name || member.user.email.split("@")[0],
              email: member.user.email,
              avatar: member.user.avatar,
              role: member.role,
              status: isOnline ? "online" : "offline",
              lastActive: new Date(
                Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000),
              ),
              // Don't show unread count for active conversation
              unreadCount: userId === activeConversation ? 0 : 0, // Initialize with 0 and fetch real counts separately
            };
          },
        );

        // Sort: online first, then with unread messages, then alphabetically
        const sortedMembers = teamMembers.sort(
          (a: TeamMember, b: TeamMember) => {
            if (a.status === "online" && b.status !== "online") return -1;
            if (a.status !== "online" && b.status === "online") return 1;
            return a.name.localeCompare(b.name);
          },
        );

        setMembers(sortedMembers);

        // After setting members, fetch unread counts
        setTimeout(fetchUnreadMessageCounts, 100);
      } catch (error) {
        console.error("Failed to fetch team members:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [
    teamId,
    onlineUsers,
    currentUser?.id,
    activeConversation,
    fetchUnreadMessageCounts,
  ]);

  // Fetch unread counts periodically
  useEffect(() => {
    // Initial fetch
    fetchUnreadMessageCounts();

    // Set up interval for periodic updates
    const intervalId = setInterval(fetchUnreadMessageCounts, 30000); // Every 30 seconds

    return () => clearInterval(intervalId);
  }, [fetchUnreadMessageCounts]);

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === "all") return matchesSearch;
    if (filter === "online") return matchesSearch && member.status === "online";
    if (filter === "unread") return matchesSearch && member.unreadCount > 0;
    return matchesSearch;
  });

  // Re-sort when online status changes
  const sortedFilteredMembers = [...filteredMembers].sort((a, b) => {
    if (a.status === "online" && b.status !== "online") return -1;
    if (a.status !== "online" && b.status === "online") return 1;
    if (a.unreadCount && !b.unreadCount) return -1;
    if (!a.unreadCount && b.unreadCount) return 1;
    return a.name.localeCompare(b.name);
  });

  // Format relative time for last active
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    // Show date for older messages
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleSelectConversation = (member: TeamMember) => {
    setActiveConversation(member.id);
    onSelectConversation(member);

    // Mark messages as read when selecting conversation
    if (chatSocket && currentUser?.id) {
      chatSocket.emit("markMessagesAsRead", {
        userId: currentUser.id,
        senderId: member.id,
      });
    }

    // Mark messages as read when selecting conversation
    setMembers((prev) =>
      prev.map((m) => (m.id === member.id ? { ...m, unreadCount: 0 } : m)),
    );
  };

  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Count online members
  const onlineCount = members.filter((m) => m.status === "online").length;

  // Count total unread messages
  const totalUnread = members.reduce(
    (sum, member) => sum + (member.unreadCount || 0),
    0,
  );

  return (
    <div className="h-full flex flex-col bg-card border-r border-border dark:bg-card">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <h2 className="font-semibold text-lg">Messages</h2>
            {totalUnread > 0 && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="ml-2"
              >
                <Badge className="bg-primary text-primary-foreground">
                  {totalUnread}
                </Badge>
              </motion.div>
            )}
          </div>
          <div className="flex items-center space-x-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowSearch(!showSearch)}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Search</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>New message</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="relative mb-3"
            >
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages or people..."
                className="pl-9 pr-9 bg-secondary/50 border-secondary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground hover:text-foreground"
                  onClick={handleClearSearch}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <Tabs defaultValue="all" className="w-full" onValueChange={setFilter}>
          <TabsList className="grid grid-cols-3 h-9 bg-secondary/40">
            <TabsTrigger value="all" className="text-xs">
              All
            </TabsTrigger>
            <TabsTrigger
              value="online"
              className="text-xs flex items-center justify-center gap-1"
            >
              Online
              {onlineCount > 0 && (
                <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/20 px-1 text-[10px]">
                  {onlineCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="unread"
              className="text-xs flex items-center justify-center gap-1"
            >
              Unread
              {totalUnread > 0 && (
                <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/20 px-1 text-[10px]">
                  {totalUnread}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="flex-1 px-1">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="flex items-start space-x-3 p-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              ))}
          </div>
        ) : sortedFilteredMembers.length > 0 ? (
          <div className="py-2">
            {sortedFilteredMembers.map((member) => (
              <motion.div
                key={member.id}
                initial={false}
                animate={{
                  backgroundColor:
                    activeConversation === member.id
                      ? "rgba(var(--accent), 0.8)"
                      : "transparent",
                  transition: { duration: 0.2 },
                }}
                whileHover={{
                  backgroundColor:
                    activeConversation === member.id
                      ? "rgba(var(--accent), 0.9)"
                      : "rgba(var(--accent), 0.3)",
                  transition: { duration: 0.2 },
                }}
                className={cn(
                  "px-3 py-2.5 cursor-pointer rounded-md mx-1 mb-1 transition-colors",
                )}
                onClick={() => handleSelectConversation(member)}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 border bg-primary/5">
                      {member.avatar ? (
                        <AvatarImage src={member.avatar} alt={member.name} />
                      ) : (
                        <AvatarFallback className="text-foreground font-medium">
                          {member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <motion.div
                      initial={false}
                      animate={{
                        backgroundColor:
                          member.status === "online" ? "#10b981" : "#9ca3af",
                        scale: member.status === "online" ? 1 : 0.8,
                        transition: { duration: 0.3 },
                      }}
                      className={cn(
                        "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card",
                      )}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3
                        className={cn(
                          "font-medium truncate",
                          member.unreadCount > 0 && "font-semibold",
                        )}
                      >
                        {member.name}
                      </h3>
                      <div className="flex items-center">
                        {member.status === "online" ? (
                          <span className="text-xs text-muted-foreground ml-1">
                            Online
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground ml-1">
                            {formatRelativeTime(member.lastActive)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-0.5">
                      <p className="text-xs truncate text-muted-foreground">
                        {member.role || "Team Member"}
                      </p>
                      {member.unreadCount > 0 &&
                        activeConversation !== member.id && (
                          <motion.div
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 25,
                            }}
                          >
                            <Badge
                              variant="secondary"
                              className="ml-1 h-5 min-w-5 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-xs"
                            >
                              {member.unreadCount}
                            </Badge>
                          </motion.div>
                        )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center text-muted-foreground">
            <Search className="h-12 w-12 mb-3 opacity-20" />
            <p className="font-medium mb-1">No conversations found</p>
            <p className="text-sm mb-4">
              {searchQuery
                ? "Try a different search term"
                : "Start a new conversation"}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Browse team members
            </Button>
          </div>
        )}
      </ScrollArea>

      <div className="p-3 border-t border-border">
        <div className="flex items-center space-x-3 p-3 rounded-md hover:bg-accent/50 cursor-pointer">
          <div className="relative">
            <Avatar className="h-9 w-9 border">
              {currentUser?.avatar ? (
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              ) : (
                <AvatarFallback>
                  {currentUser?.name?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-card" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate text-sm">
              {currentUser?.name || "User"}
            </p>
            <p className="text-xs truncate text-muted-foreground">
              {currentUser?.email || "user@example.com"}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <FileText className="h-4 w-4 mr-2" />
                Edit profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell className="h-4 w-4 mr-2" />
                Notification settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
