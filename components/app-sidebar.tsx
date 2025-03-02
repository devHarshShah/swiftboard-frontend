"use client";

import * as React from "react";
import {
  Bell,
  BookOpen,
  Calendar,
  Clock,
  Command,
  FileStack,
  Gauge,
  GitBranch,
  LifeBuoy,
  LineChart,
  MessageCircle,
  Play,
  Puzzle,
  Send,
  Settings2,
  UsersRound,
  Zap,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Project & Task Management",
      url: "#",
      icon: FileStack,
      isActive: true,
      items: [
        {
          title: "Kanban Boards",
          url: "#",
        },
        {
          title: "Gantt Charts",
          url: "#",
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      variant="inset"
      collapsible="icon"
      {...props}
      className="overflow-auto scrollbar-custom"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">ProjectPro</span>
                  <span className="truncate text-xs">Enterprise PM Suite</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
