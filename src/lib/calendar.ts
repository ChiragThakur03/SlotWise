import type { AvailabilityRule, Booking, DateOverride } from "@/lib/types";

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const SLOT_MINUTES = 30;

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export function getWeekDates(anchor: Date): Date[] {
  const start = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function getMonthGridDates(anchor: Date): Date[] {
  const firstOfMonth = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const start = startOfWeek(firstOfMonth);
  const lastOfMonth = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  const end = new Date(lastOfMonth);
  end.setDate(end.getDate() + (6 - end.getDay()));

  const dates: Date[] = [];
  const cur = new Date(start);
  while (cur <= end) {
    dates.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTimeInputValue(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function minutesToLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${displayHour} ${period}` : `${displayHour}:${String(m).padStart(2, "0")} ${period}`;
}

export function isSameDate(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function dateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export interface DayOpenWindow {
  isOpen: boolean;
  startMinutes: number;
  endMinutes: number;
  breaks: { startMinutes: number; endMinutes: number }[];
}

export function resolveDayWindow(
  date: Date,
  rules: AvailabilityRule[],
  overrides: DateOverride[]
): DayOpenWindow {
  const override = overrides.find((o) => o.date === dateKey(date));
  const rule = rules.find((r) => r.weekday === date.getDay());

  if (override) {
    if (override.isClosed) return { isOpen: false, startMinutes: 0, endMinutes: 0, breaks: [] };
    return {
      isOpen: true,
      startMinutes: timeToMinutes(override.startTime ?? rule?.startTime ?? "09:00"),
      endMinutes: timeToMinutes(override.endTime ?? rule?.endTime ?? "17:00"),
      breaks: [],
    };
  }

  if (!rule || !rule.isOpen) return { isOpen: false, startMinutes: 0, endMinutes: 0, breaks: [] };

  return {
    isOpen: true,
    startMinutes: timeToMinutes(rule.startTime),
    endMinutes: timeToMinutes(rule.endTime),
    breaks: rule.breaks.map((b) => ({
      startMinutes: timeToMinutes(b.startTime),
      endMinutes: timeToMinutes(b.endTime),
    })),
  };
}

export function getDisplayWindow(
  weekDates: Date[],
  rules: AvailabilityRule[],
  overrides: DateOverride[]
): { startMinutes: number; endMinutes: number } {
  let min = 24 * 60;
  let max = 0;
  for (const d of weekDates) {
    const w = resolveDayWindow(d, rules, overrides);
    if (w.isOpen) {
      min = Math.min(min, w.startMinutes);
      max = Math.max(max, w.endMinutes);
    }
  }
  if (min >= max) return { startMinutes: 8 * 60, endMinutes: 20 * 60 };
  return { startMinutes: Math.max(0, min - 60), endMinutes: Math.min(24 * 60, max + 60) };
}

export type DayBlock =
  | { type: "closed"; startSlot: number; slotSpan: number }
  | { type: "break"; startSlot: number; slotSpan: number }
  | { type: "free"; startSlot: number; slotSpan: number; date: Date }
  | { type: "booking"; startSlot: number; slotSpan: number; booking: Booking };

export function computeDayBlocks(
  date: Date,
  bookings: Booking[],
  window: DayOpenWindow,
  displayStartMinutes: number,
  totalSlots: number,
  slotMinutes = SLOT_MINUTES
): DayBlock[] {
  const dayBookings = bookings
    .filter((b) => isSameDate(new Date(b.startAt), date) && b.status !== "cancelled")
    .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));

  const covered = new Array(totalSlots).fill(false);
  const blocks: DayBlock[] = [];

  for (const b of dayBookings) {
    const start = new Date(b.startAt);
    const end = new Date(b.endAt);
    const startMin = start.getHours() * 60 + start.getMinutes();
    const endMin = end.getHours() * 60 + end.getMinutes();
    const startSlot = Math.max(0, Math.round((startMin - displayStartMinutes) / slotMinutes));
    const slotSpan = Math.max(1, Math.round((endMin - startMin) / slotMinutes));
    if (startSlot >= totalSlots) continue;
    blocks.push({ type: "booking", startSlot, slotSpan, booking: b });
    for (let i = startSlot; i < Math.min(totalSlots, startSlot + slotSpan); i++) covered[i] = true;
  }

  let i = 0;
  while (i < totalSlots) {
    if (covered[i]) {
      i++;
      continue;
    }
    const slotMinute = displayStartMinutes + i * slotMinutes;
    const isClosed = !window.isOpen || slotMinute < window.startMinutes || slotMinute >= window.endMinutes;
    const isBreak =
      !isClosed && window.breaks.some((br) => slotMinute >= br.startMinutes && slotMinute < br.endMinutes);

    let span = 1;
    while (i + span < totalSlots && !covered[i + span]) {
      const nextMinute = displayStartMinutes + (i + span) * slotMinutes;
      const nextClosed = !window.isOpen || nextMinute < window.startMinutes || nextMinute >= window.endMinutes;
      const nextBreak =
        !nextClosed && window.breaks.some((br) => nextMinute >= br.startMinutes && nextMinute < br.endMinutes);
      if (nextClosed !== isClosed || nextBreak !== isBreak) break;
      span++;
    }

    blocks.push(
      isClosed
        ? { type: "closed", startSlot: i, slotSpan: span }
        : isBreak
          ? { type: "break", startSlot: i, slotSpan: span }
          : { type: "free", startSlot: i, slotSpan: span, date }
    );
    i += span;
  }

  return blocks;
}
