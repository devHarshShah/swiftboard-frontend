"use client";
import React, { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/src/lib/apiClient";
import { TaskColumn } from "./task-coulmn";
import { TaskForm } from "./task-form";
import {
  Task,
  TaskStatus,
  TaskStatusKey,
  User,
  NewTaskData,
  GroupedTasks,
  statusConfig,
} from "@/src/types/types";
import { useAppContext } from "@/src/contexts/app-context";

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
  const { activeTeam, activeProject } = useAppContext();
  const projectId = activeProject?.id;
  const teamId = activeTeam?.id;

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

  const createTask = async (taskData: Task | NewTaskData) => {
    if (!taskData.name.trim() || !projectId) return;

    try {
      const isNewTask = "userIds" in taskData;
      await apiClient(`/api/project/${projectId}/tasks`, {
        method: "POST",
        body: JSON.stringify({
          name: taskData.name,
          description: taskData.description,
          status: TaskStatus.TODO,
          assignedUserIds: isNewTask
            ? taskData.userIds
            : taskData.taskAssignments.map((a) => a.user.id),
          blockedTaskIds: isNewTask
            ? taskData.blockedBy.map((task) => task.id)
            : taskData.blockedBy?.map((task) => task.id) || [],
          dueDate: taskData.dueDate,
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
    } catch (error) {
      console.error("Failed to create task", error);
    }
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
      fetchTasks();
    } catch (error) {
      console.error("Failed to move task", error);
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!projectId) return;

    try {
      await apiClient(`/api/project/${projectId}/tasks/${taskId}`, {
        method: "DELETE",
      });
      fetchTasks();
    } catch (error) {
      console.error("Failed to delete task", error);
    }
  };

  const updateTask = async (taskToUpdate: Task | NewTaskData) => {
    if (!projectId) return;

    // Type guard to check if taskToUpdate is a Task
    if (!("id" in taskToUpdate)) return;

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
    } catch (error) {
      console.error("Failed to update task", error);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [fetchTasks, fetchUsers]);

  const handleCancelEdit = () => {
    setEditingTask(null);
  };

  const handleStartEdit = (task: Task) => {
    setEditingTask(task);
  };

  return (
    <div className="grid grid-cols-3 gap-6 p-6 bg-background">
      {Object.values(TaskStatus).map((status) => (
        <TaskColumn
          key={status}
          status={status}
          tasks={tasks[status]}
          config={statusConfig}
          onMoveTask={moveTask}
          onDeleteTask={deleteTask}
          onEditTask={handleStartEdit}
          onAddTask={() => setIsAddingTask(true)}
          isAddingAllowed={status === TaskStatus.TODO}
          isAddingActive={isAddingTask && status === TaskStatus.TODO}
        >
          {status === TaskStatus.TODO && isAddingTask && (
            <TaskForm
              task={newTask}
              onSubmit={createTask}
              onCancel={() => setIsAddingTask(false)}
              users={users}
              blockingTasks={tasks[TaskStatus.TODO]}
              mode="create"
            />
          )}

          {editingTask && editingTask.status === status && (
            <TaskForm
              task={editingTask}
              onSubmit={updateTask}
              onCancel={handleCancelEdit}
              users={users}
              blockingTasks={tasks[TaskStatus.TODO]}
              mode="edit"
            />
          )}
        </TaskColumn>
      ))}
    </div>
  );
};

export default KanbanBoard;
