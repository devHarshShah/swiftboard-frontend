import React from "react";
import { Button } from "@/src/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Task } from "@/src/types/types";

interface TaskSelectorProps {
  tasks: Task[];
  selectedTasks: Task[];
  onToggleTask: (taskId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const TaskSelector: React.FC<TaskSelectorProps> = ({
  tasks,
  selectedTasks,
  onToggleTask,
  searchQuery,
  setSearchQuery,
}) => {
  const filteredTasks = tasks.filter((task) => {
    return task.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const isSelected = (taskId: string) => {
    return selectedTasks.some((task) => task.id === taskId);
  };

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <Search className="mr-2 h-4 w-4" />
            Select Blocking Tasks
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-4" side="right" align="start">
          <div className="space-y-4">
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />

            {filteredTasks.length === 0 ? (
              <div className="text-center text-muted-foreground">
                No results found
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center space-x-2 hover:bg-accent hover:text-accent-foreground p-2 rounded"
                  >
                    <Checkbox
                      checked={isSelected(task.id)}
                      onCheckedChange={() => onToggleTask(task.id)}
                      id={`task-${task.id}`}
                    />
                    <label
                      htmlFor={`task-${task.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {task.name}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {/* Display selected tasks */}
      {selectedTasks.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedTasks.map((task) => (
            <div
              key={task.id}
              className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs"
            >
              {task.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
