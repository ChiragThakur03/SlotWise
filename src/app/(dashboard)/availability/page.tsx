"use client";

import { useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useAppStore } from "@/lib/store/app-store";
import { WEEKDAY_LABELS } from "@/lib/calendar";
import { formatDate } from "@/lib/format";
import type { AvailabilityRule } from "@/lib/types";

const BUFFER_OPTIONS = [0, 10, 15, 30];

export default function AvailabilityPage() {
  const store = useAppStore();
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  function updateRule(weekday: number, patch: Partial<AvailabilityRule>) {
    store.setAvailability(store.availability.map((r) => (r.weekday === weekday ? { ...r, ...patch } : r)));
  }

  function addBreak(weekday: number) {
    const rule = store.availability.find((r) => r.weekday === weekday);
    if (!rule) return;
    updateRule(weekday, {
      breaks: [...rule.breaks, { id: `brk-${Date.now()}`, startTime: "12:00", endTime: "13:00" }],
    });
  }

  function removeBreak(weekday: number, breakId: string) {
    const rule = store.availability.find((r) => r.weekday === weekday);
    if (!rule) return;
    updateRule(weekday, { breaks: rule.breaks.filter((b) => b.id !== breakId) });
  }

  function updateBreak(weekday: number, breakId: string, patch: { startTime?: string; endTime?: string }) {
    const rule = store.availability.find((r) => r.weekday === weekday);
    if (!rule) return;
    updateRule(weekday, {
      breaks: rule.breaks.map((b) => (b.id === breakId ? { ...b, ...patch } : b)),
    });
  }

  const sortedRules = [...store.availability].sort((a, b) => a.weekday - b.weekday);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium text-navy">Availability</h1>

      <Card>
        <p className="mb-4 text-sm font-medium text-navy">Weekly hours</p>
        <div className="space-y-3">
          {sortedRules.map((rule) => (
            <div key={rule.weekday} className="rounded-card border-[0.5px] border-card-border p-3">
              <div className="flex flex-wrap items-center gap-3">
                <Switch checked={rule.isOpen} onCheckedChange={(v) => updateRule(rule.weekday, { isOpen: v })} />
                <span className="w-10 text-sm font-medium text-navy">{WEEKDAY_LABELS[rule.weekday]}</span>
                {rule.isOpen ? (
                  <>
                    <Input
                      type="time"
                      className="w-32"
                      value={rule.startTime}
                      onChange={(e) => updateRule(rule.weekday, { startTime: e.target.value })}
                    />
                    <span className="text-sm text-muted-foreground">to</span>
                    <Input
                      type="time"
                      className="w-32"
                      value={rule.endTime}
                      onChange={(e) => updateRule(rule.weekday, { endTime: e.target.value })}
                    />
                    <Button variant="ghost" size="sm" onClick={() => addBreak(rule.weekday)}>
                      <Plus className="h-3.5 w-3.5" /> Add break
                    </Button>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">Closed</span>
                )}
              </div>

              {rule.breaks.length > 0 && (
                <div className="mt-2.5 space-y-2 pl-[52px]">
                  {rule.breaks.map((b) => (
                    <div key={b.id} className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Break</span>
                      <Input
                        type="time"
                        className="w-28"
                        value={b.startTime}
                        onChange={(e) => updateBreak(rule.weekday, b.id, { startTime: e.target.value })}
                      />
                      <span className="text-xs text-muted-foreground">to</span>
                      <Input
                        type="time"
                        className="w-28"
                        value={b.endTime}
                        onChange={(e) => updateBreak(rule.weekday, b.id, { endTime: e.target.value })}
                      />
                      <button onClick={() => removeBreak(rule.weekday, b.id)} className="text-muted-foreground hover:text-destructive">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-navy">Date overrides</p>
          <Button size="sm" onClick={() => setOverrideModalOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Add override
          </Button>
        </div>
        {store.dateOverrides.length === 0 ? (
          <p className="text-sm text-muted-foreground">No overrides yet — add one for holidays or custom hours.</p>
        ) : (
          <div className="space-y-2">
            {[...store.dateOverrides]
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-card border-[0.5px] border-card-border p-3">
                  <div>
                    <p className="text-sm font-medium text-navy">
                      {formatDate(o.date, { year: "numeric" })} —{" "}
                      {o.isClosed ? "Closed" : `${o.startTime} – ${o.endTime}`}
                    </p>
                    {o.note && <p className="text-xs text-muted-foreground">{o.note}</p>}
                  </div>
                  <button onClick={() => setRemoveTarget(o.id)} className="text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <p className="mb-3 text-sm font-medium text-navy">Advance booking window</p>
          <div className="space-y-3">
            <div>
              <Label>Clients can book up to</Label>
              <div className="mt-1.5 flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  className="w-24"
                  value={store.profile.advanceBookingDays}
                  onChange={(e) => store.updateProfile({ advanceBookingDays: Number(e.target.value) })}
                />
                <span className="text-sm text-muted-foreground">days out</span>
              </div>
            </div>
            <div>
              <Label>Minimum notice</Label>
              <div className="mt-1.5 flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  className="w-24"
                  value={store.profile.minNoticeHours}
                  onChange={(e) => store.updateProfile({ minNoticeHours: Number(e.target.value) })}
                />
                <span className="text-sm text-muted-foreground">hours before booking</span>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <p className="mb-3 text-sm font-medium text-navy">Buffer time</p>
          <Label>Gap automatically added between appointments</Label>
          <Select
            value={String(store.profile.bufferMinutes)}
            onValueChange={(v) => store.updateProfile({ bufferMinutes: Number(v) })}
          >
            <SelectTrigger className="mt-1.5 w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BUFFER_OPTIONS.map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {m === 0 ? "No buffer" : `${m} min`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>
      </div>

      <AddOverrideModal open={overrideModalOpen} onOpenChange={setOverrideModalOpen} />

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
        title="Remove this override?"
        description="The date will go back to your regular weekly hours."
        confirmLabel="Remove"
        onConfirm={() => removeTarget && store.removeDateOverride(removeTarget)}
      />
    </div>
  );
}

function AddOverrideModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const store = useAppStore();
  const [date, setDate] = useState("");
  const [isClosed, setIsClosed] = useState(true);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  function reset() {
    setDate("");
    setIsClosed(true);
    setStartTime("09:00");
    setEndTime("17:00");
    setNote("");
  }

  async function handleSave() {
    if (!date || saving) return;
    setSaving(true);
    try {
      await store.addDateOverride({
        date,
        isClosed,
        startTime: isClosed ? null : startTime,
        endTime: isClosed ? null : endTime,
        note: note || null,
      });
      reset();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add date override</DialogTitle>
          <DialogDescription>Mark a specific date as closed or with custom hours.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Date</Label>
            <Input className="mt-1.5" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="flex items-center justify-between rounded-card border-[0.5px] border-card-border p-3">
            <p className="text-sm font-medium text-navy">Closed all day</p>
            <Switch checked={isClosed} onCheckedChange={setIsClosed} />
          </div>
          {!isClosed && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start</Label>
                <Input className="mt-1.5" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div>
                <Label>End</Label>
                <Input className="mt-1.5" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>
          )}
          <div>
            <Label>Note (optional)</Label>
            <Input className="mt-1.5" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Closed for the holidays" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!date || saving}>
            {saving ? "Saving…" : "Add override"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
