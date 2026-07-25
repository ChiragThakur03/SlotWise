"use client";

import { useState } from "react";
import { MapPin, Clock, Calendar as CalendarIcon, ChevronDown, Phone } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Avatar } from "@/components/ui/avatar";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAppStore } from "@/lib/store/app-store";
import { formatCents, formatDate, formatDuration, formatTime } from "@/lib/format";
import { sendNotification } from "@/lib/send-notification-client";
import { buildBookingVariables } from "@/lib/render-template";
import { toast } from "@/lib/toast";

export function BookingDetailSheet({
  bookingId,
  open,
  onOpenChange,
}: {
  bookingId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const store = useAppStore();
  const [confirmAction, setConfirmAction] = useState<"cancel" | "no_show" | null>(null);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [reminderMessage, setReminderMessage] = useState("");
  const [proNotesDraft, setProNotesDraft] = useState<string | null>(null);
  const [sendingReminder, setSendingReminder] = useState(false);

  const booking = store.bookings.find((b) => b.id === bookingId) ?? null;
  const service = booking ? store.services.find((s) => s.id === booking.serviceId) : null;
  const client = booking ? store.clients.find((c) => c.id === booking.clientId) : null;
  const reminderTemplate = store.notificationTemplates.find((t) => t.type === "reminder_24h");

  if (!booking || !client) return null;

  const notes = proNotesDraft ?? booking.proNotes;
  const isMobileAddress = !!booking.locationAddress;

  function saveNotes() {
    if (proNotesDraft !== null) store.updateBooking(booking!.id, { proNotes: proNotesDraft });
  }

  async function sendReminder() {
    setSendingReminder(true);
    const channel = reminderTemplate?.channel ?? "both";
    const result = await sendNotification(
      channel,
      { email: client!.email, phone: client!.phone },
      reminderMessage,
      buildBookingVariables(booking!, store.profile),
      reminderTemplate?.subject
    );

    store.logNotification([
      {
        profileId: booking!.profileId,
        bookingId: booking!.id,
        clientId: client!.id,
        clientName: client!.name,
        type: "custom",
        channel,
        status: result.sent ? "sent" : "failed",
        errorMessage: result.sent ? null : result.error ?? null,
      },
    ]);
    setSendingReminder(false);
    setShowReminder(false);
    toast(result.sent ? "Reminder sent!" : "Failed to send reminder", result.sent ? "success" : "error");
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex flex-col gap-5">
          <SheetHeader>
            <SheetTitle className="sr-only">Booking detail</SheetTitle>
            <div className="flex items-center gap-3">
              <Avatar name={client.name} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-base font-medium text-navy">{client.name}</p>
                <p className="truncate text-sm text-muted-foreground">{booking.serviceName}</p>
              </div>
              <div className="ml-auto">
                <BookingStatusBadge status={booking.status} />
              </div>
            </div>
          </SheetHeader>

          <div className="space-y-2.5 rounded-card border-[0.5px] border-card-border p-4">
            <InfoRow icon={CalendarIcon} label={formatDate(booking.startAt, { weekday: "long", year: "numeric" })} />
            <InfoRow icon={Clock} label={`${formatTime(booking.startAt)} – ${formatTime(booking.endAt)} (${formatDuration(service?.durationMinutes ?? 60)})`} />
            {isMobileAddress && <InfoRow icon={MapPin} label={booking.locationAddress!} />}
            {client.phone && <InfoRow icon={Phone} label={client.phone} />}
          </div>

          {booking.clientNotes && (
            <div>
              <Label>Notes from client</Label>
              <p className="mt-1.5 text-sm text-navy">{booking.clientNotes}</p>
            </div>
          )}

          <div className="space-y-2 rounded-card border-[0.5px] border-card-border p-4">
            <Label>Payment</Label>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Deposit</span>
              <span className={booking.depositPaid ? "font-medium text-accent-foreground" : "font-medium text-gold"}>
                {formatCents(booking.depositAmountCents)} {booking.depositPaid ? "paid" : "unpaid"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total session fee</span>
              <span className="font-medium text-navy">{formatCents(booking.totalPriceCents)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Method</span>
              <span className="text-navy">{booking.depositPaid ? "Stripe" : "—"}</span>
            </div>
          </div>

          {booking.intakeResponses && booking.intakeResponses.length > 0 && (
            <details className="group rounded-card border-[0.5px] border-card-border p-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-navy">
                Intake form answers
                <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="mt-3 space-y-2.5">
                {booking.intakeResponses.map((r) => (
                  <div key={r.fieldId} className="text-sm">
                    <p className="label-caption">{r.label}</p>
                    <p className="text-navy">
                      {typeof r.value === "boolean" ? (r.value ? "Yes" : "No") : Array.isArray(r.value) ? r.value.join(", ") : r.value || "—"}
                    </p>
                  </div>
                ))}
              </div>
            </details>
          )}

          {showReschedule && (
            <div className="space-y-3 rounded-card border-[0.5px] border-teal bg-teal-light/40 p-4">
              <Label>New date & time</Label>
              <RescheduleForm
                booking={booking}
                durationMinutes={service?.durationMinutes ?? 60}
                onSave={(startAt, endAt) => {
                  store.updateBooking(booking.id, { startAt, endAt });
                  setShowReschedule(false);
                }}
                onCancel={() => setShowReschedule(false)}
              />
            </div>
          )}

          {showReminder && (
            <div className="space-y-3 rounded-card border-[0.5px] border-teal bg-teal-light/40 p-4">
              <Label>Custom reminder</Label>
              <Textarea value={reminderMessage} onChange={(e) => setReminderMessage(e.target.value)} rows={4} />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowReminder(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={sendReminder} loading={sendingReminder}>
                  Send now
                </Button>
              </div>
            </div>
          )}

          <div>
            <Label>Your private notes</Label>
            <Textarea
              className="mt-1.5"
              rows={3}
              value={notes}
              onChange={(e) => setProNotesDraft(e.target.value)}
              onBlur={saveNotes}
              placeholder="Notes about this client or session (only you can see this)"
            />
          </div>

          <SheetFooter className="flex-col items-stretch gap-2 sm:flex-col">
            {booking.status === "pending" && (
              <Button onClick={() => store.setBookingStatus(booking.id, "confirmed")}>Confirm booking</Button>
            )}
            {booking.status === "confirmed" && (
              <Button onClick={() => store.setBookingStatus(booking.id, "completed")}>Mark as completed</Button>
            )}
            <div className="grid grid-cols-2 gap-2">
              {(booking.status === "confirmed" || booking.status === "pending") && (
                <Button variant="secondary" onClick={() => setConfirmAction("no_show")}>
                  Mark as no-show
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() => {
                  if (!showReminder) setReminderMessage(reminderTemplate?.body ?? "");
                  setShowReminder((v) => !v);
                }}
              >
                Send reminder
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(booking.status === "confirmed" || booking.status === "pending") && (
                <Button variant="ghost" onClick={() => setShowReschedule((v) => !v)}>
                  Reschedule
                </Button>
              )}
              {booking.status !== "cancelled" && booking.status !== "completed" && (
                <Button variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => setConfirmAction("cancel")}>
                  Cancel booking
                </Button>
              )}
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmAction === "cancel"}
        onOpenChange={(o) => !o && setConfirmAction(null)}
        title="Cancel this booking?"
        description={`This will cancel ${client.name}'s appointment${booking.depositPaid ? " and refund their deposit" : ""}, and notify them by email/SMS.`}
        confirmLabel="Cancel booking"
        onConfirm={() => store.setBookingStatus(booking.id, "cancelled")}
      />
      <ConfirmDialog
        open={confirmAction === "no_show"}
        onOpenChange={(o) => !o && setConfirmAction(null)}
        title="Mark as no-show?"
        description={`${client.name}'s deposit will be kept and the slot will reopen. They'll get an automatic follow-up message.`}
        confirmLabel="Mark as no-show"
        onConfirm={() => store.setBookingStatus(booking.id, "no_show")}
      />
    </>
  );
}

function InfoRow({ icon: Icon, label }: { icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-navy">
      <Icon className="h-4 w-4 text-muted-foreground" />
      {label}
    </div>
  );
}

function RescheduleForm({
  booking,
  durationMinutes,
  onSave,
  onCancel,
}: {
  booking: { startAt: string };
  durationMinutes: number;
  onSave: (startAt: string, endAt: string) => void;
  onCancel: () => void;
}) {
  const d = new Date(booking.startAt);
  const dateStr = d.toISOString().slice(0, 10);
  const timeStr = d.toISOString().slice(11, 16);
  const [date, setDate] = useState(dateStr);
  const [time, setTime] = useState(timeStr);

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={() => {
            const start = new Date(`${date}T${time}:00`);
            const end = new Date(start.getTime() + durationMinutes * 60000);
            onSave(start.toISOString(), end.toISOString());
          }}
        >
          Save new time
        </Button>
      </div>
    </div>
  );
}
