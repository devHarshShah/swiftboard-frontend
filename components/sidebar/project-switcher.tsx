"use client";

import * as React from "react";
import { ChevronsUpDown, Plus, Users } from "lucide-react";
import Cookies from "js-cookie";

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

import { AvatarFallback, Avatar } from "../ui/avatar";

import { useModal } from "../modal-provider";

function getProjectLogo(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export function ProjectSwitcher({
  projects,
}: {
  projects: {
    id: string;
    name: string;
    teamId: string;
    createdAt: string;
    updatedAt: string;
  }[];
}) {
  const { isMobile } = useSidebar();
  const [activeProject, setActiveProject] = React.useState(
    projects.length > 0 ? projects[0] : null,
  );

  React.useEffect(() => {
    if (projects.length > 0) {
      setActiveProject(projects[0]);
      Cookies.set("activeProjectId", projects[0].id);
    }
  }, [projects]);

  const handleProjectSelect = (project: {
    id: string;
    name: string;
    teamId: string;
    createdAt: string;
    updatedAt: string;
  }) => {
    setActiveProject(project);
    Cookies.set("activeProjectId", project.id);
  };

  const { openModal } = useModal();

  // Function to handle creating a new project
  const handleCreateProject = () => {
    openModal("CREATE_PROJECT", {
      onSubmit: () => console.log("Create project clicked"),
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
              {projects.length > 0 ? (
                // Display active project if projects exist
                <>
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {getProjectLogo(activeProject?.name || "")}
                    </AvatarFallback>
                  </Avatar>

                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {activeProject?.name}
                    </span>
                  </div>
                </>
              ) : (
                // Display "No Projects" if no projects exist
                <>
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-muted text-sidebar-muted-foreground">
                    <Users className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">No Projects</span>
                    <span className="truncate text-xs text-muted-foreground">
                      Create or join a project
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
              Projects
            </DropdownMenuLabel>
            {projects.length > 0 ? (
              // Show existing projects
              projects.map((project, index) => (
                <DropdownMenuItem
                  key={project.id}
                  onClick={() => handleProjectSelect(project)}
                  className="gap-2 p-2"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg">
                      {getProjectLogo(project.name)}
                    </AvatarFallback>
                  </Avatar>
                  {project.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </DropdownMenuItem>
              ))
            ) : (
              // Show message when no projects exist
              <DropdownMenuItem
                disabled
                className="text-center text-sm text-muted-foreground p-2"
              >
                You aren&apos;t part of any projects yet
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleCreateProject}
              className="gap-2 p-2 font-medium"
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              {projects.length > 0
                ? "Create new project"
                : "Create your first project"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
