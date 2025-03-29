"use client";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { ExtendedTask } from "@/src/types";
import { TaskNameCell } from "./taskname-cell";
import { TaskDescriptionCell } from "./taskdescription-cell";
import { TaskStatusCell } from "./taskstatus-cell";
import { TaskDueDateCell } from "./taskdate-cell";
import { TaskAssignedUsersCell } from "./taskuser-cell";
import { TaskBlockedByCell } from "./taskblock-cell";
import { TaskBlockingCell } from "./taskblocking-cell";
import { TaskActionsCell } from "./taskactions-cell";

export const columns: ColumnDef<ExtendedTask>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting()}>
        Task
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <TaskNameCell task={row.original} />,
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => <TaskDescriptionCell task={row.original} />,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting()}>
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <TaskStatusCell task={row.original} />,
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting()}>
        Due Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <TaskDueDateCell task={row.original} />,
  },
  {
    accessorKey: "taskAssignments",
    header: "Assigned To",
    cell: ({ row }) => <TaskAssignedUsersCell task={row.original} />,
  },
  {
    accessorKey: "blockedBy",
    header: "Blocked By",
    cell: ({ row }) => <TaskBlockedByCell task={row.original} />,
  },
  {
    accessorKey: "blocking",
    header: "Blocking",
    cell: ({ row }) => <TaskBlockingCell task={row.original} />,
  },
  {
    id: "actions",
    cell: ({ row }) => <TaskActionsCell task={row.original} />,
  },
];
