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
import {
  ArrowUpDown,
  Plus,
  AlertCircleIcon,
  MoreHorizontal,
  Edit,
  Trash2,
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
import { apiClient } from "@/lib/apiClient";
import { Task, TaskStatusKey, statusConfig } from "@/app/types/kanban.types";

// Extended type to include additional properties for table rendering
interface ExtendedTask extends Task {
  assignedUsers?: string[];
}

const TaskListPage: React.FC = () => {
  const [tasks, setTasks] = useState<ExtendedTask[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const projectId = Cookies.get("activeProjectId");

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
      }));

      setTasks(extendedTasks);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    }
  }, [projectId]);

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
      if (!projectId) return;

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

  useEffect(() => {
    fetchTasks();
  }, [projectId, fetchTasks]);

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
          return (
            <div className="flex items-center space-x-2">
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
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const task = row.original;
          const status = row.getValue("status") as TaskStatusKey;
          const config = statusConfig[status];

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
          const assignments = row.original.taskAssignments;
          return (
            <div className="flex flex-wrap gap-1">
              {assignments.map((assignment) => (
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
              ))}
            </div>
          );
        },
      },
      {
        accessorKey: "blockedBy",
        header: "Blocked By",
        cell: ({ row }) => {
          const blockedBy = row.original.blockedBy;
          if (!blockedBy || blockedBy.length === 0) return null;

          return (
            <div className="flex items-center text-destructive gap-1">
              <AlertCircleIcon className="h-4 w-4 mr-1" />
              {blockedBy.map((blockerTask: { id: string; name: string }) => (
                <TooltipProvider key={blockerTask.id}>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge
                        variant="destructive"
                        className="bg-destructive/10"
                      >
                        #{blockerTask.name}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{blockerTask.name}</p>
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
          const blocking = row.original.blocking;
          if (!blocking || blocking.length === 0) return null;

          return (
            <div className="flex items-center text-destructive gap-1">
              <AlertCircleIcon className="h-4 w-4 mr-1" />
              {blocking.map((blocking: { id: string; name: string }) => (
                <TooltipProvider key={blocking.id}>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge
                        variant="destructive"
                        className="bg-destructive/10"
                      >
                        #{blocking.name}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{blocking.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const task = row.original;

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
                  className="text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    /* Open edit modal */
                  }}
                >
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 hover:bg-red-50"
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
    [moveTask, deleteTask, toggleTaskCompletion],
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
    <div className="w-full p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Task
        </Button>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-r">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`border-r last:border-r-0`}
                  >
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
                <TableRow key={row.id} className="border-b border-r">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={`border-r last:border-r-0`}
                    >
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
                  No tasks found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default TaskListPage;
