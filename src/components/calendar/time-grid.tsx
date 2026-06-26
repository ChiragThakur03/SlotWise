"use client";

import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/format";
import {
  SLOT_MINUTES,
  computeDayBlocks,
  getDisplayWindow,
  minutesToLabel,
  minutesToTimeInputValue,
  resolveDayWindow,
  isSameDate,
  type DayBlock,
} from "@/lib/calendar";
import type { AvailabilityRule, Booking, DateOverride } from "@/lib/types";

const SLOT_HEIGHT = 28;

export function TimeGrid({
  dates,
  bookings,
  availability,
  dateOverrides,
  onSlotClick,
  onBookingClick,
}: {
  dates: Date[];
  bookings: Booking[];
  availability: AvailabilityRule[];
  dateOverrides: DateOverride[];
  onSlotClick: (date: Date, time: string) => void;
  onBookingClick: (bookingId: string) => void;
}) {
  const { startMinutes, endMinutes } = getDisplayWindow(dates, availability, dateOverrides);
  const totalSlots = Math.round((endMinutes - startMinutes) / SLOT_MINUTES);
  const today = new Date();

  const columns = dates.map((date) => {
    const window = resolveDayWindow(date, availability, dateOverrides);
    return {
      date,
      blocks: computeDayBlocks(date, bookings, window, startMinutes, totalSlots),
    };
  });

  return (
    <div className="overflow-x-auto rounded-card border-[0.5px] border-card-border bg-white">
      <div
        className="grid min-w-[640px]"
        style={{
          gridTemplateColumns: `56px repeat(${dates.length}, minmax(120px, 1fr))`,
        }}
      >
        {/* Header row */}
        <div className="sticky top-0 z-10 border-b border-border bg-white" />
        {dates.map((date) => (
          <div
            key={date.toISOString()}
            className={cn(
              "sticky top-0 z-10 border-b border-l border-border bg-white px-2 py-2 text-center",
              isSameDate(date, today) && "bg-teal-light"
            )}
          >
            <p className="label-caption">{date.toLocaleDateString("en-US", { weekday: "short" })}</p>
            <p className={cn("text-sm font-medium", isSameDate(date, today) ? "text-accent-foreground" : "text-navy")}>
              {date.getDate()}
            </p>
          </div>
        ))}

        {/* Time label column */}
        <div
          className="relative"
          style={{ gridRow: `2 / span ${totalSlots}`, height: totalSlots * SLOT_HEIGHT }}
        >
          {Array.from({ length: totalSlots }, (_, i) => {
            const minute = startMinutes + i * SLOT_MINUTES;
            if (minute % 60 !== 0) return null;
            return (
              <div
                key={i}
                className="absolute right-2 -translate-y-1/2 text-[11px] text-muted-foreground"
                style={{ top: i * SLOT_HEIGHT }}
              >
                {minutesToLabel(minute)}
              </div>
            );
          })}
        </div>

        {/* Day columns */}
        {columns.map(({ date, blocks }) => (
          <div
            key={date.toISOString()}
            className="relative grid border-l border-border"
            style={{
              gridTemplateRows: `repeat(${totalSlots}, ${SLOT_HEIGHT}px)`,
              gridRow: `2 / span ${totalSlots}`,
            }}
          >
            {blocks.map((block, idx) => (
              <DayBlockCell
                key={idx}
                block={block}
                startMinutes={startMinutes}
                onSlotClick={onSlotClick}
                onBookingClick={onBookingClick}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function DayBlockCell({
  block,
  startMinutes,
  onSlotClick,
  onBookingClick,
}: {
  block: DayBlock;
  startMinutes: number;
  onSlotClick: (date: Date, time: string) => void;
  onBookingClick: (bookingId: string) => void;
}) {
  const style = { gridRow: `${block.startSlot + 1} / span ${block.slotSpan}` };

  if (block.type === "closed") {
    return <div className="bg-hatched border-b border-border" style={style} />;
  }
  if (block.type === "break") {
    return <div className="border-b border-border bg-muted/60" style={style} />;
  }
  if (block.type === "free") {
    const slotDate = block.date;
    const time = minutesToTimeInputValue(startMinutes + block.startSlot * SLOT_MINUTES);
    return (
      <button
        data-slot="free"
        className="group border-b border-border transition-colors hover:bg-teal-light/60"
        style={style}
        onClick={() => onSlotClick(slotDate, time)}
      >
        <span className="hidden text-[11px] text-teal-mid group-hover:inline">+ Add</span>
      </button>
    );
  }

  const { booking } = block;
  const statusStyles: Record<string, string> = {
    confirmed: "bg-teal text-navy border-teal-mid",
    pending: "bg-teal-light text-accent-foreground border-teal",
    completed: "bg-muted text-muted-foreground border-border",
    no_show: "bg-destructive/10 text-destructive border-destructive/30",
  };

  return (
    <button
      className={cn(
        "m-px overflow-hidden rounded-[4px] border px-1.5 py-0.5 text-left text-[11px] leading-tight transition-opacity hover:opacity-90",
        statusStyles[booking.status] ?? statusStyles.confirmed
      )}
      style={style}
      onClick={() => onBookingClick(booking.id)}
    >
      <p className="truncate font-medium">{booking.clientName}</p>
      <p className="truncate opacity-80">
        {booking.serviceName} · {formatTime(booking.startAt)}
      </p>
    </button>
  );
}
