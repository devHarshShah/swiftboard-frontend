"use client";
import { useEffect, useState } from "react";
import { useAppContext } from "@/src/contexts/app-context";
import { ProjectTimeStats, TaskTimeStats } from "@/src/types/timeTracking";
import { getProjectTimeStats } from "@/src/lib/timeTracking";
import { TimeStatsOverview } from "./time-stats-overview";
import { DailyTimeChart } from "./daily-time-chart";
import { StatusDistributionChart } from "./status-distribution-chart";
import { UserTimeChart } from "./user-time-chart";
import { RecentActivity } from "./recent-activity";
import { TimeComparisonChart } from "./time-comparison-chart";
import { Alert, AlertDescription } from "@/src/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/components/ui/tabs";

export function TimeTrackingDashboard() {
  const { activeProject } = useAppContext();
  const [projectStats, setProjectStats] = useState<ProjectTimeStats | null>(
    null,
  );
  const [taskStats, setTaskStats] = useState<TaskTimeStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (!activeProject?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        const projectTimeStats = await getProjectTimeStats(activeProject.id);
        setProjectStats(projectTimeStats);

        // Optionally fetch task-level stats if needed
        // You could limit this to top N tasks by some criteria
        const taskPromises =
          projectTimeStats.taskStatusDistribution &&
          Object.entries(projectTimeStats.taskStatusDistribution)
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .filter(([_, count]) => count > 0)
            .map(async () => {
              // In a real implementation, you'd get actual task IDs here
              return [];
            });

        if (taskPromises) {
          const taskResults = await Promise.all(taskPromises);
          setTaskStats(taskResults.flat());
        }
      } catch (err) {
        console.error("Failed to fetch time tracking data", err);
        setError("Failed to load time tracking statistics. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [activeProject?.id]);

  const handleRefresh = () => {
    if (activeProject?.id) {
      setIsLoading(true);
      setError(null);
      getProjectTimeStats(activeProject.id)
        .then((data) => {
          setProjectStats(data);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error("Failed to refresh time tracking data", err);
          setError(
            "Failed to refresh time tracking statistics. Please try again.",
          );
          setIsLoading(false);
        });
    }
  };

  // Create mock data for demonstration purposes if no real data is available
  const mockProjectStats: ProjectTimeStats = projectStats || {
    projectId: activeProject?.id || "project-1",
    totalTrackedTime: 358200, // ~99.5 hours
    tasksCount: 24,
    completedTasksCount: 16,
    averageTaskCompletionTime: 15300, // ~4.25 hours
    taskStatusDistribution: {
      TODO: 8,
      IN_PROGRESS: 5,
      REVIEW: 3,
      DONE: 16,
    },
    timeByStatus: {
      TODO: 0,
      IN_PROGRESS: 86400, // 24 hours
      REVIEW: 43200, // 12 hours
      DONE: 228600, // ~63.5 hours
    },
    timeByUser: [
      {
        userId: "user-1",
        userName: "John Doe",
        userEmail: "john@example.com",
        trackedTime: 129600,
      }, // 36 hours
      {
        userId: "user-2",
        userName: "Jane Smith",
        userEmail: "jane@example.com",
        trackedTime: 86400,
      }, // 24 hours
      {
        userId: "user-3",
        userName: "Bob Johnson",
        userEmail: "bob@example.com",
        trackedTime: 64800,
      }, // 18 hours
      {
        userId: "user-4",
        userName: "Alice Wong",
        userEmail: "alice@example.com",
        trackedTime: 43200,
      }, // 12 hours
      {
        userId: "user-5",
        userName: "David Patel",
        userEmail: "david@example.com",
        trackedTime: 34200,
      }, // 9.5 hours
    ],
    dailyTrackedTime: [
      { date: "2023-05-01", trackedTime: 14400 }, // 4 hours
      { date: "2023-05-02", trackedTime: 18000 }, // 5 hours
      { date: "2023-05-03", trackedTime: 21600 }, // 6 hours
      { date: "2023-05-04", trackedTime: 16200 }, // 4.5 hours
      { date: "2023-05-05", trackedTime: 12600 }, // 3.5 hours
      { date: "2023-05-08", trackedTime: 19800 }, // 5.5 hours
      { date: "2023-05-09", trackedTime: 18000 }, // 5 hours
      { date: "2023-05-10", trackedTime: 21600 }, // 6 hours
      { date: "2023-05-11", trackedTime: 25200 }, // 7 hours
      { date: "2023-05-12", trackedTime: 14400 }, // 4 hours
      { date: "2023-05-15", trackedTime: 16200 }, // 4.5 hours
      { date: "2023-05-16", trackedTime: 18000 }, // 5 hours
      { date: "2023-05-17", trackedTime: 21600 }, // 6 hours
      { date: "2023-05-18", trackedTime: 18000 }, // 5 hours
      { date: "2023-05-19", trackedTime: 14400 }, // 4 hours
    ],
  };

  const mockTaskStats: TaskTimeStats[] =
    taskStats.length > 0
      ? taskStats
      : [
          {
            taskId: "task-1",
            taskName: "Implement user authentication",
            taskStatus: "DONE",
            totalTrackedTime: 18000, // 5 hours
            sessionsCount: 3,
            averageSessionDuration: 6000, // 1.67 hours
            lastSessionDate: new Date("2023-05-17T15:30:00"),
            assignedUsers: [
              {
                userId: "user-1",
                userName: "John Doe",
                userEmail: "john@example.com",
                trackedTime: 10800,
              }, // 3 hours
              {
                userId: "user-2",
                userName: "Jane Smith",
                userEmail: "jane@example.com",
                trackedTime: 7200,
              }, // 2 hours
            ],
          },
          {
            taskId: "task-2",
            taskName: "Design database schema",
            taskStatus: "DONE",
            totalTrackedTime: 14400, // 4 hours
            sessionsCount: 2,
            averageSessionDuration: 7200, // 2 hours
            lastSessionDate: new Date("2023-05-16T11:45:00"),
            assignedUsers: [
              {
                userId: "user-3",
                userName: "Bob Johnson",
                userEmail: "bob@example.com",
                trackedTime: 14400,
              }, // 4 hours
            ],
          },
          {
            taskId: "task-3",
            taskName: "Create API endpoints",
            taskStatus: "IN_PROGRESS",
            totalTrackedTime: 10800, // 3 hours
            sessionsCount: 4,
            averageSessionDuration: 2700, // 0.75 hours
            lastSessionDate: new Date("2023-05-18T09:15:00"),
            assignedUsers: [
              {
                userId: "user-1",
                userName: "John Doe",
                userEmail: "john@example.com",
                trackedTime: 5400,
              }, // 1.5 hours
              {
                userId: "user-4",
                userName: "Alice Wong",
                userEmail: "alice@example.com",
                trackedTime: 5400,
              }, // 1.5 hours
            ],
          },
          {
            taskId: "task-4",
            taskName: "Write unit tests",
            taskStatus: "REVIEW",
            totalTrackedTime: 7200, // 2 hours
            sessionsCount: 1,
            averageSessionDuration: 7200, // 2 hours
            lastSessionDate: new Date("2023-05-19T13:20:00"),
            assignedUsers: [
              {
                userId: "user-2",
                userName: "Jane Smith",
                userEmail: "jane@example.com",
                trackedTime: 7200,
              }, // 2 hours
            ],
          },
          {
            taskId: "task-5",
            taskName: "Set up CI/CD pipeline",
            taskStatus: "TODO",
            totalTrackedTime: 0,
            sessionsCount: 0,
            averageSessionDuration: 0,
            assignedUsers: [],
          },
        ];

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">No Project Selected</h2>
          <p className="text-muted-foreground mb-4">
            Please select a project to view time tracking statistics.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Time Tracking Analytics</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <TimeStatsOverview stats={mockProjectStats} isLoading={isLoading} />

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 mx-auto">
          <TabsTrigger value="daily">Daily Activity</TabsTrigger>
          <TabsTrigger value="status">Status Distribution</TabsTrigger>
          <TabsTrigger value="users">Team Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="daily" className="pt-4">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
            <DailyTimeChart stats={mockProjectStats} isLoading={isLoading} />
            <TimeComparisonChart
              stats={mockProjectStats}
              isLoading={isLoading}
            />
          </div>
        </TabsContent>
        <TabsContent value="status" className="pt-4">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
            <StatusDistributionChart
              stats={mockProjectStats}
              isLoading={isLoading}
            />
            <div className="col-span-2">
              <TimeComparisonChart
                stats={mockProjectStats}
                isLoading={isLoading}
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="users" className="pt-4">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
            <UserTimeChart stats={mockProjectStats} isLoading={isLoading} />
            <div className="col-span-2">
              <RecentActivity tasks={mockTaskStats} isLoading={isLoading} />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-4">
        <RecentActivity tasks={mockTaskStats} isLoading={isLoading} />
      </div>
    </div>
  );
}
