"use client";

import React, { useEffect, useState } from "react";
import { SidebarInset, SidebarProvider } from "@/src/components/ui/sidebar";
import { AppSidebar } from "@/src/components/sidebar/app-sidebar";
import BreadCrumbs from "@/src/components/sidebar/breadcrumbs";
import { ModalProvider } from "@/src/components/modal-provider";
import ModalContainer from "@/src/components/modals/modal.container";
import { AppProvider, useAppContext } from "@/src/contexts/app-context";
import { ToastProvider } from "@/src/contexts/toast-context";

function AppContent({ children }: { children: React.ReactNode }) {
  const { user, teams, projects, loading } = useAppContext();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <>
      <ToastProvider>
        {user && <AppSidebar user={user} teams={teams} projects={projects} />}
        <SidebarInset>
          <BreadCrumbs />
          <main className="w-full">
            {/* Use div with suppressHydrationWarning for the children */}
            <div suppressHydrationWarning>
              {isClient ? (
                children
              ) : (
                <div className="opacity-0">{children}</div>
              )}
            </div>
          </main>
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
