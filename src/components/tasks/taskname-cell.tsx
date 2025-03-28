"use client";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Input } from "@/src/components/ui/input";
import { ExtendedTask } from "@/src/types/types";
import { useTaskManager } from "@/src/contexts/task-context";

export function TaskNameCell({ task }: { task: ExtendedTask }) {
  const { toggleTaskCompletion, startEditing, updateEditingTask } =
    useTaskManager();

  if (task.isEditing) {
    return (
      <div className="flex items-center px-2">
        <Checkbox
          checked={task.status === "DONE"}
          onCheckedChange={() =>
            updateEditingTask(
              "status",
              task.status === "DONE" ? "TODO" : "DONE",
            )
          }
          className="mr-2"
        />
        <Input
          value={task.name}
          onChange={(e) => updateEditingTask("name", e.target.value)}
          className="w-full"
          placeholder="Enter task name"
          autoFocus
        />
      </div>
    );
  }

  return (
    <div
      className="flex items-center space-x-2 px-2"
      onDoubleClick={() => startEditing(task)}
    >
      <Checkbox
        checked={task.status === "DONE"}
        onCheckedChange={() => toggleTaskCompletion(task)}
        className="mr-2"
      />
      <span
        className={`font-medium ${task.status === "DONE" ? "line-through text-gray-500" : ""}`}
      >
        {task.name}
      </span>
    </div>
  );
}
