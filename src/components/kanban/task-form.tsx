import React from "react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Check, X } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { DateTimePicker } from "@/src/components/ui/date-timepicker";
import { UserAssignmentSection } from "../tasks/user-assignment";
import { TaskBlockingSection } from "../tasks/task-blocking";
import { cn } from "@/src/lib/utils";
import { useTaskManager } from "@/src/contexts/task-context";
import { TaskFormProps } from "@/src/types";

export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  mode,
  config,
}) => {
  const { updateEditingTask } = useTaskManager();

  const handleDateChange = (date: Date) => {
    updateEditingTask("dueDate", date);
  };

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: "name" | "description",
  ) => {
    updateEditingTask(field, e.target.value);
  };

  const isTaskEmpty = () => {
    return !task.name.trim();
  };

  return (
    <Card
      className={cn(
        "border",
        config?.[task.status]?.borderColor,
        "bg-card dark:bg-card/50 shadow-sm hover:shadow-md mb-4",
      )}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <Input
            placeholder="Task title"
            value={task.name}
            onChange={(e) => handleTextChange(e, "name")}
            className="w-full"
          />

          <Textarea
            placeholder="Task description (optional)"
            value={task.description || ""}
            onChange={(e) => handleTextChange(e, "description")}
            className="w-full min-h-[100px]"
          />

          <DateTimePicker
            onDateChange={handleDateChange}
            dueDate={task.dueDate}
          />

          {/* User Assignment - Using your existing component */}
          <div>
            <Label className="mb-2 block">Assign Users</Label>
            <UserAssignmentSection />
          </div>

          {/* Blocking Tasks - Using your TaskBlockingSection component */}
          <div>
            <Label className="mb-2 block">Blocked By</Label>
            <TaskBlockingSection />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="ghost" onClick={onCancel}>
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button
              onClick={onSubmit}
              disabled={isTaskEmpty()}
              variant="default"
            >
              <Check className="mr-2 h-4 w-4" />
              {mode === "create" ? "Create" : "Save"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
