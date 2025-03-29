import { User } from "./user";
import { Team } from "./team";
import { Project } from "./project";

export interface AppContextType {
  user: User | null;
  teams: Team[];
  projects: Project[];
  activeTeam: Team["team"] | null;
  activeProject: Project | null;
  setActiveTeam: (team: Team["team"]) => void;
  setActiveProject: (project: Project) => void;
  loading: boolean;
}
