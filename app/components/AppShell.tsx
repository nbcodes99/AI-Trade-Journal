"use client";

import React from "react";
import Sidebar from "./Sidebar";
import { TopBar } from "./TopBar";
import { ThemeProvider } from "./theme-provider";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden ml-0 md:ml-64">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-auto bg-background p-6">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
