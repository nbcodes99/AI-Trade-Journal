"use client";

import React from "react";
import Sidebar from "./Sidebar";
import { TopBar } from "./TopBar";
import { BottomNav } from "./BottomNav";
import Header from "./Navbar";
import { ThemeProvider } from "./theme-provider";
import { useAuth } from "@/lib/session";
import Footer from "./Footer";
import { PageTransition } from "./PageTransition";
import { Toaster } from "@/components/ui/sonner";
import { useRiskMonitor } from "@/lib/useRiskMonitor";
import InstallPrompt from "./InstallPrompt";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { session, isLoading } = useAuth();
  useRiskMonitor(session?.user?.id ?? null);
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  if (isLoading) {
    return (
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <div className="flex-1 min-h-screen bg-background" />
      </ThemeProvider>
    );
  }

  if (!session) {
    return (
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Header />
        <Toaster richColors position="top-center" />
        <main className="pt-20 min-h-screen bg-background">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <Toaster richColors position="top-center" />
      <InstallPrompt />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 overflow-auto ml-0 md:ml-56">
        <TopBar />
        <main className="flex-1 bg-background p-6">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
      <BottomNav />
    </ThemeProvider>
  );
}
