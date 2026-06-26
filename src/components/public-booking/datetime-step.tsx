"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { PublicDatePicker } from "@/components/public-booking/date-picker";
import { getAvailableTimeSlots } from "@/lib/booking-slots";
import type { AvailabilityRule, Booking, DateOverride, Service } from "@/lib/types";

export function DateTimeStep({
  service,
  availability,
  dateOverrides,
  bookings,
  advanceBookingDays,
  minNoticeHours,
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
}: {
  service: Service;
  availability: AvailabilityRule[];
  dateOverrides: DateOverride[];
  bookings: Booking[];
  advanceBookingDays: number;
  minNoticeHours: number;
  selectedDate: Date | null;
  selectedTime: string | null;
  onSelectDate: (date: Date) => void;
  onSelectTime: (time: string) => void;
}) {
  const slots = useMemo(() => {
    if (!selectedDate) return [];
    return getAvailableTimeSlots(
      selectedDate,
      service.durationMinutes,
      service.bufferMinutes,
      availability,
      dateOverrides,
      bookings,
      minNoticeHours
    );
  }, [selectedDate, service, availability, dateOverrides, bookings, minNoticeHours]);

  return (
    <div className="space-y-5">
      <h2 className="text-base font-medium text-navy">Pick a date & time</h2>
      <PublicDatePicker
        availability={availability}
        dateOverrides={dateOverrides}
        advanceBookingDays={advanceBookingDays}
        selectedDate={selectedDate}
        onSelect={onSelectDate}
      />

      {selectedDate && (
        <div>
          <p className="label-caption mb-2">
            Available times — {selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
          </p>
          {slots.length === 0 ? (
            <p className="text-sm text-muted-foreground">No times available this day. Try another date.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((slot) => (
                <button
                  key={slot.value}
                  onClick={() => onSelectTime(slot.value)}
                  className={cn(
                    "rounded-full border px-3 py-2 text-sm font-medium transition-colors",
                    selectedTime === slot.value
                      ? "border-teal bg-teal text-navy"
                      : "border-input text-navy hover:border-teal hover:bg-teal-light"
                  )}
                >
                  {slot.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
