"use client";
import { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import BreadCrumbs from "@/components/breadcrumbs";
import { apiClient } from "@/lib/apiClient";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);

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

  return (
    <SidebarProvider>
      {user && <AppSidebar user={user} teams={teams} />}
      <SidebarInset>
        <BreadCrumbs />
        <main className="w-full">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
