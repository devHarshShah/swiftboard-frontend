"use client";
import { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import BreadCrumbs from "@/components/breadcrumbs";
import nookies from "nookies";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, setUser] = useState(null);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const fetchWithToken = async (url: string, options: RequestInit = {}) => {
      let accessToken = nookies.get().access_token;
      const refreshToken = nookies.get().refresh_token;

      if (!accessToken && refreshToken) {
        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${refreshToken}`,
          },
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          accessToken = refreshData.accessToken;
          nookies.set(null, "access_token", accessToken, {
            maxAge: 15 * 60, // 15 minutes
            path: "/",
          });
        } else {
          console.error("Failed to refresh token");
          return refreshResponse;
        }
      }

      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401 && refreshToken) {
        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${refreshToken}`,
          },
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          accessToken = refreshData.accessToken;
          nookies.set(null, "access_token", accessToken, {
            maxAge: 15 * 60, // 15 minutes
            path: "/",
          });

          return fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${accessToken}`,
            },
          });
        } else {
          console.error("Failed to refresh token");
          return refreshResponse;
        }
      }

      return response;
    };

    const fetchUserData = async () => {
      try {
        const userResponse = await fetchWithToken("/api/user/me");
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
        const teamsResponse = await fetchWithToken("/api/teams/user");
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
