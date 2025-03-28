"use client";
import { useState } from "react";
import { SortingState } from "@tanstack/react-table";
import { Button } from "@/src/components/ui/button";
import { Plus } from "lucide-react";
import { TaskTable } from "@/src/components/tasks/task-table";
import { TaskManagerProvider } from "@/src/contexts/task-context";
import { useTaskManager } from "@/src/contexts/task-context";

export default function TaskListPage() {
  const [sorting, setSorting] = useState<SortingState>([]);

  return (
    <TaskManagerProvider>
      <div className="container mx-auto py-6 space-y-6 px-12">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Task List</h1>
          <AddTaskButton />
        </div>

        <TaskTable sorting={sorting} setSorting={setSorting} />
      </div>
    </TaskManagerProvider>
  );
}

function AddTaskButton() {
  const { addNewTask } = useTaskManager();

  return (
    <Button onClick={addNewTask} className="flex items-center gap-2">
      <Plus className="h-4 w-4" /> Add Task
    </Button>
  );
}
