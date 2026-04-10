"use client";

import { useState, useEffect, useRef } from "react";
import { SearchIcon, User, Settings, LogOut, TrendingUp } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/lib/session";
import { searchTradesBySetup } from "@/lib/search";
import { useRouter } from "next/navigation";
import { ModeToggle } from "./ModeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabaseClient";

interface TopBarProps {}

export function TopBar({}: TopBarProps) {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const userId = session?.user?.id ?? null;

  const [q, setQ] = useState("");
  const [setups, setSetups] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!q || !userId) {
      setSetups([]);
      setOpen(false);
      return;
    }

    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      const trades = await searchTradesBySetup({
        setupQuery: q,
        userId,
        limit: 50,
      });
      const unique = Array.from(
        new Set(
          (trades || [])
            .map((t: any) => (t.setup || "").trim())
            .filter(Boolean),
        ),
      );
      setSetups(unique);
      setOpen(unique.length > 0);
    }, 300);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [q, userId]);

  function handleSelectSetup(setup: string) {
    setOpen(false);
    setQ("");
    router.push(`/view-trades?setup=${encodeURIComponent(setup)}`);
  }

  return (
    <>
      <div className="w-full flex justify-between items-center border-b border-sidebar-border p-4 bg-sidebar/50 z-20">
        <div className="flex md:hidden items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <span className="text-lg font-bold text-foreground">Glint</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchDialogOpen(true)}
              className="p-2 rounded-md hover:bg-muted"
            >
              <SearchIcon className="h-5 w-5" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem asChild>
                  <div className="flex items-center justify-between w-full">
                    <span>Theme</span>
                    <ModeToggle />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="font-medium"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.push("/");
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4 text-red-500" />
                  <span className="text-red-500">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:flex items-center justify-between w-full gap-4">
          <div className="flex items-center gap-2 max-w-md flex-1 relative">
            <InputGroup className="w-full text-sm md:text-base">
              <InputGroupInput
                id="inline-start-input"
                placeholder="Search trades..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <InputGroupAddon align="inline-start">
                <SearchIcon className="text-muted-foreground" />
              </InputGroupAddon>
            </InputGroup>

            {open && setups.length > 0 && (
              <div className="absolute top-full left-0 mt-2 w-full bg-background border-b dark:bg-card rounded-md shadow-lg z-50">
                {setups.map((s) => (
                  <div
                    key={s}
                    onClick={() => handleSelectSetup(s)}
                    className="p-3 cursor-pointer flex justify-between items-center border-b last:border-0 hover:bg-accent rounded-md"
                  >
                    <div className="font-medium">{s}</div>
                    <div className="text-sm text-muted-foreground">
                      View trades
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <Button className="cursor-pointer">
              <Link href="/journal">Journal</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem asChild>
                  <div className="flex items-center justify-between w-full">
                    <span>Theme</span>
                    <ModeToggle />
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-500 font-medium"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.push("/");
                  }}
                >
                  <LogOut className="mr-2 h-4 w-4 text-red-500 font-medium" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Search Trades</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <InputGroup>
              <InputGroupInput
                placeholder="Search by setup..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                autoFocus
              />
              <InputGroupAddon align="inline-start">
                <SearchIcon className="text-muted-foreground" />
              </InputGroupAddon>
            </InputGroup>

            {open && setups.length > 0 && (
              <div className="space-y-2">
                {setups.map((s) => (
                  <div
                    key={s}
                    onClick={() => {
                      handleSelectSetup(s);
                      setSearchDialogOpen(false);
                    }}
                    className="p-3 cursor-pointer rounded-md hover:bg-accent"
                  >
                    <div className="font-medium">{s}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
