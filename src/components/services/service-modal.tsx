"use client";

import { useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useState } from "react";
import { useAppStore } from "@/lib/store/app-store";
import type { Service, ServiceExtra } from "@/lib/types";

const DURATION_PRESETS = [30, 45, 60, 90, 120];
const STYLE_TAGS = ["traditional", "neo-trad", "blackwork", "realism", "watercolor"];
const BUFFER_OPTIONS = [0, 10, 15, 30];

export function ServiceModal({
  open,
  onOpenChange,
  service,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
}) {
  const store = useAppStore();
  const profession = store.profile.profession;
  const isEdit = !!service;
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [customDuration, setCustomDuration] = useState(false);
  const [priceDollars, setPriceDollars] = useState("0");
  const [depositRequired, setDepositRequired] = useState(false);
  const [depositDollars, setDepositDollars] = useState("0");
  const [maxDailyLimit, setMaxDailyLimit] = useState("");
  const [bufferMinutes, setBufferMinutes] = useState(0);
  const [active, setActive] = useState(true);
  const [styleTags, setStyleTags] = useState<string[]>([]);
  const [recurringLessonDefault, setRecurringLessonDefault] = useState(false);
  const [breedDurations, setBreedDurations] = useState({ S: 45, M: 60, L: 90, XL: 120 });
  const [addons, setAddons] = useState<{ name: string; minutes: number; priceCents: number }[]>([]);

  useEffect(() => {
    if (!open) return;
    if (service) {
      setName(service.name);
      setDescription(service.description);
      setDurationMinutes(service.durationMinutes);
      setCustomDuration(!DURATION_PRESETS.includes(service.durationMinutes));
      setPriceDollars(String(service.priceCents / 100));
      setDepositRequired(service.depositRequired);
      setDepositDollars(String(service.depositAmountCents / 100));
      setMaxDailyLimit(service.maxDailyLimit ? String(service.maxDailyLimit) : "");
      setBufferMinutes(service.bufferMinutes);
      setActive(service.active);
      setStyleTags(service.extra.styleTags ?? []);
      setRecurringLessonDefault(service.extra.recurringLessonDefault ?? false);
      setBreedDurations({ S: 45, M: 60, L: 90, XL: 120, ...service.extra.breedSizeDurations });
      setAddons(service.extra.addons ?? []);
    } else {
      setName("");
      setDescription("");
      setDurationMinutes(60);
      setCustomDuration(false);
      setPriceDollars("0");
      setDepositRequired(false);
      setDepositDollars("0");
      setMaxDailyLimit("");
      setBufferMinutes(0);
      setActive(true);
      setStyleTags([]);
      setRecurringLessonDefault(false);
      setBreedDurations({ S: 45, M: 60, L: 90, XL: 120 });
      setAddons([]);
    }
  }, [open, service]);

  function toggleStyleTag(tag: string) {
    setStyleTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  }

  async function handleSave() {
    if (!name.trim() || saving) return;

    const extra: ServiceExtra = {};
    if (profession === "tattoo_artist") extra.styleTags = styleTags;
    if (profession === "music_teacher") extra.recurringLessonDefault = recurringLessonDefault;
    if (profession === "dog_groomer") extra.breedSizeDurations = breedDurations;
    if (profession === "mobile_stylist") extra.addons = addons;

    const payload = {
      name: name.trim(),
      description,
      durationMinutes,
      priceCents: Math.round(parseFloat(priceDollars || "0") * 100),
      depositRequired,
      depositAmountCents: depositRequired ? Math.round(parseFloat(depositDollars || "0") * 100) : 0,
      maxDailyLimit: maxDailyLimit ? parseInt(maxDailyLimit, 10) : null,
      bufferMinutes,
      active,
      sortOrder: service?.sortOrder ?? store.services.length,
      extra,
    };

    setSaving(true);
    try {
      if (isEdit) store.updateService(service!.id, payload);
      else await store.addService(payload);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit service" : "Add service"}</DialogTitle>
          <DialogDescription>Clients see this on your public booking page.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. 1 Hour Session" />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea className="mt-1.5" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Duration</Label>
              <Select
                value={customDuration ? "custom" : String(durationMinutes)}
                onValueChange={(v) => {
                  if (v === "custom") setCustomDuration(true);
                  else {
                    setCustomDuration(false);
                    setDurationMinutes(Number(v));
                  }
                }}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_PRESETS.map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {m < 60 ? `${m} min` : `${m / 60} hr${m > 60 ? "s" : ""}`}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {customDuration && (
                <Input
                  className="mt-1.5"
                  type="number"
                  min={5}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  placeholder="Minutes"
                />
              )}
            </div>
            <div>
              <Label>Price ($)</Label>
              <Input className="mt-1.5" type="number" min={0} step="0.01" value={priceDollars} onChange={(e) => setPriceDollars(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-card border-[0.5px] border-card-border p-3">
            <div>
              <p className="text-sm font-medium text-navy">Deposit required</p>
              <p className="text-xs text-muted-foreground">Charge a deposit at booking time</p>
            </div>
            <Switch checked={depositRequired} onCheckedChange={setDepositRequired} />
          </div>
          {depositRequired && (
            <div>
              <Label>Deposit amount ($)</Label>
              <Input className="mt-1.5" type="number" min={0} step="0.01" value={depositDollars} onChange={(e) => setDepositDollars(e.target.value)} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Max daily limit (optional)</Label>
              <Input className="mt-1.5" type="number" min={1} value={maxDailyLimit} onChange={(e) => setMaxDailyLimit(e.target.value)} placeholder="No limit" />
            </div>
            <div>
              <Label>Buffer after session</Label>
              <Select value={String(bufferMinutes)} onValueChange={(v) => setBufferMinutes(Number(v))}>
                <SelectTrigger className="mt-1.5">
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
            </div>
          </div>

          {profession === "tattoo_artist" && (
            <div>
              <Label>Style tags</Label>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {STYLE_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleStyleTag(tag)}
                    className={
                      styleTags.includes(tag)
                        ? "rounded-full border border-teal bg-teal px-3 py-1 text-xs font-medium text-navy"
                        : "rounded-full border border-input px-3 py-1 text-xs text-muted-foreground hover:border-teal"
                    }
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {profession === "music_teacher" && (
            <div className="flex items-center justify-between rounded-card border-[0.5px] border-card-border p-3">
              <div>
                <p className="text-sm font-medium text-navy">Recurring lesson</p>
                <p className="text-xs text-muted-foreground">Auto-creates a weekly repeat booking</p>
              </div>
              <Switch checked={recurringLessonDefault} onCheckedChange={setRecurringLessonDefault} />
            </div>
          )}

          {profession === "dog_groomer" && (
            <div>
              <Label>Default duration by breed size</Label>
              <div className="mt-1.5 grid grid-cols-4 gap-2">
                {(["S", "M", "L", "XL"] as const).map((size) => (
                  <div key={size}>
                    <p className="mb-1 text-center text-xs text-muted-foreground">{size}</p>
                    <Input
                      type="number"
                      min={15}
                      value={breedDurations[size]}
                      onChange={(e) => setBreedDurations((prev) => ({ ...prev, [size]: Number(e.target.value) }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {profession === "mobile_stylist" && (
            <div>
              <Label>Add-on services</Label>
              <div className="mt-1.5 space-y-2">
                {addons.map((addon, i) => (
                  <div key={i} className="grid grid-cols-[1fr_70px_80px_auto] items-center gap-2">
                    <Input
                      value={addon.name}
                      onChange={(e) =>
                        setAddons((prev) => prev.map((a, idx) => (idx === i ? { ...a, name: e.target.value } : a)))
                      }
                      placeholder="Blow dry"
                    />
                    <Input
                      type="number"
                      value={addon.minutes}
                      onChange={(e) =>
                        setAddons((prev) => prev.map((a, idx) => (idx === i ? { ...a, minutes: Number(e.target.value) } : a)))
                      }
                      placeholder="min"
                    />
                    <Input
                      type="number"
                      value={addon.priceCents / 100}
                      onChange={(e) =>
                        setAddons((prev) =>
                          prev.map((a, idx) => (idx === i ? { ...a, priceCents: Math.round(Number(e.target.value) * 100) } : a))
                        )
                      }
                      placeholder="$"
                    />
                    <button
                      type="button"
                      className="text-xs text-destructive"
                      onClick={() => setAddons((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setAddons((prev) => [...prev, { name: "", minutes: 15, priceCents: 0 }])}
                >
                  + Add add-on
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between rounded-card border-[0.5px] border-card-border p-3">
            <div>
              <p className="text-sm font-medium text-navy">Active</p>
              <p className="text-xs text-muted-foreground">Inactive services are hidden from clients</p>
            </div>
            <Switch checked={active} onCheckedChange={setActive} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
