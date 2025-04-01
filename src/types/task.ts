import { User } from "./user";
import { BaseEntity } from "./common";

export const TaskStatus = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE",
} as const;

export type TaskStatusKey = keyof typeof TaskStatus;

export interface Task extends BaseEntity {
  name: string;
  description: string;
  status: TaskStatusKey;
  taskAssignments: TaskAssignment[];
  dueDate: Date;
  expectedHours: number;
  blockedBy: Task[];
  blocking: Task[];
  isEditing?: boolean;
}

export interface TaskAssignment extends BaseEntity {
  taskId: string;
  userId: string;
  user: User;
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

export const TASK_STATUS_OPTIONS = [
  { value: "TODO", label: "To Do" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "REVIEW", label: "Review" },
  { value: "DONE", label: "Done" },
];

export interface ExtendedTask extends Task {
  assignedUsers?: string[];
  isNew?: boolean;
}

export interface TaskColumnProps {
  status: TaskStatusKey;
  tasks: Task[];
  config: typeof statusConfig;
  onMoveTask: (task: Task, status: TaskStatusKey) => void;
  onDeleteTask: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onAddTask: () => void;
  isAddingAllowed: boolean;
  isAddingActive: boolean;
  children?: React.ReactNode;
}

export interface TaskFormProps {
  task: ExtendedTask;
  onSubmit: () => void;
  onCancel: () => void;
  users: User[];
  mode: "create" | "edit";
  config?: typeof statusConfig;
}

export interface TaskCardProps {
  task: Task;
  config: typeof statusConfig;
  onMove: (newStatus: TaskStatusKey) => void;
  onDelete: () => void;
  onEdit: () => void;
  isDisabled?: boolean;
}

export interface TaskManagerContextType {
  tasks: ExtendedTask[];
  editingTask: ExtendedTask | null;
  isLoading: boolean;
  userSearchQuery: string;
  blockingTaskSearchQuery: string;
  users: User[];
  setUserSearchQuery: (query: string) => void;
  setBlockingTaskSearchQuery: (query: string) => void;
  toggleUserSelection: (userId: string) => void;
  toggleTaskSelection: (task: Task) => void;
  startEditing: (task: ExtendedTask) => void;
  cancelEditing: () => void;
  handleSaveEditing: () => void;
  updateEditingTask: <K extends keyof ExtendedTask>(
    field: K,
    value: ExtendedTask[K] | undefined,
  ) => void;
  toggleTaskCompletion: (task: Task) => void;
  moveTask: (task: Task, newStatus: TaskStatusKey) => void;
  deleteTask: (taskId: string) => void;
  addNewTask: () => void;
}
