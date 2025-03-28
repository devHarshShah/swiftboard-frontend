"use client";
import { ExtendedTask } from "@/src/types/types";
import { Badge } from "@/src/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { TaskBlockingSection } from "./task-blocking";

export function TaskBlockedByCell({ task }: { task: ExtendedTask }) {
  if (task.isEditing) {
    return (
      <div className="px-2 py-1">
        <TaskBlockingSection />
      </div>
    );
  }

  const blockedBy = task.blockedBy || [];

  if (blockedBy.length === 0) {
    return (
      <span className="px-2 text-sm text-muted-foreground italic">
        Not blocked
      </span>
    );
  }

  return (
    <div className="px-2 flex flex-col gap-1">
      {blockedBy.map((blocker) => (
        <Badge
          key={blocker.id}
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200"
        >
          <AlertCircle className="h-3 w-3 mr-1" />
          <span className="text-xs truncate max-w-[120px]">{blocker.name}</span>
        </Badge>
      ))}
    </div>
  );
}
