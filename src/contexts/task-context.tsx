"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { apiClient } from "@/src/lib/apiClient";
import { useAppContext } from "@/src/contexts/app-context";
import {
  TaskStatusKey,
  Task,
  User,
  ExtendedTask,
  TaskManagerContextType,
  TeamMemberResponse,
  TaskAssignment,
} from "@/src/types";

const TaskManagerContext = createContext<TaskManagerContextType | undefined>(
  undefined,
);

export function TaskManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [tasks, setTasks] = useState<ExtendedTask[]>([]);
  const [editingTask, setEditingTask] = useState<ExtendedTask | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [blockingTaskSearchQuery, setBlockingTaskSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { activeTeam, activeProject } = useAppContext();
  const projectId = activeProject?.id;
  const teamId = activeTeam?.id;

  // Fetch users for the team
  const fetchUsers = useCallback(async () => {
    if (!teamId) return;

    try {
      const response = await apiClient(`/api/teams/${teamId}/members`);
      const userData = (await response.json()) as TeamMemberResponse[];
      // Transform team member response to users
      const fetchedUsers: User[] = userData.map(
        (member: TeamMemberResponse) => ({
          ...member.user,
          name: member.user.name || member.user.email.split("@")[0], // Use email prefix as fallback name
        }),
      );
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  }, [teamId]);

  // Fetch tasks for the project
  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    setIsLoading(true);

    try {
      const response = await apiClient(`/api/project/${projectId}/tasks`);
      const data: Task[] = await response.json();

      // Transform tasks to include additional properties
      const extendedTasks: ExtendedTask[] = data.map((task) => ({
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
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [fetchTasks, fetchUsers]);

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
      dueDate: new Date(),
      expectedHours: 0,
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

      const userToAssign = users.find((u) => u.id === userId);
      if (!userToAssign) return;

      const updatedAssignments: TaskAssignment[] = isCurrentlyAssigned
        ? editingTask.taskAssignments.filter((a) => a.user.id !== userId)
        : [
            ...editingTask.taskAssignments,
            {
              id: `temp-${userId}`,
              user: userToAssign,
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

  // Define interface for the API payload
  interface TaskSaveData {
    name: string;
    description: string;
    status: TaskStatusKey;
    assignedUserIds: string[];
    blockedTaskIds: string[];
  }

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
        const taskData: TaskSaveData = {
          name: task.name,
          description: task.description,
          status: task.status,
          assignedUserIds: task.taskAssignments.map((a) => a.user.id),
          blockedTaskIds: task.blockedBy?.map((t) => t.id) || [],
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

  // Update task field in edit mode with strong typing
  const updateEditingTask = useCallback(
    <K extends keyof ExtendedTask>(
      field: K,
      value: ExtendedTask[K] | undefined,
    ) => {
      if (!editingTask) return;

      setEditingTask((prev) => {
        if (!prev) return null;
        return { ...prev, [field]: value };
      });

      // Also update in the tasks array
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === editingTask.id ? { ...t, [field]: value } : t,
        ),
      );
    },
    [editingTask],
  );

  const value: TaskManagerContextType = {
    tasks,
    editingTask,
    isLoading,
    userSearchQuery,
    blockingTaskSearchQuery,
    users,
    setUserSearchQuery,
    setBlockingTaskSearchQuery,
    toggleUserSelection,
    toggleTaskSelection,
    startEditing,
    cancelEditing,
    handleSaveEditing,
    updateEditingTask,
    toggleTaskCompletion,
    moveTask,
    deleteTask,
    addNewTask,
  };

  return (
    <TaskManagerContext.Provider value={value}>
      {children}
    </TaskManagerContext.Provider>
  );
}

export function useTaskManager(): TaskManagerContextType {
  const context = useContext(TaskManagerContext);
  if (context === undefined) {
    throw new Error("useTaskManager must be used within a TaskManagerProvider");
  }
  return context;
}
