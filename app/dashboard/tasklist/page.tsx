"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import Cookies from "js-cookie";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowUpDown,
  Plus,
  AlertCircleIcon,
  MoreHorizontal,
  Edit,
  Trash2,
  Check,
  X,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { apiClient } from "@/lib/apiClient";
import {
  Task,
  TaskStatusKey,
  statusConfig,
  User,
} from "@/app/types/kanban.types";

// Extended type to include additional properties for table rendering
interface ExtendedTask extends Task {
  assignedUsers?: string[];
  description: string;
  isEditing?: boolean;
  isNew?: boolean;
}

const TaskListPage: React.FC = () => {
  const [tasks, setTasks] = useState<ExtendedTask[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [editingTask, setEditingTask] = useState<ExtendedTask | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [blockingTaskSearchQuery, setBlockingTaskSearchQuery] = useState("");
  const projectId = Cookies.get("activeProjectId");
  const teamId = Cookies.get("activeTeamId");

  // Fetch users for the team
  const fetchUsers = useCallback(async () => {
    if (!teamId) return;

    try {
      const response = await apiClient(`/api/teams/${teamId}/members`);
      const userData = await response.json();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const users = userData.map((member: any) => member.user);
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

      // Transform tasks to include additional properties if needed
      const extendedTasks = data.map((task) => ({
        ...task,
        assignedUsers: task.taskAssignments.map(
          (assignment) =>
            assignment.user.name || assignment.user.email.split("@")[0],
        ),
        description: task.description ?? "",
        isEditing: false,
      }));

      setTasks(extendedTasks);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [projectId, fetchTasks, fetchUsers]);

  // Add a new empty task for editing
  const addNewTask = useCallback(() => {
    const newTask: ExtendedTask = {
      id: `new-${Date.now()}`,
      name: "",
      description: "",
      status: "TODO",
      taskAssignments: [],
      blockedBy: [],
      blocking: [],
      isEditing: true,
      isNew: true,
    };

    setTasks((prevTasks) => [newTask, ...prevTasks]);
    setEditingTask(newTask);
  }, []);

  // Toggle user assignment selection
  const toggleUserSelection = useCallback(
    (userId: string) => {
      if (!editingTask) return;

      const isCurrentlyAssigned = editingTask.taskAssignments.some(
        (a) => a.user.id === userId,
      );

      const updatedAssignments = isCurrentlyAssigned
        ? editingTask.taskAssignments.filter((a) => a.user.id !== userId)
        : [
            ...editingTask.taskAssignments,
            {
              id: `temp-${userId}`,
              user: users.find((u) => u.id === userId)!,
              taskId: editingTask.id,
              userId: userId,
            },
          ];

      setEditingTask({
        ...editingTask,
        taskAssignments: updatedAssignments,
      });

      // Also update in the tasks array
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === editingTask.id
            ? { ...t, taskAssignments: updatedAssignments }
            : t,
        ),
      );
    },
    [editingTask, users],
  );

  // Toggle task blocking selection
  const toggleTaskSelection = useCallback(
    (task: Task) => {
      if (!editingTask) return;

      const isCurrentlyBlocking = editingTask.blockedBy?.some(
        (t) => t.id === task.id,
      );

      const updatedBlockedBy = isCurrentlyBlocking
        ? (editingTask.blockedBy || []).filter((t) => t.id !== task.id)
        : [...(editingTask.blockedBy || []), task];

      setEditingTask({
        ...editingTask,
        blockedBy: updatedBlockedBy,
      });

      // Also update in the tasks array
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === editingTask.id ? { ...t, blockedBy: updatedBlockedBy } : t,
        ),
      );
    },
    [editingTask],
  );

  // Save a task (new or existing)
  const saveTask = useCallback(
    async (task: ExtendedTask) => {
      if (!projectId) return;

      try {
        const isNew = task.isNew;
        const method = isNew ? "POST" : "PUT";
        const endpoint = isNew
          ? `/api/project/${projectId}/tasks`
          : `/api/project/${projectId}/tasks/${task.id}`;

        // Prepare the data to send
        const taskData = {
          name: task.name,
          description: task.description,
          status: task.status,
          assignedUserIds: task.taskAssignments.map((a) => a.user.id),
          blockedTaskIds: task.blockedBy?.map((task) => task.id) || [],
        };

        await apiClient(endpoint, {
          method,
          body: JSON.stringify(taskData),
        });

        // Refresh tasks to get the updated list
        fetchTasks();
      } catch (error) {
        console.error("Failed to save task", error);
      }
    },
    [projectId, fetchTasks],
  );

  // Move task to a new status
  const moveTask = useCallback(
    async (task: Task, newStatus: TaskStatusKey) => {
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
    },
    [projectId, fetchTasks],
  );

  // Toggle task completion
  const toggleTaskCompletion = useCallback(
    async (task: Task) => {
      const newStatus = task.status === "DONE" ? "TODO" : "DONE";
      await moveTask(task, newStatus);
    },
    [moveTask],
  );

  // Delete a task
  const deleteTask = useCallback(
    async (taskId: string) => {
      if (!projectId || taskId.startsWith("new-")) {
        // If it's a new unsaved task, just remove it from state
        if (taskId.startsWith("new-")) {
          setTasks((prevTasks) => prevTasks.filter((t) => t.id !== taskId));
          setEditingTask(null);
          return;
        }
        return;
      }

      try {
        await apiClient(`/api/project/${projectId}/tasks/${taskId}`, {
          method: "DELETE",
        });
        fetchTasks(); // Refresh tasks
      } catch (error) {
        console.error("Failed to delete task", error);
      }
    },
    [projectId, fetchTasks],
  );

  // Cancel editing
  const cancelEditing = useCallback(() => {
    // If we're editing a new task, remove it
    if (editingTask?.isNew) {
      setTasks((prevTasks) => prevTasks.filter((t) => t.id !== editingTask.id));
    } else if (editingTask) {
      // Otherwise just stop editing
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === editingTask.id ? { ...t, isEditing: false } : t,
        ),
      );
    }

    setEditingTask(null);
    setUserSearchQuery("");
    setBlockingTaskSearchQuery("");
  }, [editingTask]);

  // Start editing a task
  const startEditing = useCallback(
    (task: ExtendedTask) => {
      // Make sure we're not already editing another task
      if (editingTask && editingTask.id !== task.id) {
        cancelEditing();
      }

      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === task.id ? { ...t, isEditing: true } : t,
        ),
      );

      setEditingTask(task);
    },
    [editingTask, cancelEditing],
  );

  // Handle saving the currently edited task
  const handleSaveEditing = useCallback(() => {
    if (!editingTask) return;

    // Validate required fields
    if (!editingTask.name.trim()) {
      alert("Task name is required");
      return;
    }

    // Save the task
    saveTask(editingTask);

    // Update local state to reflect changes immediately
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t.id === editingTask.id
          ? { ...editingTask, isEditing: false, isNew: false }
          : t,
      ),
    );

    setEditingTask(null);
    setUserSearchQuery("");
    setBlockingTaskSearchQuery("");
  }, [editingTask, saveTask]);

  // Update task field in edit mode
  const updateEditingTask = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (field: string, value: any) => {
      if (!editingTask) return;

      setEditingTask((prev) => (prev ? { ...prev, [field]: value } : null));

      // Also update in the tasks array
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === editingTask.id ? { ...t, [field]: value } : t,
        ),
      );
    },
    [editingTask],
  );

  // Render user assignment popover

  const renderUserAssignmentSection = useCallback(() => {
    if (!editingTask) return null;

    const selectedUsers = editingTask.taskAssignments.map((a) => a.user);

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <Search className="mr-2 h-4 w-4" />
            Assign Users
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-4" side="right" align="start">
          <div className="space-y-4">
            <Input
              placeholder="Search users..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="w-full"
            />

            {users.length === 0 ? (
              <div className="text-center text-muted-foreground">
                No users found
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {users
                  .filter(
                    (user) =>
                      user.name
                        ?.toLowerCase()
                        .includes(userSearchQuery.toLowerCase()) ||
                      user.email
                        .toLowerCase()
                        .includes(userSearchQuery.toLowerCase()),
                  )
                  .map((user) => {
                    const isSelected = selectedUsers.some(
                      (u) => u.id === user.id,
                    );

                    return (
                      <div
                        key={user.id}
                        className="flex items-center space-x-2 hover:bg-accent hover:text-accent-foreground p-2 rounded"
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleUserSelection(user.id)}
                          id={`user-${user.id}`}
                        />
                        <label
                          htmlFor={`user-${user.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {user.name || user.email}
                        </label>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  }, [toggleUserSelection, users, editingTask, userSearchQuery]);

  // Render task blocking popover
  const renderTaskBlockingSection = useCallback(() => {
    if (!editingTask) return null;

    const otherTasks = tasks.filter((t) => t.id !== editingTask.id);
    const selectedTasks = editingTask.blockedBy || [];

    return (
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
              value={blockingTaskSearchQuery}
              onChange={(e) => setBlockingTaskSearchQuery(e.target.value)}
              className="w-full"
            />

            {otherTasks.length === 0 ? (
              <div className="text-center text-muted-foreground">
                No other tasks found
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto space-y-2">
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
                        className="flex items-center space-x-2 hover:bg-accent hover:text-accent-foreground p-2 rounded"
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleTaskSelection(task)}
                          id={`task-${task.id}`}
                        />
                        <label
                          htmlFor={`task-${task.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
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
    );
  }, [editingTask, tasks, blockingTaskSearchQuery, toggleTaskSelection]);

  const columns: ColumnDef<ExtendedTask>[] = useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <Button variant="ghost" onClick={column.getToggleSortingHandler()}>
            Task
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const task = row.original;

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
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => {
          const task = row.original;

          if (task.isEditing) {
            return (
              <Textarea
                value={task.description}
                onChange={(e) =>
                  updateEditingTask("description", e.target.value)
                }
                className="w-full resize-none h-10"
                placeholder="Enter description"
              />
            );
          }

          return (
            <div
              className="text-sm max-w-sm line-clamp-2"
              onDoubleClick={() => startEditing(task)}
            >
              {task.description || "No description"}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const task = row.original;
          const status = row.getValue("status") as TaskStatusKey;
          const config = statusConfig[status];

          if (task.isEditing) {
            return (
              <Select
                value={task.status}
                onValueChange={(newStatus: TaskStatusKey) =>
                  updateEditingTask("status", newStatus)
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue>
                    <Badge
                      variant="outline"
                      className={`${statusConfig[task.status as TaskStatusKey].textColor} ${statusConfig[task.status as TaskStatusKey].borderColor} bg-transparent`}
                    >
                      {statusConfig[task.status as TaskStatusKey].label}
                    </Badge>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(statusConfig).map((key) => {
                    const statusKey = key as TaskStatusKey;
                    const statusCfg = statusConfig[statusKey];
                    return (
                      <SelectItem key={key} value={statusKey}>
                        <Badge
                          variant="outline"
                          className={`${statusCfg.textColor} ${statusCfg.borderColor} bg-transparent`}
                        >
                          {statusCfg.label}
                        </Badge>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            );
          }

          return (
            <Select
              value={status}
              onValueChange={(newStatus: TaskStatusKey) =>
                moveTask(task, newStatus)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue>
                  <Badge
                    variant="outline"
                    className={`${config.textColor} ${config.borderColor} bg-transparent`}
                  >
                    {config.label}
                  </Badge>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {Object.keys(statusConfig).map((key) => {
                  const statusKey = key as TaskStatusKey;
                  const statusCfg = statusConfig[statusKey];
                  return (
                    <SelectItem key={key} value={statusKey}>
                      <Badge
                        variant="outline"
                        className={`${statusCfg.textColor} ${statusCfg.borderColor} bg-transparent`}
                      >
                        {statusCfg.label}
                      </Badge>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          );
        },
      },
      {
        accessorKey: "assignedUsers",
        header: "Assigned To",
        cell: ({ row }) => {
          const task = row.original;
          const assignments = task.taskAssignments;

          if (task.isEditing) {
            return (
              <div className="flex flex-col gap-2 w-full">
                <div className="flex flex-wrap gap-1">
                  {assignments && assignments.length > 0 ? (
                    assignments.map((assignment) => (
                      <Badge key={assignment.id} variant="secondary">
                        {assignment.user.name ||
                          assignment.user.email.split("@")[0]}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500 italic">
                      Unassigned
                    </span>
                  )}
                </div>
                {renderUserAssignmentSection()}
              </div>
            );
          }

          return (
            <div
              className="flex flex-wrap gap-1"
              onDoubleClick={() => startEditing(task)}
            >
              {assignments && assignments.length > 0 ? (
                assignments.map((assignment) => (
                  <TooltipProvider key={assignment.id}>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge variant="secondary">
                          {assignment.user.name ||
                            assignment.user.email.split("@")[0]}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{assignment.user.email}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))
              ) : (
                <span className="text-sm text-gray-500 italic">Unassigned</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "blockedBy",
        header: "Blocked By",
        cell: ({ row }) => {
          const task = row.original;
          const blockedBy = task.blockedBy;

          if (task.isEditing) {
            return (
              <div className="flex flex-col gap-2 w-full">
                <div className="flex flex-wrap gap-1 mb-2">
                  {blockedBy && blockedBy.length > 0 ? (
                    <div className="w-full space-y-1">
                      {blockedBy.map((blockerTask) => (
                        <div
                          key={blockerTask.id}
                          className="flex items-center gap-1"
                        >
                          <Badge
                            variant="outline"
                            className="bg-red-50 text-red-700 border-red-200 px-2 py-1 hover:bg-red-100 transition-colors"
                          >
                            <div className="flex items-center">
                              <AlertCircleIcon className="h-3 w-3 mr-1" />
                              {blockerTask.name}
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
                {renderTaskBlockingSection()}
              </div>
            );
          }

          if (!blockedBy || blockedBy.length === 0)
            return (
              <div
                className="text-sm text-gray-500 italic hover:bg-gray-50 p-2 rounded transition-colors"
                onDoubleClick={() => startEditing(task)}
              >
                No blockers
              </div>
            );

          return (
            <div
              className="flex flex-wrap gap-1 hover:bg-gray-50 p-2 rounded transition-colors"
              onDoubleClick={() => startEditing(task)}
            >
              {blockedBy.map((blockerTask) => (
                <TooltipProvider key={blockerTask.id}>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 transition-colors"
                      >
                        <div className="flex items-center">
                          <AlertCircleIcon className="h-3 w-3 mr-1" />
                          {blockerTask.name}
                        </div>
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent
                      side="top"
                      className="bg-slate-900 text-white p-2 text-xs"
                    >
                      <p className="font-semibold">Blocking Task</p>
                      <p>{blockerTask.name}</p>
                      <p className="text-xs text-gray-300 mt-1">
                        Status:{" "}
                        {
                          statusConfig[blockerTask.status as TaskStatusKey]
                            .label
                        }
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          );
        },
      },
      {
        accessorKey: "blocking",
        header: "Blocking",
        cell: ({ row }) => {
          const task = row.original;
          const blocking = task.blocking;

          if (task.isEditing) {
            return (
              <div className="flex flex-col gap-1">
                {blocking && blocking.length > 0 ? (
                  <div className="w-full space-y-1 p-2 rounded-md">
                    {blocking.map((blockingTask) => (
                      <div key={blockingTask.id} className="flex items-center">
                        <Badge
                          variant="outline"
                          className="bg-amber-100 text-amber-700 border-amber-200"
                        >
                          <div className="flex items-center">
                            <AlertCircleIcon className="h-3 w-3 mr-1" />
                            {blockingTask.name}
                          </div>
                        </Badge>
                      </div>
                    ))}
                    <div className="text-xs text-amber-600 mt-1 italic">
                      These dependencies are set from the other tasks
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500 italic">
                    Not blocking any tasks
                  </span>
                )}
              </div>
            );
          }

          if (!blocking || blocking.length === 0)
            return (
              <div
                className="text-sm text-gray-500 italic hover:bg-gray-50 p-2 rounded transition-colors"
                onDoubleClick={() => startEditing(task)}
              >
                Not blocking
              </div>
            );

          return (
            <div
              className="p-2 transition-colors"
              onDoubleClick={() => startEditing(task)}
            >
              <div className="flex flex-wrap gap-1">
                {blocking.map((blockingTask) => (
                  <TooltipProvider key={blockingTask.id}>
                    <Tooltip>
                      <TooltipTrigger>
                        <Badge
                          variant="outline"
                          className="bg-amber-100 text-amber-700 border-amber-200"
                        >
                          <AlertCircleIcon className="h-3 w-3 mr-1" />
                          {blockingTask.name}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent
                        side="top"
                        className="bg-slate-900 text-white p-2 text-xs"
                      >
                        <p className="font-semibold">Blocked Task</p>
                        <p>{blockingTask.name}</p>
                        <p className="text-xs text-gray-300 mt-1">
                          Status:{" "}
                          {
                            statusConfig[blockingTask.status as TaskStatusKey]
                              .label
                          }
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            </div>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const task = row.original;

          if (task.isEditing) {
            return (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSaveEditing}
                  className="h-8 w-8 text-green-600 hover:text-green-700"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={cancelEditing}
                  className="h-8 w-8 text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          }

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(task.id)}
                >
                  Copy task ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-blue-600"
                  onClick={() => startEditing(task)}
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => deleteTask(task.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [
      moveTask,
      deleteTask,
      toggleTaskCompletion,
      startEditing,
      updateEditingTask,
      handleSaveEditing,
      cancelEditing,
      renderUserAssignmentSection,
      renderTaskBlockingSection,
      toggleTaskSelection,
    ],
  );

  const table = useReactTable({
    data: tasks,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="container mx-auto py-6 space-y-6 px-12">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Task List</h1>
        <Button onClick={addNewTask} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Task
        </Button>
      </div>

      <div className="flex items-center py-4">
        <Input
          placeholder="Filter tasks..."
          value={table.getColumn("name")?.getFilterValue() as string}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="border border-r">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="border border-r">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <p className="text-muted-foreground">No tasks found</p>
                      <Button onClick={addNewTask} variant="outline">
                        <Plus className="mr-2 h-4 w-4" /> Create your first task
                      </Button>
                    </div>
                  ) : (
                    "No results found."
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default TaskListPage;
