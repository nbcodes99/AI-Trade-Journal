"use client";

import Link from "next/link";
import { useState } from "react";
import classnames from "classnames";
import { usePathname } from "next/navigation";
import { AlignRight } from "lucide-react";
import { GiCrossedAirFlows } from "react-icons/gi";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useAuth } from "@/lib/session";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

export default function Header() {
  const currentPath = usePathname();
  const session = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);

  const links = session
    ? [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Trades", href: "/trades" },
        { label: "Insights", href: "/insights" },
      ]
    : [
        { label: "Features", href: "/features" },
        { label: "Pricing", href: "/pricing" },
        { label: "Login", href: "/login" },
      ];

  function toggleNavbar() {
    setIsOpen(!isOpen);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 backdrop-blur-sm border-b">
      <nav className="container mx-auto flex max-w-5xl justify-between items-center px-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/glint1.png"
            alt="Glint"
            width={180}
            height={180}
            priority
          />
          <span className="sr-only">Glint</span>
        </Link>

        <ul className="hidden md:flex gap-8">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={classnames("transition-colors", {
                  "border-b-2 font-medium": link.href === currentPath,
                  "font-medium text-muted-foreground":
                    link.href !== currentPath,
                })}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {session && (
          <div
            className="ml-4 hidden md:block relative"
            onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
            // onMouseEnter={() => setAvatarMenuOpen(true)}
            // onMouseLeave={() => setAvatarMenuOpen(false)}
          >
            <Image
              src={session.user.user_metadata?.avatar_url || "/avatar.jpg"}
              alt="Profile"
              width={40}
              height={40}
              className="rounded-full border border-gray-300 cursor-pointer"
            />
            {avatarMenuOpen && (
              <div className="absolute right-0 mt-2 w-32">
                <Button onClick={handleLogout} variant="destructive">
                  Logout
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="hamburger md:hidden" onClick={toggleNavbar}>
          {isOpen ? (
            <GiCrossedAirFlows className="transition-colors text-2xl" />
          ) : (
            <AlignRight className="transition-colors text-3xl" />
          )}
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.ul
              className="open flex flex-col gap-4 md:hidden absolute right-0 top-full bg-background p-6 shadow-lg"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.5 }}
            >
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={classnames("transition-colors", {
                      "text-teal-700 border-b-2 border-teal-700":
                        link.href === currentPath,
                      "text-teal-400 hover:text-teal-300":
                        link.href !== currentPath,
                    })}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {session && (
                <li className="mt-4">
                  <Button onClick={handleLogout} variant="destructive">
                    Logout
                  </Button>
                </li>
              )}
            </motion.ul>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
