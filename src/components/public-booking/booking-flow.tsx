"use client";

import { useState } from "react";
import { ChevronLeft, MapPin } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ServiceStep } from "@/components/public-booking/service-step";
import { DateTimeStep } from "@/components/public-booking/datetime-step";
import { IntakeStep, type ContactInfo, type IntakeAnswers, type SignatureAnswers } from "@/components/public-booking/intake-step";
import { PaymentStep } from "@/components/public-booking/payment-step";
import { ConfirmationStep } from "@/components/public-booking/confirmation-step";
import { PROFESSIONS } from "@/lib/verticals";
import { cn } from "@/lib/utils";
import { sendNotification } from "@/lib/send-notification-client";
import type { TemplateVariables } from "@/lib/render-template";
import { formatCents, formatDate, formatTime } from "@/lib/format";
import { actionCreatePublicBooking, actionConfirmPublicBookingDeposit } from "@/lib/actions";
import type { AvailabilityRule, Booking, DateOverride, IntakeForm, Profile, Service } from "@/lib/types";

const CONFIRMATION_SUBJECT = "You're booked with {pro_name} — {service} on {date}";
const CONFIRMATION_BODY =
  "Hi {client_name}, your {service} appointment with {pro_name} is confirmed for {date} at {time}. Deposit paid: {deposit_amount}. Need to reschedule? {booking_link}";

type Step = 1 | 2 | 3 | 4 | "confirmation";

export function BookingFlow({
  profile,
  services,
  availability,
  dateOverrides,
  intakeForm,
  bookings,
}: {
  profile: Profile;
  services: Service[];
  availability: AvailabilityRule[];
  dateOverrides: DateOverride[];
  intakeForm?: IntakeForm;
  bookings: Booking[];
}) {
  const [step, setStep] = useState<Step>(1);
  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [contact, setContact] = useState<ContactInfo>({ name: "", email: "", phone: "" });
  const [answers, setAnswers] = useState<IntakeAnswers>({});
  const [signatures, setSignatures] = useState<SignatureAnswers>({});
  const [submitting, setSubmitting] = useState(false);
  const [depositPaid, setDepositPaid] = useState(false);
  const [pendingBookingId, setPendingBookingId] = useState<string | null>(null);

  function handleBookAnother() {
    setStep(1);
    setService(null);
    setDate(null);
    setTime(null);
    setContact({ name: "", email: "", phone: "" });
    setAnswers({});
    setSignatures({});
    setDepositPaid(false);
    setPendingBookingId(null);
  }

  const professionLabel = PROFESSIONS[profile.profession].label;

  function canContinueFromIntake() {
    if (!contact.name.trim() || !contact.email.trim() || !contact.phone.trim()) return false;
    for (const field of intakeForm?.fields ?? []) {
      if (!field.required) continue;
      const v = answers[field.id];
      if (field.fieldType === "checkbox" || field.isWaiver) {
        if (v !== true) return false;
        if (field.isWaiver && field.requiresSignature && !signatures[field.id]?.trim()) return false;
      } else if (!v || (Array.isArray(v) && v.length === 0)) {
        return false;
      }
    }
    return true;
  }

  // Pre-creates a pending booking before showing the Stripe payment form so
  // the bookingId can be stored in payment intent metadata for webhook reliability.
  async function handleGoToPayment() {
    if (!service || !date || !time) return;
    const hasDeposit = service.depositRequired && service.depositAmountCents > 0;
    if (hasDeposit && !pendingBookingId) {
      setSubmitting(true);
      try {
        const startAt = new Date(date);
        const [h, m] = time.split(":").map(Number);
        startAt.setHours(h, m, 0, 0);
        const endAt = new Date(startAt.getTime() + service.durationMinutes * 60000);
        const { bookingId } = await actionCreatePublicBooking({
          username: profile.username,
          serviceId: service.id,
          clientName: contact.name,
          clientEmail: contact.email,
          clientPhone: contact.phone,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          totalPriceCents: service.priceCents,
          depositAmountCents: service.depositAmountCents,
          depositPaid: false,
          clientNotes: "",
        });
        setPendingBookingId(bookingId);
      } catch (err) {
        console.error("Could not pre-create booking:", err);
      } finally {
        setSubmitting(false);
      }
    }
    setStep(4);
  }

  async function handleConfirmPayment(confirmedBookingId?: string) {
    if (!service || !date || !time || submitting) return;
    setSubmitting(true);
    try {
      const startAt = new Date(date);
      const [h, m] = time.split(":").map(Number);
      startAt.setHours(h, m, 0, 0);
      const endAt = new Date(startAt.getTime() + service.durationMinutes * 60000);
      const paidDeposit = service.depositRequired && service.depositAmountCents > 0;

      if (confirmedBookingId) {
        // Stripe payment succeeded — confirm the pre-created pending booking
        await actionConfirmPublicBookingDeposit(confirmedBookingId);
      } else {
        // No deposit service — create the booking fresh
        await actionCreatePublicBooking({
          username: profile.username,
          serviceId: service.id,
          clientName: contact.name,
          clientEmail: contact.email,
          clientPhone: contact.phone,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          totalPriceCents: service.priceCents,
          depositAmountCents: 0,
          depositPaid: false,
          clientNotes: "",
        });
      }

      setDepositPaid(paidDeposit);
      setStep("confirmation");

      const variables: TemplateVariables = {
        client_name: contact.name,
        client_first_name: contact.name.split(" ")[0],
        service: service.name,
        date: formatDate(startAt.toISOString(), { weekday: "short" }),
        time: formatTime(startAt.toISOString()),
        deposit_amount: formatCents(service.depositAmountCents),
        booking_link: `https://slotwise.io/book/${profile.username}`,
        pro_name: profile.businessName,
      };

      sendNotification("both", { email: contact.email, phone: contact.phone }, CONFIRMATION_BODY, variables, CONFIRMATION_SUBJECT).catch(
        () => {}
      );
    } catch (err) {
      console.error("Booking failed:", err);
    } finally {
      setSubmitting(false);
    }
  }

  const startAt = (() => {
    if (!date || !time) return null;
    const d = new Date(date);
    const [h, m] = time.split(":").map(Number);
    d.setHours(h, m, 0, 0);
    return d;
  })();

  return (
    <div className="min-h-screen bg-off-white">
      <div className="mx-auto max-w-lg px-4 py-6 sm:py-10">
        <header className="mb-6 flex flex-col items-center gap-2 text-center">
          <Avatar name={profile.businessName} size="lg" />
          <h1 className="text-lg font-medium text-navy">{profile.businessName}</h1>
          <Badge variant="confirmed">{professionLabel}</Badge>
          {profile.bio && <p className="max-w-sm text-sm text-muted-foreground">{profile.bio}</p>}
          {profile.location && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> {profile.location}
            </p>
          )}
        </header>

        {step !== "confirmation" && (
          <div className="mb-5 flex items-center gap-2">
            {step !== 1 && (
              <button
                onClick={() => setStep((s) => (typeof s === "number" ? ((s - 1) as Step) : s))}
                className="rounded-btn p-1.5 text-muted-foreground hover:bg-muted"
                aria-label="Back"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <div className="flex flex-1 gap-1.5">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className={cn("h-1.5 flex-1 rounded-full", n <= step ? "bg-teal" : "bg-muted")}
                />
              ))}
            </div>
          </div>
        )}

        <div className="rounded-card border-[0.5px] border-card-border bg-white p-4 sm:p-6">
          {step === 1 && <ServiceStep services={services} onSelect={(s) => { setService(s); setPendingBookingId(null); setStep(2); }} />}

          {step === 2 && service && (
            <>
              <DateTimeStep
                service={service}
                availability={availability}
                dateOverrides={dateOverrides}
                bookings={bookings}
                advanceBookingDays={profile.advanceBookingDays}
                minNoticeHours={profile.minNoticeHours}
                selectedDate={date}
                selectedTime={time}
                onSelectDate={(d) => { setDate(d); setTime(null); setPendingBookingId(null); }}
                onSelectTime={setTime}
              />
              <Button className="mt-5 w-full" size="lg" disabled={!date || !time} onClick={() => setStep(3)}>
                Continue
              </Button>
            </>
          )}

          {step === 3 && (
            <>
              <IntakeStep
                intakeForm={intakeForm}
                contact={contact}
                onContactChange={(patch) => setContact((c) => ({ ...c, ...patch }))}
                answers={answers}
                onAnswerChange={(id, v) => setAnswers((a) => ({ ...a, [id]: v }))}
                signatures={signatures}
                onSignatureChange={(id, name) => setSignatures((s) => ({ ...s, [id]: name }))}
              />
              <Button className="mt-5 w-full" size="lg" disabled={!canContinueFromIntake()} loading={submitting} onClick={handleGoToPayment}>
                Continue
              </Button>
            </>
          )}

          {step === 4 && service && date && time && (
            <PaymentStep profile={profile} service={service} date={date} time={time} pendingBookingId={pendingBookingId} onConfirm={handleConfirmPayment} submitting={submitting} />
          )}

          {step === "confirmation" && service && startAt && (
            <ConfirmationStep
              profile={profile}
              service={service}
              startAt={startAt}
              depositPaid={depositPaid}
              onBookAnother={handleBookAnother}
            />
          )}
        </div>
      </div>
    </div>
  );
}
