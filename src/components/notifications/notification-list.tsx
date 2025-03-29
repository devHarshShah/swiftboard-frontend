import { CheckCheck, Filter } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { ScrollArea } from "@/src/components/ui/scroll-area";
import { Button } from "@/src/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { NotificationItem } from "./notification-item";
import { EmptyNotifications } from "./empty-notification";
import { NotificationSkeleton } from "./notification-skeleton";
import { NotificationListProps } from "@/src/types";

export function NotificationList({
  notifications,
  activeCategory,
  filter,
  setFilter,
  groupedNotifications,
  loading,
  getUnreadCount,
  filterNotifications,
  markAllAsRead,
  markAsRead,
  deleteNotification,
}: NotificationListProps) {
  const filteredNotifications = filterNotifications(
    activeCategory === "all"
      ? notifications
      : groupedNotifications[activeCategory] || [],
  );

  return (
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
                disabled={getUnreadCount(activeCategory) === 0}
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
              <NotificationSkeleton />
            ) : (
              <>
                {filteredNotifications.length === 0 ? (
                  <EmptyNotifications
                    filter={filter}
                    activeCategory={activeCategory}
                  />
                ) : (
                  <div>
                    {filteredNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        markAsRead={markAsRead}
                        deleteNotification={deleteNotification}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
