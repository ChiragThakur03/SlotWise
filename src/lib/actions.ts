"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import type {
  Profile,
  Service,
  Client,
  Booking,
  AvailabilityRule,
  DateOverride,
  Staff,
  IntakeFormField,
  NotificationTemplate,
  NotificationLogEntry,
  BookingStatus,
} from "@/lib/types";

// ─── Auth helper ─────────────────────────────────────────────────────────────

async function requireAuth() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, userId: user.id };
}

function isUUID(s: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export async function actionSaveProfile(patch: Partial<Profile>) {
  const { supabase, userId } = await requireAuth();

  const db: Record<string, unknown> = {};
  if (patch.username !== undefined) db.username = patch.username;
  if (patch.businessName !== undefined) db.business_name = patch.businessName;
  if (patch.bio !== undefined) db.bio = patch.bio;
  if (patch.photoUrl !== undefined) db.photo_url = patch.photoUrl;
  if (patch.location !== undefined) db.location = patch.location;
  if (patch.contactEmail !== undefined) db.contact_email = patch.contactEmail;
  if (patch.contactPhone !== undefined) db.contact_phone = patch.contactPhone;
  if (patch.accentColor !== undefined) db.accent_color = patch.accentColor;
  if (patch.showSocialLinks !== undefined) db.show_social_links = patch.showSocialLinks;
  if (patch.advanceBookingDays !== undefined) db.advance_booking_days = patch.advanceBookingDays;
  if (patch.minNoticeHours !== undefined) db.min_notice_hours = patch.minNoticeHours;
  if (patch.bufferMinutes !== undefined) db.buffer_minutes = patch.bufferMinutes;
  if (patch.depositDefaultPercent !== undefined) db.deposit_default_percent = patch.depositDefaultPercent;
  if (patch.cancellationPolicy !== undefined) db.cancellation_policy = patch.cancellationPolicy;
  if (patch.refundPolicy !== undefined) db.refund_policy = patch.refundPolicy;
  if (patch.stripeAccountId !== undefined) db.stripe_account_id = patch.stripeAccountId;
  if (patch.stripeCustomerId !== undefined) db.stripe_customer_id = patch.stripeCustomerId;
  if (patch.stripeSubscriptionId !== undefined) db.stripe_subscription_id = patch.stripeSubscriptionId;
  if (patch.subscriptionPlan !== undefined) db.subscription_plan = patch.subscriptionPlan;
  if (patch.subscriptionStatus !== undefined) db.subscription_status = patch.subscriptionStatus;
  if (patch.proNotifyNewBooking !== undefined) db.pro_notify_new_booking = patch.proNotifyNewBooking;
  if (patch.proNotifyCancellation !== undefined) db.pro_notify_cancellation = patch.proNotifyCancellation;
  if (patch.proNotifyPayment !== undefined) db.pro_notify_payment = patch.proNotifyPayment;
  if (patch.onboardingStep !== undefined) db.onboarding_step = patch.onboardingStep;
  if (patch.onboardingCompleted !== undefined) db.onboarding_completed = patch.onboardingCompleted;

  const { error } = await supabase.from("profiles").update(db).eq("id", userId);
  if (error) throw error;
  revalidatePath("/", "layout");
}

// ─── Services ─────────────────────────────────────────────────────────────────

export async function actionCreateService(
  data: Omit<Service, "id" | "profileId">
): Promise<Service> {
  const { supabase, userId } = await requireAuth();

  const { data: row, error } = await supabase
    .from("services")
    .insert({
      profile_id: userId,
      name: data.name,
      description: data.description,
      duration_minutes: data.durationMinutes,
      price_cents: data.priceCents,
      deposit_required: data.depositRequired,
      deposit_amount_cents: data.depositAmountCents,
      max_daily_limit: data.maxDailyLimit,
      buffer_minutes: data.bufferMinutes,
      active: data.active,
      sort_order: data.sortOrder,
      extra: data.extra,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: row.id,
    profileId: row.profile_id,
    name: row.name,
    description: row.description,
    durationMinutes: row.duration_minutes,
    priceCents: row.price_cents,
    depositRequired: row.deposit_required,
    depositAmountCents: row.deposit_amount_cents,
    maxDailyLimit: row.max_daily_limit,
    bufferMinutes: row.buffer_minutes,
    active: row.active,
    sortOrder: row.sort_order,
    extra: row.extra ?? {},
  };
}

export async function actionUpdateService(
  id: string,
  patch: Partial<Omit<Service, "id" | "profileId">>
) {
  const { supabase } = await requireAuth();

  const db: Record<string, unknown> = {};
  if (patch.name !== undefined) db.name = patch.name;
  if (patch.description !== undefined) db.description = patch.description;
  if (patch.durationMinutes !== undefined) db.duration_minutes = patch.durationMinutes;
  if (patch.priceCents !== undefined) db.price_cents = patch.priceCents;
  if (patch.depositRequired !== undefined) db.deposit_required = patch.depositRequired;
  if (patch.depositAmountCents !== undefined) db.deposit_amount_cents = patch.depositAmountCents;
  if (patch.maxDailyLimit !== undefined) db.max_daily_limit = patch.maxDailyLimit;
  if (patch.bufferMinutes !== undefined) db.buffer_minutes = patch.bufferMinutes;
  if (patch.active !== undefined) db.active = patch.active;
  if (patch.sortOrder !== undefined) db.sort_order = patch.sortOrder;
  if (patch.extra !== undefined) db.extra = patch.extra;

  const { error } = await supabase.from("services").update(db).eq("id", id);
  if (error) throw error;
}

// ─── Clients ──────────────────────────────────────────────────────────────────

export async function actionCreateClient(data: {
  name: string;
  email: string | null;
  phone: string | null;
  notes: string;
}): Promise<Client> {
  const { supabase, userId } = await requireAuth();

  const { data: row, error } = await supabase
    .from("clients")
    .insert({
      profile_id: userId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      notes: data.notes,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: row.id,
    profileId: row.profile_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    notes: row.notes,
    noShowCount: row.no_show_count,
    createdAt: row.created_at,
    totalSessions: 0,
    totalSpentCents: 0,
    lastVisitAt: null,
  };
}

export async function actionUpdateClient(id: string, patch: Partial<Client>) {
  const { supabase } = await requireAuth();

  const db: Record<string, unknown> = {};
  if (patch.name !== undefined) db.name = patch.name;
  if (patch.email !== undefined) db.email = patch.email;
  if (patch.phone !== undefined) db.phone = patch.phone;
  if (patch.notes !== undefined) db.notes = patch.notes;
  if (patch.noShowCount !== undefined) db.no_show_count = patch.noShowCount;

  const { error } = await supabase.from("clients").update(db).eq("id", id);
  if (error) throw error;
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export async function actionCreateBooking(
  data: Omit<Booking, "id" | "profileId" | "clientName" | "serviceName" | "intakeResponses">
): Promise<Booking> {
  const { supabase, userId } = await requireAuth();

  const { data: row, error } = await supabase
    .from("bookings")
    .insert({
      profile_id: userId,
      service_id: data.serviceId,
      client_id: data.clientId,
      staff_id: data.staffId,
      start_at: data.startAt,
      end_at: data.endAt,
      status: data.status,
      total_price_cents: data.totalPriceCents,
      deposit_amount_cents: data.depositAmountCents,
      deposit_paid: data.depositPaid,
      location_address: data.locationAddress,
      client_notes: data.clientNotes,
      pro_notes: data.proNotes,
      recurring_group_id: data.recurringGroupId,
    })
    .select("*, clients(name), services(name)")
    .single();

  if (error) throw error;

  return {
    id: row.id,
    profileId: row.profile_id,
    serviceId: row.service_id,
    clientId: row.client_id,
    staffId: row.staff_id,
    startAt: row.start_at,
    endAt: row.end_at,
    status: row.status,
    totalPriceCents: row.total_price_cents,
    depositAmountCents: row.deposit_amount_cents,
    depositPaid: row.deposit_paid,
    locationAddress: row.location_address,
    clientNotes: row.client_notes,
    proNotes: row.pro_notes,
    recurringGroupId: row.recurring_group_id,
    clientName: (row.clients as any)?.name,
    serviceName: (row.services as any)?.name,
  };
}

export async function actionUpdateBooking(id: string, patch: Partial<Booking>) {
  const { supabase } = await requireAuth();

  const db: Record<string, unknown> = {};
  if (patch.status !== undefined) db.status = patch.status;
  if (patch.startAt !== undefined) db.start_at = patch.startAt;
  if (patch.endAt !== undefined) db.end_at = patch.endAt;
  if (patch.proNotes !== undefined) db.pro_notes = patch.proNotes;
  if (patch.clientNotes !== undefined) db.client_notes = patch.clientNotes;
  if (patch.depositPaid !== undefined) db.deposit_paid = patch.depositPaid;
  if (patch.locationAddress !== undefined) db.location_address = patch.locationAddress;

  const { error } = await supabase.from("bookings").update(db).eq("id", id);
  if (error) throw error;
}

export async function actionSetBookingStatus(
  id: string,
  status: BookingStatus,
  clientId?: string
) {
  const { supabase } = await requireAuth();

  const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
  if (error) throw error;

  if (status === "no_show" && clientId) {
    const { data: c } = await supabase
      .from("clients")
      .select("no_show_count")
      .eq("id", clientId)
      .single();
    if (c) {
      await supabase
        .from("clients")
        .update({ no_show_count: c.no_show_count + 1 })
        .eq("id", clientId);
    }
  }
}

// ─── Availability ─────────────────────────────────────────────────────────────

export async function actionSaveAvailability(
  rules: AvailabilityRule[]
): Promise<AvailabilityRule[]> {
  const { supabase, userId } = await requireAuth();

  // Delete all existing rules for this profile (breaks cascade via FK)
  const { error: delError } = await supabase
    .from("availability_rules")
    .delete()
    .eq("profile_id", userId)
    .is("staff_id", null);
  if (delError) throw delError;

  const saved: AvailabilityRule[] = [];

  for (const rule of rules) {
    const { data: ruleRow, error: ruleErr } = await supabase
      .from("availability_rules")
      .insert({
        profile_id: userId,
        weekday: rule.weekday,
        is_open: rule.isOpen,
        start_time: rule.startTime,
        end_time: rule.endTime,
      })
      .select()
      .single();
    if (ruleErr) throw ruleErr;

    let savedBreaks: AvailabilityRule["breaks"] = [];
    if (rule.breaks.length > 0) {
      const { data: breakRows, error: breakErr } = await supabase
        .from("availability_breaks")
        .insert(
          rule.breaks.map((b) => ({
            availability_rule_id: ruleRow.id,
            start_time: b.startTime,
            end_time: b.endTime,
          }))
        )
        .select();
      if (breakErr) throw breakErr;
      savedBreaks = (breakRows ?? []).map((b: Record<string, string>) => ({
        id: b.id,
        startTime: b.start_time,
        endTime: b.end_time,
      }));
    }

    saved.push({
      id: ruleRow.id,
      profileId: ruleRow.profile_id,
      weekday: ruleRow.weekday,
      isOpen: ruleRow.is_open,
      startTime: ruleRow.start_time,
      endTime: ruleRow.end_time,
      breaks: savedBreaks,
    });
  }

  return saved;
}

export async function actionCreateDateOverride(
  data: Omit<DateOverride, "id" | "profileId">
): Promise<DateOverride> {
  const { supabase, userId } = await requireAuth();

  const { data: row, error } = await supabase
    .from("date_overrides")
    .insert({
      profile_id: userId,
      date: data.date,
      is_closed: data.isClosed,
      start_time: data.startTime,
      end_time: data.endTime,
      note: data.note,
    })
    .select()
    .single();
  if (error) throw error;

  return {
    id: row.id,
    profileId: row.profile_id,
    date: row.date,
    isClosed: row.is_closed,
    startTime: row.start_time,
    endTime: row.end_time,
    note: row.note,
  };
}

export async function actionDeleteDateOverride(id: string) {
  const { supabase } = await requireAuth();
  const { error } = await supabase.from("date_overrides").delete().eq("id", id);
  if (error) throw error;
}

// ─── Intake Forms ─────────────────────────────────────────────────────────────

export async function actionSaveIntakeFormFields(
  formId: string,
  fields: IntakeFormField[]
): Promise<{ formId: string; fields: IntakeFormField[] }> {
  const { supabase, userId } = await requireAuth();

  let realFormId = formId;

  // Create form if it doesn't exist yet (empty stub has id = "")
  if (!isUUID(formId)) {
    const { data: form, error } = await supabase
      .from("intake_forms")
      .insert({ profile_id: userId, name: "Intake form", service_id: null })
      .select()
      .single();
    if (error) throw error;
    realFormId = form.id;
  }

  // Replace all fields atomically
  await supabase.from("intake_form_fields").delete().eq("form_id", realFormId);

  if (fields.length === 0) return { formId: realFormId, fields: [] };

  const { data: rows, error } = await supabase
    .from("intake_form_fields")
    .insert(
      fields.map((f, i) => ({
        form_id: realFormId,
        label: f.label,
        field_type: f.fieldType,
        options: f.options,
        required: f.required,
        sort_order: i,
        is_waiver: f.isWaiver,
        requires_signature: f.requiresSignature,
        waiver_text: f.waiverText,
      }))
    )
    .select();
  if (error) throw error;

  return {
    formId: realFormId,
    fields: (rows ?? []).map((r: Record<string, any>) => ({
      id: r.id,
      formId: r.form_id,
      label: r.label,
      fieldType: r.field_type,
      options: r.options ?? [],
      required: r.required,
      sortOrder: r.sort_order,
      isWaiver: r.is_waiver,
      requiresSignature: r.requires_signature,
      waiverText: r.waiver_text,
    })),
  };
}

// ─── Staff ────────────────────────────────────────────────────────────────────

export async function actionCreateStaff(data: {
  name: string;
  email: string;
  serviceIds: string[];
}): Promise<Staff> {
  const { supabase, userId } = await requireAuth();

  const { data: row, error } = await supabase
    .from("staff")
    .insert({ profile_id: userId, name: data.name, email: data.email, role: "staff" })
    .select()
    .single();
  if (error) throw error;

  if (data.serviceIds.length > 0) {
    await supabase
      .from("staff_services")
      .insert(data.serviceIds.map((sId) => ({ staff_id: row.id, service_id: sId })));
  }

  return {
    id: row.id,
    profileId: row.profile_id,
    userId: null,
    name: row.name,
    email: row.email,
    role: "staff",
    serviceIds: data.serviceIds,
    bookingCount: 0,
  };
}

export async function actionDeleteStaff(id: string) {
  const { supabase } = await requireAuth();
  const { error } = await supabase.from("staff").delete().eq("id", id);
  if (error) throw error;
}

// ─── Notification Templates ───────────────────────────────────────────────────

export async function actionSaveNotificationTemplate(template: NotificationTemplate) {
  const { supabase, userId } = await requireAuth();

  const { error } = await supabase.from("notification_templates").upsert(
    {
      ...(isUUID(template.id) ? { id: template.id } : {}),
      profile_id: userId,
      type: template.type,
      channel: template.channel,
      enabled: template.enabled,
      subject: template.subject,
      body: template.body,
    },
    { onConflict: "profile_id,type" }
  );
  if (error) throw error;
}

// ─── Notification Log ─────────────────────────────────────────────────────────

export async function actionLogNotifications(
  entries: Array<Omit<NotificationLogEntry, "id" | "sentAt">>
) {
  const { supabase } = await requireAuth();

  const { error } = await supabase.from("notification_log").insert(
    entries.map((e) => ({
      profile_id: e.profileId,
      booking_id: e.bookingId,
      client_id: e.clientId,
      type: e.type,
      channel: e.channel,
      status: e.status,
      error_message: e.errorMessage,
    }))
  );
  if (error) throw error;
}

// ─── Public Booking (no auth — admin client) ──────────────────────────────────

export async function actionCreatePublicBooking(data: {
  username: string;
  serviceId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  startAt: string;
  endAt: string;
  totalPriceCents: number;
  depositAmountCents: number;
  depositPaid: boolean;
  clientNotes: string;
}): Promise<{ bookingId: string; clientId: string }> {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", data.username)
    .maybeSingle();
  if (!profile) throw new Error("Profile not found");

  // Re-use an existing client record with the same email, or create a new one
  let clientId: string;
  if (data.clientEmail) {
    const { data: existing } = await supabase
      .from("clients")
      .select("id")
      .eq("profile_id", profile.id)
      .eq("email", data.clientEmail)
      .maybeSingle();
    if (existing) {
      clientId = existing.id;
      // Update name/phone to whatever the client provided in this booking
      await supabase
        .from("clients")
        .update({ name: data.clientName, phone: data.clientPhone || null })
        .eq("id", clientId);
    } else {
      const { data: created, error } = await supabase
        .from("clients")
        .insert({
          profile_id: profile.id,
          name: data.clientName,
          email: data.clientEmail,
          phone: data.clientPhone || null,
          notes: "",
        })
        .select("id")
        .single();
      if (error) throw error;
      clientId = created.id;
    }
  } else {
    const { data: created, error } = await supabase
      .from("clients")
      .insert({
        profile_id: profile.id,
        name: data.clientName,
        email: null,
        phone: data.clientPhone || null,
        notes: "",
      })
      .select("id")
      .single();
    if (error) throw error;
    clientId = created.id;
  }

  const { data: booking, error } = await supabase
    .from("bookings")
    .insert({
      profile_id: profile.id,
      service_id: data.serviceId,
      client_id: clientId,
      start_at: data.startAt,
      end_at: data.endAt,
      status: data.depositPaid ? "confirmed" : "pending",
      total_price_cents: data.totalPriceCents,
      deposit_amount_cents: data.depositAmountCents,
      deposit_paid: data.depositPaid,
      client_notes: data.clientNotes,
      pro_notes: "",
    })
    .select("id")
    .single();
  if (error) throw error;

  return { bookingId: booking.id, clientId };
}

// Confirms a pending public booking after successful Stripe payment
export async function actionConfirmPublicBookingDeposit(bookingId: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("bookings")
    .update({ status: "confirmed", deposit_paid: true })
    .eq("id", bookingId);
  if (error) throw error;
}
