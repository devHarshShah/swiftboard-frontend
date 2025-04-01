import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/src/components/ui/avatar";
import { formatDuration } from "@/src/lib/timeTracking";
import { TaskTimeStats } from "@/src/types/timeTracking";

interface RecentActivityProps {
  tasks: TaskTimeStats[];
  isLoading: boolean;
}

export function RecentActivity({ tasks, isLoading }: RecentActivityProps) {
  // Sort tasks by last session date, most recent first
  const sortedTasks = [...tasks]
    .filter((task) => task.lastSessionDate)
    .sort((a, b) => {
      const dateA = a.lastSessionDate
        ? new Date(a.lastSessionDate).getTime()
        : 0;
      const dateB = b.lastSessionDate
        ? new Date(b.lastSessionDate).getTime()
        : 0;
      return dateB - dateA;
    })
    .slice(0, 5); // Only show 5 most recent

  if (isLoading) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle className="animate-pulse h-6 bg-muted rounded w-48"></CardTitle>
          <CardDescription className="animate-pulse h-4 bg-muted rounded w-64"></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center animate-pulse">
                  <div className="h-9 w-9 rounded-full bg-muted mr-3"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest time tracking sessions across tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sortedTasks.length === 0 ? (
          <div className="text-center text-muted-foreground py-4">
            No recent activity to display
          </div>
        ) : (
          <div className="space-y-6">
            {sortedTasks.map((task) => {
              const mostActiveUser = task.assignedUsers.sort(
                (a, b) => b.trackedTime - a.trackedTime,
              )[0];
              const formattedDate = task.lastSessionDate
                ? new Date(task.lastSessionDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Unknown";

              return (
                <div key={task.taskId} className="flex items-start">
                  <Avatar className="h-9 w-9 mr-3">
                    {mostActiveUser?.userName ? (
                      <AvatarImage
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(mostActiveUser.userName)}&background=random`}
                      />
                    ) : (
                      <AvatarFallback>
                        {mostActiveUser?.userName?.charAt(0) || "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium leading-none">
                        {task.taskName}
                      </p>
                      <div className="flex items-center space-x-1">
                        <Badge
                          variant="outline"
                          className="text-xs font-normal"
                        >
                          {getStatusBadgeColor(task.taskStatus)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formattedDate}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Total time: {formatDuration(task.totalTrackedTime)} •
                      {task.sessionsCount} session
                      {task.sessionsCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getStatusBadgeColor(status: string) {
  switch (status.toUpperCase()) {
    case "TODO":
      return (
        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
          Todo
        </span>
      );
    case "IN_PROGRESS":
      return (
        <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
          In Progress
        </span>
      );
    case "REVIEW":
      return (
        <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
          Review
        </span>
      );
    case "DONE":
      return (
        <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
          Done
        </span>
      );
    default:
      return (
        <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
          {status}
        </span>
      );
  }
}
