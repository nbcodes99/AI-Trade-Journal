"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  User,
  Settings,
  LogOut,
  TrendingUp,
  X,
  Clock,
  ArrowRight,
  Command,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/lib/session";
import { searchTradesBySetup } from "@/lib/search";
import { useRouter, usePathname } from "next/navigation";
import { ModeToggle } from "./ModeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";

const PAGE_META: Record<string, { label: string }> = {
  "/dashboard": { label: "Dashboard" },
  "/trades": { label: "Trade Journal" },
  "/insights": { label: "Insights" },
  "/journal": { label: "Log Trade" },
  "/profile": { label: "Settings" },
};

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/trades", label: "Trades" },
  { href: "/insights", label: "Insights" },
  { href: "/journal", label: "Journal" },
];

export function TopBar() {
  const { session } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const userId = session?.user?.id ?? null;
  const userName =
    session?.user?.user_metadata?.full_name ||
    session?.user?.user_metadata?.name ||
    session?.user?.email ||
    "";
  const userInitials = userName
    ? userName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "T";

  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [quickStats, setQuickStats] = useState<{
    trades: number;
    winRate: string;
  } | null>(null);
  const debounceRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch live stats
  useEffect(() => {
    if (!userId) return;
    const fetchStats = async () => {
      const { data } = await supabase
        .from("trades")
        .select("result")
        .eq("user_id", userId);
      if (!data) return;
      const wins = data.filter((t) => t.result === "win").length;
      const wr = data.length ? ((wins / data.length) * 100).toFixed(1) : "0.0";
      setQuickStats({ trades: data.length, winRate: wr });
    };
    fetchStats();
  }, [userId]);

  // Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => inputRef.current?.focus(), 50);
  }, [searchOpen]);

  // Search debounce
  useEffect(() => {
    if (!q || !userId) {
      setResults([]);
      return;
    }
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      const trades = await searchTradesBySetup({
        setupQuery: q,
        userId,
        limit: 8,
      });
      setResults(trades || []);
    }, 250);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [q, userId]);

  const handleSelectSetup = (setup: string) => {
    if (setup && !recentSearches.includes(setup)) {
      setRecentSearches((prev) => [setup, ...prev].slice(0, 5));
    }
    setSearchOpen(false);
    setQ("");
    setResults([]);
    router.push(`/view-trades?setup=${encodeURIComponent(setup)}`);
  };

  const uniqueSetups = Array.from(
    new Set(results.map((t: any) => (t.setup || "").trim()).filter(Boolean)),
  );

  const currentPage = PAGE_META[pathname] || { label: "Glint" };

  return (
    <>
      <header className="w-full border-b border-border/60 bg-background/70 backdrop-blur-xl z-20 sticky top-0">
        <div className="flex items-center justify-between px-4 md:px-6 p-6">
          <div className="flex items-center gap-4 min-w-0">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 md:hidden shrink-0"
            >
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="font-extrabold text-foreground tracking-tight">
                Glint
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-primary" />
                <span className="text-muted-foreground/90 text-sm">/</span>
                <span className="text-sm font-semibold text-foreground">
                  {currentPage.label}
                </span>
              </div>

              <div className="h-4 w-px bg-border" />

              {quickStats && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Trades
                    </span>
                    <span className="text-xs font-extrabold text-foreground">
                      {quickStats.trades}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      WR
                    </span>
                    <span
                      className={`text-xs font-extrabold ${
                        parseFloat(quickStats.winRate) >= 50
                          ? "text-primary"
                          : "text-destructive"
                      }`}
                    >
                      {quickStats.winRate}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2 h-9 px-3 rounded-lg border border-border/60 bg-muted/40 text-muted-foreground text-sm hover:bg-muted hover:text-foreground transition-all duration-150 min-w-[180px]"
            >
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span className="flex-1 text-left text-xs">Search trades...</span>
              <kbd className="flex items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium">
                <Command className="h-2.5 w-2.5" />K
              </kbd>
            </button>

            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-muted/40 text-muted-foreground hover:text-foreground transition-all"
            >
              <Search className="h-4 w-4" />
            </button>

            <Link href="/journal" className="hidden md:flex">
              <Button size="sm" className="gap-1.5 h-9 font-semibold text-xs">
                <BookOpen className="h-3.5 w-3.5" />
                Log Trade
              </Button>
            </Link>

            <div className="hidden md:flex">
              <ModeToggle />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 border border-primary/20 text-primary text-xs font-extrabold hover:bg-primary/25 transition-all">
                  {userInitials}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end" sideOffset={8}>
                <div className="px-3 py-3 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary text-sm font-extrabold border border-primary/20 shrink-0">
                      {userInitials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {userName.split(" ")[0] || "Trader"}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {session?.user?.email}
                      </p>
                    </div>
                    <Badge
                      variant="default"
                      className="text-[10px] py-0 h-5 shrink-0"
                    >
                      Pro
                    </Badge>
                  </div>
                </div>

                <div className="py-1">
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 pt-2 pb-1">
                    Account
                  </DropdownMenuLabel>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <span>Settings & Profile</span>
                      <ChevronRight className="h-3 w-3 ml-auto text-muted-foreground" />
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/journal"
                      className="flex items-center gap-2 cursor-pointer md:hidden"
                    >
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>Log a Trade</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="md:hidden">
                    <span className="text-sm">Theme</span>
                    <div className="ml-auto">
                      <ModeToggle />
                    </div>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator />

                <div className="py-1">
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                    onClick={async () => {
                      await supabase.auth.signOut();
                      router.push("/");
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium">Sign Out</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="p-0 gap-0 max-w-lg overflow-hidden rounded-2xl border border-border shadow-2xl">
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by setup..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            {q && (
              <button
                onClick={() => {
                  setQ("");
                  setResults([]);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="max-h-[380px] overflow-y-auto">
            {uniqueSetups.length > 0 && (
              <div className="p-2">
                <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Setups matching "{q}"
                </p>
                {uniqueSetups.map((setup) => (
                  <button
                    key={setup}
                    onClick={() => handleSelectSetup(setup)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-left group"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground capitalize">
                        {setup}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {results.filter((t: any) => t.setup === setup).length}{" "}
                        trade
                        {results.filter((t: any) => t.setup === setup)
                          .length !== 1
                          ? "s"
                          : ""}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}

            {!q && recentSearches.length > 0 && (
              <div className="p-2">
                <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Recent Searches
                </p>
                {recentSearches.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSelectSetup(s)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-left group"
                  >
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="flex-1 text-sm text-muted-foreground capitalize">
                      {s}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}

            {!q && (
              <div className="p-2 border-t border-border">
                <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Quick Navigation
                </p>
                {NAV_LINKS.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => {
                      setSearchOpen(false);
                      router.push(link.href);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-left group"
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold border border-border bg-muted ${
                        pathname === link.href
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {link.label[0]}
                    </div>
                    <span className="flex-1 text-sm font-medium text-foreground">
                      {link.label}
                    </span>
                    {pathname === link.href && (
                      <Badge variant="outline" className="text-[10px] py-0 h-4">
                        Current
                      </Badge>
                    )}
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}

            {q && uniqueSetups.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <Search className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm font-medium text-foreground">
                  No setups found
                </p>
                <p className="text-xs text-muted-foreground">
                  Try a different pattern or setup name
                </p>
              </div>
            )}
          </div>

          <div
            className="flex
           items-center gap-4 px-4 py-2.5 border-t border-border bg-muted/30"
          >
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <kbd className="rounded border border-border bg-background px-1 py-0.5 text-[9px]">
                ↵
              </kbd>{" "}
              Select
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <kbd className="rounded border border-border bg-background px-1 py-0.5 text-[9px]">
                ESC
              </kbd>{" "}
              Close
            </span>
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
              <Command className="h-2.5 w-2.5" />
              <kbd className="rounded border border-border bg-background px-1 py-0.5 text-[9px]">
                K
              </kbd>{" "}
              to open
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
