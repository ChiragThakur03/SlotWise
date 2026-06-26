"use client";

import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store/app-store";
import type { SubscriptionPlan } from "@/lib/types";

const PLANS: { id: SubscriptionPlan; name: string; price: string; blurb: string; features: string[] }[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$19/mo",
    blurb: "Solo pros just starting out",
    features: ["Up to 50 bookings/month", "1 service type", "Basic email reminders", "Stripe deposit collection", "Public booking page", "Client list"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$49/mo",
    blurb: "Established solo pros",
    features: ["Unlimited bookings", "Up to 5 service types", "SMS + email reminders", "Intake forms + waivers", "Analytics dashboard", "Client notes + history", "No-show protection"],
  },
  {
    id: "studio",
    name: "Studio",
    price: "$79/mo",
    blurb: "Small studios with a team",
    features: ["Everything in Pro", "Up to 5 staff members", "Per-staff calendars", "White-label booking page", "Priority support", "Custom intake form builder", "CSV export"],
  },
];

export function BillingTab() {
  const store = useAppStore();
  const { profile } = store;
  const [switching, setSwitching] = useState<SubscriptionPlan | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSwitch(plan: SubscriptionPlan) {
    setSwitching(plan);
    setMessage(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      // No Stripe price configured yet — apply the plan change directly so
      // the rest of the app (enforcement, feature gating) still demos.
      store.updateProfile({ subscriptionPlan: plan });
      setMessage(data.error ?? null);
    } catch {
      store.updateProfile({ subscriptionPlan: plan });
    } finally {
      setSwitching(null);
    }
  }

  const bookingsThisMonth = useMemo(() => {
    const now = new Date();
    return store.bookings.filter((b) => {
      const d = new Date(b.startAt);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && b.status !== "cancelled";
    }).length;
  }, [store.bookings]);

  const isStarter = profile.subscriptionPlan === "starter";
  const overLimit = isStarter && bookingsThisMonth > 50;
  const nearLimit = isStarter && bookingsThisMonth > 50 && bookingsThisMonth <= 60;

  return (
    <div className="space-y-4">
      {isStarter && (
        <Card>
          <p className="mb-2 text-sm font-medium text-navy">Usage this month</p>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{bookingsThisMonth} of 50 bookings</span>
            {overLimit && (
              <span className="text-gold">
                {nearLimit ? "Over your limit — upgrade within 48 hours to avoid being paused" : "Limit reached"}
              </span>
            )}
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full", overLimit ? "bg-gold" : "bg-teal")}
              style={{ width: `${Math.min(100, (bookingsThisMonth / 50) * 100)}%` }}
            />
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PLANS.map((plan) => {
          const current = profile.subscriptionPlan === plan.id;
          return (
            <Card key={plan.id} className={cn(current && "border-teal")}>
              <div className="mb-3 flex items-center justify-between">
                <p className="font-medium text-navy">{plan.name}</p>
                {current && <span className="rounded-full bg-teal-light px-2 py-0.5 text-xs font-medium text-accent-foreground">Current</span>}
              </div>
              <p className="text-2xl font-medium text-navy">{plan.price}</p>
              <p className="mt-1 text-xs text-muted-foreground">{plan.blurb}</p>
              <ul className="mt-4 space-y-1.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-sm text-navy">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal-mid" /> {f}
                  </li>
                ))}
              </ul>
              {!current && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4 w-full"
                  disabled={switching === plan.id}
                  onClick={() => handleSwitch(plan.id)}
                >
                  {switching === plan.id ? "Switching…" : `Switch to ${plan.name}`}
                </Button>
              )}
            </Card>
          );
        })}
      </div>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </div>
  );
}
