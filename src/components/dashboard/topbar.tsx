"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Copy, ChevronDown, LogOut, Settings as SettingsIcon, Check } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { SidebarNav } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { initials } from "@/lib/format";

export function Topbar({
  businessName,
  username,
}: {
  businessName: string;
  username: string;
}) {
  const [navOpen, setNavOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const bookingUrl = `slotwise.io/book/${username}`;

  function copyLink() {
    navigator.clipboard?.writeText(`https://${bookingUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-white px-4 md:px-6">
      <div className="flex items-center gap-3">
        <Sheet open={navOpen} onOpenChange={setNavOpen}>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setNavOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <SheetContent side="left" className="flex w-64 flex-col bg-navy p-0">
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <div className="flex items-center gap-2 px-5 py-5">
              <div className="h-7 w-7 rounded-btn bg-teal" />
              <span className="text-[15px] font-medium text-white">SlotWise</span>
            </div>
            <SidebarNav onNavigate={() => setNavOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      <button
        onClick={copyLink}
        className="hidden items-center gap-2 rounded-btn border border-input px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-teal hover:text-teal-mid sm:flex"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-teal-mid" /> : <Copy className="h-3.5 w-3.5" />}
        {bookingUrl}
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-btn px-2 py-1.5 hover:bg-muted">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-teal text-xs font-medium text-navy">
              {initials(businessName)}
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href="/settings">
              <SettingsIcon className="h-4 w-4" /> Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild destructive>
            <Link href="/login">
              <LogOut className="h-4 w-4" /> Log out
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
