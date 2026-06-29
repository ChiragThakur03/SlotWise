"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Lock, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCents, formatDate, formatTime } from "@/lib/format";
import type { Profile, Service } from "@/lib/types";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function PaymentStep({
  profile,
  service,
  date,
  time,
  pendingBookingId,
  onConfirm,
  submitting,
}: {
  profile: Profile;
  service: Service;
  date: Date;
  time: string;
  pendingBookingId?: string | null;
  onConfirm: (bookingId?: string) => void;
  submitting: boolean;
}) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const startAt = new Date(date);
  const [h, m] = time.split(":").map(Number);
  startAt.setHours(h, m, 0, 0);

  const hasDeposit = service.depositRequired && service.depositAmountCents > 0;

  useEffect(() => {
    if (!hasDeposit) return;
    setClientSecret(null);
    setFetchError(null);
    fetch("/api/stripe/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amountCents: service.depositAmountCents,
        description: `Deposit — ${service.name} with ${profile.businessName}`,
        bookingId: pendingBookingId ?? undefined,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setFetchError(data.error);
        else setClientSecret(data.clientSecret);
      })
      .catch(() => setFetchError("Could not initialise payment. Please try again."));
  }, [hasDeposit, pendingBookingId, service.depositAmountCents, service.name, profile.businessName]);

  return (
    <div className="space-y-5">
      <h2 className="text-base font-medium text-navy">Confirm & pay</h2>

      {/* Booking summary */}
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
                <Row
                  label="Remaining at appointment"
                  value={formatCents(service.priceCents - service.depositAmountCents)}
                />
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Payment section */}
      {hasDeposit ? (
        <>
          {fetchError ? (
            <div className="flex items-start gap-2 rounded-card border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {fetchError}
            </div>
          ) : !clientSecret ? (
            <Card>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-teal border-t-transparent" />
                Loading payment form…
              </div>
            </Card>
          ) : (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                  variables: { colorPrimary: "#4ECDC4", colorText: "#1a2744", borderRadius: "8px" },
                },
              }}
            >
              <CardForm
                clientSecret={clientSecret}
                service={service}
                pendingBookingId={pendingBookingId}
                onConfirm={onConfirm}
                submitting={submitting}
              />
            </Elements>
          )}
          <p className="text-center text-xs text-muted-foreground">
            Your card is charged {formatCents(service.depositAmountCents)} now. Remaining{" "}
            {formatCents(service.priceCents - service.depositAmountCents)} is paid at your appointment.
          </p>
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            No deposit required. Payment is collected at your appointment.
          </p>
          <Button className="w-full" size="lg" loading={submitting} onClick={() => onConfirm()}>
            Confirm booking
          </Button>
        </>
      )}
    </div>
  );
}

function CardForm({
  clientSecret,
  service,
  pendingBookingId,
  onConfirm,
  submitting,
}: {
  clientSecret: string;
  service: Service;
  pendingBookingId?: string | null;
  onConfirm: (bookingId?: string) => void;
  submitting: boolean;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [cardError, setCardError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  async function handlePay() {
    if (!stripe || !elements || processing || submitting) return;
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setCardError(null);
    setProcessing(true);
    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (error) {
        setCardError(error.message ?? "Payment failed. Please try again.");
      } else if (paymentIntent?.status === "succeeded") {
        onConfirm(pendingBookingId ?? undefined);
      }
    } finally {
      setProcessing(false);
    }
  }

  return (
    <Card>
      <div className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Lock className="h-3.5 w-3.5" /> Secure payment via Stripe
      </div>

      <div className="rounded-btn border border-input px-3 py-2.5">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: "14px",
                color: "#1a2744",
                fontFamily: "inherit",
                "::placeholder": { color: "#9ca3af" },
              },
              invalid: { color: "#ef4444" },
            },
            hidePostalCode: true,
          }}
        />
      </div>

      {cardError && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {cardError}
        </p>
      )}

      <Button
        className="mt-4 w-full"
        size="lg"
        loading={processing || submitting}
        disabled={!stripe}
        onClick={handlePay}
      >
        Book & Pay {formatCents(service.depositAmountCents)} Deposit
      </Button>
    </Card>
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
