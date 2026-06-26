import type { Booking, Client, Service } from "@/lib/types";

function bookingRevenueCents(b: Booking): number {
  if (b.status === "completed") return b.totalPriceCents;
  if (b.status === "no_show" && b.depositPaid) return b.depositAmountCents;
  if (b.depositPaid) return b.depositAmountCents;
  return 0;
}

export function computeMonthlyRevenue(bookings: Booking[], months = 6) {
  const out: { label: string; revenueCents: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - i);
    const monthBookings = bookings.filter((b) => {
      const bd = new Date(b.startAt);
      return bd.getFullYear() === d.getFullYear() && bd.getMonth() === d.getMonth();
    });
    const revenueCents = monthBookings.reduce((s, b) => s + bookingRevenueCents(b), 0);
    out.push({ label: d.toLocaleDateString("en-US", { month: "short" }), revenueCents });
  }
  return out;
}

export function withTrailingAverage<T extends { revenueCents: number }>(data: T[], window = 3) {
  return data.map((d, i) => {
    const slice = data.slice(Math.max(0, i - window + 1), i + 1);
    const avg = slice.reduce((s, x) => s + x.revenueCents, 0) / slice.length;
    return { ...d, mrrCents: Math.round(avg) };
  });
}

function pctChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}

export function computeBookingStats(bookings: Booking[]) {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const thisMonth = bookings.filter((b) => new Date(b.startAt) >= thisMonthStart && new Date(b.startAt) < now);
  const lastMonth = bookings.filter((b) => new Date(b.startAt) >= lastMonthStart && new Date(b.startAt) < thisMonthStart);

  function rates(set: Booking[]) {
    const finished = set.filter((b) => ["completed", "no_show", "cancelled"].includes(b.status));
    const total = set.length;
    const completionRate = finished.length ? (set.filter((b) => b.status === "completed").length / finished.length) * 100 : 0;
    const noShowRate = finished.length ? (set.filter((b) => b.status === "no_show").length / finished.length) * 100 : 0;
    const cancellationRate = finished.length ? (set.filter((b) => b.status === "cancelled").length / finished.length) * 100 : 0;
    return { total, completionRate, noShowRate, cancellationRate };
  }

  const current = rates(thisMonth);
  const previous = rates(lastMonth);

  return {
    total: current.total,
    completionRate: Math.round(current.completionRate),
    noShowRate: Math.round(current.noShowRate),
    cancellationRate: Math.round(current.cancellationRate),
    trends: {
      total: pctChange(current.total, previous.total),
      completionRate: pctChange(current.completionRate, previous.completionRate),
      noShowRate: pctChange(current.noShowRate, previous.noShowRate),
      cancellationRate: pctChange(current.cancellationRate, previous.cancellationRate),
    },
  };
}

export function computeTopServices(bookings: Booking[], services: Service[]) {
  return services
    .map((s) => {
      const serviceBookings = bookings.filter((b) => b.serviceId === s.id && b.status !== "cancelled");
      return {
        serviceName: s.name,
        revenueCents: serviceBookings.reduce((sum, b) => sum + bookingRevenueCents(b), 0),
        bookingCount: serviceBookings.length,
      };
    })
    .sort((a, b) => b.revenueCents - a.revenueCents);
}

export const HEATMAP_HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8am - 8pm
export const HEATMAP_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function computeBusiestHours(bookings: Booking[]) {
  const grid: number[][] = HEATMAP_DAYS.map(() => HEATMAP_HOURS.map(() => 0));
  for (const b of bookings) {
    if (b.status === "cancelled") continue;
    const d = new Date(b.startAt);
    const day = d.getDay();
    const hour = d.getHours();
    const hourIdx = HEATMAP_HOURS.indexOf(hour);
    if (hourIdx >= 0) grid[day][hourIdx] += 1;
  }
  return grid;
}

export function computeClientMetrics(clients: Client[], bookings: Booking[]) {
  const completed = bookings.filter((b) => b.status === "completed");
  const byClient = new Map<string, Booking[]>();
  for (const b of completed) {
    byClient.set(b.clientId, [...(byClient.get(b.clientId) ?? []), b]);
  }

  const clientBookingLists = Array.from(byClient.values());
  const returning = clientBookingLists.filter((bs) => bs.length >= 2).length;
  const newCount = Math.max(0, clients.length - returning);

  const totalSpent = completed.reduce((s, b) => s + b.totalPriceCents, 0);
  const avgLifetimeValueCents = clients.length ? Math.round(totalSpent / clients.length) : 0;

  const visitCounts = clientBookingLists.map((bs) => bs.length).filter((n) => n > 0);
  const avgVisits = visitCounts.length ? visitCounts.reduce((s, n) => s + n, 0) / visitCounts.length : 0;

  return {
    newCount,
    returningCount: returning,
    avgLifetimeValueCents,
    avgVisitsBeforeChurn: Math.round(avgVisits * 10) / 10,
  };
}
