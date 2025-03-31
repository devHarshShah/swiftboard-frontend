"use client";
import React, { useMemo } from "react";
import { TaskColumn } from "./task-coulmn";
import { TaskForm } from "./task-form";
import {
  TaskStatus,
  GroupedTasks,
  Task,
  ExtendedTask,
  statusConfig,
} from "@/src/types";
import { useTaskManager } from "@/src/contexts/task-context";

// Type guard function to check if a task is an ExtendedTask with isNew property
function isExtendedTask(task: Task): task is ExtendedTask {
  return "isNew" in task;
}

const KanbanBoard: React.FC = () => {
  const {
    tasks,
    editingTask,
    isLoading,
    addNewTask,
    moveTask,
    deleteTask,
    startEditing,
    cancelEditing,
    handleSaveEditing,
    users,
  } = useTaskManager();

  // Group tasks by status for the kanban columns
  const groupedTasks = useMemo(() => {
    return tasks.reduce(
      (acc, task) => {
        if (!acc[task.status]) {
          acc[task.status] = [];
        }
        acc[task.status].push(task);
        return acc;
      },
      {
        [TaskStatus.TODO]: [],
        [TaskStatus.IN_PROGRESS]: [],
        [TaskStatus.DONE]: [],
      } as GroupedTasks,
    );
  }, [tasks]);

  // Handle creating a new task
  const handleAddNewTask = () => {
    if (editingTask) {
      // If already editing, cancel it first
      cancelEditing();
    }
    addNewTask();
  };

  // Render loading state if data is being fetched
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-6 p-6 bg-background">
      {Object.values(TaskStatus).map((status) => (
        <TaskColumn
          key={status}
          status={status}
          tasks={groupedTasks[status].filter(
            (task) =>
              !isExtendedTask(task) || !task.isNew || task.status !== status,
          )}
          config={statusConfig}
          onMoveTask={moveTask}
          onDeleteTask={deleteTask}
          onEditTask={startEditing}
          onAddTask={handleAddNewTask}
          isAddingAllowed={status === TaskStatus.TODO}
          isAddingActive={Boolean(
            editingTask?.isNew && editingTask.status === TaskStatus.TODO,
          )}
        >
          {/* Show task form for new or editing tasks */}
          {editingTask && editingTask.status === status && (
            <TaskForm
              task={editingTask}
              onSubmit={handleSaveEditing}
              onCancel={cancelEditing}
              users={users}
              mode={editingTask.isNew ? "create" : "edit"}
              config={statusConfig}
            />
          )}
        </TaskColumn>
      ))}
    </div>
  );
};

export default KanbanBoard;
