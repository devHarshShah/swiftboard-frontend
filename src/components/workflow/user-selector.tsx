import React from "react";
import { Button } from "@/src/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Checkbox } from "@/src/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/src/components/ui/popover";
import { UserSelectorProps } from "@/src/types";

export const UserSelector: React.FC<UserSelectorProps> = ({
  users,
  selectedUsers,
  onToggleUser,
  searchQuery,
  setSearchQuery,
}) => {
  const filteredUsers = users.filter((user) => {
    const name = user.name || user.email;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const isSelected = (userId: string) => {
    return selectedUsers.some((user) => user.id === userId);
  };

  return (
    <div>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            <Search className="mr-2 h-4 w-4" />
            Select Users
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-4" side="right" align="start">
          <div className="space-y-4">
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />

            {filteredUsers.length === 0 ? (
              <div className="text-center text-muted-foreground">
                No results found
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto space-y-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-2 hover:bg-accent hover:text-accent-foreground p-2 rounded"
                  >
                    <Checkbox
                      checked={isSelected(user.id)}
                      onCheckedChange={() => onToggleUser(user.id)}
                      id={`user-${user.id}`}
                    />
                    <label
                      htmlFor={`user-${user.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {user.name || user.email}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedUsers.map((user) => (
            <div
              key={user.id}
              className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-xs"
            >
              {user.name || user.email}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
