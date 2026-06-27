"use client";

import { useMemo, useState } from "react";
import { Search, MoreVertical, Send, Download, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { BookingDetailSheet } from "@/components/bookings/booking-detail-sheet";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAppStore } from "@/lib/store/app-store";
import { formatCents, formatDate, formatDuration, formatTime } from "@/lib/format";
import { downloadCsv } from "@/lib/csv";
import { sendNotification } from "@/lib/send-notification-client";
import { buildBookingVariables } from "@/lib/render-template";
import type { BookingStatus } from "@/lib/types";

const STATUS_OPTIONS: { value: BookingStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "confirmed", label: "Confirmed" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "no_show", label: "No-show" },
];

export default function BookingsPage() {
  const store = useAppStore();
  const [status, setStatus] = useState<BookingStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);
  const [bulkSent, setBulkSent] = useState(false);
  const [sendingReminders, setSendingReminders] = useState(false);

  const services = store.services;
  function serviceDuration(serviceId: string) {
    return services.find((s) => s.id === serviceId)?.durationMinutes ?? 60;
  }

  const filtered = useMemo(() => {
    return [...store.bookings]
      .filter((b) => status === "all" || b.status === status)
      .filter((b) => !search || b.clientName?.toLowerCase().includes(search.toLowerCase()))
      .filter((b) => !dateFrom || new Date(b.startAt) >= new Date(dateFrom))
      .filter((b) => !dateTo || new Date(b.startAt) <= new Date(`${dateTo}T23:59:59`))
      .sort((a, b) => +new Date(b.startAt) - +new Date(a.startAt));
  }, [store.bookings, status, search, dateFrom, dateTo]);

  const allSelected = filtered.length > 0 && filtered.every((b) => selected.has(b.id));

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(filtered.map((b) => b.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function sendReminderToSelected() {
    setSendingReminders(true);
    const targets = filtered.filter((b) => selected.has(b.id));
    const reminderTemplate = store.notificationTemplates.find((t) => t.type === "reminder_24h");

    const entries = await Promise.all(
      targets.map(async (b) => {
        const client = store.clients.find((c) => c.id === b.clientId);
        const result = reminderTemplate
          ? await sendNotification(
              reminderTemplate.channel,
              { email: client?.email, phone: client?.phone },
              reminderTemplate.body,
              buildBookingVariables(b, store.profile),
              reminderTemplate.subject
            )
          : { configured: false, sent: false };

        return {
          profileId: b.profileId,
          bookingId: b.id,
          clientId: b.clientId,
          clientName: b.clientName,
          type: "custom" as const,
          channel: (reminderTemplate?.channel ?? "both") as "email" | "sms" | "both",
          status: (result.configured && !result.sent ? "failed" : "sent") as "sent" | "failed",
          errorMessage: result.configured && !result.sent ? result.error ?? null : null,
        };
      })
    );

    store.logNotification(entries);
    setBulkSent(true);
    setSendingReminders(false);
    setTimeout(() => setBulkSent(false), 2000);
  }

  function exportSelected() {
    const targets = filtered.filter((b) => selected.has(b.id));
    downloadCsv(
      "bookings.csv",
      targets.map((b) => ({
        client: b.clientName ?? "",
        service: b.serviceName ?? "",
        date: formatDate(b.startAt),
        time: formatTime(b.startAt),
        duration_minutes: serviceDuration(b.serviceId),
        deposit_paid: b.depositPaid ? "yes" : "no",
        total_cents: b.totalPriceCents,
        status: b.status,
      }))
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <h1 className="text-xl font-medium text-navy">Bookings</h1>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-56">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search by client name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={status} onValueChange={(v) => setStatus(v as BookingStatus | "all")}>
          <SelectTrigger className="w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">From</span>
          <Input type="date" className="w-40" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <span className="text-sm text-muted-foreground">to</span>
          <Input type="date" className="w-40" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>

        {(status !== "all" || search || dateFrom || dateTo) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatus("all");
              setSearch("");
              setDateFrom("");
              setDateTo("");
            }}
          >
            <X className="h-3.5 w-3.5" /> Clear filters
          </Button>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all" />
            </TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Date / Time</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Deposit</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                No bookings match these filters.
              </TableCell>
            </TableRow>
          )}
          {filtered.map((b) => (
            <TableRow key={b.id} className="cursor-pointer" onClick={() => setSelectedBookingId(b.id)}>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox checked={selected.has(b.id)} onCheckedChange={() => toggleOne(b.id)} aria-label={`Select ${b.clientName}`} />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2.5">
                  <Avatar name={b.clientName ?? ""} size="sm" />
                  <span className="font-medium">{b.clientName}</span>
                </div>
              </TableCell>
              <TableCell>{b.serviceName}</TableCell>
              <TableCell>
                {formatDate(b.startAt)}, {formatTime(b.startAt)}
              </TableCell>
              <TableCell>{formatDuration(serviceDuration(b.serviceId))}</TableCell>
              <TableCell>
                {b.depositAmountCents > 0 ? (
                  <span className={b.depositPaid ? "text-accent-foreground" : "text-gold"}>
                    {b.depositPaid ? "Yes" : "No"}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>{formatCents(b.totalPriceCents)}</TableCell>
              <TableCell>
                <BookingStatusBadge status={b.status} />
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Row actions">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSelectedBookingId(b.id)}>View details</DropdownMenuItem>
                    {b.status === "pending" && (
                      <DropdownMenuItem onClick={() => store.setBookingStatus(b.id, "confirmed")}>
                        Confirm booking
                      </DropdownMenuItem>
                    )}
                    {(b.status === "confirmed" || b.status === "pending") && (
                      <DropdownMenuItem onClick={() => store.setBookingStatus(b.id, "no_show")}>
                        Mark as no-show
                      </DropdownMenuItem>
                    )}
                    {b.status !== "cancelled" && b.status !== "completed" && (
                      <DropdownMenuItem destructive onClick={() => setCancelTarget(b.id)}>
                        Cancel booking
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-card border-[0.5px] border-card-border bg-navy px-4 py-3 shadow-card">
          <span className="text-sm text-white">{selected.size} selected</span>
          <Button size="sm" onClick={sendReminderToSelected} loading={sendingReminders} disabled={bulkSent}>
            <Send className="h-3.5 w-3.5" /> {bulkSent ? "Sent!" : "Send reminder to selected"}
          </Button>
          <Button size="sm" variant="secondary" onClick={exportSelected}>
            <Download className="h-3.5 w-3.5" /> Export selected to CSV
          </Button>
          <button onClick={() => setSelected(new Set())} className="ml-1 text-white/60 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <BookingDetailSheet
        bookingId={selectedBookingId}
        open={!!selectedBookingId}
        onOpenChange={(open) => !open && setSelectedBookingId(null)}
      />

      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(o) => !o && setCancelTarget(null)}
        title="Cancel this booking?"
        description="This will cancel the appointment and notify the client by email/SMS."
        confirmLabel="Cancel booking"
        onConfirm={() => cancelTarget && store.setBookingStatus(cancelTarget, "cancelled")}
      />
    </div>
  );
}
