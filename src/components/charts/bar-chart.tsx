"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export interface BarChartDatum {
  label: string;
  value: number;
  tooltipLabel?: string;
}

export function BarChart({
  data,
  formatValue = (v) => String(v),
  className,
  barClassName,
  highlightToday = false,
}: {
  data: BarChartDatum[];
  formatValue?: (value: number) => string;
  className?: string;
  barClassName?: string;
  highlightToday?: boolean;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className={cn("relative flex h-40 items-end gap-[3px]", className)}>
      {data.map((d, i) => {
        const heightPercent = Math.max(2, (d.value / max) * 100);
        const isLast = i === data.length - 1;
        return (
          <div
            key={i}
            className="group relative flex h-full flex-1 items-end justify-center"
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
          >
            {hoverIndex === i && (
              <div className="absolute bottom-full z-10 mb-2 whitespace-nowrap rounded-btn bg-navy px-2.5 py-1.5 text-xs text-white shadow-card">
                <p className="font-medium">{formatValue(d.value)}</p>
                <p className="text-white/60">{d.tooltipLabel ?? d.label}</p>
              </div>
            )}
            <div
              style={{ height: `${heightPercent}%` }}
              className={cn(
                "w-full rounded-[3px] bg-teal/30 transition-colors group-hover:bg-teal",
                highlightToday && isLast && "bg-teal",
                barClassName
              )}
            />
          </div>
        );
      })}
    </div>
  );
}
