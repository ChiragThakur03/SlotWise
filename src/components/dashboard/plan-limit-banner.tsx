"use client";

import { useMemo } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { useAppStore } from "@/lib/store/app-store";

export function PlanLimitBanner() {
  const store = useAppStore();
  const { profile } = store;

  const bookingsThisMonth = useMemo(() => {
    const now = new Date();
    return store.bookings.filter((b) => {
      const d = new Date(b.startAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && b.status !== "cancelled";
    }).length;
  }, [store.bookings]);

  if (profile.subscriptionPlan !== "starter" || bookingsThisMonth <= 50) return null;

  const overHardLimit = bookingsThisMonth >= 60;

  return (
    <div className="flex items-center gap-3 rounded-card border-[0.5px] border-gold/40 bg-gold/10 px-4 py-3">
      <AlertTriangle className="h-4 w-4 shrink-0 text-gold" />
      <p className="flex-1 text-sm text-navy">
        {overHardLimit
          ? `You're at ${bookingsThisMonth} bookings this month — past your Starter limit. Upgrade now to keep taking bookings without interruption.`
          : `You're over your Starter plan limit (${bookingsThisMonth} of 50 bookings). You have 48 hours to upgrade before new bookings pause.`}
      </p>
      <Link href="/settings?tab=billing" className="shrink-0 text-sm font-medium text-teal-mid hover:underline">
        Upgrade plan
      </Link>
    </div>
  );
}
