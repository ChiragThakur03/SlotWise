"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TimeGrid } from "@/components/calendar/time-grid";
import { MonthView } from "@/components/calendar/month-view";
import { BookingDetailSheet } from "@/components/bookings/booking-detail-sheet";
import { NewBookingModal } from "@/components/bookings/new-booking-modal";
import { useAppStore } from "@/lib/store/app-store";
import { getWeekDates } from "@/lib/calendar";

type ViewMode = "day" | "week" | "month";

export default function CalendarPage() {
  const store = useAppStore();
  const [view, setView] = useState<ViewMode>("week");
  const [anchor, setAnchor] = useState(() => new Date());
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [newBooking, setNewBooking] = useState<{ open: boolean; date?: string; time?: string }>({ open: false });

  const dates = useMemo(() => {
    if (view === "day") return [anchor];
    if (view === "week") return getWeekDates(anchor);
    return [];
  }, [view, anchor]);

  function step(direction: 1 | -1) {
    const d = new Date(anchor);
    if (view === "day") d.setDate(d.getDate() + direction);
    else if (view === "week") d.setDate(d.getDate() + direction * 7);
    else d.setMonth(d.getMonth() + direction);
    setAnchor(d);
  }

  function headerLabel() {
    if (view === "month") return anchor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (view === "day") return anchor.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    const week = getWeekDates(anchor);
    const start = week[0];
    const end = week[6];
    const sameMonth = start.getMonth() === end.getMonth();
    return sameMonth
      ? `${start.toLocaleDateString("en-US", { month: "long" })} ${start.getDate()}–${end.getDate()}, ${end.getFullYear()}`
      : `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-medium text-navy">Calendar</h1>
        <Button onClick={() => setNewBooking({ open: true })}>
          <Plus className="h-4 w-4" /> Add booking
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => step(-1)} aria-label="Previous">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAnchor(new Date())}>
            Today
          </Button>
          <Button variant="ghost" size="icon" onClick={() => step(1)} aria-label="Next">
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="ml-1 text-sm font-medium text-navy">{headerLabel()}</span>
        </div>

        <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {view === "month" ? (
        <MonthView
          anchor={anchor}
          bookings={store.bookings}
          onDayClick={(date) => {
            setAnchor(date);
            setView("day");
          }}
        />
      ) : (
        <TimeGrid
          dates={dates}
          bookings={store.bookings}
          availability={store.availability}
          dateOverrides={store.dateOverrides}
          onSlotClick={(date, time) =>
            setNewBooking({ open: true, date: date.toISOString().slice(0, 10), time })
          }
          onBookingClick={setSelectedBookingId}
        />
      )}

      <BookingDetailSheet
        bookingId={selectedBookingId}
        open={!!selectedBookingId}
        onOpenChange={(open) => !open && setSelectedBookingId(null)}
      />
      <NewBookingModal
        open={newBooking.open}
        onOpenChange={(open) => setNewBooking((s) => ({ ...s, open }))}
        defaultDate={newBooking.date}
        defaultTime={newBooking.time}
      />
    </div>
  );
}
