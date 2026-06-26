"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Mail, Phone } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { BookingDetailSheet } from "@/components/bookings/booking-detail-sheet";
import { NewBookingModal } from "@/components/bookings/new-booking-modal";
import { useAppStore } from "@/lib/store/app-store";
import { computeClientStats } from "@/lib/derive";
import { formatCents, formatDate, formatTime } from "@/lib/format";

export default function ClientProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const store = useAppStore();
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [bookAgainOpen, setBookAgainOpen] = useState(false);
  const [notesDraft, setNotesDraft] = useState<string | null>(null);

  const client = store.clients.find((c) => c.id === id);
  const bookings = useMemo(
    () =>
      store.bookings
        .filter((b) => b.clientId === id)
        .sort((a, b) => +new Date(b.startAt) - +new Date(a.startAt)),
    [store.bookings, id]
  );
  const stats = useMemo(() => computeClientStats(id, store.bookings), [id, store.bookings]);
  const latestIntake = bookings.find((b) => b.intakeResponses && b.intakeResponses.length > 0);

  if (!client) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/clients")}>
          <ArrowLeft className="h-4 w-4" /> Back to clients
        </Button>
        <p className="text-sm text-muted-foreground">Client not found.</p>
      </div>
    );
  }

  const notes = notesDraft ?? client.notes;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.push("/clients")}>
        <ArrowLeft className="h-4 w-4" /> Back to clients
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar name={client.name} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-medium text-navy">{client.name}</h1>
              {stats.isReturning && <Badge variant="confirmed">Returning</Badge>}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              {client.email && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" /> {client.email}
                </span>
              )}
              {client.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" /> {client.phone}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button onClick={() => setBookAgainOpen(true)}>
          <Plus className="h-4 w-4" /> Book again
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <p className="label-caption">Total sessions</p>
          <p className="mt-2 text-2xl font-medium text-navy">{stats.totalSessions}</p>
        </Card>
        <Card>
          <p className="label-caption">Total revenue</p>
          <p className="mt-2 text-2xl font-medium text-gold">{formatCents(stats.totalSpentCents)}</p>
        </Card>
        <Card>
          <p className="label-caption">Last visit</p>
          <p className="mt-2 text-2xl font-medium text-navy">{stats.lastVisitAt ? formatDate(stats.lastVisitAt) : "—"}</p>
        </Card>
        <Card>
          <p className="label-caption">No-shows</p>
          <p className={`mt-2 text-2xl font-medium ${client.noShowCount > 0 ? "text-destructive" : "text-navy"}`}>
            {client.noShowCount}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <h2 className="text-sm font-medium text-navy">Booking history</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Date / Time</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground">
                    No bookings yet.
                  </TableCell>
                </TableRow>
              )}
              {bookings.map((b) => (
                <TableRow key={b.id} className="cursor-pointer" onClick={() => setSelectedBookingId(b.id)}>
                  <TableCell>{b.serviceName}</TableCell>
                  <TableCell>
                    {formatDate(b.startAt)}, {formatTime(b.startAt)}
                  </TableCell>
                  <TableCell>{formatCents(b.totalPriceCents)}</TableCell>
                  <TableCell>
                    <BookingStatusBadge status={b.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-5">
          {latestIntake?.intakeResponses && (
            <div>
              <h2 className="mb-3 text-sm font-medium text-navy">Intake form answers on file</h2>
              <Card className="space-y-2.5">
                {latestIntake.intakeResponses.map((r) => (
                  <div key={r.fieldId} className="text-sm">
                    <p className="label-caption">{r.label}</p>
                    <p className="text-navy">
                      {typeof r.value === "boolean" ? (r.value ? "Yes" : "No") : Array.isArray(r.value) ? r.value.join(", ") : r.value || "—"}
                    </p>
                  </div>
                ))}
              </Card>
            </div>
          )}

          <div>
            <Label>Notes</Label>
            <Textarea
              className="mt-1.5"
              rows={5}
              value={notes}
              onChange={(e) => setNotesDraft(e.target.value)}
              onBlur={() => notesDraft !== null && store.updateClient(client.id, { notes: notesDraft })}
              placeholder="Notes about this client (private)"
            />
          </div>
        </div>
      </div>

      <BookingDetailSheet
        bookingId={selectedBookingId}
        open={!!selectedBookingId}
        onOpenChange={(open) => !open && setSelectedBookingId(null)}
      />
      <NewBookingModal open={bookAgainOpen} onOpenChange={setBookAgainOpen} defaultClientId={client.id} />
    </div>
  );
}
