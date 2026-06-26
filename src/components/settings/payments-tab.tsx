"use client";

import { useState } from "react";
import { CreditCard, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/lib/store/app-store";

export function PaymentsTab() {
  const store = useAppStore();
  const { profile } = store;
  const [connecting, setConnecting] = useState(false);
  const [connectMessage, setConnectMessage] = useState<string | null>(null);
  const connected = !!profile.stripeAccountId;

  async function handleConnect() {
    setConnecting(true);
    setConnectMessage(null);
    try {
      const res = await fetch("/api/stripe/connect", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setConnectMessage(data.error ?? "Stripe isn't configured yet.");
      }
    } catch {
      setConnectMessage("Stripe isn't configured yet — add your API keys to enable this.");
    } finally {
      setConnecting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-navy">Stripe</p>
              <p className="text-xs text-muted-foreground">
                {connected ? "Connected — deposits are paid out to your bank account." : "Not connected yet"}
              </p>
            </div>
          </div>
          {connected ? (
            <span className="flex items-center gap-1.5 text-sm text-accent-foreground">
              <CheckCircle2 className="h-4 w-4" /> Connected
            </span>
          ) : (
            <Button size="sm" onClick={handleConnect} disabled={connecting}>
              {connecting ? "Connecting…" : "Connect with Stripe"}
            </Button>
          )}
        </div>
        {connectMessage && <p className="mt-3 text-xs text-muted-foreground">{connectMessage}</p>}
      </Card>

      <Card className="space-y-4">
        <div>
          <Label>Default deposit (% of price)</Label>
          <div className="mt-1.5 flex items-center gap-2">
            <Input
              type="number"
              className="w-24"
              min={0}
              max={100}
              defaultValue={profile.depositDefaultPercent}
              onBlur={(e) => store.updateProfile({ depositDefaultPercent: Number(e.target.value) })}
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
        </div>
        <div>
          <Label>Cancellation policy</Label>
          <Textarea
            className="mt-1.5"
            rows={3}
            defaultValue={profile.cancellationPolicy}
            onBlur={(e) => store.updateProfile({ cancellationPolicy: e.target.value })}
          />
        </div>
        <div>
          <Label>Refund rules</Label>
          <Textarea
            className="mt-1.5"
            rows={3}
            defaultValue={profile.refundPolicy}
            onBlur={(e) => store.updateProfile({ refundPolicy: e.target.value })}
          />
        </div>
      </Card>
    </div>
  );
}
