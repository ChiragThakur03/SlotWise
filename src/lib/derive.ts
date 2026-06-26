import type { Booking, Client } from "@/lib/types";

export function computeTodayBookings(bookings: Booking[]): Booking[] {
  const today = new Date().toDateString();
  return bookings
    .filter((b) => new Date(b.startAt).toDateString() === today)
    .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
}

export function computeUpcomingBookings(bookings: Booking[], days = 7): Booking[] {
  const now = new Date();
  const end = new Date();
  end.setDate(end.getDate() + days);
  return bookings
    .filter((b) => {
      const d = new Date(b.startAt);
      return d > now && d <= end && b.status !== "cancelled";
    })
    .sort((a, b) => +new Date(a.startAt) - +new Date(b.startAt));
}

export function computeRevenueByDay(bookings: Booking[], days = 30): { date: string; revenueCents: number }[] {
  const out: { date: string; revenueCents: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const dayBookings = bookings.filter((b) => {
      const bd = new Date(b.startAt);
      return (
        bd.toDateString() === d.toDateString() &&
        (b.status === "completed" || b.status === "confirmed" || b.status === "no_show")
      );
    });
    const revenueCents = dayBookings.reduce(
      (sum, b) =>
        sum +
        (b.depositPaid ? b.depositAmountCents : 0) +
        (b.status === "completed" ? b.totalPriceCents - b.depositAmountCents : 0),
      0
    );
    out.push({ date: d.toISOString(), revenueCents });
  }
  return out;
}

export function computeClientStats(clientId: string, bookings: Booking[]) {
  const clientBookings = bookings.filter((b) => b.clientId === clientId);
  const countedBookings = clientBookings.filter((b) => b.status !== "cancelled");
  const completed = clientBookings.filter((b) => b.status === "completed");

  const totalSpentCents = completed.reduce((s, b) => s + b.totalPriceCents, 0);
  const lastVisitAt = completed.length
    ? completed.reduce((latest, b) => (new Date(b.startAt) > new Date(latest.startAt) ? b : latest)).startAt
    : null;

  return {
    totalSessions: completed.length,
    totalSpentCents,
    lastVisitAt,
    isReturning: countedBookings.length >= 3,
  };
}

export function computeDashboardStats(bookings: Booking[], clients: Client[]) {
  const today = computeTodayBookings(bookings);
  const weekRevenue = computeRevenueByDay(bookings, 7).reduce((s, d) => s + d.revenueCents, 0);
  const last30 = bookings.filter((b) => +new Date(b.startAt) > Date.now() - 30 * 86400000);
  const finished = last30.filter((b) => b.status === "completed" || b.status === "no_show");
  const noShowRate = finished.length
    ? finished.filter((b) => b.status === "no_show").length / finished.length
    : 0;

  return {
    todayCount: today.length,
    weekRevenueCents: weekRevenue,
    noShowRatePercent: Math.round(noShowRate * 100),
    activeClients: clients.length,
  };
}
