"use client";

import { useState } from "react";
import { CreditCard, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function StepPayment({
  depositPercent,
  onDepositPercentChange,
  connected,
}: {
  depositPercent: number;
  onDepositPercentChange: (value: number) => void;
  connected: boolean;
}) {
  const [connecting, setConnecting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleConnect() {
    setConnecting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/stripe/connect", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setMessage(data.error ?? "Stripe isn't configured yet — you can connect it later from Settings.");
    } catch {
      setMessage("Stripe isn't configured yet — you can connect it later from Settings.");
    } finally {
      setConnecting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Default deposit (% of price)</Label>
        <div className="mt-1.5 flex items-center gap-2">
          <Input
            type="number"
            className="w-24"
            min={0}
            max={100}
            value={depositPercent}
            onChange={(e) => onDepositPercentChange(Number(e.target.value))}
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-navy">Stripe</p>
              <p className="text-xs text-muted-foreground">Collect deposits and get paid out automatically.</p>
            </div>
          </div>
          {connected ? (
            <span className="flex items-center gap-1.5 text-sm text-accent-foreground">
              <Check className="h-4 w-4" /> Connected
            </span>
          ) : (
            <Button size="sm" onClick={handleConnect} disabled={connecting}>
              {connecting ? "Connecting…" : "Connect with Stripe"}
            </Button>
          )}
        </div>
        {message && <p className="mt-3 text-xs text-muted-foreground">{message}</p>}
      </Card>

      {!connected && (
        <p className="text-xs text-muted-foreground">
          You can skip this and connect Stripe anytime from Settings — you just won&apos;t be able to collect deposits until then.
        </p>
      )}
    </div>
  );
}
