"use client";

import Link from "next/link";
import { useAuth } from "@/lib/session";
import Image from "next/image";
import classnames from "classnames";
import { usePathname } from "next/navigation";
import { IoIosSettings } from "react-icons/io";
import {
  Home,
  BookOpen,
  ListChecks,
  BarChart3,
  Layers,
  CreditCard,
  LogIn,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { session, isLoading } = useAuth();
  const links = session
    ? [
        { label: "Dashboard", href: "/dashboard", icon: Home },
        { label: "Journal", href: "/journal", icon: BookOpen },
        { label: "Trades", href: "/trades", icon: ListChecks },
        { label: "Analytics", href: "/insights", icon: BarChart3 },
      ]
    : [
        { label: "Features", href: "/features", icon: Layers },
        { label: "Pricing", href: "/pricing", icon: CreditCard },
        { label: "Login", href: "/login", icon: LogIn },
      ];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={classnames(
          "fixed inset-y-0 left-0 bg-sidebar/40 backdrop-blur-sm border-r border-sidebar-border w-56 p-6 flex flex-col justify-between transform transition-transform duration-200 z-40",
          {
            "-translate-x-full": !open,
            "translate-x-0": open,
            "md:translate-x-0": true,
          },
        )}
      >
        <div>
          <Link href="/">
            <Image src="/glint1.png" alt="Glint" width={220} height={220} />
            <span className="sr-only">Glint</span>
          </Link>
          <nav className="flex flex-col gap-4 mt-6">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={classnames(
                    "flex flex-col items-start gap-1 text-base font-medium text-sidebar-foreground transition-colors",
                    {
                      "text-primary": isActive,
                    },
                  )}
                  onClick={onClose}
                >
                  <div className="flex items-center gap-3">
                    <link.icon className="h-4 w-4 text-current" />
                    {link.label}
                  </div>
                  {isActive && (
                    <span className="block h-0.5 w-8 rounded-full bg-primary" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {session && (
          <div className="mt-4 mb-14">
            <Link href="/profile" className="flex items-center gap-2 text-2xl">
              <IoIosSettings />
              <span className="text-sm font-medium">Settings</span>
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
