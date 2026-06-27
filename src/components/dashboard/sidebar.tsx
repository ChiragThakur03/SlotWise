"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/format";
import { NAV_ITEMS } from "@/components/dashboard/nav-items";
import { useProgressStart } from "@/components/navigation-progress";

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const startProgress = useProgressStart();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  return (
    <nav className="flex-1 space-y-0.5 px-3 py-2">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        const pending = pendingHref === item.href && !active;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => {
              if (!active) {
                setPendingHref(item.href);
                startProgress();
              }
              onNavigate?.();
            }}
            className={cn(
              "flex items-center gap-3 rounded-btn border-l-[3px] px-3 py-2 text-sm transition-colors",
              active || pending
                ? "border-teal bg-teal-light pl-[9px] font-medium text-accent-foreground"
                : "border-transparent text-white/60 hover:bg-white/5 hover:text-white/90"
            )}
          >
            <Icon className={cn("h-4 w-4 shrink-0", pending && "animate-pulse")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({
  businessName,
  profession,
}: {
  businessName: string;
  profession: string;
}) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-white/5 bg-navy md:flex">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="h-7 w-7 rounded-btn bg-teal" />
        <span className="text-[15px] font-medium text-white">SlotWise</span>
      </div>

      <SidebarNav />

      <div className="flex items-center gap-2.5 border-t border-white/5 px-4 py-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal text-xs font-medium text-navy">
          {initials(businessName)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{businessName}</p>
          <p className="truncate text-xs capitalize text-white/50">{profession.replace(/_/g, " ")}</p>
        </div>
      </div>
    </aside>
  );
}
