"use client";

import React from "react";
import { SidebarInset, SidebarProvider } from "@/src/components/ui/sidebar";
import { AppSidebar } from "@/src/components/sidebar/app-sidebar";
import BreadCrumbs from "@/src/components/sidebar/breadcrumbs";
import { ModalProvider } from "@/src/components/modal-provider";
import ModalContainer from "@/src/components/modals/modal.container";
import { AppProvider, useAppContext } from "@/src/contexts/app-context";
import { ToastProvider } from "@/src/contexts/toast-context";

// This component uses the context
function AppContent({ children }: { children: React.ReactNode }) {
  const { user, teams, projects, loading } = useAppContext();

  if (loading) {
    return <div>Loading...</div>; // Or a proper loading component
  }

  return (
    <>
      <ToastProvider>
        {user && <AppSidebar user={user} teams={teams} projects={projects} />}
        <SidebarInset>
          <BreadCrumbs />
          <main className="w-full">{children}</main>
        </SidebarInset>
        <ModalContainer />
      </ToastProvider>
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppProvider>
      <SidebarProvider>
        <ModalProvider>
          <AppContent>{children}</AppContent>
        </ModalProvider>
      </SidebarProvider>
    </AppProvider>
  );
}
