"use client";
import React, { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  Move,
  MoreVertical,
  AlertCircleIcon,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { apiClient } from "@/lib/apiClient";
import { cn } from "@/lib/utils";

import {
  Task,
  TaskStatus,
  TaskStatusKey,
  User,
  NewTaskData,
  GroupedTasks,
  statusConfig,
} from "@/app/types/kanban.types";

const KanbanBoard: React.FC = () => {
  const [tasks, setTasks] = useState<GroupedTasks>({
    [TaskStatus.TODO]: [],
    [TaskStatus.IN_PROGRESS]: [],
    [TaskStatus.DONE]: [],
  });
  const [newTask, setNewTask] = useState<NewTaskData>({
    name: "",
    description: "",
    userIds: [],
    blockedBy: [],
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const projectId = Cookies.get("activeProjectId");
  const teamId = Cookies.get("activeTeamId");

  const fetchUsers = useCallback(async () => {
    if (!teamId) return;

    try {
      const response = await apiClient(`/api/teams/${teamId}/members`);
      const userData = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const users = userData.map((member: any) => member.user); // Extract only the user data
      setUsers(users);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  }, [teamId]);

  // Fetch tasks for the project
  const fetchTasks = useCallback(async () => {
    if (!projectId) return;

    try {
      const response = await apiClient(`/api/project/${projectId}/tasks`);
      const data: Task[] = await response.json();

      // Group tasks by status
      const groupedTasks = data.reduce(
        (acc, task) => {
          acc[task.status] = [...(acc[task.status] || []), task];
          return acc;
        },
        {
          [TaskStatus.TODO]: [],
          [TaskStatus.IN_PROGRESS]: [],
          [TaskStatus.DONE]: [],
        } as GroupedTasks,
      );

      setTasks(groupedTasks);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    }
  }, [projectId]);

  const getUsernameFromEmail = (user: User) => {
    const username = user.name
      ? user.name.replace(/\s+/g, "").toLowerCase()
      : user.email.split("@")[0];
    return `@${username}`;
  };

  // Create a new task
  const createTask = async () => {
    if (!newTask.name.trim() || !projectId) return;

    try {
      await apiClient(`/api/project/${projectId}/tasks`, {
        method: "POST",
        body: JSON.stringify({
          name: newTask.name,
          description: newTask.description,
          status: TaskStatus.TODO,
          assignedUserIds: newTask.userIds || [], // Send selected user IDs
          blockedTaskIds: newTask.blockedBy.map((task) => task.id), // Send blocked task IDs
        }),
      });

      fetchTasks(); // Refresh tasks
      setNewTask({ name: "", description: "", userIds: [], blockedBy: [] });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to create task", error);
    }
  };

  // Move task between columns
  const moveTask = async (task: Task, newStatus: TaskStatusKey) => {
    if (!projectId) return;

    try {
      await apiClient(`/api/project/${projectId}/tasks/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: newStatus,
        }),
      });
      fetchTasks(); // Refresh tasks
    } catch (error) {
      console.error("Failed to move task", error);
    }
  };

  // Delete a task
  const deleteTask = async (taskId: string) => {
    if (!projectId) return;

    try {
      await apiClient(`/api/project/${projectId}/tasks/${taskId}`, {
        method: "DELETE",
      });
      fetchTasks(); // Refresh tasks
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setNewTask((prev) => {
      const currentUserIds = prev.userIds || [];
      const updatedUserIds = currentUserIds.includes(userId)
        ? currentUserIds.filter((id) => id !== userId)
        : [...currentUserIds, userId];

      return {
        ...prev,
        userIds: updatedUserIds,
      };
    });
  };

  const toggleTaskSelection = (taskId: string) => {
    setNewTask((prev) => {
      const currentBlockedBy = prev.blockedBy || [];
      const updatedBlockedBy = currentBlockedBy.some(
        (task) => task.id === taskId,
      )
        ? currentBlockedBy.filter((task) => task.id !== taskId)
        : [
            ...currentBlockedBy,
            tasks[TaskStatus.TODO].find((task) => task.id === taskId)!,
          ];

      return {
        ...prev,
        blockedBy: updatedBlockedBy,
      };
    });
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [fetchTasks, fetchUsers]);

  // Render column for a specific status
  const renderColumn = (status: TaskStatusKey) => {
    const config = statusConfig[status];

    return (
      <div
        key={status}
        className={cn(
          config.bgColor,
          "rounded-xl p-4 w-full shadow-sm space-y-3 relative border",
          config.borderColor,
        )}
      >
        <div className="flex justify-between items-center mb-4">
          <h3
            className={cn(
              config.textColor,
              "font-semibold text-lg tracking-tight",
            )}
          >
            {config.label}
          </h3>
          {status === TaskStatus.TODO && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDialogOpen(true)}
              className={cn(
                config.textColor,
                "hover:bg-secondary dark:hover:bg-secondary/30",
              )}
            >
              <Plus className="h-5 w-5" />
            </Button>
          )}
        </div>

        <div className="space-y-3 overflow-y-auto scrollbar-custom">
          {tasks[status].map((task) => (
            <TooltipProvider key={task.id}>
              <Card
                className={cn(
                  "border transition-all duration-200 ease-in-out",
                  config.borderColor,
                  config.hoverColor,
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
                              onSelect={() =>
                                moveTask(task, newStatus as TaskStatusKey)
                              }
                              className="cursor-pointer"
                            >
                              <Move className="mr-2 h-4 w-4" />
                              Move to {statusConfig[newStatus].label}
                            </DropdownMenuItem>
                          ))}
                        <DropdownMenuItem
                          onSelect={() => deleteTask(task.id)}
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
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-3 gap-6 p-6 bg-background">
      {Object.values(TaskStatus).map((status) => renderColumn(status))}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>
              Add a new task to your project board
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Title
              </Label>
              <Input
                id="name"
                value={newTask.name}
                onChange={(e) =>
                  setNewTask((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Enter task name"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Add task details"
                className="col-span-3 min-h-[100px]"
              />
            </div>

            {/* New User Assignment Section */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Assign Users</Label>
              <div className="col-span-3 space-y-2">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`user-${user.id}`}
                      checked={newTask.userIds?.includes(user.id)}
                      onCheckedChange={() => toggleUserSelection(user.id)}
                    />
                    <Label
                      htmlFor={`user-${user.id}`}
                      className="text-sm font-normal"
                    >
                      {user.name} ({user.email})
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Blocked By: </Label>
              <div className="col-span-3 space-y-2">
                {tasks["TODO"].map((task: Task) => (
                  <div key={task.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`task-${task.id}`}
                      checked={newTask.blockedBy.some((t) => t.id === task.id)}
                      onCheckedChange={() => toggleTaskSelection(task.id)}
                    />
                    <Label
                      htmlFor={`task-${task.id}`}
                      className="text-sm font-normal"
                    >
                      {task.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Button
            onClick={createTask}
            disabled={!newTask.name.trim()}
            className="w-full"
          >
            Create Task
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KanbanBoard;
