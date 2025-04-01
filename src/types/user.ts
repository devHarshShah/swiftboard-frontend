import { BaseEntity } from "./common";

export interface User extends BaseEntity {
  name: string;
  email: string;
  avatar?: string;
}

export type UserRole = "admin" | "member" | "guest" | "owner";
export type UserStatus = "online" | "offline" | "away" | "busy";

export interface TeamMember extends User {
  role: string;
  status: string;
  lastActive: Date;
  unreadCount: number;
}

export interface UserSelectorProps {
  users: User[];
  selectedUsers: User[];
  onToggleUser: (userId: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export interface TeamMemberResponse {
  user: {
    id: string;
    name?: string;
    email: string;
    avatar?: string;
  };
  role: string;
}
