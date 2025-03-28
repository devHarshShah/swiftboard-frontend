import { Bell } from "lucide-react";

interface EmptyNotificationsProps {
  filter: string;
  activeCategory: string;
}

export function EmptyNotifications({
  filter,
  activeCategory,
}: EmptyNotificationsProps) {
  return (
    <div className="flex flex-col items-center justify-center h-60 p-8 text-center text-muted-foreground">
      <Bell className="h-12 w-12 mb-4 opacity-20" />
      <p className="text-lg font-medium">No notifications found</p>
      <p className="text-sm max-w-md mt-2">
        {filter !== "all"
          ? `Try changing your filter settings to see ${activeCategory === "all" ? "all" : activeCategory.replace(/_/g, " ")} notifications.`
          : `You don't have any ${activeCategory === "all" ? "" : activeCategory.replace(/_/g, " ")} notifications yet.`}
      </p>
    </div>
  );
}
