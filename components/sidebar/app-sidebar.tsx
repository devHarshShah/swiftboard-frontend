"use client";

import * as React from "react";
import {
  Bell,
  BookOpen,
  Calendar,
  Clock,
  FileStack,
  Gauge,
  GitBranch,
  LifeBuoy,
  LineChart,
  MessageCircle,
  Play,
  Puzzle,
  Send,
  UsersRound,
  Zap,
  Settings2,
} from "lucide-react";

import { NavMain } from "@/components/sidebar/nav-main";
import { NavProjects } from "@/components/sidebar/nav-projects";
import { NavSecondary } from "@/components/sidebar/nav-secondary";
import { NavUser } from "@/components/sidebar/nav-user";
import { TeamSwitcher } from "./team-switcher";
import { ProjectSwitcher } from "./project-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

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
          url: "#",
        },
        {
          title: "Dependencies & Subtasks",
          url: "#",
        },
        {
          title: "Templates",
          url: "#",
        },
      ],
    },
    {
      title: "Time Tracking",
      url: "#",
      icon: Clock,
      items: [
        {
          title: "Timer",
          url: "#",
        },
        {
          title: "Reports",
          url: "#",
        },
        {
          title: "Time Suggestions",
          url: "#",
        },
        {
          title: "Timesheets",
          url: "#",
        },
      ],
    },
    {
      title: "Agile & Scrum",
      url: "#",
      icon: GitBranch,
      items: [
        {
          title: "Sprint Planning",
          url: "#",
        },
        {
          title: "Backlog",
          url: "#",
        },
        {
          title: "User Stories",
          url: "#",
        },
        {
          title: "Team Velocity",
          url: "#",
        },
        {
          title: "Retrospectives",
          url: "#",
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
          url: "#",
        },
        {
          title: "Comments",
          url: "#",
        },
        {
          title: "Mentions",
          url: "#",
        },
        {
          title: "Calls",
          url: "#",
        },
      ],
    },
    {
      title: "Resource Management",
      url: "#",
      icon: UsersRound,
      items: [
        {
          title: "Workload Balancing",
          url: "#",
        },
        {
          title: "Skill Assignments",
          url: "#",
        },
        {
          title: "Availability",
          url: "#",
        },
      ],
    },
    {
      title: "Dashboards & Analytics",
      url: "#",
      icon: Gauge,
      items: [
        {
          title: "Project KPIs",
          url: "#",
        },
        {
          title: "Burn Charts",
          url: "#",
        },
        {
          title: "Predictive Analytics",
          url: "#",
        },
        {
          title: "Custom Reports",
          url: "#",
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
          url: "#",
        },
        {
          title: "App Integrations",
          url: "#",
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
        {
          title: "Priority Alerts",
          url: "#",
        },
        {
          title: "AI Suggestions",
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
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Customization",
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
  projects: [
    {
      name: "Active Sprints",
      url: "#",
      icon: Play,
    },
    {
      name: "Recent Projects",
      url: "#",
      icon: Calendar,
    },
    {
      name: "Performance",
      url: "#",
      icon: LineChart,
    },
    {
      name: "Integration Hub",
      url: "#",
      icon: Puzzle,
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
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
