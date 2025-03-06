"use client";
import React, { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Move,
  MoreVertical,
  AlertCircleIcon,
  Check,
  X,
  Search,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { apiClient } from "@/lib/apiClient";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

import {
  Task,
  TaskStatus,
  TaskStatusKey,
  User,
  NewTaskData,
  GroupedTasks,
  statusConfig,
} from "@/app/types/kanban.types";
import { DateTimePicker } from "@/components/ui/date-timepicker";

const KanbanBoard: React.FC = () => {
  const [tasks, setTasks] = useState<GroupedTasks>({
    [TaskStatus.TODO]: [],
    [TaskStatus.IN_PROGRESS]: [],
    [TaskStatus.DONE]: [],
  });
  const [newTask, setNewTask] = useState<NewTaskData>({
    name: "",
    description: "",
    dueDate: new Date(),
    expectedHours: 0,
    userIds: [],
    blockedBy: [],
  });
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [blockingTaskSearchQuery, setBlockingTaskSearchQuery] = useState("");
  const projectId = Cookies.get("activeProjectId");
  const teamId = Cookies.get("activeTeamId");

  const handleDateChange = (date: Date) => {
    setNewTask((prev) => ({
      ...prev,
      dueDate: date,
    }));
  };

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

  const fetchTasks = useCallback(async () => {
    if (!projectId) return;

    try {
      const response = await apiClient(`/api/project/${projectId}/tasks`);
      const data: Task[] = await response.json();

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

  const createTask = async () => {
    if (!newTask.name.trim() || !projectId) return;

    try {
      await apiClient(`/api/project/${projectId}/tasks`, {
        method: "POST",
        body: JSON.stringify({
          name: newTask.name,
          description: newTask.description,
          status: TaskStatus.TODO,
          assignedUserIds: newTask.userIds || [],
          blockedTaskIds: newTask.blockedBy.map((task) => task.id),
          dueDate: newTask.dueDate,
        }),
      });

      fetchTasks();
      setNewTask({
        name: "",
        description: "",
        dueDate: new Date(),
        expectedHours: 0,
        userIds: [],
        blockedBy: [],
      });
      setIsAddingTask(false);
      setUserSearchQuery("");
      setBlockingTaskSearchQuery("");
    } catch (error) {
      console.error("Failed to create task", error);
    }
  };

  const getUsernameFromEmail = (user: User) => {
    const username = user.name
      ? user.name.replace(/\s+/g, "").toLowerCase()
      : user.email.split("@")[0];
    return `@${username}`;
  };

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

  const updateTask = async (taskToUpdate: Task) => {
    if (!projectId) return;

    try {
      await apiClient(`/api/project/${projectId}/tasks/${taskToUpdate.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: taskToUpdate.name,
          description: taskToUpdate.description,
          assignedUserIds: taskToUpdate.taskAssignments.map((a) => a.user.id),
          blockedTaskIds: taskToUpdate.blockedBy?.map((task) => task.id) || [],
          dueDate: taskToUpdate.dueDate,
        }),
      });

      fetchTasks();
      setEditingTask(null);
      setUserSearchQuery("");
      setBlockingTaskSearchQuery("");
    } catch (error) {
      console.error("Failed to update task", error);
    }
  };

  const toggleUserSelection = (userId: string, isEditing: boolean) => {
    if (isEditing && editingTask) {
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
    } else {
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
    }
  };

  const toggleTaskSelection = (task: Task, isEditing: boolean) => {
    if (isEditing && editingTask) {
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
    } else {
      setNewTask((prev) => {
        const currentBlockedBy = prev.blockedBy || [];
        const updatedBlockedBy = currentBlockedBy.some((t) => t.id === task.id)
          ? currentBlockedBy.filter((t) => t.id !== task.id)
          : [...currentBlockedBy, task];

        return {
          ...prev,
          blockedBy: updatedBlockedBy,
        };
      });
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [fetchTasks, fetchUsers]);

  const renderAssignmentSection = (
    items: User[] | Task[],
    selectedItems: User[] | Task[],
    onToggle: (item: User | Task) => void,
    placeholder: string,
    searchQuery: string,
    setSearchQuery: (query: string) => void,
    isEditing: boolean = false,
  ) => {
    const isSelected = (item: User | Task) => {
      if (isEditing) {
        return (selectedItems as Task[]).some(
          (selectedItem) => selectedItem.id === (item as Task).id,
        );
      }
      return (selectedItems as User[])
        .map((user) => user.id)
        .includes((item as User).id);
    };

    const filteredItems = items.filter((item) => {
      const name = (item as User).name || (item as Task).name;
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <Search className="mr-2 h-4 w-4" />
            {placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-4" side="right" align="start">
          <div className="space-y-4">
            <Input
              placeholder={`Search ${placeholder.toLowerCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />

            {filteredItems.length === 0 ? (
              <div className="text-center text-muted-foreground">
                No results found
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {filteredItems.map((item) => {
                  const itemId = (item as User).id || (item as Task).id;
                  const itemName = (item as User).name || (item as Task).name;

                  return (
                    <div
                      key={itemId}
                      className="flex items-center space-x-2 hover:bg-accent hover:text-accent-foreground p-2 rounded"
                    >
                      <Checkbox
                        checked={isSelected(item)}
                        onCheckedChange={() => onToggle(item)}
                        id={`item-${itemId}`}
                      />
                      <label
                        htmlFor={`item-${itemId}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {itemName}
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
  };

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
              onClick={() => setIsAddingTask(true)}
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
          {/* Inline Task Creation */}
          {status === TaskStatus.TODO && isAddingTask && (
            <Card
              className={cn(
                "border",
                config.borderColor,
                "bg-card dark:bg-card/50 shadow-sm hover:shadow-md",
              )}
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Input
                    placeholder="Task title"
                    value={newTask.name}
                    onChange={(e) =>
                      setNewTask((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full"
                  />
                  <Textarea
                    placeholder="Task description (optional)"
                    value={newTask.description}
                    onChange={(e) =>
                      setNewTask((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full min-h-[100px]"
                  />

                  <DateTimePicker onDateChange={handleDateChange} />

                  {/* User Assignment */}
                  <div>
                    <Label className="mb-2 block">Assign Users</Label>
                    {renderAssignmentSection(
                      users,
                      newTask.userIds
                        .map(
                          (userId) => users.find((user) => user.id === userId)!,
                        )
                        .filter(Boolean),
                      (user) => toggleUserSelection((user as User).id, false),
                      "Select Users",
                      userSearchQuery,
                      setUserSearchQuery,
                    )}
                    {/* Display selected users */}
                    {newTask.userIds.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newTask.userIds.map((userId) => {
                          const user = users.find((u) => u.id === userId);
                          return (
                            <div
                              key={userId}
                              className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs"
                            >
                              {user?.name || user?.email}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Blocking Tasks */}
                  <div>
                    <Label className="mb-2 block">Blocked By</Label>
                    {renderAssignmentSection(
                      tasks[TaskStatus.TODO],
                      newTask.blockedBy,
                      (task) => toggleTaskSelection(task as Task, false),
                      "Select Blocking Tasks",
                      blockingTaskSearchQuery,
                      setBlockingTaskSearchQuery,
                    )}
                    {/* Display selected blocking tasks */}
                    {newTask.blockedBy.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newTask.blockedBy.map((task) => (
                          <div
                            key={task.id}
                            className="bg-destructive/10 text-destructive px-2 py-1 rounded-full text-xs"
                          >
                            {task.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setIsAddingTask(false);
                        setUserSearchQuery("");
                        setBlockingTaskSearchQuery("");
                      }}
                    >
                      <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                    <Button
                      onClick={createTask}
                      disabled={!newTask.name.trim()}
                    >
                      <Check className="mr-2 h-4 w-4" /> Create
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Task editing mode would be similar, with renderAssignmentSection for users and blocking tasks */}
          {tasks[status].map((task) => (
            <TooltipProvider key={task.id}>
              <Card
                onDoubleClick={() => setEditingTask(task)}
                className={cn(
                  "border transition-all duration-200 ease-in-out",
                  config.borderColor,
                  "bg-card dark:bg-card/50 shadow-sm hover:shadow-md",
                  task.blockedBy?.length > 0 && "border-destructive/50",
                )}
              >
                {editingTask?.id === task.id ? (
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <Input
                        placeholder="Task title"
                        value={editingTask.name}
                        onChange={(e) =>
                          setEditingTask((prev) =>
                            prev ? { ...prev, name: e.target.value } : null,
                          )
                        }
                        className="w-full"
                      />
                      <Textarea
                        placeholder="Task description (optional)"
                        value={editingTask.description || ""}
                        onChange={(e) =>
                          setEditingTask((prev) =>
                            prev
                              ? { ...prev, description: e.target.value }
                              : null,
                          )
                        }
                        className="w-full min-h-[100px]"
                      />

                      <DateTimePicker
                        onDateChange={(date) =>
                          setEditingTask((prev) =>
                            prev ? { ...prev, dueDate: date } : null,
                          )
                        }
                        dueDate={editingTask.dueDate}
                      />

                      {/* User Assignment for Editing */}
                      <div>
                        <Label className="mb-2 block">Assign Users</Label>
                        {renderAssignmentSection(
                          users,
                          editingTask.taskAssignments.map((a) => a.user),
                          (user) =>
                            toggleUserSelection((user as User).id, true),
                          "Select Users",
                          userSearchQuery,
                          setUserSearchQuery,
                          true,
                        )}
                        {/* Display selected users */}
                        {editingTask.taskAssignments.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {editingTask.taskAssignments.map((assignment) => {
                              const user = assignment.user;
                              return (
                                <div
                                  key={user.id}
                                  className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs"
                                >
                                  {user.name || user.email}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Blocking Tasks for Editing */}
                      <div>
                        <Label className="mb-2 block">Blocked By</Label>
                        {renderAssignmentSection(
                          tasks[TaskStatus.TODO],
                          editingTask.blockedBy || [],
                          (task) => toggleTaskSelection(task as Task, true),
                          "Select Blocking Tasks",
                          blockingTaskSearchQuery,
                          setBlockingTaskSearchQuery,
                          true,
                        )}
                        {/* Display selected blocking tasks */}
                        {editingTask.blockedBy &&
                          editingTask.blockedBy.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {editingTask.blockedBy.map((task) => (
                                <div
                                  key={task.id}
                                  className="bg-destructive/10 text-destructive px-2 py-1 rounded-full text-xs"
                                >
                                  {task.name}
                                </div>
                              ))}
                            </div>
                          )}
                      </div>

                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setEditingTask(null);
                            setUserSearchQuery("");
                            setBlockingTaskSearchQuery("");
                          }}
                        >
                          <X className="mr-2 h-4 w-4" /> Cancel
                        </Button>
                        <Button onClick={() => updateTask(editingTask)}>
                          <Check className="mr-2 h-4 w-4" /> Save
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                ) : (
                  // Regular Task Display
                  <>
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
                                  <p className="text-xs">
                                    {assignment.user.email}
                                  </p>
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
                  </>
                )}
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
    </div>
  );
};

export default KanbanBoard;
