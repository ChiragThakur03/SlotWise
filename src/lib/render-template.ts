import type { Booking, Profile } from "@/lib/types";
import { formatCents, formatDate, formatTime } from "@/lib/format";

export interface TemplateVariables {
  client_name?: string;
  client_first_name?: string;
  service?: string;
  date?: string;
  time?: string;
  deposit_amount?: string;
  booking_link?: string;
  pro_name?: string;
}

export function renderTemplate(text: string, vars: TemplateVariables): string {
  return text.replace(/\{(\w+)\}/g, (match, key) => {
    const value = (vars as Record<string, string | undefined>)[key];
    return value ?? match;
  });
}

export function buildBookingVariables(booking: Booking, profile: Profile): TemplateVariables {
  return {
    client_name: booking.clientName,
    client_first_name: booking.clientName?.split(" ")[0],
    service: booking.serviceName,
    date: formatDate(booking.startAt, { weekday: "short" }),
    time: formatTime(booking.startAt),
    deposit_amount: formatCents(booking.depositAmountCents),
    booking_link: `https://slotwise.io/book/${profile.username}`,
    pro_name: profile.businessName,
  };
}
