/**
 * Demo seed — Iron & Ink Tattoo Studio
 *
 * Creates a demo account with 6 months of realistic bookings, clients,
 * services, availability, and notification logs.
 *
 * Usage:
 *   node --env-file=.env.local scripts/seed-demo.mjs
 *
 * Demo credentials: demo@slotwise.io / Demo1234!
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEMO_EMAIL = "demo@slotwise.io";
const DEMO_PASSWORD = "Demo1234!";

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── helpers ────────────────────────────────────────────────────────────────

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d;
}

function setHour(date, h, m = 0) {
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  return d;
}

// Returns a date in the past N±spread days, on a Tue–Sat
function pastBookingDate(daysBack, spreadDays = 3) {
  const base = daysAgo(daysBack + Math.floor(Math.random() * spreadDays));
  // push to nearest open day (Tue=2 … Sat=6)
  while (base.getDay() === 0 || base.getDay() === 1) base.setDate(base.getDate() + 1);
  return base;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function run() {
  console.log("🌱  Seeding demo account…");

  // ── 1. Auth user ────────────────────────────────────────────────────────
  // Delete existing demo user if present (idempotent re-run)
  const { data: existing } = await admin.auth.admin.listUsers();
  const existingUser = existing?.users?.find((u) => u.email === DEMO_EMAIL);
  if (existingUser) {
    await admin.auth.admin.deleteUser(existingUser.id);
    console.log("  Deleted existing demo user.");
  }

  const { data: newUser, error: userErr } = await admin.auth.admin.createUser({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
    email_confirm: true,
  });
  if (userErr) throw new Error("createUser: " + userErr.message);
  const userId = newUser.user.id;
  console.log("  ✓ Auth user created:", userId);

  // ── 2. Profile ──────────────────────────────────────────────────────────
  await admin.from("profiles").insert({
    id: userId,
    username: "ironandink",
    profession: "tattoo_artist",
    business_name: "Iron & Ink Tattoo",
    bio: "Custom tattoo studio in Austin, TX. Specialising in blackwork, fine line, and Japanese traditional. Walk-ins welcome on Saturdays.",
    location: "Austin, TX",
    contact_email: DEMO_EMAIL,
    contact_phone: "+1 512-555-0192",
    accent_color: "teal",
    advance_booking_days: 60,
    min_notice_hours: 24,
    buffer_minutes: 15,
    deposit_default_percent: 30,
    cancellation_policy: "Cancellations within 48 hours forfeit the deposit.",
    refund_policy: "Full refund if cancelled more than 48 hours before the appointment.",
    subscription_plan: "pro",
    subscription_status: "active",
    onboarding_step: 4,
    onboarding_completed: true,
  });
  console.log("  ✓ Profile");

  // ── 3. Services ─────────────────────────────────────────────────────────
  const servicesPayload = [
    {
      profile_id: userId,
      name: "Flash Tattoo",
      description: "Choose from our rotating flash sheet. Great for first-timers.",
      duration_minutes: 90,
      price_cents: 15000,
      deposit_required: true,
      deposit_amount_cents: 4500,
      buffer_minutes: 15,
      active: true,
      sort_order: 0,
      extra: { styleTags: ["blackwork", "flash", "traditional"] },
    },
    {
      profile_id: userId,
      name: "Small Custom Piece",
      description: "Up to 3-inch custom design — palm-size or smaller.",
      duration_minutes: 120,
      price_cents: 25000,
      deposit_required: true,
      deposit_amount_cents: 7500,
      buffer_minutes: 15,
      active: true,
      sort_order: 1,
      extra: { styleTags: ["custom", "fine-line", "blackwork"] },
    },
    {
      profile_id: userId,
      name: "Half-Day Session",
      description: "4-hour deep session for larger pieces, sleeves, or back work.",
      duration_minutes: 240,
      price_cents: 65000,
      deposit_required: true,
      deposit_amount_cents: 19500,
      buffer_minutes: 30,
      active: true,
      sort_order: 2,
      extra: { styleTags: ["japanese", "sleeve", "realism"] },
    },
    {
      profile_id: userId,
      name: "Touch-Up",
      description: "Free touch-up within 3 months of original tattoo. Paid after.",
      duration_minutes: 45,
      price_cents: 8000,
      deposit_required: false,
      deposit_amount_cents: 0,
      buffer_minutes: 10,
      active: true,
      sort_order: 3,
      extra: { styleTags: ["touch-up"] },
    },
    {
      profile_id: userId,
      name: "Design Consultation",
      description: "30-min session to finalise your custom design concept.",
      duration_minutes: 30,
      price_cents: 0,
      deposit_required: false,
      deposit_amount_cents: 0,
      buffer_minutes: 0,
      active: true,
      sort_order: 4,
      extra: {},
    },
  ];

  const { data: services, error: svcErr } = await admin
    .from("services")
    .insert(servicesPayload)
    .select("id, name, price_cents, duration_minutes");
  if (svcErr) throw new Error("services: " + svcErr.message);
  console.log("  ✓ Services:", services.map((s) => s.name).join(", "));

  const sFlash = services.find((s) => s.name === "Flash Tattoo");
  const sSmall = services.find((s) => s.name === "Small Custom Piece");
  const sHalfDay = services.find((s) => s.name === "Half-Day Session");
  const sTouchUp = services.find((s) => s.name === "Touch-Up");
  const sConsult = services.find((s) => s.name === "Design Consultation");

  // ── 4. Availability (Tue–Sat 10:00–19:00) ───────────────────────────────
  const availPayload = [0, 1, 2, 3, 4, 5, 6].map((day) => ({
    profile_id: userId,
    weekday: day,
    is_open: day >= 2 && day <= 6, // Tue(2)–Sat(6)
    start_time: "10:00",
    end_time: "19:00",
  }));
  await admin.from("availability_rules").insert(availPayload);
  console.log("  ✓ Availability (Tue–Sat 10:00–19:00)");

  // ── 5. Clients ──────────────────────────────────────────────────────────
  const clientsPayload = [
    { profile_id: userId, name: "Maya Torres",       email: "maya.torres@gmail.com",    phone: "+1 512-555-0101", notes: "Loves fine line florals. Sensitive skin — use lower voltage." },
    { profile_id: userId, name: "Liam Chen",         email: "liam.chen@outlook.com",    phone: "+1 512-555-0102", notes: "Japanese traditional fan. Building a full sleeve." },
    { profile_id: userId, name: "Priya Sharma",      email: "priya.sharma@yahoo.com",   phone: "+1 512-555-0103", notes: "First tattoo. Very nervous — go slow." },
    { profile_id: userId, name: "Jordan Blake",      email: "jblake@protonmail.com",    phone: "+1 512-555-0104", notes: "Blackwork geometric. Prefers afternoon slots." },
    { profile_id: userId, name: "Sofia Reyes",       email: "sofia.reyes@gmail.com",    phone: "+1 512-555-0105", notes: "Returning client. Touch-ups needed on left forearm piece." },
    { profile_id: userId, name: "Marcus Hill",       email: "marcus.hill@icloud.com",   phone: "+1 512-555-0106", notes: "Bold traditional. No fine line." },
    { profile_id: userId, name: "Aisha Patel",       email: "aisha.patel@gmail.com",    phone: "+1 512-555-0107", notes: "Minimalist style. Very detailed references." },
    { profile_id: userId, name: "Tyler Grant",       email: "tyler.grant@live.com",     phone: "+1 512-555-0108", notes: "Walk-in converted. Booked multiple flash pieces." },
    { profile_id: userId, name: "Nadia Okonkwo",     email: "nadia.ok@gmail.com",       phone: "+1 512-555-0109", notes: "Realism portrait. Needs extended session." },
    { profile_id: userId, name: "Ethan Walsh",       email: "ethan.walsh@gmail.com",    phone: "+1 512-555-0110", notes: "Late cancellation history — require deposit upfront." },
    { profile_id: userId, name: "Carmen Ruiz",       email: "carmen.ruiz@yahoo.com",    phone: "+1 512-555-0111", notes: "Neo-trad. Always on time." },
    { profile_id: userId, name: "Dev Kapoor",        email: "dev.kapoor@gmail.com",     phone: "+1 512-555-0112", notes: "Sleeve in progress — session 3 of 6." },
    { profile_id: userId, name: "Zoe Mitchell",      email: "zoe.m@gmail.com",          phone: "+1 512-555-0113", notes: "Ankle piece. Keloid-prone — check aftercare." },
    { profile_id: userId, name: "Ryan Nguyen",       email: "ryan.nguyen@gmail.com",    phone: "+1 512-555-0114", notes: "Chest panel — Japanese koi. Multiple sessions." },
    { profile_id: userId, name: "Isabel Ferreira",   email: "isabel.f@outlook.com",     phone: "+1 512-555-0115", notes: "Fine line botanical. References always on Pinterest." },
  ];

  const { data: clients, error: cliErr } = await admin
    .from("clients")
    .insert(clientsPayload)
    .select("id, name");
  if (cliErr) throw new Error("clients: " + cliErr.message);
  console.log("  ✓ Clients:", clients.length);

  // ── 6. Bookings ─────────────────────────────────────────────────────────
  // Today is roughly day 0.  We spread bookings over the past ~180 days
  // plus ~14 upcoming days to fill analytics charts and the calendar.

  const bookingsPayload = [];

  // Helper: push a booking row
  function book({ client, service, daysOffset, hour = 11, status, depositPaid = true, proNotes = "" }) {
    const start = setHour(daysOffset < 0 ? daysAgo(-daysOffset) : daysFromNow(daysOffset), hour);
    const end = new Date(start.getTime() + service.duration_minutes * 60 * 1000);
    // skip if it falls on Mon or Sun
    if (start.getDay() === 0 || start.getDay() === 1) start.setDate(start.getDate() + 2);
    bookingsPayload.push({
      profile_id: userId,
      service_id: service.id,
      client_id: client.id,
      start_at: start.toISOString(),
      end_at: end.toISOString(),
      status,
      total_price_cents: service.price_cents,
      deposit_amount_cents: Math.round(service.price_cents * 0.3),
      deposit_paid: depositPaid,
      pro_notes: proNotes,
    });
  }

  const [maya, liam, priya, jordan, sofia, marcus, aisha, tyler, nadia, ethan,
         carmen, dev, zoe, ryan, isabel] = clients;

  // ── Past 6 months (Jan–May + early June) — completed, some cancelled/no_show
  // January (~5)
  book({ client: liam,   service: sHalfDay, daysOffset: -170, hour: 10, status: "completed", proNotes: "Session 1 of sleeve — outer arm outline done." });
  book({ client: maya,   service: sFlash,   daysOffset: -165, hour: 13, status: "completed" });
  book({ client: jordan, service: sSmall,   daysOffset: -162, hour: 15, status: "completed" });
  book({ client: ethan,  service: sFlash,   daysOffset: -158, hour: 11, status: "cancelled", depositPaid: false });
  book({ client: carmen, service: sSmall,   daysOffset: -155, hour: 14, status: "completed" });

  // February (~7)
  book({ client: dev,    service: sHalfDay, daysOffset: -140, hour: 10, status: "completed", proNotes: "Sleeve session 2 — inner arm shading." });
  book({ client: nadia,  service: sHalfDay, daysOffset: -137, hour: 10, status: "completed", proNotes: "Portrait realism — outline and base tones." });
  book({ client: ryan,   service: sHalfDay, daysOffset: -133, hour: 10, status: "completed", proNotes: "Koi chest panel session 1." });
  book({ client: aisha,  service: sSmall,   daysOffset: -130, hour: 15, status: "completed" });
  book({ client: sofia,  service: sTouchUp, daysOffset: -128, hour: 16, status: "completed" });
  book({ client: tyler,  service: sFlash,   daysOffset: -125, hour: 12, status: "completed" });
  book({ client: priya,  service: sConsult, daysOffset: -122, hour: 14, status: "completed" });

  // March (~9)
  book({ client: liam,   service: sHalfDay, daysOffset: -112, hour: 10, status: "completed", proNotes: "Sleeve session 3 — colour fill started." });
  book({ client: marcus, service: sFlash,   daysOffset: -110, hour: 13, status: "completed" });
  book({ client: zoe,    service: sSmall,   daysOffset: -108, hour: 15, status: "completed", proNotes: "Ankle piece — slightly irritated, advised care." });
  book({ client: isabel, service: sSmall,   daysOffset: -105, hour: 11, status: "completed" });
  book({ client: dev,    service: sHalfDay, daysOffset: -102, hour: 10, status: "completed", proNotes: "Sleeve session 3 — background fill." });
  book({ client: ryan,   service: sHalfDay, daysOffset: -99,  hour: 10, status: "completed", proNotes: "Koi session 2 — colour." });
  book({ client: ethan,  service: sFlash,   daysOffset: -96,  hour: 14, status: "no_show",   depositPaid: true });
  book({ client: tyler,  service: sSmall,   daysOffset: -93,  hour: 12, status: "completed" });
  book({ client: aisha,  service: sConsult, daysOffset: -90,  hour: 15, status: "completed" });

  // April (~10)
  book({ client: priya,  service: sFlash,   daysOffset: -78, hour: 14, status: "completed", proNotes: "First tattoo — went great!" });
  book({ client: nadia,  service: sHalfDay, daysOffset: -75, hour: 10, status: "completed", proNotes: "Portrait — detail work on eyes." });
  book({ client: jordan, service: sHalfDay, daysOffset: -72, hour: 10, status: "completed" });
  book({ client: carmen, service: sFlash,   daysOffset: -70, hour: 13, status: "completed" });
  book({ client: maya,   service: sSmall,   daysOffset: -67, hour: 15, status: "completed" });
  book({ client: liam,   service: sHalfDay, daysOffset: -64, hour: 10, status: "completed", proNotes: "Sleeve session 4 — colour highlights." });
  book({ client: isabel, service: sSmall,   daysOffset: -61, hour: 11, status: "cancelled", depositPaid: true });
  book({ client: sofia,  service: sSmall,   daysOffset: -59, hour: 16, status: "completed" });
  book({ client: marcus, service: sSmall,   daysOffset: -56, hour: 13, status: "completed" });
  book({ client: ryan,   service: sHalfDay, daysOffset: -53, hour: 10, status: "completed", proNotes: "Koi session 3 — final detail." });

  // May (~12)
  book({ client: dev,    service: sHalfDay, daysOffset: -42, hour: 10, status: "completed", proNotes: "Sleeve session 5 — wrapping background." });
  book({ client: tyler,  service: sFlash,   daysOffset: -40, hour: 12, status: "completed" });
  book({ client: zoe,    service: sTouchUp, daysOffset: -38, hour: 15, status: "completed" });
  book({ client: aisha,  service: sSmall,   daysOffset: -36, hour: 14, status: "completed" });
  book({ client: carmen, service: sHalfDay, daysOffset: -33, hour: 10, status: "completed" });
  book({ client: nadia,  service: sHalfDay, daysOffset: -30, hour: 10, status: "completed", proNotes: "Portrait final session — done!" });
  book({ client: isabel, service: sSmall,   daysOffset: -28, hour: 11, status: "completed" });
  book({ client: priya,  service: sSmall,   daysOffset: -26, hour: 15, status: "completed" });
  book({ client: marcus, service: sFlash,   daysOffset: -24, hour: 14, status: "no_show",   depositPaid: true });
  book({ client: jordan, service: sSmall,   daysOffset: -22, hour: 13, status: "completed" });
  book({ client: maya,   service: sFlash,   daysOffset: -20, hour: 15, status: "completed" });
  book({ client: ryan,   service: sConsult, daysOffset: -18, hour: 14, status: "completed", proNotes: "Back piece consultation — approved design." });

  // June — past days this month (~8)
  book({ client: liam,   service: sHalfDay, daysOffset: -15, hour: 10, status: "completed", proNotes: "Sleeve session 6 — final!" });
  book({ client: tyler,  service: sSmall,   daysOffset: -13, hour: 12, status: "completed" });
  book({ client: carmen, service: sTouchUp, daysOffset: -11, hour: 16, status: "completed" });
  book({ client: sofia,  service: sFlash,   daysOffset: -9,  hour: 13, status: "completed" });
  book({ client: isabel, service: sHalfDay, daysOffset: -7,  hour: 10, status: "completed" });
  book({ client: aisha,  service: sSmall,   daysOffset: -5,  hour: 15, status: "completed" });
  book({ client: dev,    service: sConsult, daysOffset: -3,  hour: 11, status: "completed", proNotes: "New back piece design approved." });
  book({ client: zoe,    service: sFlash,   daysOffset: -2,  hour: 14, status: "completed" });

  // ── Upcoming confirmed & pending ─────────────────────────────────────────
  book({ client: ryan,   service: sHalfDay, daysOffset: 2,  hour: 10, status: "confirmed" });
  book({ client: priya,  service: sSmall,   daysOffset: 3,  hour: 14, status: "confirmed" });
  book({ client: marcus, service: sFlash,   daysOffset: 4,  hour: 13, status: "pending", depositPaid: false });
  book({ client: maya,   service: sSmall,   daysOffset: 5,  hour: 15, status: "confirmed" });
  book({ client: jordan, service: sHalfDay, daysOffset: 7,  hour: 10, status: "confirmed" });
  book({ client: ethan,  service: sFlash,   daysOffset: 8,  hour: 11, status: "pending",   depositPaid: false });
  book({ client: nadia,  service: sHalfDay, daysOffset: 10, hour: 10, status: "confirmed" });
  book({ client: tyler,  service: sFlash,   daysOffset: 12, hour: 13, status: "pending", depositPaid: false });
  book({ client: isabel, service: sSmall,   daysOffset: 14, hour: 11, status: "confirmed" });

  const { error: bkgErr } = await admin.from("bookings").insert(bookingsPayload);
  if (bkgErr) throw new Error("bookings: " + bkgErr.message);
  console.log("  ✓ Bookings:", bookingsPayload.length);

  // ── 7. Notification log ─────────────────────────────────────────────────
  // Fetch the completed bookings to attach log entries to them
  const { data: completedBookings } = await admin
    .from("bookings")
    .select("id, client_id")
    .eq("profile_id", userId)
    .in("status", ["completed", "confirmed"]);

  const notifRows = completedBookings.slice(0, 30).flatMap((b) => [
    {
      profile_id: userId,
      booking_id: b.id,
      client_id: b.client_id,
      type: "booking_confirmation",
      channel: "email",
      status: "delivered",
      sent_at: new Date(Date.now() - Math.random() * 7776000000).toISOString(),
    },
    {
      profile_id: userId,
      booking_id: b.id,
      client_id: b.client_id,
      type: "reminder_24h",
      channel: "email",
      status: Math.random() > 0.1 ? "delivered" : "failed",
      sent_at: new Date(Date.now() - Math.random() * 7776000000).toISOString(),
    },
  ]);

  await admin.from("notification_log").insert(notifRows);
  console.log("  ✓ Notification log:", notifRows.length, "entries");

  // ── 8. Intake form (general — service_id: null) ─────────────────────────────
  const { data: form, error: formErr } = await admin
    .from("intake_forms")
    .insert({ profile_id: userId, service_id: null, name: "New Client Intake" })
    .select("id")
    .single();
  if (formErr) throw new Error("intake_form: " + formErr.message);

  const base = { form_id: form.id, options: [], is_waiver: false, requires_signature: false, waiver_text: null };
  const { error: fieldsErr } = await admin.from("intake_form_fields").insert([
    { ...base, label: "Full legal name", field_type: "short_text", required: true, sort_order: 0 },
    { ...base, label: "Date of birth", field_type: "date", required: true, sort_order: 1 },
    { ...base, label: "Placement on body", field_type: "short_text", required: true, sort_order: 2 },
    { ...base, label: "Approximate size", field_type: "dropdown", required: true, sort_order: 3, options: ["Tiny (< 1in)", "Small (1-2in)", "Medium (2-4in)", "Large (4-6in)", "Extra large (6in+)"] },
    { ...base, label: "Style preference", field_type: "multi_select", required: false, sort_order: 4, options: ["Blackwork", "Fine line", "Traditional", "Neo-trad", "Realism", "Japanese", "Geometric", "Watercolour"] },
    { ...base, label: "Reference images or design description", field_type: "long_text", required: true, sort_order: 5 },
    { ...base, label: "Skin conditions, allergies or medical history relevant to tattooing", field_type: "long_text", required: false, sort_order: 6 },
    { ...base, label: "Have you been tattooed before?", field_type: "dropdown", required: true, sort_order: 7, options: ["Yes", "No"] },
    {
      form_id: form.id,
      label: "Aftercare & Liability Waiver",
      field_type: "checkbox",
      required: true,
      sort_order: 8,
      options: [],
      is_waiver: true,
      requires_signature: true,
      waiver_text: "I confirm that I am 18 years of age or older. I understand that tattooing involves needles penetrating the skin and carries inherent risks. I agree to follow all aftercare instructions provided by Iron & Ink Tattoo. I acknowledge that healing results vary by individual and that Iron & Ink is not responsible for complications arising from failure to follow aftercare guidelines or from pre-existing medical conditions. I release Iron & Ink Tattoo and its artists from any liability related to the tattooing procedure.",
    },
  ]);
  if (fieldsErr) throw new Error("intake_form_fields: " + fieldsErr.message);
  console.log("  ✓ Intake form + 9 fields");

  console.log("\n✅  Demo seed complete!");
  console.log("   Email:    demo@slotwise.io");
  console.log("   Password: Demo1234!");
  console.log("   Profile:  ironandink");
}

run().catch((err) => {
  console.error("\n❌  Seed failed:", err.message);
  process.exit(1);
});
