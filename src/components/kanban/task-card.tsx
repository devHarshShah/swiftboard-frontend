import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Trash2, Move, MoreVertical, AlertCircleIcon } from "lucide-react";
import { Label } from "@/src/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/src/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { cn } from "@/src/lib/utils";
import {
  Task,
  TaskStatus,
  TaskStatusKey,
  statusConfig,
  User,
} from "@/src/types/types";

interface TaskCardProps {
  task: Task;
  config: typeof statusConfig;
  onMove: (newStatus: TaskStatusKey) => void;
  onDelete: () => void;
  onEdit: () => void;
  isDisabled?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  config,
  onMove,
  onDelete,
  onEdit,
}) => {
  const getUsernameFromEmail = (user: User) => {
    const username = user.name
      ? user.name.replace(/\s+/g, "").toLowerCase()
      : user.email.split("@")[0];
    return `@${username}`;
  };

  return (
    <TooltipProvider>
      <Card
        onDoubleClick={onEdit}
        className={cn(
          "border transition-all duration-200 ease-in-out",
          config[task.status].borderColor,
          "bg-card dark:bg-card/50 shadow-sm hover:shadow-md",
          task.blockedBy?.length > 0 && "border-destructive/50",
        )}
      >
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold text-foreground truncate max-w-[80%]">
              {task.name}
            </CardTitle>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-foreground"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {Object.values(TaskStatus)
                  .filter((s) => s !== task.status)
                  .map((newStatus) => (
                    <DropdownMenuItem
                      key={newStatus}
                      onSelect={() => onMove(newStatus as TaskStatusKey)}
                      className="cursor-pointer"
                    >
                      <Move className="mr-2 h-4 w-4" />
                      Move to {TaskStatus[newStatus]}
                    </DropdownMenuItem>
                  ))}
                <DropdownMenuItem
                  onSelect={onDelete}
                  className="text-destructive cursor-pointer focus:bg-destructive/10"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {task.description && (
            <p className="text-sm text-muted-foreground mb-3">
              {task.description}
            </p>
          )}

          {task.dueDate && (
            <div className="flex items-center text-sm mb-3">
              <Label className="mr-2">Due Date</Label>
              <span className="font-medium text-muted-foreground">
                {new Date(task.dueDate).toLocaleString()}
              </span>
            </div>
          )}

          {task.taskAssignments.length > 0 && (
            <div className="flex items-center text-sm mb-3 flex-wrap gap-2">
              <span className="font-medium text-foreground mr-2">
                Assigned To
              </span>
              <div className="flex flex-wrap gap-2">
                {task.taskAssignments.map((assignment) => (
                  <Tooltip key={assignment.id}>
                    <TooltipTrigger asChild>
                      <div className="inline-flex items-center bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full text-xs font-medium cursor-default">
                        {getUsernameFromEmail(assignment.user)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{assignment.user.email}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          )}

          {task.blockedBy && task.blockedBy.length > 0 && (
            <div className="flex items-center text-sm mb-3 flex-wrap gap-2 text-destructive">
              <div className="flex items-center">
                <AlertCircleIcon className="h-4 w-4 mr-2" />
                <span className="font-medium mr-2">Blocked By</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {task.blockedBy.map((blockerTask) => (
                  <Tooltip key={blockerTask.id}>
                    <TooltipTrigger asChild>
                      <div className="inline-flex items-center bg-destructive/10 text-destructive px-2.5 py-1 rounded-full text-xs font-medium cursor-default">
                        #{blockerTask.name}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{blockerTask.name}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          )}

          {task.blocking && task.blocking.length > 0 && (
            <div className="flex items-center text-sm mb-3 flex-wrap gap-2 text-warning">
              <div className="flex items-center">
                <AlertCircleIcon className="h-4 w-4 mr-2" />
                <span className="font-medium mr-2">Blocking</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {task.blocking.map((blockedTask) => (
                  <Tooltip key={blockedTask.id}>
                    <TooltipTrigger asChild>
                      <div className="inline-flex items-center bg-warning/10 text-warning px-2.5 py-1 rounded-full text-xs font-medium cursor-default">
                        #{blockedTask.name}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">{blockedTask.name}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
