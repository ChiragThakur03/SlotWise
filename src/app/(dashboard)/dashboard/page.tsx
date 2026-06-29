"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Send, Receipt, Check, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { BarChart } from "@/components/charts/bar-chart";
import { BookingDetailSheet } from "@/components/bookings/booking-detail-sheet";
import { NewBookingModal } from "@/components/bookings/new-booking-modal";
import { EmptyBookingLinkPrompt } from "@/components/empty-booking-link-prompt";
import { PlanLimitBanner } from "@/components/dashboard/plan-limit-banner";
import { OnboardedBanner } from "@/components/dashboard/onboarded-banner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAppStore } from "@/lib/store/app-store";
import { computeTodayBookings, computeUpcomingBookings, computeRevenueByDay, computeDashboardStats } from "@/lib/derive";
import { formatCents, formatTime, relativeDay } from "@/lib/format";
import { sendNotification } from "@/lib/send-notification-client";
import { buildBookingVariables } from "@/lib/render-template";

export default function DashboardPage() {
  const store = useAppStore();
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [newBookingOpen, setNewBookingOpen] = useState(false);
  const [depositSummaryOpen, setDepositSummaryOpen] = useState(false);
  const [remindersSent, setRemindersSent] = useState(false);

  const todayBookings = useMemo(() => computeTodayBookings(store.bookings), [store.bookings]);
  const upcomingBookings = useMemo(() => computeUpcomingBookings(store.bookings, 7), [store.bookings]);
  const revenueByDay = useMemo(() => computeRevenueByDay(store.bookings, 30), [store.bookings]);
  const stats = useMemo(() => computeDashboardStats(store.bookings, store.clients), [store.bookings, store.clients]);

  const todayDeposits = todayBookings.filter((b) => b.depositAmountCents > 0);
  const todayDepositsCollected = todayDeposits.filter((b) => b.depositPaid).reduce((s, b) => s + b.depositAmountCents, 0);
  const todayDepositsOutstanding = todayDeposits.filter((b) => !b.depositPaid).reduce((s, b) => s + b.depositAmountCents, 0);

  async function sendRemindersToToday() {
    const targets = todayBookings.filter((b) => b.status === "confirmed" || b.status === "pending");
    const reminderTemplate = store.notificationTemplates.find((t) => t.type === "reminder_24h");

    const entries = await Promise.all(
      targets.map(async (b) => {
        const client = store.clients.find((c) => c.id === b.clientId);
        const result = reminderTemplate
          ? await sendNotification(
              reminderTemplate.channel,
              { email: client?.email, phone: client?.phone },
              reminderTemplate.body,
              buildBookingVariables(b, store.profile),
              reminderTemplate.subject
            )
          : { configured: false, sent: false };

        return {
          profileId: b.profileId,
          bookingId: b.id,
          clientId: b.clientId,
          clientName: b.clientName,
          type: "custom" as const,
          channel: (reminderTemplate?.channel ?? "both") as "email" | "sms" | "both",
          status: (result.sent ? "sent" : "failed") as "sent" | "failed",
          errorMessage: result.sent ? null : result.error ?? null,
        };
      })
    );

    store.logNotification(entries);
    setRemindersSent(true);
    setTimeout(() => setRemindersSent(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-medium text-navy">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      <Suspense fallback={null}>
        <OnboardedBanner />
      </Suspense>
      <PlanLimitBanner />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's bookings" value={String(stats.todayCount)} />
        <StatCard label="This week's revenue" value={formatCents(stats.weekRevenueCents)} accent />
        <StatCard label="No-show rate (30d)" value={`${stats.noShowRatePercent}%`} warn={stats.noShowRatePercent > 15} />
        <StatCard label="Active clients" value={String(stats.activeClients)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-navy">Today&apos;s schedule</h2>
            <Link href="/calendar" className="flex items-center text-sm text-teal-mid hover:underline">
              View calendar <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {todayBookings.length === 0 ? (
            <EmptyBookingLinkPrompt username={store.profile.username} />
          ) : (
            <ol className="relative space-y-3 border-l border-border pl-5">
              {todayBookings.map((b) => (
                <li key={b.id} className="relative">
                  <span className="absolute -left-[27px] top-4 h-2 w-2 rounded-full bg-teal" />
                  <button onClick={() => setSelectedBookingId(b.id)} className="w-full text-left">
                    <Card className="flex items-center gap-3 transition-colors hover:border-teal">
                      <Avatar name={b.clientName ?? ""} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-navy">{b.clientName}</p>
                        <p className="truncate text-xs text-muted-foreground">{b.serviceName}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-xs text-muted-foreground">{formatTime(b.startAt)}</span>
                        <BookingStatusBadge status={b.status} />
                      </div>
                    </Card>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <h2 className="mb-3 text-sm font-medium text-navy">Quick actions</h2>
            <div className="space-y-2">
              <Button className="w-full justify-start" onClick={() => setNewBookingOpen(true)}>
                <Plus className="h-4 w-4" /> Add manual booking
              </Button>
              <Button variant="secondary" className="w-full justify-start" onClick={sendRemindersToToday}>
                {remindersSent ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                {remindersSent ? "Reminders sent" : "Send reminder to all today"}
              </Button>
              <Button variant="secondary" className="w-full justify-start" onClick={() => setDepositSummaryOpen(true)}>
                <Receipt className="h-4 w-4" /> View deposit summary
              </Button>
            </div>
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-navy">Upcoming (7 days)</h2>
              <Link href="/bookings" className="text-sm text-teal-mid hover:underline">
                See all
              </Link>
            </div>
            {upcomingBookings.length === 0 ? (
              <Card>
                <p className="text-sm text-muted-foreground">Nothing else booked this week yet.</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {upcomingBookings.slice(0, 5).map((b) => (
                  <button key={b.id} onClick={() => setSelectedBookingId(b.id)} className="w-full text-left">
                    <Card className="flex items-center gap-3 p-3 transition-colors hover:border-teal">
                      <Avatar name={b.clientName ?? ""} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-navy">{b.clientName}</p>
                        <p className="truncate text-xs text-muted-foreground">{b.serviceName}</p>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {relativeDay(b.startAt)}, {formatTime(b.startAt)}
                      </span>
                    </Card>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-medium text-navy">Revenue, last 30 days</h2>
          <span className="text-sm font-medium text-gold">
            {formatCents(revenueByDay.reduce((s, d) => s + d.revenueCents, 0))}
          </span>
        </div>
        <BarChart
          data={revenueByDay.map((d) => ({
            label: new Date(d.date).toLocaleDateString("en-US", { day: "numeric" }),
            value: d.revenueCents,
            tooltipLabel: new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          }))}
          formatValue={formatCents}
          highlightToday
        />
      </Card>

      <BookingDetailSheet
        bookingId={selectedBookingId}
        open={!!selectedBookingId}
        onOpenChange={(open) => !open && setSelectedBookingId(null)}
      />
      <NewBookingModal open={newBookingOpen} onOpenChange={setNewBookingOpen} />

      <Dialog open={depositSummaryOpen} onOpenChange={setDepositSummaryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Today&apos;s deposit summary</DialogTitle>
            <DialogDescription>Deposits collected and outstanding for today&apos;s bookings.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {todayDeposits.length === 0 && <p className="text-sm text-muted-foreground">No deposits required today.</p>}
            {todayDeposits.map((b) => (
              <div key={b.id} className="flex items-center justify-between rounded-card border-[0.5px] border-card-border p-3 text-sm">
                <span className="text-navy">{b.clientName}</span>
                <span className={b.depositPaid ? "font-medium text-accent-foreground" : "font-medium text-gold"}>
                  {formatCents(b.depositAmountCents)} {b.depositPaid ? "paid" : "due"}
                </span>
              </div>
            ))}
            {todayDeposits.length > 0 && (
              <div className="flex items-center justify-between border-t border-border pt-3 text-sm font-medium">
                <span className="text-navy">Collected / Outstanding</span>
                <span className="text-navy">
                  {formatCents(todayDepositsCollected)} / {formatCents(todayDepositsOutstanding)}
                </span>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
