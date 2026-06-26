"use client";

import { useState } from "react";
import { Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCents, formatDate, formatTime } from "@/lib/format";
import type { Profile, Service } from "@/lib/types";

export function PaymentStep({
  profile,
  service,
  date,
  time,
  onConfirm,
  submitting,
}: {
  profile: Profile;
  service: Service;
  date: Date;
  time: string;
  onConfirm: () => void;
  submitting: boolean;
}) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const startAt = new Date(date);
  const [h, m] = time.split(":").map(Number);
  startAt.setHours(h, m, 0, 0);

  const hasDeposit = service.depositRequired && service.depositAmountCents > 0;
  const canSubmit = cardNumber.length >= 12 && expiry.length >= 4 && cvc.length >= 3;

  return (
    <div className="space-y-5">
      <h2 className="text-base font-medium text-navy">Confirm & pay</h2>

      <Card>
        <p className="label-caption mb-2">Booking summary</p>
        <div className="space-y-1.5 text-sm">
          <Row label="Service" value={service.name} />
          <Row label="With" value={profile.businessName} />
          <Row label="Date" value={formatDate(startAt.toISOString(), { weekday: "short", year: "numeric" })} />
          <Row label="Time" value={formatTime(startAt.toISOString())} />
          <div className="border-t border-border pt-1.5">
            <Row label="Total session fee" value={formatCents(service.priceCents)} />
            {hasDeposit && (
              <>
                <Row label="Deposit due now" value={formatCents(service.depositAmountCents)} emphasize />
                <Row label="Remaining at appointment" value={formatCents(service.priceCents - service.depositAmountCents)} />
              </>
            )}
          </div>
        </div>
      </Card>

      {hasDeposit ? (
        <Card>
          <div className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Lock className="h-3.5 w-3.5" /> Secure payment via Stripe
          </div>
          <div className="space-y-3">
            <div>
              <Label>Card number</Label>
              <Input
                className="mt-1.5"
                inputMode="numeric"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Expiry</Label>
                <Input className="mt-1.5" placeholder="MM / YY" value={expiry} onChange={(e) => setExpiry(e.target.value)} />
              </div>
              <div>
                <Label>CVC</Label>
                <Input className="mt-1.5" placeholder="123" value={cvc} onChange={(e) => setCvc(e.target.value)} />
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">No deposit required. Payment is collected at your appointment.</p>
      )}

      <Button className="w-full" size="lg" disabled={hasDeposit && !canSubmit} onClick={onConfirm}>
        {submitting ? "Processing…" : hasDeposit ? `Book & Pay ${formatCents(service.depositAmountCents)} Deposit` : "Confirm booking"}
      </Button>
      {hasDeposit && (
        <p className="text-center text-xs text-muted-foreground">
          Your card is charged {formatCents(service.depositAmountCents)} now. Remaining {formatCents(service.priceCents - service.depositAmountCents)} is paid at your appointment.
        </p>
      )}
    </div>
  );
}

function Row({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={emphasize ? "font-medium text-gold" : "text-navy"}>{value}</span>
    </div>
  );
}
