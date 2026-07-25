"use client";

import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useAppStore } from "@/lib/store/app-store";
import { toast } from "@/lib/toast";

const ROWS = [
  { key: "proNotifyNewBooking" as const, label: "New booking", description: "When a client books an appointment" },
  { key: "proNotifyCancellation" as const, label: "Cancellation", description: "When a client cancels their appointment" },
  { key: "proNotifyPayment" as const, label: "Payment received", description: "When a deposit or payment is collected" },
];

export function NotificationsTab() {
  const store = useAppStore();
  const { profile } = store;

  return (
    <Card className="divide-y divide-border">
      {ROWS.map((row, i) => (
        <div key={row.key} className={i === 0 ? "flex items-center justify-between pb-4" : "flex items-center justify-between py-4"}>
          <div>
            <p className="text-sm font-medium text-navy">{row.label}</p>
            <p className="text-xs text-muted-foreground">{row.description}</p>
          </div>
          <Switch checked={profile[row.key]} onCheckedChange={(v) => { store.updateProfile({ [row.key]: v }); toast("Saved", "success", "settings"); }} />
        </div>
      ))}
    </Card>
  );
}
