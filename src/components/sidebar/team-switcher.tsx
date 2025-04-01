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
} from "@/src/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/src/components/ui/sidebar";

import { AvatarFallback, Avatar } from "../ui/avatar";
import { useModal } from "../modal-provider";
import { useAppContext } from "@/src/contexts/app-context";

function getTeamLogo(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export function TeamSwitcher() {
  const { isMobile } = useSidebar();
  const { teams, activeTeam, setActiveTeam } = useAppContext();
  const { openModal } = useModal();

  const handleTeamSelect = (team: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  }) => {
    setActiveTeam(team);
  };

  const handleCreateTeam = () => {
    openModal("CREATE_TEAM", {
      onSubmit: () => console.log("Create team clicked"),
    });
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
                <>
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {getTeamLogo(activeTeam?.name || "")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {activeTeam?.name}
                    </span>
                    <span className="truncate text-xs">
                      {
                        teams.find(
                          (teamData) => teamData.team.id === activeTeam?.id,
                        )?.role
                      }
                    </span>
                  </div>
                </>
              ) : (
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
              teams.map((teamData, index) => (
                <DropdownMenuItem
                  key={teamData.team.id}
                  onClick={() => handleTeamSelect(teamData.team)}
                  className="gap-2 p-2"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {getTeamLogo(teamData.team.name)}
                    </AvatarFallback>
                  </Avatar>
                  {teamData.team.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))
            ) : (
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
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
