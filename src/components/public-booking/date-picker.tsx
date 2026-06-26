"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMonthGridDates, isSameDate, WEEKDAY_LABELS } from "@/lib/calendar";
import { isDateInBookableRange, isDateOpen } from "@/lib/booking-slots";
import type { AvailabilityRule, DateOverride } from "@/lib/types";

export function PublicDatePicker({
  availability,
  dateOverrides,
  advanceBookingDays,
  selectedDate,
  onSelect,
}: {
  availability: AvailabilityRule[];
  dateOverrides: DateOverride[];
  advanceBookingDays: number;
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
}) {
  const [anchor, setAnchor] = useState(() => new Date());
  const dates = getMonthGridDates(anchor);
  const today = new Date();

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() - 1, 1))}
          className="rounded-btn p-1.5 text-muted-foreground hover:bg-muted"
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-medium text-navy">
          {anchor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </p>
        <button
          onClick={() => setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1))}
          className="rounded-btn p-1.5 text-muted-foreground hover:bg-muted"
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="label-caption py-1">
            {d[0]}
          </div>
        ))}
        {dates.map((date) => {
          const inMonth = date.getMonth() === anchor.getMonth();
          const bookable = isDateInBookableRange(date, advanceBookingDays) && isDateOpen(date, availability, dateOverrides);
          const selected = selectedDate && isSameDate(date, selectedDate);
          return (
            <button
              key={date.toISOString()}
              disabled={!bookable}
              onClick={() => onSelect(date)}
              className={cn(
                "flex aspect-square items-center justify-center rounded-full text-sm transition-colors",
                !inMonth && "text-transparent",
                inMonth && !bookable && "text-muted-foreground/40",
                inMonth && bookable && !selected && "text-teal-mid hover:bg-teal-light",
                selected && "bg-teal font-medium text-navy",
                inMonth && isSameDate(date, today) && !selected && "ring-1 ring-inset ring-teal/40"
              )}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
