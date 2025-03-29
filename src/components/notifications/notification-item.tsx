import { Clock, CheckCheck, Trash2, ArrowUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { cn } from "@/src/lib/utils";
import {
  getTypeDetails,
  getPriorityBadge,
  formatDate,
} from "@/src/lib/notification-utils";
import { NotificationItemProps } from "@/src/types";

export function NotificationItem({
  notification,
  markAsRead,
  deleteNotification,
}: NotificationItemProps) {
  const { icon, color, bgHover, bgActive } = getTypeDetails(notification.type);
  const priorityDetails = getPriorityBadge(notification.priority);

  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 transition-colors border-b",
        bgHover,
        !notification.read ? bgActive : "",
      )}
    >
      <div className={cn("p-2.5 rounded-full flex-shrink-0 border", color)}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{notification.message}</p>
              {!notification.read && (
                <span className="h-2 w-2 rounded-full bg-blue-600"></span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {notification.priority && (
                <Badge variant="outline" className={priorityDetails.className}>
                  {priorityDetails.icon}
                  {priorityDetails.label}
                </Badge>
              )}
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
              <span title={formatDate(notification.parsedCreatedAt)}>
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
                <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
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
                onClick={() => deleteNotification(notification.id)}
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
}
