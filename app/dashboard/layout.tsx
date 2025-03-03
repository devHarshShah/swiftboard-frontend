"use client";
import { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import BreadCrumbs from "@/components/sidebar/breadcrumbs";
import { apiClient } from "@/lib/apiClient";
import { ModalProvider } from "@/components/modal-provider";
import ModalContainer from "@/components/modals/modal.container";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState([]);

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
            setProjects(projectsData);
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
