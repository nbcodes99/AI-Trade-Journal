"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Lightbulb,
  Shield,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/journal", icon: BookOpen, label: "Journal" },
  { href: "/trades", icon: TrendingUp, label: "Trades" },
  { href: "/insights", icon: Lightbulb, label: "Insights" },
  { href: "/risk-manager", icon: Shield, label: "Risk" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed md:hidden bottom-0 left-0 right-0 z-50">
      <div className="mx-3 mb-3 rounded-2xl border border-border/60 bg-background/80 backdrop-blur-xl shadow-lg shadow-black/10 overflow-hidden">
        <div className="flex items-center justify-around px-1 h-16">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center justify-center gap-1 flex-1 h-full relative group"
              >
                <div
                  className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-all duration-200 ${
                    isActive ? "bg-primary/15" : "group-active:bg-muted/60"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 transition-all duration-200 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={`text-[9px] font-semibold leading-none transition-all duration-200 ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {label}
                  </span>
                </div>

                {isActive && (
                  <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
