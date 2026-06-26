"use client";

import { Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export interface DraftService {
  id: string;
  name: string;
  durationMinutes: number;
  priceDollars: string;
  depositRequired: boolean;
  depositDollars: string;
}

const DURATIONS = [30, 45, 60, 90, 120];

export function StepServices({
  services,
  onChange,
}: {
  services: DraftService[];
  onChange: (services: DraftService[]) => void;
}) {
  function update(id: string, patch: Partial<DraftService>) {
    onChange(services.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function remove(id: string) {
    onChange(services.filter((s) => s.id !== id));
  }

  function add() {
    onChange([
      ...services,
      { id: `draft-${Date.now()}-${services.length}`, name: "New service", durationMinutes: 60, priceDollars: "0", depositRequired: false, depositDollars: "0" },
    ]);
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">We pre-filled these based on your profession — edit prices and durations, or add your own.</p>
      {services.map((s) => (
        <Card key={s.id} className="space-y-3">
          <div className="flex items-center gap-2">
            <Input className="flex-1" value={s.name} onChange={(e) => update(s.id, { name: e.target.value })} />
            <button onClick={() => remove(s.id)} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Duration</Label>
              <Select
                value={DURATIONS.includes(s.durationMinutes) ? String(s.durationMinutes) : "custom"}
                onValueChange={(v) => v !== "custom" && update(s.id, { durationMinutes: Number(v) })}
              >
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((m) => (
                    <SelectItem key={m} value={String(m)}>
                      {m < 60 ? `${m} min` : `${m / 60} hr${m > 60 ? "s" : ""}`}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {!DURATIONS.includes(s.durationMinutes) && (
                <Input
                  className="mt-1.5"
                  type="number"
                  min={5}
                  value={s.durationMinutes}
                  onChange={(e) => update(s.id, { durationMinutes: Number(e.target.value) })}
                  placeholder="Minutes"
                />
              )}
            </div>
            <div>
              <Label>Price ($)</Label>
              <Input
                className="mt-1.5"
                type="number"
                min={0}
                value={s.priceDollars}
                onChange={(e) => update(s.id, { priceDollars: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-navy">Require deposit</span>
            <Switch checked={s.depositRequired} onCheckedChange={(v) => update(s.id, { depositRequired: v })} />
          </div>
          {s.depositRequired && (
            <div>
              <Label>Deposit amount ($)</Label>
              <Input
                className="mt-1.5"
                type="number"
                min={0}
                value={s.depositDollars}
                onChange={(e) => update(s.id, { depositDollars: e.target.value })}
              />
            </div>
          )}
        </Card>
      ))}
      <Button variant="secondary" size="sm" onClick={add}>
        <Plus className="h-3.5 w-3.5" /> Add service
      </Button>
    </div>
  );
}
