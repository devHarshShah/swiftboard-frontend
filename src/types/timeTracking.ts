export interface TimeTrackingSession {
  id: string;
  taskId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in seconds
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskTimeStats {
  taskId: string;
  taskName: string;
  taskStatus: string;
  totalTrackedTime: number; // in seconds
  sessionsCount: number;
  averageSessionDuration: number; // in seconds
  lastSessionDate?: Date;
  assignedUsers: {
    userId: string;
    userName: string;
    userEmail: string;
    trackedTime: number; // in seconds
  }[];
}

export interface ProjectTimeStats {
  projectId: string;
  totalTrackedTime: number; // in seconds
  tasksCount: number;
  completedTasksCount: number;
  averageTaskCompletionTime: number; // in seconds
  taskStatusDistribution: {
    [status: string]: number; // count of tasks in each status
  };
  timeByStatus: {
    [status: string]: number; // time spent in each status (in seconds)
  };
  timeByUser: {
    userId: string;
    userName: string;
    userEmail: string;
    trackedTime: number; // in seconds
  }[];
  dailyTrackedTime: {
    date: string;
    trackedTime: number; // in seconds
  }[];
}

export interface TimeTrackingDto {
  notes?: string;
}

export interface MoveTaskDto {
  status: string;
}
