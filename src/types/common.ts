// Common shared types used across the application
export interface Errors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
  [key: string]: string | undefined;
}

// Base entity interface that other entities can extend
export interface BaseEntity {
  id: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}
