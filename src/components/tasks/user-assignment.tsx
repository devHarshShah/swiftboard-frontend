"use client";
import { useTaskManager } from "@/src/contexts/task-context";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { Button } from "@/src/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Checkbox } from "@/src/components/ui/checkbox";
import { Badge } from "@/src/components/ui/badge";
import { Avatar, AvatarFallback } from "@/src/components/ui/avatar";

export function UserAssignmentSection() {
  const {
    editingTask,
    users,
    userSearchQuery,
    setUserSearchQuery,
    toggleUserSelection,
  } = useTaskManager();

  if (!editingTask) return null;

  const selectedUsers = editingTask.taskAssignments.map((a) => a.user);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-wrap gap-1">
        {editingTask.taskAssignments &&
        editingTask.taskAssignments.length > 0 ? (
          editingTask.taskAssignments.map((assignment) => (
            <Badge
              key={assignment.id}
              variant="secondary"
              className="flex items-center gap-1"
            >
              <Avatar className="h-4 w-4">
                <AvatarFallback className="text-[8px]">
                  {assignment.user.name
                    ? assignment.user.name.substring(0, 2).toUpperCase()
                    : assignment.user.email.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">
                {assignment.user.name || assignment.user.email.split("@")[0]}
              </span>
            </Badge>
          ))
        ) : (
          <span className="text-sm text-gray-500 italic">Unassigned</span>
        )}
      </div>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-sm h-8"
          >
            <Search className="mr-2 h-3 w-3" />
            Assign Users
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-3" side="right" align="start">
          <div className="space-y-4">
            <Input
              placeholder="Search users..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="w-full h-8 text-sm"
            />

            {users.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm">
                No users found
              </div>
            ) : (
              <div className="max-h-[250px] overflow-y-auto space-y-1">
                {users
                  .filter(
                    (user) =>
                      user.name
                        ?.toLowerCase()
                        .includes(userSearchQuery.toLowerCase()) ||
                      user.email
                        .toLowerCase()
                        .includes(userSearchQuery.toLowerCase()),
                  )
                  .map((user) => {
                    const isSelected = selectedUsers.some(
                      (u) => u.id === user.id,
                    );

                    return (
                      <div
                        key={user.id}
                        className="flex items-center space-x-2 hover:bg-accent hover:text-accent-foreground p-1.5 rounded text-sm"
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleUserSelection(user.id)}
                          id={`user-${user.id}`}
                        />
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-[10px]">
                            {user.name
                              ? user.name.substring(0, 2).toUpperCase()
                              : user.email.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <label
                          htmlFor={`user-${user.id}`}
                          className="text-sm font-medium leading-none truncate flex-1 cursor-pointer"
                        >
                          {user.name || user.email}
                        </label>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
