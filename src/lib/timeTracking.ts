import { apiClient } from "./apiClient";
import {
  ProjectTimeStats,
  TaskTimeStats,
  TimeTrackingDto,
  MoveTaskDto,
} from "@/src/types/timeTracking";

// Get time statistics for the entire project
export async function getProjectTimeStats(
  projectId: string,
): Promise<ProjectTimeStats> {
  const response = await apiClient(`/api/projects/${projectId}/time-stats`);
  if (!response.ok) {
    throw new Error("Failed to fetch project time statistics");
  }
  return response.json();
}

// Get time statistics for a specific task
export async function getTaskTimeStats(
  projectId: string,
  taskId: string,
): Promise<TaskTimeStats> {
  const response = await apiClient(
    `/api/projects/${projectId}/tasks/${taskId}/time-stats`,
  );
  if (!response.ok) {
    throw new Error("Failed to fetch task time statistics");
  }
  return response.json();
}

// Start time tracking for a task
export async function startTimeTracking(
  projectId: string,
  taskId: string,
  data: TimeTrackingDto,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const response = await apiClient(
    `/api/projects/${projectId}/tasks/${taskId}/time-tracking`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
  if (!response.ok) {
    throw new Error("Failed to start time tracking");
  }
  return response.json();
}

// Stop time tracking for a task
export async function stopTimeTracking(
  projectId: string,
  taskId: string,
  sessionId: string,
  data: TimeTrackingDto,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const response = await apiClient(
    `/api/projects/${projectId}/tasks/${taskId}/time-tracking/${sessionId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
  if (!response.ok) {
    throw new Error("Failed to stop time tracking");
  }
  return response.json();
}

// Move a task to a different status
export async function moveTask(
  projectId: string,
  taskId: string,
  data: MoveTaskDto,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  const response = await apiClient(
    `/api/projects/${projectId}/tasks/${taskId}/move`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
  if (!response.ok) {
    throw new Error("Failed to move task");
  }
  return response.json();
}

// Format seconds into a human-readable duration
export function formatDuration(seconds: number): string {
  if (!seconds) return "0m";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Format seconds into hours with decimals (e.g., 1.5h)
export function formatHours(seconds: number): string {
  if (!seconds) return "0h";

  const hours = (seconds / 3600).toFixed(1);
  return `${hours}h`;
}
