"use client";

import Link from "next/link";
import { useAuth } from "@/lib/session";
import Image from "next/image";
import classnames from "classnames";
import { IoIosSettings } from "react-icons/io";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { session, isLoading } = useAuth();
  const links = session
    ? [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Journal", href: "/journal" },
        { label: "Trades", href: "/trades" },
        { label: "Insights", href: "/insights" },
      ]
    : [
        { label: "Features", href: "/features" },
        { label: "Pricing", href: "/pricing" },
        { label: "Login", href: "/login" },
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
          <Link href="/" className="flex items-center justify-around">
            <Image src="/glint2.png" alt="Glint" width={220} height={220} />
            <span className="sr-only">Glint</span>
          </Link>
          <nav className="flex flex-col gap-4 mt-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-base font-medium text-sidebar-foreground"
                onClick={onClose}
              >
                {link.label}
              </Link>
            ))}
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
