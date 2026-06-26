import {
  isSameDate,
  minutesToLabel,
  minutesToTimeInputValue,
  resolveDayWindow,
} from "@/lib/calendar";
import type { AvailabilityRule, Booking, DateOverride } from "@/lib/types";

const SLOT_INTERVAL = 30;

export function isDateInBookableRange(date: Date, advanceBookingDays: number): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const max = new Date(today);
  max.setDate(max.getDate() + advanceBookingDays);
  return date >= today && date <= max;
}

export function isDateOpen(date: Date, availability: AvailabilityRule[], dateOverrides: DateOverride[]): boolean {
  return resolveDayWindow(date, availability, dateOverrides).isOpen;
}

export interface TimeSlot {
  value: string; // "HH:MM" 24h, for constructing a Date
  label: string; // "10:00 AM"
}

export function getAvailableTimeSlots(
  date: Date,
  durationMinutes: number,
  bufferMinutes: number,
  availability: AvailabilityRule[],
  dateOverrides: DateOverride[],
  bookings: Booking[],
  minNoticeHours: number
): TimeSlot[] {
  const window = resolveDayWindow(date, availability, dateOverrides);
  if (!window.isOpen) return [];

  const noticeCutoff = new Date(Date.now() + minNoticeHours * 3600_000);
  const dayBookings = bookings.filter(
    (b) => isSameDate(new Date(b.startAt), date) && b.status !== "cancelled"
  );

  const slots: TimeSlot[] = [];
  for (let t = window.startMinutes; t + durationMinutes <= window.endMinutes; t += SLOT_INTERVAL) {
    const slotStart = new Date(date);
    slotStart.setHours(0, 0, 0, 0);
    slotStart.setMinutes(t);
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60_000);

    if (slotStart < noticeCutoff) continue;

    const overlapsBreak = window.breaks.some(
      (br) => t < br.endMinutes && t + durationMinutes > br.startMinutes
    );
    if (overlapsBreak) continue;

    const overlapsBooking = dayBookings.some((b) => {
      const bs = new Date(b.startAt).getTime() - bufferMinutes * 60_000;
      const be = new Date(b.endAt).getTime() + bufferMinutes * 60_000;
      return slotStart.getTime() < be && slotEnd.getTime() > bs;
    });
    if (overlapsBooking) continue;

    slots.push({ value: minutesToTimeInputValue(t), label: minutesToLabel(t) });
  }
  return slots;
}
