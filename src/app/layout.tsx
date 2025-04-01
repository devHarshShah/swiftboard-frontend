import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/src/components/sidebar/theme-provider";

export const metadata: Metadata = {
  title: "SwiftBoard - Streamline Your Workflow",
  description:
    "The all-in-one platform for teams to collaborate, manage tasks, and automate workflows",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
