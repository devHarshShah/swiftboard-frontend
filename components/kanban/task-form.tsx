import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DateTimePicker } from "@/components/ui/date-timepicker";
import { UserSelector } from "./user-selector";
import { TaskSelector } from "./task-selector";
import { cn } from "@/lib/utils";
import {
  Task,
  User,
  NewTaskData,
  statusConfig,
} from "@/app/types/kanban.types";

interface TaskFormProps {
  task: Task | NewTaskData;
  onSubmit: (task: Task | NewTaskData) => void;
  onCancel: () => void;
  users: User[];
  blockingTasks: Task[];
  mode: "create" | "edit";
  config?: typeof statusConfig;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  users,
  blockingTasks,
  mode,
  config,
}) => {
  const [formData, setFormData] = useState<Task | NewTaskData>(task);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [blockingTaskSearchQuery, setBlockingTaskSearchQuery] = useState("");

  const handleDateChange = (date: Date) => {
    setFormData((prev) => ({
      ...prev,
      dueDate: date,
    }));
  };

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const isTaskEmpty = () => {
    if ("name" in formData) {
      return !formData.name.trim();
    }
    return false;
  };

  const handleUserToggle = (userId: string) => {
    if (mode === "edit" && "taskAssignments" in formData) {
      const isCurrentlyAssigned = formData.taskAssignments.some(
        (a) => a.user.id === userId,
      );

      const updatedAssignments = isCurrentlyAssigned
        ? formData.taskAssignments.filter((a) => a.user.id !== userId)
        : [
            ...formData.taskAssignments,
            {
              id: `temp-${userId}`,
              user: users.find((u) => u.id === userId)!,
              taskId: formData.id,
              userId: userId,
            },
          ];

      setFormData({
        ...formData,
        taskAssignments: updatedAssignments,
      });
    } else if ("userIds" in formData) {
      const currentUserIds = formData.userIds || [];
      const updatedUserIds = currentUserIds.includes(userId)
        ? currentUserIds.filter((id) => id !== userId)
        : [...currentUserIds, userId];

      setFormData({
        ...formData,
        userIds: updatedUserIds,
      });
    }
  };

  const handleTaskToggle = (taskId: string) => {
    const blockingTask = blockingTasks.find((task) => task.id === taskId);
    if (!blockingTask) return;

    if (mode === "edit" && "blockedBy" in formData) {
      const isCurrentlyBlocking = formData.blockedBy?.some(
        (t) => t.id === blockingTask.id,
      );
      const updatedBlockedBy = isCurrentlyBlocking
        ? (formData.blockedBy || []).filter((t) => t.id !== blockingTask.id)
        : [...(formData.blockedBy || []), blockingTask];

      setFormData({
        ...formData,
        blockedBy: updatedBlockedBy,
      });
    } else if ("blockedBy" in formData) {
      const currentBlockedBy = formData.blockedBy || [];
      const updatedBlockedBy = currentBlockedBy.some(
        (t) => t.id === blockingTask.id,
      )
        ? currentBlockedBy.filter((t) => t.id !== blockingTask.id)
        : [...currentBlockedBy, blockingTask];

      setFormData({
        ...formData,
        blockedBy: updatedBlockedBy,
      });
    }
  };

  const getSelectedUsers = () => {
    if (mode === "edit" && "taskAssignments" in formData) {
      return formData.taskAssignments.map((a) => a.user);
    } else if ("userIds" in formData) {
      return formData.userIds
        .map((userId) => users.find((user) => user.id === userId))
        .filter(Boolean) as User[];
    }
    return [];
  };

  const getBlockingTasks = () => {
    if ("blockedBy" in formData) {
      return formData.blockedBy || [];
    }
    return [];
  };

  return (
    <Card
      className={cn(
        "border",
        "status" in formData &&
          config?.[formData.status as keyof typeof statusConfig]?.borderColor,
        "bg-card dark:bg-card/50 shadow-sm hover:shadow-md",
      )}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <Input
            placeholder="Task title"
            value={"name" in formData ? formData.name : ""}
            onChange={(e) => handleTextChange(e, "name")}
            className="w-full"
          />
          <Textarea
            placeholder="Task description (optional)"
            value={"description" in formData ? formData.description || "" : ""}
            onChange={(e) => handleTextChange(e, "description")}
            className="w-full min-h-[100px]"
          />

          <DateTimePicker
            onDateChange={handleDateChange}
            dueDate={"dueDate" in formData ? formData.dueDate : undefined}
          />

          {/* User Assignment */}
          <div>
            <Label className="mb-2 block">Assign Users</Label>
            <UserSelector
              users={users}
              selectedUsers={getSelectedUsers()}
              onToggleUser={handleUserToggle}
              searchQuery={userSearchQuery}
              setSearchQuery={setUserSearchQuery}
            />
          </div>

          {/* Blocking Tasks */}
          <div>
            <Label className="mb-2 block">Blocked By</Label>
            <TaskSelector
              tasks={blockingTasks}
              selectedTasks={getBlockingTasks()}
              onToggleTask={handleTaskToggle}
              searchQuery={blockingTaskSearchQuery}
              setSearchQuery={setBlockingTaskSearchQuery}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={onCancel}>
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isTaskEmpty()}>
              <Check className="mr-2 h-4 w-4" />
              {mode === "create" ? "Create" : "Save"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
