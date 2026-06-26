"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface ComboDatum {
  label: string;
  bar: number;
  line: number;
}

export function ComboChart({
  data,
  formatValue = (v) => String(v),
}: {
  data: ComboDatum[];
  formatValue?: (value: number) => string;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.bar), ...data.map((d) => d.line));

  const points = data
    .map((d, i) => {
      const x = data.length > 1 ? (i / (data.length - 1)) * 100 : 50;
      const y = 100 - (d.line / max) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-teal" /> Revenue
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-gold" /> MRR (3-mo avg)
        </span>
      </div>
      <div className="relative h-48">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
          <polyline points={points} fill="none" stroke="#F5A623" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="relative flex h-full items-end gap-[3px]">
          {data.map((d, i) => (
            <div
              key={i}
              className="group relative flex h-full flex-1 items-end justify-center"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              {hoverIndex === i && (
                <div className="absolute bottom-full z-10 mb-2 whitespace-nowrap rounded-btn bg-navy px-2.5 py-1.5 text-xs text-white shadow-card">
                  <p className="font-medium">{formatValue(d.bar)}</p>
                  <p className="text-gold/80">MRR {formatValue(d.line)}</p>
                </div>
              )}
              <div
                style={{ height: `${Math.max(2, (d.bar / max) * 100)}%` }}
                className={cn("w-full rounded-[3px] bg-teal/30 transition-colors group-hover:bg-teal")}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex gap-[3px]">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center text-[11px] text-muted-foreground">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
