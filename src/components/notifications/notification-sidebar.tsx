import { Bell, Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { getTypeDetails } from "@/src/lib/notification-utils";
import { NotificationType } from "@/src/lib/notification-utils";
import { NotificationSidebarProps } from "@/src/types";

export function NotificationSidebar({
  categories,
  activeCategory,
  setActiveCategory,
  getUnreadCount,
  filter,
  setFilter,
  timeFilter,
  setTimeFilter,
  clearAllNotifications,
}: NotificationSidebarProps) {
  return (
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
  );
}
