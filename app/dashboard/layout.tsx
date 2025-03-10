"use client";
import { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import BreadCrumbs from "@/components/sidebar/breadcrumbs";
import { apiClient } from "@/lib/apiClient";
import { ModalProvider } from "@/components/modal-provider";
import ModalContainer from "@/components/modals/modal.container";
import Cookies from "js-cookie";

interface Team {
  team: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  role: string;
  status: string;
}

interface Project {
  id: string;
  name: string;
  teamId: string;
  createdAt: string;
  updatedAt: string;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await apiClient("/api/user/me");
        const userData = await userResponse.json();
        if (userResponse.ok) {
          setUser(userData);
          Cookies.set("userId", userData.id);
        } else {
          console.error("Failed to fetch user data:", userData.error);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    const fetchTeamsData = async () => {
      try {
        const teamsResponse = await apiClient("/api/teams/user");
        const teamsData = await teamsResponse.json();
        if (teamsResponse.ok) {
          setTeams(teamsData);
        } else {
          console.error("Failed to fetch teams data:", teamsData.error);
        }
      } catch (error) {
        console.error("Error fetching teams data:", error);
      }
    };

    fetchUserData();
    fetchTeamsData();
  }, []);

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        if (teams.length > 0) {
          const projectsResponse = await apiClient(
            `/api/teams/projects/${teams[0].team.id}`,
          );
          const projectsData = await projectsResponse.json();
          if (projectsResponse.ok) {
            setProjects(projectsData.projects);
          } else {
            console.error("Failed to fetch projects data:", projectsData.error);
          }
        }
      } catch (error) {
        console.error("Error fetching projects data:", error);
      }
    };

    fetchProjectData();
  }, [teams]);

  useEffect(() => {
    const fetchActiveProject = async () => {
      const activeProjectId = Cookies.get("activeProjectId");
      if (activeProjectId) {
        try {
          const projectResponse = await apiClient(
            `/api/project/${activeProjectId}`,
          );
          const projectData = await projectResponse.json();
          if (projectResponse.ok) {
            setActiveProject(projectData.project);
          } else {
            console.error(
              "Failed to fetch active project data:",
              projectData.error,
            );
          }
        } catch (error) {
          console.error("Error fetching active project data:", error);
        }
      }
    };

    fetchActiveProject();
  }, []);

  return (
    <SidebarProvider>
      <ModalProvider>
        {user && <AppSidebar user={user} teams={teams} projects={projects} />}
        <SidebarInset>
          <BreadCrumbs />
          <main className="w-full">{children}</main>
        </SidebarInset>
        <ModalContainer />
      </ModalProvider>
    </SidebarProvider>
  );
}
