"use client";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { ExtendedTask } from "@/src/types";
import { UserAssignmentSection } from "./user-assignment";

export function TaskAssignedUsersCell({ task }: { task: ExtendedTask }) {
  if (task.isEditing) {
    return (
      <div className="px-2 py-1">
        <UserAssignmentSection />
      </div>
    );
  }

  const assignments = task.taskAssignments || [];

  if (assignments.length === 0) {
    return (
      <span className="px-2 text-sm text-muted-foreground italic">
        Unassigned
      </span>
    );
  }

  return (
    <div className="px-2 flex flex-wrap gap-1">
      {assignments.map((assignment) => (
        <Badge
          key={assignment.id}
          variant="secondary"
          className="flex items-center gap-1"
        >
          <Avatar className="h-5 w-5">
            <AvatarFallback className="text-[10px]">
              {assignment.user.name
                ? assignment.user.name.substring(0, 2).toUpperCase()
                : assignment.user.email.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs">
            {assignment.user.name || assignment.user.email.split("@")[0]}
          </span>
        </Badge>
      ))}
    </div>
  );
}
