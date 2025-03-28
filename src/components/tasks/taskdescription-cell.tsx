"use client";
import { Textarea } from "@/src/components/ui/textarea";
import { ExtendedTask } from "@/src/types/types";
import { useTaskManager } from "@/src/contexts/task-context";

export function TaskDescriptionCell({ task }: { task: ExtendedTask }) {
  const { updateEditingTask } = useTaskManager();

  if (task.isEditing) {
    return (
      <div className="px-2">
        <Textarea
          value={task.description || ""}
          onChange={(e) => updateEditingTask("description", e.target.value)}
          className="w-full min-h-[80px]"
          placeholder="Add a description"
        />
      </div>
    );
  }

  return (
    <div className="px-2 max-w-[250px]">
      {task.description ? (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {task.description}
        </p>
      ) : (
        <p className="text-sm italic text-muted-foreground">No description</p>
      )}
    </div>
  );
}
