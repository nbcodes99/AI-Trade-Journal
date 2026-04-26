"use client";

import Link from "next/link";
import { useAuth } from "@/lib/session";
import classnames from "classnames";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  BookOpen,
  ListChecks,
  BarChart3,
  Layers,
  CreditCard,
  LogIn,
  Settings,
  TrendingUp,
  ChevronRight,
  LogOut,
  Zap,
  Shield,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, isLoading } = useAuth();

  const userName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.user_metadata?.name ||
    session?.user?.email ||
    "Trader";
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const userEmail = session?.user?.email || "";

  const authedLinks = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: Home,
      description: "Overview",
    },
    {
      label: "Journal",
      href: "/journal",
      icon: BookOpen,
      description: "Log trades",
    },
    {
      label: "Trades",
      href: "/trades",
      icon: ListChecks,
      description: "History",
    },
    {
      label: "Analytics",
      href: "/insights",
      icon: BarChart3,
      description: "Insights",
    },
    {
      label: "Risk Manager",
      href: "/risk-manager",
      icon: Shield,
      description: "Protect capital",
    },
  ];

  const publicLinks = [
    {
      label: "Features",
      href: "/features",
      icon: Layers,
      description: "What's included",
    },
    {
      label: "Pricing",
      href: "/pricing",
      icon: CreditCard,
      description: "Plans & billing",
    },
    { label: "Login", href: "/login", icon: LogIn, description: "Sign in" },
  ];

  const links = session ? authedLinks : publicLinks;

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={classnames(
          "fixed inset-y-0 left-0 w-56 flex flex-col z-40 transform transition-transform duration-200",
          "bg-sidebar/60 backdrop-blur-xl border-r border-sidebar-border/60",
          {
            "-translate-x-full": !open,
            "translate-x-0": open,
            "md:translate-x-0": true,
          },
        )}
      >
        <div className="px-5 pt-6 pb-4 border-b border-border/40">
          <Link
            href="/"
            onClick={onClose}
            className="flex items-center gap-2.5"
          >
            <TrendingUp className="h-4 w-4 text-primary" />
            <div>
              <p className="text-base font-extrabold tracking-tight text-foreground leading-none">
                Glint
              </p>
              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                Trading Journal
              </p>
            </div>
          </Link>
        </div>

        <div className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="px-2 mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            {session ? "Navigation" : "Menu"}
          </p>
          <nav className="flex flex-col gap-0.5">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={classnames(
                    "group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={classnames(
                        "flex h-7 w-7 items-center justify-center rounded-lg transition-all",
                        isActive
                          ? "bg-primary/20 text-primary"
                          : "bg-muted/60 text-muted-foreground group-hover:bg-muted group-hover:text-foreground",
                      )}
                    >
                      <link.icon className="h-3.5 w-3.5" />
                    </div>
                    <div>
                      <p className="text-sm leading-none">{link.label}</p>
                      <p
                        className={classnames(
                          "text-[10px] mt-0.5 leading-none",
                          isActive
                            ? "text-primary/70"
                            : "text-muted-foreground/60",
                        )}
                      >
                        {link.description}
                      </p>
                    </div>
                  </div>
                  {isActive ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  ) : (
                    <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-40 transition-opacity" />
                  )}
                </Link>
              );
            })}
          </nav>

          {session && (
            <div className="mt-6">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  <p className="text-xs font-bold text-foreground">
                    Unlock Pro
                  </p>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Get AI coaching, unlimited trades & advanced analytics.
                </p>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="flex items-center justify-center w-full h-7 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
                >
                  Upgrade →
                </Link>
              </div>
            </div>
          )}
        </div>

        {session && (
          <div className="border-t border-border/40 p-3 space-y-1">
            <Link
              href="/profile"
              onClick={onClose}
              className={classnames(
                "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                pathname === "/profile"
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
              )}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground group-hover:bg-muted group-hover:text-foreground transition-all">
                <Settings className="h-3.5 w-3.5" />
              </div>
              <span>Settings</span>
            </Link>

            <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-muted/30 border border-border/40">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 border border-primary/20 text-primary text-xs font-extrabold shrink-0">
                {userInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {userName.split(" ")[0]}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {userEmail}
                </p>
              </div>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/");
                }}
                className="flex h-6 w-6 items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                title="Sign out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
