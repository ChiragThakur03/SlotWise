"use client";

import { useMemo } from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ComboChart } from "@/components/charts/combo-chart";
import { HorizontalBarChart } from "@/components/charts/horizontal-bar-chart";
import { Heatmap } from "@/components/charts/heatmap";
import { DonutChart } from "@/components/charts/donut-chart";
import { useAppStore } from "@/lib/store/app-store";
import {
  computeMonthlyRevenue,
  withTrailingAverage,
  computeBookingStats,
  computeTopServices,
  computeBusiestHours,
  computeClientMetrics,
} from "@/lib/analytics";
import { formatCents } from "@/lib/format";

export default function AnalyticsPage() {
  const store = useAppStore();

  const monthlyRevenue = useMemo(() => withTrailingAverage(computeMonthlyRevenue(store.bookings, 6)), [store.bookings]);
  const bookingStats = useMemo(() => computeBookingStats(store.bookings), [store.bookings]);
  const topServices = useMemo(() => computeTopServices(store.bookings, store.services), [store.bookings, store.services]);
  const heatmapGrid = useMemo(() => computeBusiestHours(store.bookings), [store.bookings]);
  const clientMetrics = useMemo(() => computeClientMetrics(store.clients, store.bookings), [store.clients, store.bookings]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-medium text-navy">Analytics</h1>

      <Card>
        <p className="mb-4 text-sm font-medium text-navy">Revenue overview</p>
        <ComboChart
          data={monthlyRevenue.map((m) => ({ label: m.label, bar: m.revenueCents, line: m.mrrCents }))}
          formatValue={formatCents}
        />
      </Card>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTrend label="Total bookings" value={String(bookingStats.total)} trend={bookingStats.trends.total} />
        <StatTrend label="Completion rate" value={`${bookingStats.completionRate}%`} trend={bookingStats.trends.completionRate} />
        <StatTrend label="No-show rate" value={`${bookingStats.noShowRate}%`} trend={bookingStats.trends.noShowRate} invert />
        <StatTrend label="Cancellation rate" value={`${bookingStats.cancellationRate}%`} trend={bookingStats.trends.cancellationRate} invert />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <p className="mb-4 text-sm font-medium text-navy">Top services</p>
          <HorizontalBarChart
            data={topServices.map((s) => ({ label: s.serviceName, value: s.revenueCents, meta: `${s.bookingCount} bookings` }))}
            formatValue={formatCents}
          />
        </Card>

        <Card>
          <p className="mb-4 text-sm font-medium text-navy">Client metrics</p>
          <DonutChart
            segments={[
              { label: "Returning", value: clientMetrics.returningCount, color: "#00C2A8" },
              { label: "New", value: clientMetrics.newCount, color: "#E1F5EE" },
            ]}
          />
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-border pt-4">
            <div>
              <p className="label-caption">Avg. lifetime value</p>
              <p className="mt-1 text-lg font-medium text-gold">{formatCents(clientMetrics.avgLifetimeValueCents)}</p>
            </div>
            <div>
              <p className="label-caption">Avg. visits / client</p>
              <p className="mt-1 text-lg font-medium text-navy">{clientMetrics.avgVisitsBeforeChurn}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <p className="mb-4 text-sm font-medium text-navy">Busiest hours</p>
        <Heatmap grid={heatmapGrid} />
      </Card>
    </div>
  );
}

function StatTrend({ label, value, trend, invert }: { label: string; value: string; trend: number | null; invert?: boolean }) {
  const isGood = trend === null ? null : invert ? trend <= 0 : trend >= 0;
  return (
    <Card>
      <p className="label-caption">{label}</p>
      <p className="mt-2 text-2xl font-medium text-navy">{value}</p>
      {trend !== null && (
        <p className={`mt-1 flex items-center gap-1 text-xs ${isGood ? "text-accent-foreground" : "text-destructive"}`}>
          {trend === 0 ? <Minus className="h-3 w-3" /> : trend > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
          {Math.abs(trend)}% vs last month
        </p>
      )}
    </Card>
  );
}
