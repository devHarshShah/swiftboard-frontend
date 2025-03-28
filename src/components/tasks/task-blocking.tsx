"use client";
import { useTaskManager } from "@/src/contexts/task-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Button } from "@/src/components/ui/button";
import { Search, AlertCircle, X } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Badge } from "@/src/components/ui/badge";

export function TaskBlockingSection() {
  const {
    editingTask,
    tasks,
    blockingTaskSearchQuery,
    setBlockingTaskSearchQuery,
    toggleTaskSelection,
  } = useTaskManager();

  if (!editingTask) return null;

  const otherTasks = tasks.filter((t) => t.id !== editingTask.id);
  const selectedTasks = editingTask.blockedBy || [];

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-wrap gap-1 mb-1">
        {selectedTasks.length > 0 ? (
          <div className="w-full space-y-1">
            {selectedTasks.map((blockerTask) => (
              <div key={blockerTask.id} className="flex items-center gap-1">
                <Badge
                  variant="outline"
                  className="bg-red-50 text-red-700 border-red-200 px-2 py-1 hover:bg-red-100 transition-colors"
                >
                  <div className="flex items-center text-left">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    <span className="text-xs truncate max-w-[150px]">
                      {blockerTask.name}
                    </span>
                  </div>
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 rounded-full hover:bg-red-100 hover:text-red-700"
                  onClick={() => toggleTaskSelection(blockerTask)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-sm text-gray-500 italic">
            No blocking tasks
          </span>
        )}
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-sm h-8"
          >
            <Search className="mr-2 h-3 w-3" />
            Select Blocking Tasks
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-3" side="right" align="start">
          <div className="space-y-4">
            <Input
              placeholder="Search tasks..."
              value={blockingTaskSearchQuery}
              onChange={(e) => setBlockingTaskSearchQuery(e.target.value)}
              className="w-full h-8 text-sm"
            />

            {otherTasks.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm">
                No other tasks found
              </div>
            ) : (
              <div className="max-h-[250px] overflow-y-auto space-y-1">
                {otherTasks
                  .filter((task) =>
                    task.name
                      .toLowerCase()
                      .includes(blockingTaskSearchQuery.toLowerCase()),
                  )
                  .map((task) => {
                    const isSelected = selectedTasks.some(
                      (t) => t.id === task.id,
                    );

                    return (
                      <div
                        key={task.id}
                        className="flex items-center space-x-2 hover:bg-accent hover:text-accent-foreground p-1.5 rounded text-sm"
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleTaskSelection(task)}
                          id={`task-${task.id}`}
                        />
                        <label
                          htmlFor={`task-${task.id}`}
                          className="text-sm font-medium leading-none truncate flex-1 cursor-pointer"
                        >
                          {task.name}
                        </label>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
