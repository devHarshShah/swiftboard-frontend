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
        // {
        //   title: "Dependencies & Subtasks",
        //   url: "#",
        // },
        // {
        //   title: "Templates",
        //   url: "#",
        // },
      ],
    },
    // {
    //   title: "Time Tracking",
    //   url: "#",
    //   icon: Clock,
    //   items: [
    //     {
    //       title: "Timer",
    //       url: "#",
    //     },
    //     {
    //       title: "Reports",
    //       url: "#",
    //     },
    //     {
    //       title: "Time Suggestions",
    //       url: "#",
    //     },
    //     {
    //       title: "Timesheets",
    //       url: "#",
    //     },
    //   ],
    // },
    {
      title: "Collaboration",
      url: "#",
      icon: MessageCircle,
      items: [
        {
          title: "Chat",
          url: "/dashboard/chat",
        },
        // {
        //   title: "Comments",
        //   url: "#",
        // },
        // {
        //   title: "Mentions",
        //   url: "#",
        // },
        // {
        //   title: "Calls",
        //   url: "#",
        // },
      ],
    },
    // {
    //   title: "Resource Management",
    //   url: "#",
    //   icon: UsersRound,
    //   items: [
    //     {
    //       title: "Workload Balancing",
    //       url: "#",
    //     },
    //     {
    //       title: "Skill Assignments",
    //       url: "#",
    //     },
    //     {
    //       title: "Availability",
    //       url: "#",
    //     },
    //   ],
    // },
    // {
    //   title: "Dashboards & Analytics",
    //   url: "#",
    //   icon: Gauge,
    //   items: [
    //     {
    //       title: "Project KPIs",
    //       url: "#",
    //     },
    //     {
    //       title: "Burn Charts",
    //       url: "#",
    //     },
    //     {
    //       title: "Predictive Analytics",
    //       url: "#",
    //     },
    //     {
    //       title: "Custom Reports",
    //       url: "#",
    //     },
    //   ],
    // },
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
          url: "#",
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
  teams,
  projects,
  ...props
}: {
  user: { name: string; email: string; avatar: string };
  teams: {
    team: { id: string; name: string; createdAt: string; updatedAt: string };
    role: string;
    status: string;
  }[];
  projects: {
    id: string;
    name: string;
    teamId: string;
    createdAt: string;
    updatedAt: string;
  }[];
} & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      {...props}
      className="overflow-auto scrollbar-custom"
    >
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
        <div className="mt-2">
          <ProjectSwitcher projects={projects} />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
