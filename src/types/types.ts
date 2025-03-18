// Types and Interfaces for Kanban Board

export const TaskStatus = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE",
} as const;

export type TaskStatusKey = keyof typeof TaskStatus;

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface TaskAssignment {
  id: string;
  taskId: string;
  userId: string;
  user: User;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  status: TaskStatusKey;
  taskAssignments: TaskAssignment[];
  dueDate: Date;
  expectedHours: number;
  blockedBy: Task[];
  blocking: Task[];
}

export interface NewTaskData {
  name: string;
  description: string;
  userIds: string[];
  dueDate: Date;
  expectedHours: number;
  blockedBy: Task[];
}

export interface GroupedTasks {
  [TaskStatus.TODO]: Task[];
  [TaskStatus.IN_PROGRESS]: Task[];
  [TaskStatus.DONE]: Task[];
}

export const statusConfig = {
  [TaskStatus.TODO]: {
    label: "To Do",
    bgColor: "bg-chart-1/10 dark:bg-chart-1/20",
    textColor: "text-chart-1 dark:text-chart-1",
    borderColor: "border-chart-1/30 dark:border-chart-1/40",
    hoverColor: "hover:bg-chart-1/20 dark:hover:bg-chart-1/30",
  },
  [TaskStatus.IN_PROGRESS]: {
    label: "In Progress",
    bgColor: "bg-chart-3/10 dark:bg-chart-3/20",
    textColor: "text-chart-3 dark:text-chart-3",
    borderColor: "border-chart-3/30 dark:border-chart-3/40",
    hoverColor: "hover:bg-chart-3/20 dark:hover:bg-chart-3/30",
  },
  [TaskStatus.DONE]: {
    label: "Completed",
    bgColor: "bg-chart-5/10 dark:bg-chart-5/20",
    textColor: "text-chart-5 dark:text-chart-5",
    borderColor: "border-chart-5/30 dark:border-chart-5/40",
    hoverColor: "hover:bg-chart-5/20 dark:hover:bg-chart-5/30",
  },
};

export type NodeType = "start" | "task" | "condition" | "api" | "data" | "end";

export interface WorkflowNodeData {
  label: string;
  type: NodeType;
  description: string;
  icon?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: Record<string, any>;
}
