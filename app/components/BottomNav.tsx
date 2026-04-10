"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, TrendingUp, Lightbulb } from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/journal", icon: BookOpen, label: "Journal" },
  { href: "/trades", icon: TrendingUp, label: "Trades" },
  { href: "/insights", icon: Lightbulb, label: "Insights" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed md:hidden bottom-0 left-0 right-0 border-t border-sidebar-border bg-sidebar/60 backdrop-blur z-10">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center h-16 w-full transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title={label}
            >
              <Icon className="h-6 w-6" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
