"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "./ModeToggle";
import { AlignLeft, SearchIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import Link from "next/link";

interface TopBarProps {
  onMenuClick: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  return (
    <div className="w-full flex flex-col md:flex-row justify-between items-center border-b border-sidebar-border p-4 bg-sidebar/90 z-20">
      <div className="flex items-center w-full gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-md"
          aria-label="Open menu"
        >
          <AlignLeft className="h-6 w-6" />
        </button>
        <div className="w-full flex items-center gap-2 max-w-md">
          <InputGroup>
            <InputGroupInput id="inline-start-input" placeholder="Search..." />
            <InputGroupAddon align="inline-start">
              <SearchIcon className="text-muted-foreground" />
            </InputGroupAddon>
          </InputGroup>
          <Button variant="outline" className="cursor-pointer">
            Search
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-4 mt-2 md:mt-0">
        <Button className="cursor-pointer">
          <Link href="/trades">Quick Add Trade</Link>
        </Button>
        <ModeToggle />
      </div>
    </div>
  );
}
