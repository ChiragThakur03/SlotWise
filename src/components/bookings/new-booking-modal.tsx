"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useAppStore } from "@/lib/store/app-store";
import { formatCents, formatDuration } from "@/lib/format";

const NEW_CLIENT = "__new__";

export function NewBookingModal({
  open,
  onOpenChange,
  defaultDate,
  defaultTime,
  defaultClientId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
  defaultTime?: string;
  defaultClientId?: string;
}) {
  const store = useAppStore();
  const activeServices = store.services.filter((s) => s.active);

  const [clientId, setClientId] = useState<string>(defaultClientId ?? store.clients[0]?.id ?? NEW_CLIENT);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [serviceId, setServiceId] = useState<string>(activeServices[0]?.id ?? "");
  const [date, setDate] = useState(defaultDate ?? new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(defaultTime ?? "10:00");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setClientId(defaultClientId ?? store.clients[0]?.id ?? NEW_CLIENT);
      setDate(defaultDate ?? new Date().toISOString().slice(0, 10));
      setTime(defaultTime ?? "10:00");
      setNotes("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultClientId, defaultDate, defaultTime]);

  const service = activeServices.find((s) => s.id === serviceId);
  const canSubmit = serviceId && date && time && (clientId !== NEW_CLIENT || newClientName.trim());

  async function handleSubmit() {
    if (!service || !canSubmit || saving) return;
    setSaving(true);
    try {
      let finalClientId = clientId;
      if (clientId === NEW_CLIENT) {
        const newClient = await store.addClient({
          name: newClientName.trim(),
          email: newClientEmail.trim() || null,
          phone: null,
          notes: "",
        });
        finalClientId = newClient.id;
      }
      const startAt = new Date(`${date}T${time}:00`);
      const endAt = new Date(startAt.getTime() + service.durationMinutes * 60000);
      await store.addBooking({
        serviceId: service.id,
        clientId: finalClientId,
        staffId: null,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        status: "confirmed",
        totalPriceCents: service.priceCents,
        depositAmountCents: 0,
        depositPaid: false,
        locationAddress: null,
        clientNotes: "",
        proNotes: notes,
        recurringGroupId: null,
        clientName: clientId === NEW_CLIENT ? newClientName.trim() : store.clients.find((c) => c.id === clientId)?.name ?? "",
        serviceName: service.name,
      });
      onOpenChange(false);
      setNotes("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add manual booking</DialogTitle>
          <DialogDescription>Create a booking on behalf of a client — no payment required.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Client</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {store.clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
                <SelectItem value={NEW_CLIENT}>+ New client</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {clientId === NEW_CLIENT && (
            <div className="grid grid-cols-2 gap-3 rounded-card border-[0.5px] border-card-border p-3">
              <div className="col-span-2">
                <Label>Name</Label>
                <Input className="mt-1.5" value={newClientName} onChange={(e) => setNewClientName(e.target.value)} placeholder="Client name" />
              </div>
              <div className="col-span-2">
                <Label>Email (optional)</Label>
                <Input className="mt-1.5" value={newClientEmail} onChange={(e) => setNewClientEmail(e.target.value)} placeholder="client@example.com" />
              </div>
            </div>
          )}

          <div>
            <Label>Service</Label>
            <Select value={serviceId} onValueChange={setServiceId}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {activeServices.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name} — {formatDuration(s.durationMinutes)} · {formatCents(s.priceCents)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Date</Label>
              <Input className="mt-1.5" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label>Time</Label>
              <Input className="mt-1.5" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Notes (optional)</Label>
            <Textarea className="mt-1.5" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!canSubmit || saving} onClick={handleSubmit}>
            {saving ? "Saving…" : "Add booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
