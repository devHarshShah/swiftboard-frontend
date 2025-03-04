"use client";
import React, { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Move, MoreVertical } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
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
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const projectId = Cookies.get("activeProjectId");
  const teamId = Cookies.get("activeTeamId");

  // Status configuration with theme-aware styling
  const statusConfig = {
    [TaskStatus.TODO]: {
      label: "To Do",
      bgColor: "bg-chart-1/10 dark:bg-chart-1/20",
      textColor: "text-chart-1 dark:text-chart-1",
      borderColor: "border-chart-1/30 dark:border-chart-1/40",
      hoverColor: "hover:bg-chart-1/20 dark:hover:bg-chart-1/30",
    },
    [TaskStatus.IN_PROGRESS]: {
      label: "In Progress",
      bgColor: "bg-chart-3/10 dark:bg-chart-3/20",
      textColor: "text-chart-3 dark:text-chart-3",
      borderColor: "border-chart-3/30 dark:border-chart-3/40",
      hoverColor: "hover:bg-chart-3/20 dark:hover:bg-chart-3/30",
    },
    [TaskStatus.DONE]: {
      label: "Completed",
      bgColor: "bg-chart-5/10 dark:bg-chart-5/20",
      textColor: "text-chart-5 dark:text-chart-5",
      borderColor: "border-chart-5/30 dark:border-chart-5/40",
      hoverColor: "hover:bg-chart-5/20 dark:hover:bg-chart-5/30",
    },
  };

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
          userIds: newTask.userIds || [], // Send selected user IDs
        }),
      });

      fetchTasks(); // Refresh tasks
      setNewTask({ name: "", description: "", userIds: [] });
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
            <Card
              key={task.id}
              className={cn(
                "border transition-all duration-200 ease-in-out",
                config.borderColor,
                config.hoverColor,
                "bg-card dark:bg-card/50",
              )}
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-medium text-foreground">
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
              <CardContent className="p-4 pt-0 text-sm text-muted-foreground">
                {task.description}
                <div className="mt-2">
                  <strong>Assigned to:</strong>
                  <ul className="list-disc list-inside">
                    {task.taskAssignments.map((assignment) => (
                      <li key={assignment.id}>
                        {assignment.user.name} ({assignment.user.email})
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
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
