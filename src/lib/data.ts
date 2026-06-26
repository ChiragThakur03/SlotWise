import { createClient, createAdminClient } from "@/lib/supabase/server";
import {
  computeClientStats,
  computeTodayBookings,
  computeUpcomingBookings,
  computeRevenueByDay,
  computeDashboardStats,
} from "@/lib/derive";
import type {
  Profile,
  Service,
  Client,
  Booking,
  AvailabilityRule,
  DateOverride,
  Staff,
  IntakeForm,
  NotificationTemplate,
  NotificationLogEntry,
} from "@/lib/types";

// ─── Mappers: DB snake_case → TS camelCase ──────────────────────────────────

function mapProfile(r: Record<string, any>): Profile {
  return {
    id: r.id,
    username: r.username,
    profession: r.profession,
    businessName: r.business_name,
    bio: r.bio,
    photoUrl: r.photo_url,
    location: r.location,
    contactEmail: r.contact_email,
    contactPhone: r.contact_phone,
    accentColor: r.accent_color,
    showSocialLinks: r.show_social_links,
    advanceBookingDays: r.advance_booking_days,
    minNoticeHours: r.min_notice_hours,
    bufferMinutes: r.buffer_minutes,
    depositDefaultPercent: r.deposit_default_percent,
    cancellationPolicy: r.cancellation_policy,
    refundPolicy: r.refund_policy,
    stripeAccountId: r.stripe_account_id,
    stripeCustomerId: r.stripe_customer_id,
    stripeSubscriptionId: r.stripe_subscription_id,
    subscriptionPlan: r.subscription_plan,
    subscriptionStatus: r.subscription_status,
    proNotifyNewBooking: r.pro_notify_new_booking,
    proNotifyCancellation: r.pro_notify_cancellation,
    proNotifyPayment: r.pro_notify_payment,
    onboardingStep: r.onboarding_step,
    onboardingCompleted: r.onboarding_completed,
    createdAt: r.created_at,
  };
}

function mapService(r: Record<string, any>): Service {
  return {
    id: r.id,
    profileId: r.profile_id,
    name: r.name,
    description: r.description,
    durationMinutes: r.duration_minutes,
    priceCents: r.price_cents,
    depositRequired: r.deposit_required,
    depositAmountCents: r.deposit_amount_cents,
    maxDailyLimit: r.max_daily_limit,
    bufferMinutes: r.buffer_minutes,
    active: r.active,
    sortOrder: r.sort_order,
    extra: r.extra ?? {},
  };
}

function mapClient(r: Record<string, any>): Client {
  return {
    id: r.id,
    profileId: r.profile_id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    notes: r.notes,
    noShowCount: r.no_show_count,
    createdAt: r.created_at,
  };
}

function mapBooking(r: Record<string, any>): Booking {
  return {
    id: r.id,
    profileId: r.profile_id,
    serviceId: r.service_id,
    clientId: r.client_id,
    staffId: r.staff_id,
    startAt: r.start_at,
    endAt: r.end_at,
    status: r.status,
    totalPriceCents: r.total_price_cents,
    depositAmountCents: r.deposit_amount_cents,
    depositPaid: r.deposit_paid,
    locationAddress: r.location_address,
    clientNotes: r.client_notes,
    proNotes: r.pro_notes,
    recurringGroupId: r.recurring_group_id,
    clientName: r.clients?.name,
    serviceName: r.services?.name,
  };
}

function mapAvailability(r: Record<string, any>): AvailabilityRule {
  return {
    id: r.id,
    profileId: r.profile_id,
    weekday: r.weekday,
    isOpen: r.is_open,
    startTime: r.start_time,
    endTime: r.end_time,
    breaks: (r.availability_breaks ?? []).map((b: any) => ({
      id: b.id,
      startTime: b.start_time,
      endTime: b.end_time,
    })),
  };
}

function mapDateOverride(r: Record<string, any>): DateOverride {
  return {
    id: r.id,
    profileId: r.profile_id,
    date: r.date,
    isClosed: r.is_closed,
    startTime: r.start_time,
    endTime: r.end_time,
    note: r.note,
  };
}

function mapIntakeForm(r: Record<string, any>): IntakeForm {
  return {
    id: r.id,
    profileId: r.profile_id,
    serviceId: r.service_id,
    name: r.name,
    fields: (r.intake_form_fields ?? [])
      .sort((a: any, b: any) => a.sort_order - b.sort_order)
      .map((f: any) => ({
        id: f.id,
        formId: f.form_id,
        label: f.label,
        fieldType: f.field_type,
        options: f.options ?? [],
        required: f.required,
        sortOrder: f.sort_order,
        isWaiver: f.is_waiver,
        requiresSignature: f.requires_signature,
        waiverText: f.waiver_text,
      })),
  };
}

// ─── Auth helper ─────────────────────────────────────────────────────────────

async function getAuthProfileId(): Promise<string | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return data ? mapProfile(data) : null;
}

export async function getProfileByUsername(username: string): Promise<Profile | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  return data ? mapProfile(data) : null;
}

// ─── Services ─────────────────────────────────────────────────────────────────

export async function getServices(): Promise<Service[]> {
  const profileId = await getAuthProfileId();
  if (!profileId) return [];

  const { data } = await createClient()
    .from("services")
    .select("*")
    .eq("profile_id", profileId)
    .order("sort_order");

  return (data ?? []).map(mapService);
}

export async function getServiceById(id: string): Promise<Service | null> {
  const { data } = await createClient()
    .from("services")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  return data ? mapService(data) : null;
}

// ─── Clients ──────────────────────────────────────────────────────────────────

export async function getClients(): Promise<Client[]> {
  const profileId = await getAuthProfileId();
  if (!profileId) return [];

  const supabase = createClient();
  const [{ data: clientRows }, { data: bookingRows }] = await Promise.all([
    supabase
      .from("clients")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false }),
    supabase
      .from("bookings")
      .select("client_id, status, total_price_cents, start_at")
      .eq("profile_id", profileId),
  ]);

  // Sparse booking objects — computeClientStats only needs these four fields
  const bookings = (bookingRows ?? []).map((r) => ({
    clientId: r.client_id,
    status: r.status,
    totalPriceCents: r.total_price_cents,
    startAt: r.start_at,
  })) as Booking[];

  return (clientRows ?? []).map((c) => ({
    ...mapClient(c),
    ...computeClientStats(c.id, bookings),
  }));
}

export async function getClientById(id: string): Promise<Client | null> {
  const supabase = createClient();
  const [{ data: clientRow }, { data: bookingRows }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).maybeSingle(),
    supabase
      .from("bookings")
      .select("client_id, status, total_price_cents, start_at")
      .eq("client_id", id),
  ]);

  if (!clientRow) return null;

  const bookings = (bookingRows ?? []).map((r) => ({
    clientId: r.client_id,
    status: r.status,
    totalPriceCents: r.total_price_cents,
    startAt: r.start_at,
  })) as Booking[];

  return { ...mapClient(clientRow), ...computeClientStats(id, bookings) };
}

export async function getClientBookings(clientId: string): Promise<Booking[]> {
  const { data } = await createClient()
    .from("bookings")
    .select("*, clients(name), services(name)")
    .eq("client_id", clientId)
    .order("start_at", { ascending: false });

  return (data ?? []).map(mapBooking);
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export async function getBookings(): Promise<Booking[]> {
  const profileId = await getAuthProfileId();
  if (!profileId) return [];

  const { data } = await createClient()
    .from("bookings")
    .select("*, clients(name), services(name)")
    .eq("profile_id", profileId)
    .order("start_at", { ascending: false });

  return (data ?? []).map(mapBooking);
}

export async function getBookingById(id: string): Promise<Booking | null> {
  const { data } = await createClient()
    .from("bookings")
    .select(
      `*, clients(name), services(name),
       intake_responses(field_id, value, signature_name,
         intake_form_fields(label))`
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) return null;

  const booking = mapBooking(data);
  if (data.intake_responses?.length) {
    booking.intakeResponses = data.intake_responses.map((r: any) => ({
      fieldId: r.field_id,
      label: r.intake_form_fields?.label ?? "",
      value: r.value,
      signatureName: r.signature_name,
    }));
  }

  return booking;
}

export async function getTodayBookings(): Promise<Booking[]> {
  return computeTodayBookings(await getBookings());
}

export async function getUpcomingBookings(days = 7): Promise<Booking[]> {
  return computeUpcomingBookings(await getBookings(), days);
}

export async function getRevenueByDay(days = 30) {
  return computeRevenueByDay(await getBookings(), days);
}

export async function getDashboardStats() {
  const [bookings, clients] = await Promise.all([getBookings(), getClients()]);
  return computeDashboardStats(bookings, clients);
}

// ─── Availability ─────────────────────────────────────────────────────────────

export async function getAvailability(): Promise<AvailabilityRule[]> {
  const profileId = await getAuthProfileId();
  if (!profileId) return [];

  const { data } = await createClient()
    .from("availability_rules")
    .select("*, availability_breaks(*)")
    .eq("profile_id", profileId)
    .order("weekday");

  return (data ?? []).map(mapAvailability);
}

export async function getDateOverrides(): Promise<DateOverride[]> {
  const profileId = await getAuthProfileId();
  if (!profileId) return [];

  const { data } = await createClient()
    .from("date_overrides")
    .select("*")
    .eq("profile_id", profileId)
    .order("date");

  return (data ?? []).map(mapDateOverride);
}

// ─── Staff ────────────────────────────────────────────────────────────────────

export async function getStaff(): Promise<Staff[]> {
  const profileId = await getAuthProfileId();
  if (!profileId) return [];

  const supabase = createClient();
  const [{ data: staffRows }, { data: bookingRows }] = await Promise.all([
    supabase
      .from("staff")
      .select("*, staff_services(service_id)")
      .eq("profile_id", profileId),
    supabase
      .from("bookings")
      .select("staff_id")
      .eq("profile_id", profileId)
      .not("staff_id", "is", null),
  ]);

  const countByStaff = (bookingRows ?? []).reduce<Record<string, number>>(
    (acc, b) => {
      if (b.staff_id) acc[b.staff_id] = (acc[b.staff_id] ?? 0) + 1;
      return acc;
    },
    {}
  );

  return (staffRows ?? []).map((r) => ({
    id: r.id,
    profileId: r.profile_id,
    userId: r.user_id,
    name: r.name,
    email: r.email,
    role: r.role,
    serviceIds: (r.staff_services ?? []).map((ss: any) => ss.service_id),
    bookingCount: countByStaff[r.id] ?? 0,
  }));
}

// ─── Notification templates & log ─────────────────────────────────────────────

export async function getNotificationTemplates(): Promise<NotificationTemplate[]> {
  const profileId = await getAuthProfileId();
  if (!profileId) return [];

  const { data } = await createClient()
    .from("notification_templates")
    .select("*")
    .eq("profile_id", profileId);

  return (data ?? []).map((r) => ({
    id: r.id,
    profileId: r.profile_id,
    type: r.type,
    channel: r.channel,
    enabled: r.enabled,
    subject: r.subject,
    body: r.body,
  }));
}

export async function getNotificationLog(): Promise<NotificationLogEntry[]> {
  const profileId = await getAuthProfileId();
  if (!profileId) return [];

  const { data } = await createClient()
    .from("notification_log")
    .select("*, clients(name)")
    .eq("profile_id", profileId)
    .order("sent_at", { ascending: false })
    .limit(100);

  return (data ?? []).map((r) => ({
    id: r.id,
    profileId: r.profile_id,
    bookingId: r.booking_id,
    clientId: r.client_id,
    clientName: r.clients?.name,
    type: r.type,
    channel: r.channel,
    status: r.status,
    errorMessage: r.error_message,
    sentAt: r.sent_at,
  }));
}

// ─── Intake forms ─────────────────────────────────────────────────────────────

export async function getIntakeForm(): Promise<IntakeForm> {
  const profileId = await getAuthProfileId();

  // Return an empty stub when there's no auth session or no form in the DB.
  // The form builder will render an empty state and let the user add fields.
  const empty: IntakeForm = {
    id: "",
    profileId: profileId ?? "",
    serviceId: null,
    name: "Intake form",
    fields: [],
  };

  if (!profileId) return empty;

  const supabase = createClient();

  // Prefer the general form (service_id IS NULL); fall back to the first
  // service-specific form if no general form exists yet.
  const { data: general } = await supabase
    .from("intake_forms")
    .select("*, intake_form_fields(*)")
    .eq("profile_id", profileId)
    .is("service_id", null)
    .order("created_at")
    .limit(1)
    .maybeSingle();

  if (general) return mapIntakeForm(general);

  const { data: any } = await supabase
    .from("intake_forms")
    .select("*, intake_form_fields(*)")
    .eq("profile_id", profileId)
    .order("created_at")
    .limit(1)
    .maybeSingle();

  return any ? mapIntakeForm(any) : empty;
}

// ─── Public booking page (no auth — admin client bypasses RLS) ───────────────

export async function getPublicBookingPageData(username: string) {
  const supabase = createAdminClient();

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (!profileRow) return null;
  const profile = mapProfile(profileRow);

  const today = new Date().toISOString().slice(0, 10);

  const [
    { data: serviceRows },
    { data: availabilityRows },
    { data: dateOverrideRows },
    { data: intakeFormRow },
    { data: bookingRows },
  ] = await Promise.all([
    supabase
      .from("services")
      .select("*")
      .eq("profile_id", profile.id)
      .eq("active", true)
      .order("sort_order"),
    supabase
      .from("availability_rules")
      .select("*, availability_breaks(*)")
      .eq("profile_id", profile.id)
      .order("weekday"),
    supabase
      .from("date_overrides")
      .select("*")
      .eq("profile_id", profile.id)
      .gte("date", today),
    supabase
      .from("intake_forms")
      .select("*, intake_form_fields(*)")
      .eq("profile_id", profile.id)
      .is("service_id", null)
      .limit(1)
      .maybeSingle(),
    // Only future bookings are needed for slot availability
    supabase
      .from("bookings")
      .select(
        "id, profile_id, service_id, client_id, staff_id, start_at, end_at, status, total_price_cents, deposit_amount_cents, deposit_paid, location_address, client_notes, pro_notes, recurring_group_id"
      )
      .eq("profile_id", profile.id)
      .gte("start_at", new Date().toISOString())
      .not("status", "in", '("cancelled")'),
  ]);

  return {
    profile,
    services: (serviceRows ?? []).map(mapService),
    availability: (availabilityRows ?? []).map(mapAvailability),
    dateOverrides: (dateOverrideRows ?? []).map(mapDateOverride),
    intakeForm: intakeFormRow ? mapIntakeForm(intakeFormRow) : null,
    bookings: (bookingRows ?? []).map((r) => mapBooking(r)),
  };
}
