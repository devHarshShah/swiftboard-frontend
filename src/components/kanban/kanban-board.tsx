"use client";
import React, { useMemo } from "react";
import { TaskColumn } from "./task-coulmn";
import { TaskForm } from "./task-form";
import { TaskStatus, GroupedTasks, statusConfig } from "@/src/types";
import { useTaskManager } from "@/src/contexts/task-context";

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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (task) => !(task as any).isNew || (task as any).status !== status,
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
