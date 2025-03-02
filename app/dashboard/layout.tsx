import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import BreadCrumbs from "@/components/breadcrumbs";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <BreadCrumbs />
        <main className="w-full">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
