import React from "react";
import { Button } from "@/src/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { TaskCard } from "./task-card";
import { Task, TaskStatusKey, statusConfig } from "@/src/types/types";
import { useTaskManager } from "@/src/contexts/task-context";

interface TaskColumnProps {
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

export const TaskColumn: React.FC<TaskColumnProps> = ({
  status,
  tasks,
  config,
  onMoveTask,
  onDeleteTask,
  onEditTask,
  onAddTask,
  isAddingAllowed,
  isAddingActive, // New prop to better control UI state
  children,
}) => {
  const { editingTask } = useTaskManager();

  // Status count - only count non-new tasks for display
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const taskCount = tasks.filter((task) => !(task as any).isNew).length;

  return (
    <div
      className={cn(
        config[status].bgColor,
        "rounded-xl p-4 w-full shadow-sm flex flex-col border h-full",
        config[status].borderColor,
      )}
    >
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h3
          className={cn(
            config[status].textColor,
            "font-semibold text-lg tracking-tight",
          )}
        >
          {config[status].label} ({taskCount})
        </h3>
        {isAddingAllowed && !isAddingActive && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onAddTask}
            className={cn(
              config[status].textColor,
              "hover:bg-secondary dark:hover:bg-secondary/30",
              // Disable button if currently editing another task
              editingTask && !editingTask.isNew
                ? "opacity-50 cursor-not-allowed"
                : "",
            )}
            disabled={!!editingTask && !editingTask.isNew}
          >
            <Plus className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="space-y-3 overflow-y-auto scrollbar-custom flex-grow pr-1 max-h-[calc(100vh-220px)]">
        {/* Task Form - Render at the top of the column */}
        {children}

        {/* Task Cards */}
        {tasks
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((task) => !(task as any).isNew) // Filter out new tasks as they appear in the form
          .map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              config={config}
              onMove={(newStatus) => onMoveTask(task, newStatus)}
              onDelete={() => onDeleteTask(task.id)}
              onEdit={() => onEditTask(task)}
              isDisabled={!!editingTask} // Disable interaction when editing
            />
          ))}

        {tasks.length === 0 && !isAddingActive && (
          <div className="flex items-center justify-center h-20 border border-dashed rounded-md border-gray-300 text-gray-500 text-sm">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
};
