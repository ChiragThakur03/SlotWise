"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { HEATMAP_DAYS, HEATMAP_HOURS } from "@/lib/analytics";

function hourLabel(hour: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const h = hour % 12 === 0 ? 12 : hour % 12;
  return `${h}${period}`;
}

export function Heatmap({ grid }: { grid: number[][] }) {
  const [hover, setHover] = useState<{ day: number; hour: number } | null>(null);
  const max = Math.max(1, ...grid.flat());

  return (
    <div className="overflow-x-auto">
      <div className="inline-grid min-w-[640px] gap-1" style={{ gridTemplateColumns: `40px repeat(${HEATMAP_HOURS.length}, 1fr)` }}>
        <div />
        {HEATMAP_HOURS.map((h) => (
          <div key={h} className="text-center text-[10px] text-muted-foreground">
            {hourLabel(h)}
          </div>
        ))}
        {HEATMAP_DAYS.map((day, dayIdx) => (
          <div key={day} className="contents">
            <div className="flex items-center text-xs text-muted-foreground">{day}</div>
            {HEATMAP_HOURS.map((h, hourIdx) => {
              const count = grid[dayIdx][hourIdx];
              const intensity = count / max;
              return (
                <div
                  key={h}
                  onMouseEnter={() => setHover({ day: dayIdx, hour: h })}
                  onMouseLeave={() => setHover(null)}
                  className={cn("relative aspect-square rounded-[3px]", count === 0 && "bg-muted")}
                  style={count > 0 ? { backgroundColor: `rgba(0, 194, 168, ${0.15 + intensity * 0.85})` } : undefined}
                >
                  {hover?.day === dayIdx && hover.hour === h && count > 0 && (
                    <div className="absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded-btn bg-navy px-2 py-1 text-[11px] text-white">
                      {count} booking{count > 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
