"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { ExtendedTask, TASK_STATUS_OPTIONS } from "@/src/types/types";
import { useTaskManager } from "@/src/contexts/task-context";
import { Badge } from "@/src/components/ui/badge";

export function TaskStatusCell({ task }: { task: ExtendedTask }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { moveTask, updateEditingTask } = useTaskManager();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "TODO":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "REVIEW":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "DONE":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    return (
      TASK_STATUS_OPTIONS.find((option) => option.value === status)?.label ||
      status
    );
  };

  if (task.isEditing) {
    return (
      <div className="px-2">
        <Select
          value={task.status}
          onValueChange={(value) => updateEditingTask("status", value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {TASK_STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div className="px-2">
      <Badge variant="outline" className={`${getStatusColor(task.status)}`}>
        {getStatusLabel(task.status)}
      </Badge>
    </div>
  );
}
