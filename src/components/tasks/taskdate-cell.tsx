"use client";
import { format } from "date-fns";
import { useTaskManager } from "@/src/contexts/task-context";
import { ExtendedTask } from "@/src/types";
import { Calendar } from "@/src/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { CalendarIcon } from "lucide-react";

export function TaskDueDateCell({ task }: { task: ExtendedTask }) {
  const { updateEditingTask } = useTaskManager();

  if (task.isEditing) {
    return (
      <div className="px-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !task.dueDate && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {task.dueDate ? (
                format(new Date(task.dueDate), "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={task.dueDate ? new Date(task.dueDate) : undefined}
              onSelect={(date) =>
                updateEditingTask("dueDate", date ? new Date(date) : undefined)
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const now = new Date();
  const isPastDue = dueDate && dueDate < now && task.status !== "DONE";

  return (
    <div className="px-2">
      {dueDate ? (
        <span
          className={cn("text-sm", isPastDue && "text-red-500 font-medium")}
        >
          {format(dueDate, "MMM d, yyyy")}
          {isPastDue && " (overdue)"}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground italic">
          No due date
        </span>
      )}
    </div>
  );
}
