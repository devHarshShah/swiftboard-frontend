"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, Users } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

function getTeamLogo(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo?: React.ElementType;
    plan: string;
  }[];
}) {
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState(
    teams.length > 0 ? teams[0] : null,
  );

  // Function to handle creating a new team
  const handleCreateTeam = () => {
    // Here you would typically navigate to team creation page or open a modal
    console.log("Create team clicked");
    // Example: router.push("/teams/create") or openCreateTeamModal()
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {teams.length > 0 ? (
                // Display active team if teams exist
                <>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    {activeTeam?.logo ? (
                      <activeTeam.logo className="size-4" />
                    ) : (
                      <span className="text-xl font-bold">
                        {getTeamLogo(activeTeam?.name || "")}
                      </span>
                    )}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {activeTeam?.name}
                    </span>
                    <span className="truncate text-xs">{activeTeam?.plan}</span>
                  </div>
                </>
              ) : (
                // Display "Join a Team" if no teams exist
                <>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-muted text-sidebar-muted-foreground">
                    <Users className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">No Teams</span>
                    <span className="truncate text-xs text-muted-foreground">
                      Create or join a team
                    </span>
                  </div>
                </>
              )}
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Teams
            </DropdownMenuLabel>
            {teams.length > 0 ? (
              // Show existing teams
              teams.map((team, index) => (
                <DropdownMenuItem
                  key={team.name}
                  onClick={() => setActiveTeam(team)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    {team.logo ? (
                      <team.logo className="size-4 shrink-0" />
                    ) : (
                      <span className="text-sm font-bold">
                        {getTeamLogo(team.name)}
                      </span>
                    )}
                  </div>
                  {team.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))
            ) : (
              // Show message when no teams exist
              <DropdownMenuItem
                disabled
                className="text-center text-sm text-muted-foreground p-2"
              >
                You aren&apos;t part of any teams yet
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleCreateTeam}
              className="gap-2 p-2 font-medium"
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              {teams.length > 0 ? "Create new team" : "Create your first team"}
            </DropdownMenuItem>
            {teams.length === 0 && (
              <DropdownMenuItem className="gap-2 p-2 text-xs text-muted-foreground">
                <div className="pl-8">
                  Teams help you organize your projects and collaborate with
                  others
                </div>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
