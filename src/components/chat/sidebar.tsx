import React, { useState, useEffect } from "react";
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
import { TeamMember } from "@/src/types/types";
import { cn } from "@/src/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

export default function Sidebar({
  onSelectConversation,
}: {
  onSelectConversation: (user: TeamMember) => void;
}) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeConversation, setActiveConversation] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showSearch, setShowSearch] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  // Use context instead of cookies
  const { activeTeam, user: currentUser } = useAppContext();
  const { chatSocket } = useWebSocket();
  const teamId = activeTeam?.id;

  // Listen for online/offline status changes
  useEffect(() => {
    if (!chatSocket) return;

    // Handle user online status
    const handleUserOnline = (userId: string) => {
      setOnlineUsers((prev) => new Set(prev).add(userId));

      // Update the members array with the new online status
      setMembers((prev) =>
        prev.map((member) =>
          member.id === userId ? { ...member, status: "online" } : member,
        ),
      );
    };

    // Handle user offline status
    const handleUserOffline = (userId: string) => {
      const newOnlineUsers = new Set(onlineUsers);
      newOnlineUsers.delete(userId);
      setOnlineUsers(newOnlineUsers);

      // Update the members array with the new offline status
      setMembers((prev) =>
        prev.map((member) =>
          member.id === userId
            ? {
                ...member,
                status: "offline",
                lastActive: new Date(), // Update last active time
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
      if (
        message.receiverId === currentUser?.id &&
        message.senderId !== currentUser?.id
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

    // Subscribe to events
    chatSocket.on("userOnline", handleUserOnline);
    chatSocket.on("userOffline", handleUserOffline);
    chatSocket.on("newMessage", handleNewMessage);

    // When connecting, request the list of online users
    chatSocket.emit("getOnlineUsers");

    // Handle the response with all online users
    chatSocket.on("onlineUsers", (users: string[]) => {
      setOnlineUsers(new Set(users));

      // Update all members with their online status
      setMembers((prev) =>
        prev.map((member) => ({
          ...member,
          status: users.includes(member.id) ? "online" : "offline",
        })),
      );
    });

    return () => {
      chatSocket.off("userOnline", handleUserOnline);
      chatSocket.off("userOffline", handleUserOffline);
      chatSocket.off("newMessage", handleNewMessage);
      chatSocket.off("onlineUsers");
    };
  }, [chatSocket, currentUser?.id, onlineUsers]);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!teamId) return;

      setIsLoading(true);
      try {
        const response = await apiClient(`/api/teams/${teamId}/members`);
        const data = await response.json();

        // Use the onlineUsers set to determine who's online
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const teamMembers = data.map((member: any) => ({
          id: member.user.id,
          name: member.user.name || member.user.email.split("@")[0],
          email: member.user.email,
          avatar: member.user.avatar,
          role: member.role,
          status: onlineUsers.has(member.user.id) ? "online" : "offline",
          lastActive: new Date(
            Date.now() - Math.floor(Math.random() * 24 * 60 * 60 * 1000),
          ),
          // Simulate unread messages for demo
          unreadCount:
            Math.random() > 0.7 ? Math.floor(Math.random() * 5) + 1 : 0,
        }));

        // Sort: online first, then with unread messages, then alphabetically
        const sortedMembers = teamMembers.sort(
          (a: TeamMember, b: TeamMember) => {
            if (a.status === "online" && b.status !== "online") return -1;
            if (a.status !== "online" && b.status === "online") return 1;
            if (a.unreadCount && !b.unreadCount) return -1;
            if (!a.unreadCount && b.unreadCount) return 1;
            return a.name.localeCompare(b.name);
          },
        );

        setMembers(sortedMembers);
      } catch (error) {
        console.error("Failed to fetch team members:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [teamId, onlineUsers]); // Add onlineUsers as dependency

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
                      {member.unreadCount > 0 && (
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
