"use client";
import { ExtendedTask } from "@/src/types";
import { Badge } from "@/src/components/ui/badge";

export function TaskBlockingCell({ task }: { task: ExtendedTask }) {
  const blocking = task.blocking || [];

  if (blocking.length === 0) {
    return (
      <span className="px-2 text-sm text-muted-foreground italic">
        Not blocking
      </span>
    );
  }

  return (
    <div className="px-2 flex flex-col gap-1">
      {blocking.map((blockedTask) => (
        <Badge
          key={blockedTask.id}
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          <span className="text-xs truncate max-w-[120px]">
            {blockedTask.name}
          </span>
        </Badge>
      ))}
    </div>
  );
}
