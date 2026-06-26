"use client";

import { cn } from "@/lib/utils";
import { getMonthGridDates, isSameDate, WEEKDAY_LABELS } from "@/lib/calendar";
import type { Booking } from "@/lib/types";

export function MonthView({
  anchor,
  bookings,
  onDayClick,
}: {
  anchor: Date;
  bookings: Booking[];
  onDayClick: (date: Date) => void;
}) {
  const dates = getMonthGridDates(anchor);
  const today = new Date();

  return (
    <div className="overflow-hidden rounded-card border-[0.5px] border-card-border bg-white">
      <div className="grid grid-cols-7 border-b border-border">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="label-caption px-2 py-2 text-center">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {dates.map((date) => {
          const dayBookings = bookings.filter(
            (b) => isSameDate(new Date(b.startAt), date) && b.status !== "cancelled"
          );
          const inMonth = date.getMonth() === anchor.getMonth();
          return (
            <button
              key={date.toISOString()}
              onClick={() => onDayClick(date)}
              className={cn(
                "flex min-h-[88px] flex-col items-start gap-1 border-b border-r border-border p-2 text-left transition-colors hover:bg-teal-light/40",
                !inMonth && "bg-off-white/60"
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-sm",
                  isSameDate(date, today) ? "bg-teal text-navy font-medium" : inMonth ? "text-navy" : "text-muted-foreground"
                )}
              >
                {date.getDate()}
              </span>
              <div className="flex flex-wrap gap-1">
                {dayBookings.slice(0, 4).map((b) => (
                  <span key={b.id} className="h-1.5 w-1.5 rounded-full bg-teal" />
                ))}
              </div>
              {dayBookings.length > 0 && (
                <span className="text-[11px] text-muted-foreground">
                  {dayBookings.length} booking{dayBookings.length > 1 ? "s" : ""}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
