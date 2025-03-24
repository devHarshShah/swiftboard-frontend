"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiClient } from "@/src/lib/apiClient";
import { User, Team, Project } from "../types/types";

interface AppContextType {
  user: User | null;
  teams: Team[];
  projects: Project[];
  activeTeam: Team["team"] | null;
  activeProject: Project | null;
  setActiveTeam: (team: Team["team"]) => void;
  setActiveProject: (project: Project) => void;
  loading: boolean;
}

// Create the context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Create a hook for using the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}

// Create the provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTeam, setActiveTeam] = useState<Team["team"] | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await apiClient("/api/user/me");
        const userData = await userResponse.json();
        if (userResponse.ok) {
          setUser(userData);
        } else {
          console.error("Failed to fetch user data:", userData.error);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Fetch teams data
  useEffect(() => {
    const fetchTeamsData = async () => {
      try {
        const teamsResponse = await apiClient("/api/teams/user");
        const teamsData = await teamsResponse.json();
        if (teamsResponse.ok) {
          setTeams(teamsData);
          // Set active team to first team if we have teams and no active team
          if (teamsData.length > 0 && !activeTeam) {
            setActiveTeam(teamsData[0].team);
          }
        } else {
          console.error("Failed to fetch teams data:", teamsData.error);
        }
      } catch (error) {
        console.error("Error fetching teams data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamsData();
  }, [activeTeam]);

  // Fetch projects when active team changes
  useEffect(() => {
    const fetchProjectsData = async () => {
      if (!activeTeam) return;

      try {
        const projectsResponse = await apiClient(
          `/api/teams/projects/${activeTeam.id}`,
        );
        const projectsData = await projectsResponse.json();
        if (projectsResponse.ok) {
          setProjects(projectsData.projects);
          // Set active project to first project if we have projects and no active project
          if (
            projectsData.projects.length > 0 &&
            (!activeProject || activeProject.teamId !== activeTeam.id)
          ) {
            setActiveProject(projectsData.projects[0]);
          }
        } else {
          console.error("Failed to fetch projects data:", projectsData.error);
        }
      } catch (error) {
        console.error("Error fetching projects data:", error);
      }
    };

    fetchProjectsData();
  }, [activeTeam, activeProject]);

  const value = {
    user,
    teams,
    projects,
    activeTeam,
    activeProject,
    setActiveTeam,
    setActiveProject,
    loading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
