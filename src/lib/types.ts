export type Profession =
  | "tattoo_artist"
  | "dog_groomer"
  | "music_teacher"
  | "mobile_stylist"
  | "physiotherapist"
  | "personal_trainer";

export type SubscriptionPlan = "starter" | "pro" | "studio";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no_show";

export type NotificationChannel = "email" | "sms" | "both";

export type NotificationType =
  | "booking_confirmation"
  | "new_booking_alert"
  | "reminder_48h"
  | "reminder_24h"
  | "reminder_2h"
  | "no_show_followup"
  | "custom";

export type NotificationStatus = "sent" | "delivered" | "failed";

export type IntakeFieldType =
  | "short_text"
  | "long_text"
  | "dropdown"
  | "multi_select"
  | "date"
  | "file_upload"
  | "checkbox";

export interface Profile {
  id: string;
  username: string;
  profession: Profession;
  businessName: string;
  bio: string;
  photoUrl: string | null;
  location: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  accentColor: string;
  showSocialLinks: boolean;

  advanceBookingDays: number;
  minNoticeHours: number;
  bufferMinutes: number;

  depositDefaultPercent: number;
  cancellationPolicy: string;
  refundPolicy: string;

  stripeAccountId: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;

  proNotifyNewBooking: boolean;
  proNotifyCancellation: boolean;
  proNotifyPayment: boolean;

  onboardingStep: number;
  onboardingCompleted: boolean;

  createdAt: string;
}

export interface Staff {
  id: string;
  profileId: string;
  userId: string | null;
  name: string;
  email: string;
  role: "owner" | "staff";
  serviceIds: string[];
  bookingCount?: number;
}

export interface ServiceExtra {
  styleTags?: string[];
  breedSizeDurations?: Record<"S" | "M" | "L" | "XL", number>;
  recurringLessonDefault?: boolean;
  instrument?: string;
  addons?: { name: string; minutes: number; priceCents: number }[];
}

export interface Service {
  id: string;
  profileId: string;
  name: string;
  description: string;
  durationMinutes: number;
  priceCents: number;
  depositRequired: boolean;
  depositAmountCents: number;
  maxDailyLimit: number | null;
  bufferMinutes: number;
  active: boolean;
  sortOrder: number;
  extra: ServiceExtra;
}

export interface AvailabilityBreak {
  id: string;
  startTime: string;
  endTime: string;
}

export interface AvailabilityRule {
  id: string;
  profileId: string;
  weekday: number; // 0 = Sunday
  isOpen: boolean;
  startTime: string;
  endTime: string;
  breaks: AvailabilityBreak[];
}

export interface DateOverride {
  id: string;
  profileId: string;
  date: string;
  isClosed: boolean;
  startTime: string | null;
  endTime: string | null;
  note: string | null;
}

export interface Client {
  id: string;
  profileId: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string;
  noShowCount: number;
  createdAt: string;
  // derived/aggregated, computed from bookings
  totalSessions?: number;
  totalSpentCents?: number;
  lastVisitAt?: string | null;
}

export interface IntakeResponse {
  fieldId: string;
  label: string;
  value: string | string[] | boolean | null;
  signatureName?: string | null;
}

export interface Booking {
  id: string;
  profileId: string;
  serviceId: string;
  clientId: string;
  staffId: string | null;

  startAt: string;
  endAt: string;
  status: BookingStatus;

  totalPriceCents: number;
  depositAmountCents: number;
  depositPaid: boolean;

  locationAddress: string | null;
  clientNotes: string;
  proNotes: string;

  recurringGroupId: string | null;

  // joined for convenience in UI
  clientName?: string;
  serviceName?: string;
  intakeResponses?: IntakeResponse[];
}

export interface IntakeFormField {
  id: string;
  formId: string;
  label: string;
  fieldType: IntakeFieldType;
  options: string[];
  required: boolean;
  sortOrder: number;
  isWaiver: boolean;
  requiresSignature: boolean;
  waiverText: string | null;
}

export interface IntakeForm {
  id: string;
  profileId: string;
  serviceId: string | null;
  name: string;
  fields: IntakeFormField[];
}

export interface NotificationTemplate {
  id: string;
  profileId: string;
  type: NotificationType;
  channel: NotificationChannel;
  enabled: boolean;
  subject: string;
  body: string;
}

export interface NotificationLogEntry {
  id: string;
  profileId: string;
  bookingId: string | null;
  clientId: string | null;
  clientName?: string;
  type: NotificationType;
  channel: NotificationChannel;
  status: NotificationStatus;
  errorMessage: string | null;
  sentAt: string;
}
