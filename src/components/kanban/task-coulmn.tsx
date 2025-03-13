import React from "react";
import { Button } from "@/src/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { TaskCard } from "./task-card";
import { Task, TaskStatusKey, statusConfig } from "@/src/types/types";

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
  children,
}) => {
  return (
    <div
      className={cn(
        config[status].bgColor,
        "rounded-xl p-4 w-full shadow-sm space-y-3 relative border",
        config[status].borderColor,
      )}
    >
      <div className="flex justify-between items-center mb-4">
        <h3
          className={cn(
            config[status].textColor,
            "font-semibold text-lg tracking-tight",
          )}
        >
          {config[status].label}
        </h3>
        {isAddingAllowed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onAddTask}
            className={cn(
              config[status].textColor,
              "hover:bg-secondary dark:hover:bg-secondary/30",
            )}
          >
            <Plus className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="space-y-3 overflow-y-auto scrollbar-custom">
        {children}

        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            config={config}
            onMove={(newStatus) => onMoveTask(task, newStatus)}
            onDelete={() => onDeleteTask(task.id)}
            onEdit={() => onEditTask(task)}
          />
        ))}
      </div>
    </div>
  );
};
