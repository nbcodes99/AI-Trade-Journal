"use client";

import { useState, useEffect, useRef } from "react";
import { AlignLeft, SearchIcon } from "lucide-react";
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

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { session, isLoading } = useAuth();
  const router = useRouter();
  const userId = session?.user?.id ?? null;

  const [q, setQ] = useState("");
  const [setups, setSetups] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
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
    <div className="w-full flex flex-col md:flex-row justify-between items-center border-b border-sidebar-border p-4 bg-sidebar/90 z-20 gap-4">
      <div className="flex items-center w-full gap-4 relative">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-md"
          aria-label="Open menu"
        >
          <AlignLeft className="h-6 w-6" />
        </button>

        <div className="w-full flex items-center gap-2 max-w-md relative">
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
          {/* 
          <Button
            // variant="outline"
            className="cursor-pointer"
            onClick={async () => {
              if (!userId || !q) return;
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
            }}
          >
            <SearchIcon />
          </Button> */}

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
      </div>

      <div className="items-center gap-4 mt-2 md:mt-0 hidden md:flex">
        <Button className="cursor-pointer">
          <Link href="/trades">Quick Add Trade</Link>
        </Button>
        <ModeToggle />
      </div>
    </div>
  );
}
