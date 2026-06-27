"use client";

import { Check, Mail, CalendarPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCents, formatDate, formatTime } from "@/lib/format";
import { downloadIcsFile, googleCalendarUrl } from "@/lib/ics";
import type { Profile, Service } from "@/lib/types";

export function ConfirmationStep({
  profile,
  service,
  startAt,
  depositPaid,
  onBookAnother,
}: {
  profile: Profile;
  service: Service;
  startAt: Date;
  depositPaid: boolean;
  onBookAnother: () => void;
}) {
  const endAt = new Date(startAt.getTime() + service.durationMinutes * 60_000);
  const title = `${service.name} with ${profile.businessName}`;
  const description = `Booked via SlotWise. ${profile.cancellationPolicy}`;
  const location = profile.location ?? "";

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal">
        <Check className="h-8 w-8 text-navy" strokeWidth={3} />
      </div>
      <div>
        <h2 className="text-lg font-medium text-navy">You&apos;re booked!</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We&apos;ve sent a confirmation to your email{depositPaid ? " with your receipt" : ""}.
        </p>
      </div>

      <Card className="w-full text-left">
        <p className="font-medium text-navy">{service.name}</p>
        <p className="mt-1 text-sm text-muted-foreground">with {profile.businessName}</p>
        <div className="mt-3 space-y-1 border-t border-border pt-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date</span>
            <span className="text-navy">{formatDate(startAt.toISOString(), { weekday: "long", year: "numeric" })}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Time</span>
            <span className="text-navy">{formatTime(startAt.toISOString())}</span>
          </div>
          {depositPaid && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Deposit paid</span>
              <span className="text-accent-foreground">{formatCents(service.depositAmountCents)}</span>
            </div>
          )}
        </div>
      </Card>

      <div className="w-full">
        <p className="label-caption mb-2 text-left">Add to calendar</p>
        <div className="grid grid-cols-3 gap-2">
          <Button variant="secondary" size="sm" asChild>
            <a href={googleCalendarUrl({ title, description, location, start: startAt, end: endAt })} target="_blank" rel="noopener noreferrer">
              Google
            </a>
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => downloadIcsFile({ title, description, location, start: startAt, end: endAt, filename: "appointment.ics" })}
          >
            Apple
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => downloadIcsFile({ title, description, location, start: startAt, end: endAt, filename: "appointment.ics" })}
          >
            Outlook
          </Button>
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Mail className="h-3.5 w-3.5" /> You&apos;ll also get a reminder email before your appointment.
      </p>

      <Button className="w-full" variant="secondary" onClick={onBookAnother}>
        <CalendarPlus className="h-4 w-4" /> Book another appointment
      </Button>
    </div>
  );
}
