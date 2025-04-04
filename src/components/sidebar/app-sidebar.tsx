"use client";

import * as React from "react";
import {
  Bell,
  BookOpen,
  FileStack,
  LifeBuoy,
  MessageCircle,
  Send,
  Zap,
  Settings2,
} from "lucide-react";

import { NavMain } from "@/src/components/sidebar/nav-main";
import { NavSecondary } from "@/src/components/sidebar/nav-secondary";
import { NavUser } from "@/src/components/sidebar/nav-user";
import { TeamSwitcher } from "./team-switcher";
import { ProjectSwitcher } from "./project-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/src/components/ui/sidebar";

import { User, Team, Project } from "@/src/types";

const data = {
  navMain: [
    {
      title: "Project & Task Management",
      url: "#",
      icon: FileStack,
      isActive: true,
      items: [
        {
          title: "Kanban Boards",
          url: "/dashboard/kanbanboard",
        },
        {
          title: "Task Lists",
          url: "/dashboard/tasklist",
        },
      ],
    },

    {
      title: "Collaboration",
      url: "#",
      icon: MessageCircle,
      items: [
        {
          title: "Chat",
          url: "/dashboard/chat",
        },
      ],
    },

    {
      title: "Automations & Integrations",
      url: "#",
      icon: Zap,
      items: [
        {
          title: "Workflow Builder",
          url: "/dashboard/workflow",
        },
        {
          title: "API & Webhooks",
          url: "#",
        },
      ],
    },
    {
      title: "Notifications",
      url: "#",
      icon: Bell,
      items: [
        {
          title: "Real-Time Updates",
          url: "/dashboard/notification",
        },
        {
          title: "Email Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Team",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
    },
    {
      title: "Support",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "#",
      icon: Send,
    },
  ],
};

export function AppSidebar({
  user,
  ...props
}: {
  user: User;
  teams: Team[];
  projects: Project[];
} & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      {...props}
      className="overflow-auto scrollbar-custom"
    >
      <SidebarHeader>
        <TeamSwitcher />
        <div className="mt-2">
          <ProjectSwitcher />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
