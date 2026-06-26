import type {
  AvailabilityRule,
  Booking,
  Client,
  DateOverride,
  IntakeForm,
  NotificationLogEntry,
  NotificationTemplate,
  Profile,
  Service,
  Staff,
} from "@/lib/types";
import {
  computeTodayBookings,
  computeUpcomingBookings,
  computeRevenueByDay,
  computeDashboardStats,
} from "@/lib/derive";
import { PROFESSIONS } from "@/lib/verticals";

function iso(daysFromToday: number, hour: number, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function dateKey(daysFromToday: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  return d.toISOString().slice(0, 10);
}

export const mockProfile: Profile = {
  id: "00000000-0000-0000-0000-000000000001",
  username: "inkiron",
  profession: "tattoo_artist",
  businessName: "Ink & Iron Tattoo",
  bio: "Custom blackwork and realism, by appointment only.",
  photoUrl: null,
  location: "Portland, OR",
  contactEmail: "hello@inkiron.example",
  contactPhone: "+1 (503) 555-0182",
  accentColor: "teal",
  showSocialLinks: true,
  advanceBookingDays: 60,
  minNoticeHours: 24,
  bufferMinutes: 15,
  depositDefaultPercent: 30,
  cancellationPolicy: "Cancellations within 48 hours forfeit the deposit.",
  refundPolicy: "Deposits are non-refundable but transferable to a rescheduled date.",
  stripeAccountId: null,
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  subscriptionPlan: "pro",
  subscriptionStatus: "active",
  proNotifyNewBooking: true,
  proNotifyCancellation: true,
  proNotifyPayment: true,
  onboardingStep: 4,
  onboardingCompleted: true,
  createdAt: iso(-120, 9),
};

export const mockServices: Service[] = [
  {
    id: "svc-1",
    profileId: mockProfile.id,
    name: "1 Hour Session",
    description: "Small custom pieces, touch-ups, and consultations.",
    durationMinutes: 60,
    priceCents: 15000,
    depositRequired: true,
    depositAmountCents: 4500,
    maxDailyLimit: 4,
    bufferMinutes: 15,
    active: true,
    sortOrder: 0,
    extra: { styleTags: ["traditional", "blackwork"] },
  },
  {
    id: "svc-2",
    profileId: mockProfile.id,
    name: "2 Hour Session",
    description: "Medium-sized pieces and detailed linework.",
    durationMinutes: 120,
    priceCents: 28000,
    depositRequired: true,
    depositAmountCents: 8400,
    maxDailyLimit: 3,
    bufferMinutes: 15,
    active: true,
    sortOrder: 1,
    extra: { styleTags: ["realism"] },
  },
  {
    id: "svc-3",
    profileId: mockProfile.id,
    name: "Half-Day Session",
    description: "Large scale pieces, sleeves, and backpieces.",
    durationMinutes: 240,
    priceCents: 65000,
    depositRequired: true,
    depositAmountCents: 19500,
    maxDailyLimit: 1,
    bufferMinutes: 30,
    active: true,
    sortOrder: 2,
    extra: { styleTags: ["blackwork", "neo-trad"] },
  },
  {
    id: "svc-4",
    profileId: mockProfile.id,
    name: "Full-Day Session",
    description: "Full sleeves and multi-session project days.",
    durationMinutes: 480,
    priceCents: 120000,
    depositRequired: true,
    depositAmountCents: 36000,
    maxDailyLimit: 1,
    bufferMinutes: 30,
    active: false,
    sortOrder: 3,
    extra: { styleTags: ["realism", "watercolor"] },
  },
];

export const mockStaff: Staff[] = [
  { id: "staff-1", profileId: mockProfile.id, userId: null, name: "Ravi Singh", email: "ravi@inkiron.example", role: "staff", serviceIds: ["svc-1", "svc-2"], bookingCount: 4 },
  { id: "staff-2", profileId: mockProfile.id, userId: null, name: "Erin Walsh", email: "erin@inkiron.example", role: "staff", serviceIds: ["svc-1"], bookingCount: 2 },
];

export const mockClients: Client[] = [
  { id: "cl-1", profileId: mockProfile.id, name: "Maya Chen", email: "maya@example.com", phone: "+1 503 555 0101", notes: "Prefers afternoon slots. Sensitive skin — patch test first.", noShowCount: 0, createdAt: iso(-200, 0), totalSessions: 5, totalSpentCents: 96000, lastVisitAt: iso(-14, 14) },
  { id: "cl-2", profileId: mockProfile.id, name: "Jordan Lee", email: "jordan@example.com", phone: "+1 503 555 0102", notes: "Working on a full sleeve, 4 sessions planned.", noShowCount: 0, createdAt: iso(-180, 0), totalSessions: 3, totalSpentCents: 84000, lastVisitAt: iso(-30, 11) },
  { id: "cl-3", profileId: mockProfile.id, name: "Sam Okafor", email: "sam@example.com", phone: "+1 503 555 0103", notes: "", noShowCount: 1, createdAt: iso(-90, 0), totalSessions: 2, totalSpentCents: 43000, lastVisitAt: iso(-45, 16) },
  { id: "cl-4", profileId: mockProfile.id, name: "Priya Nair", email: "priya@example.com", phone: "+1 503 555 0104", notes: "First tattoo — talk through aftercare carefully.", noShowCount: 0, createdAt: iso(-10, 0), totalSessions: 1, totalSpentCents: 15000, lastVisitAt: iso(-5, 13) },
  { id: "cl-5", profileId: mockProfile.id, name: "Diego Fuentes", email: "diego@example.com", phone: "+1 503 555 0105", notes: "Regular client, books every 2 months.", noShowCount: 0, createdAt: iso(-300, 0), totalSessions: 8, totalSpentCents: 168000, lastVisitAt: iso(-7, 10) },
  { id: "cl-6", profileId: mockProfile.id, name: "Lena Voss", email: "lena@example.com", phone: "+1 503 555 0106", notes: "", noShowCount: 2, createdAt: iso(-60, 0), totalSessions: 1, totalSpentCents: 15000, lastVisitAt: iso(-50, 9) },
];

function client(id: string) {
  return mockClients.find((c) => c.id === id)!;
}
function service(id: string) {
  return mockServices.find((s) => s.id === id)!;
}

type BookingSeed = Omit<Booking, "clientName" | "serviceName">;

const bookingSeeds: BookingSeed[] = [
  // Today
  { id: "bk-1", profileId: mockProfile.id, serviceId: "svc-1", clientId: "cl-4", staffId: null, startAt: iso(0, 10), endAt: iso(0, 11), status: "confirmed", totalPriceCents: 15000, depositAmountCents: 4500, depositPaid: true, locationAddress: null, clientNotes: "First tattoo, a bit nervous!", proNotes: "", recurringGroupId: null, intakeResponses: [
    { fieldId: "f-1", label: "Reference photo", value: "rose-outline-ref.jpg" },
    { fieldId: "f-2", label: "Placement & size on body", value: "Inner forearm, about 4 inches" },
    { fieldId: "f-3", label: "Style preference", value: "Blackwork" },
    { fieldId: "f-4", label: "Allergies or medical notes", value: "None" },
    { fieldId: "f-5", label: "Aftercare waiver", value: true, signatureName: "Priya Nair" },
  ] },
  { id: "bk-2", profileId: mockProfile.id, serviceId: "svc-2", clientId: "cl-1", staffId: null, startAt: iso(0, 13), endAt: iso(0, 15), status: "confirmed", totalPriceCents: 28000, depositAmountCents: 8400, depositPaid: true, locationAddress: null, clientNotes: "Continuing forearm piece.", proNotes: "Bring stencil from last session.", recurringGroupId: null, intakeResponses: [
    { fieldId: "f-1", label: "Reference photo", value: "forearm-session2-ref.jpg" },
    { fieldId: "f-2", label: "Placement & size on body", value: "Forearm, continuing existing piece" },
    { fieldId: "f-3", label: "Style preference", value: "Realism" },
    { fieldId: "f-4", label: "Allergies or medical notes", value: "Mild lidocaine sensitivity" },
    { fieldId: "f-5", label: "Aftercare waiver", value: true, signatureName: "Maya Chen" },
  ] },
  { id: "bk-3", profileId: mockProfile.id, serviceId: "svc-1", clientId: "cl-6", staffId: null, startAt: iso(0, 16), endAt: iso(0, 17), status: "pending", totalPriceCents: 15000, depositAmountCents: 4500, depositPaid: false, locationAddress: null, clientNotes: "", proNotes: "Has no-show history — confirm by phone.", recurringGroupId: null },
  // Upcoming (next 7 days)
  { id: "bk-4", profileId: mockProfile.id, serviceId: "svc-3", clientId: "cl-2", staffId: null, startAt: iso(1, 11), endAt: iso(1, 15), status: "confirmed", totalPriceCents: 65000, depositAmountCents: 19500, depositPaid: true, locationAddress: null, clientNotes: "Sleeve session 3 of 4.", proNotes: "", recurringGroupId: null },
  { id: "bk-5", profileId: mockProfile.id, serviceId: "svc-1", clientId: "cl-3", staffId: null, startAt: iso(2, 14), endAt: iso(2, 15), status: "confirmed", totalPriceCents: 15000, depositAmountCents: 4500, depositPaid: true, locationAddress: null, clientNotes: "", proNotes: "", recurringGroupId: null },
  { id: "bk-6", profileId: mockProfile.id, serviceId: "svc-2", clientId: "cl-5", staffId: null, startAt: iso(4, 10), endAt: iso(4, 12), status: "confirmed", totalPriceCents: 28000, depositAmountCents: 8400, depositPaid: true, locationAddress: null, clientNotes: "", proNotes: "", recurringGroupId: null },
  { id: "bk-7", profileId: mockProfile.id, serviceId: "svc-1", clientId: "cl-1", staffId: null, startAt: iso(6, 13), endAt: iso(6, 14), status: "pending", totalPriceCents: 15000, depositAmountCents: 0, depositPaid: false, locationAddress: null, clientNotes: "Wants a consultation first.", proNotes: "", recurringGroupId: null },
  // Past
  { id: "bk-8", profileId: mockProfile.id, serviceId: "svc-2", clientId: "cl-5", staffId: null, startAt: iso(-7, 10), endAt: iso(-7, 12), status: "completed", totalPriceCents: 28000, depositAmountCents: 8400, depositPaid: true, locationAddress: null, clientNotes: "", proNotes: "Healed well, follow up in 8 weeks.", recurringGroupId: null },
  { id: "bk-9", profileId: mockProfile.id, serviceId: "svc-1", clientId: "cl-4", staffId: null, startAt: iso(-5, 13), endAt: iso(-5, 14), status: "completed", totalPriceCents: 15000, depositAmountCents: 4500, depositPaid: true, locationAddress: null, clientNotes: "", proNotes: "", recurringGroupId: null },
  { id: "bk-10", profileId: mockProfile.id, serviceId: "svc-1", clientId: "cl-6", staffId: null, startAt: iso(-50, 9), endAt: iso(-50, 10), status: "no_show", totalPriceCents: 15000, depositAmountCents: 4500, depositPaid: true, locationAddress: null, clientNotes: "", proNotes: "Kept deposit, sent follow-up.", recurringGroupId: null },
  { id: "bk-11", profileId: mockProfile.id, serviceId: "svc-1", clientId: "cl-3", staffId: null, startAt: iso(-45, 16), endAt: iso(-45, 17), status: "no_show", totalPriceCents: 15000, depositAmountCents: 4500, depositPaid: true, locationAddress: null, clientNotes: "", proNotes: "", recurringGroupId: null },
  { id: "bk-12", profileId: mockProfile.id, serviceId: "svc-3", clientId: "cl-2", staffId: null, startAt: iso(-30, 11), endAt: iso(-30, 15), status: "completed", totalPriceCents: 65000, depositAmountCents: 19500, depositPaid: true, locationAddress: null, clientNotes: "", proNotes: "Sleeve session 2 of 4.", recurringGroupId: null },
  { id: "bk-13", profileId: mockProfile.id, serviceId: "svc-1", clientId: "cl-1", staffId: null, startAt: iso(-14, 14), endAt: iso(-14, 15), status: "completed", totalPriceCents: 15000, depositAmountCents: 4500, depositPaid: true, locationAddress: null, clientNotes: "", proNotes: "", recurringGroupId: null },
  { id: "bk-14", profileId: mockProfile.id, serviceId: "svc-1", clientId: "cl-5", staffId: null, startAt: iso(-90, 10), endAt: iso(-90, 11), status: "cancelled", totalPriceCents: 15000, depositAmountCents: 0, depositPaid: false, locationAddress: null, clientNotes: "Rescheduled due to illness.", proNotes: "", recurringGroupId: null },
];

export const mockBookings: Booking[] = bookingSeeds.map((b) => ({
  ...b,
  clientName: client(b.clientId).name,
  serviceName: service(b.serviceId).name,
}));

export const mockAvailability: AvailabilityRule[] = [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
  id: `avail-${weekday}`,
  profileId: mockProfile.id,
  weekday,
  isOpen: weekday !== 0,
  startTime: "10:00",
  endTime: "18:00",
  breaks: weekday === 0 ? [] : [{ id: `brk-${weekday}`, startTime: "13:00", endTime: "14:00" }],
}));

export const mockDateOverrides: DateOverride[] = [
  {
    id: "ov-1",
    profileId: mockProfile.id,
    date: dateKey(15),
    isClosed: true,
    startTime: null,
    endTime: null,
    note: "Studio closed — annual inventory",
  },
  {
    id: "ov-2",
    profileId: mockProfile.id,
    date: dateKey(22),
    isClosed: false,
    startTime: "10:00",
    endTime: "13:00",
    note: "Half day — out for a conference",
  },
];

export const mockIntakeForm: IntakeForm = {
  id: "form-1",
  profileId: mockProfile.id,
  serviceId: null,
  name: "Intake form",
  fields: PROFESSIONS[mockProfile.profession].defaultIntakeFields.map((f, i) => ({
    id: `field-${i}`,
    formId: "form-1",
    label: f.label,
    fieldType: f.fieldType,
    options: f.options ?? [],
    required: f.required,
    sortOrder: i,
    isWaiver: f.isWaiver ?? false,
    requiresSignature: f.requiresSignature ?? false,
    waiverText: f.waiverText ?? null,
  })),
};

export const mockNotificationTemplates: NotificationTemplate[] = [
  { id: "nt-1", profileId: mockProfile.id, type: "reminder_48h", channel: "both", enabled: true, subject: "See you in 2 days, {client_first_name}", body: "Hi {client_name}, just confirming your {service} appointment on {date} at {time}. Deposit paid: {deposit_amount}. Need to reschedule? {booking_link}" },
  { id: "nt-2", profileId: mockProfile.id, type: "reminder_24h", channel: "both", enabled: true, subject: "See you tomorrow, {client_first_name} \u{1F44B}", body: "Hi {client_name}, this is a reminder for your {service} appointment tomorrow at {time}. Please arrive with clean, lotion-free skin. {booking_link}" },
  { id: "nt-3", profileId: mockProfile.id, type: "reminder_2h", channel: "sms", enabled: true, subject: "", body: "Reminder: your {service} appointment is in 2 hours at {time}. See you soon!" },
  { id: "nt-4", profileId: mockProfile.id, type: "no_show_followup", channel: "email", enabled: true, subject: "We missed you today, {client_first_name}", body: "We had a slot reserved for you at {time} today. If something came up, no worries — here's the link to rebook: {booking_link}" },
  { id: "nt-5", profileId: mockProfile.id, type: "booking_confirmation", channel: "both", enabled: true, subject: "You're booked with {pro_name} — {service} on {date}", body: "Your {service} appointment is confirmed for {date} at {time}. Deposit paid: {deposit_amount}. Need to reschedule? {booking_link}" },
  { id: "nt-6", profileId: mockProfile.id, type: "new_booking_alert", channel: "email", enabled: true, subject: "New booking: {client_name} — {service} on {date}", body: "{client_name} booked {service} on {date} at {time}. Deposit paid: {deposit_amount}." },
];

export const mockNotificationLog: NotificationLogEntry[] = [
  { id: "log-1", profileId: mockProfile.id, bookingId: "bk-4", clientId: "cl-2", clientName: "Jordan Lee", type: "reminder_48h", channel: "both", status: "delivered", errorMessage: null, sentAt: iso(-1, 11) },
  { id: "log-2", profileId: mockProfile.id, bookingId: "bk-1", clientId: "cl-4", clientName: "Priya Nair", type: "reminder_24h", channel: "email", status: "delivered", errorMessage: null, sentAt: iso(-1, 10) },
  { id: "log-3", profileId: mockProfile.id, bookingId: "bk-10", clientId: "cl-6", clientName: "Lena Voss", type: "no_show_followup", channel: "email", status: "failed", errorMessage: "Mailbox not found", sentAt: iso(-50, 9) },
  { id: "log-4", profileId: mockProfile.id, bookingId: "bk-2", clientId: "cl-1", clientName: "Maya Chen", type: "booking_confirmation", channel: "both", status: "sent", errorMessage: null, sentAt: iso(-3, 9) },
];

export function getTodayBookings(): Booking[] {
  return computeTodayBookings(mockBookings);
}

export function getUpcomingBookings(days = 7): Booking[] {
  return computeUpcomingBookings(mockBookings, days);
}

export function getRevenueByDay(days = 30) {
  return computeRevenueByDay(mockBookings, days);
}

export function getDashboardStats() {
  return computeDashboardStats(mockBookings, mockClients);
}
