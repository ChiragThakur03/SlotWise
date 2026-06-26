"use client";

import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WEEKDAY_LABELS } from "@/lib/calendar";

export interface DraftHours {
  weekday: number;
  isOpen: boolean;
  startTime: string;
  endTime: string;
}

export function StepAvailability({
  hours,
  onChange,
}: {
  hours: DraftHours[];
  onChange: (hours: DraftHours[]) => void;
}) {
  function update(weekday: number, patch: Partial<DraftHours>) {
    onChange(hours.map((h) => (h.weekday === weekday ? { ...h, ...patch } : h)));
  }

  function copyMondayToWeekdays() {
    const monday = hours.find((h) => h.weekday === 1);
    if (!monday) return;
    onChange(
      hours.map((h) => ([2, 3, 4, 5].includes(h.weekday) ? { ...h, isOpen: monday.isOpen, startTime: monday.startTime, endTime: monday.endTime } : h))
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Set your weekly hours — you can fine-tune breaks and overrides later.</p>
        <Button variant="ghost" size="sm" onClick={copyMondayToWeekdays}>
          Copy Monday to all weekdays
        </Button>
      </div>
      <div className="space-y-2">
        {[...hours].sort((a, b) => a.weekday - b.weekday).map((h) => (
          <div key={h.weekday} className="flex items-center gap-3 rounded-card border-[0.5px] border-card-border p-3">
            <Switch checked={h.isOpen} onCheckedChange={(v) => update(h.weekday, { isOpen: v })} />
            <span className="w-10 text-sm font-medium text-navy">{WEEKDAY_LABELS[h.weekday]}</span>
            {h.isOpen ? (
              <>
                <Input type="time" className="w-32" value={h.startTime} onChange={(e) => update(h.weekday, { startTime: e.target.value })} />
                <span className="text-sm text-muted-foreground">to</span>
                <Input type="time" className="w-32" value={h.endTime} onChange={(e) => update(h.weekday, { endTime: e.target.value })} />
              </>
            ) : (
              <span className="text-sm text-muted-foreground">Closed</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
