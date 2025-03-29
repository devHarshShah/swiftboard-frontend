import { BaseEntity } from "./common";

export interface Project extends BaseEntity {
  name: string;
  teamId: string;
}
