-- SlotWise initial schema
-- Run via `supabase db push` or paste into the Supabase SQL editor.

create extension if not exists "pgcrypto";

-- ============================================================================
-- ENUMS
-- ============================================================================

create type profession as enum (
  'tattoo_artist',
  'dog_groomer',
  'music_teacher',
  'mobile_stylist',
  'physiotherapist',
  'personal_trainer'
);

create type subscription_plan as enum ('starter', 'pro', 'studio');
create type subscription_status as enum ('trialing', 'active', 'past_due', 'canceled');

create type booking_status as enum (
  'pending',
  'confirmed',
  'completed',
  'cancelled',
  'no_show'
);

create type notification_channel as enum ('email', 'sms', 'both');

create type notification_type as enum (
  'booking_confirmation',
  'new_booking_alert',
  'reminder_48h',
  'reminder_24h',
  'reminder_2h',
  'no_show_followup',
  'custom'
);

create type notification_status as enum ('sent', 'delivered', 'failed');

create type intake_field_type as enum (
  'short_text',
  'long_text',
  'dropdown',
  'multi_select',
  'date',
  'file_upload',
  'checkbox'
);

create type staff_role as enum ('owner', 'staff');

-- ============================================================================
-- PROFILES (one per pro / business owner — extends auth.users)
-- ============================================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  profession profession not null,
  business_name text not null default '',
  bio text not null default '',
  photo_url text,
  location text,
  contact_email text,
  contact_phone text,
  accent_color text not null default 'teal',
  show_social_links boolean not null default true,

  advance_booking_days int not null default 60,
  min_notice_hours int not null default 24,
  buffer_minutes int not null default 0,

  deposit_default_percent int not null default 30,
  cancellation_policy text not null default '',
  refund_policy text not null default '',

  stripe_account_id text,
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_plan subscription_plan not null default 'starter',
  subscription_status subscription_status not null default 'trialing',

  pro_notify_new_booking boolean not null default true,
  pro_notify_cancellation boolean not null default true,
  pro_notify_payment boolean not null default true,

  onboarding_step int not null default 0,
  onboarding_completed boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_username_idx on profiles (username);

-- ============================================================================
-- STAFF (Studio plan — team members under a business)
-- ============================================================================

create table staff (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  role staff_role not null default 'staff',
  invited_at timestamptz not null default now(),
  joined_at timestamptz,
  created_at timestamptz not null default now()
);

create index staff_profile_id_idx on staff (profile_id);

-- ============================================================================
-- SERVICES
-- ============================================================================

create table services (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  description text not null default '',
  duration_minutes int not null default 60,
  price_cents int not null default 0,
  deposit_required boolean not null default true,
  deposit_amount_cents int not null default 0,
  max_daily_limit int,
  buffer_minutes int not null default 0,
  active boolean not null default true,
  sort_order int not null default 0,
  -- vertical-specific extras: style_tags (tattoo), breed_size_durations (groomer),
  -- recurring_lesson (music), addons (mobile beauty), etc.
  extra jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index services_profile_id_idx on services (profile_id);

create table staff_services (
  staff_id uuid not null references staff(id) on delete cascade,
  service_id uuid not null references services(id) on delete cascade,
  primary key (staff_id, service_id)
);

-- ============================================================================
-- AVAILABILITY
-- ============================================================================

create table availability_rules (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  staff_id uuid references staff(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  is_open boolean not null default true,
  start_time time not null default '09:00',
  end_time time not null default '17:00',
  created_at timestamptz not null default now(),
  unique (profile_id, staff_id, weekday)
);

create table availability_breaks (
  id uuid primary key default gen_random_uuid(),
  availability_rule_id uuid not null references availability_rules(id) on delete cascade,
  start_time time not null,
  end_time time not null
);

create table date_overrides (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  staff_id uuid references staff(id) on delete cascade,
  date date not null,
  is_closed boolean not null default true,
  start_time time,
  end_time time,
  note text,
  created_at timestamptz not null default now()
);

create index date_overrides_profile_id_idx on date_overrides (profile_id, date);

-- ============================================================================
-- CLIENTS (CRM-lite)
-- ============================================================================

create table clients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  notes text not null default '',
  no_show_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index clients_profile_id_idx on clients (profile_id);
create unique index clients_profile_email_idx on clients (profile_id, email) where email is not null;

-- ============================================================================
-- BOOKINGS
-- ============================================================================

create table bookings (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  service_id uuid not null references services(id) on delete restrict,
  client_id uuid not null references clients(id) on delete restrict,
  staff_id uuid references staff(id) on delete set null,

  start_at timestamptz not null,
  end_at timestamptz not null,
  status booking_status not null default 'pending',

  total_price_cents int not null default 0,
  deposit_amount_cents int not null default 0,
  deposit_paid boolean not null default false,
  stripe_payment_intent_id text,

  location_address text,
  client_notes text not null default '',
  pro_notes text not null default '',

  recurring_group_id uuid,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bookings_profile_id_idx on bookings (profile_id, start_at);
create index bookings_client_id_idx on bookings (client_id);
create index bookings_status_idx on bookings (profile_id, status);

-- ============================================================================
-- INTAKE FORMS
-- ============================================================================

create table intake_forms (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  service_id uuid references services(id) on delete cascade,
  name text not null default 'Intake form',
  created_at timestamptz not null default now()
);

create table intake_form_fields (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references intake_forms(id) on delete cascade,
  label text not null,
  field_type intake_field_type not null,
  options jsonb not null default '[]'::jsonb,
  required boolean not null default false,
  sort_order int not null default 0,
  is_waiver boolean not null default false,
  requires_signature boolean not null default false,
  waiver_text text,
  created_at timestamptz not null default now()
);

create index intake_form_fields_form_id_idx on intake_form_fields (form_id, sort_order);

create table intake_responses (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  field_id uuid not null references intake_form_fields(id) on delete cascade,
  value jsonb,
  signature_name text,
  signed_at timestamptz,
  created_at timestamptz not null default now()
);

create index intake_responses_booking_id_idx on intake_responses (booking_id);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

create table notification_templates (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  type notification_type not null,
  channel notification_channel not null default 'email',
  enabled boolean not null default true,
  subject text not null default '',
  body text not null default '',
  created_at timestamptz not null default now(),
  unique (profile_id, type)
);

create table notification_log (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  booking_id uuid references bookings(id) on delete cascade,
  client_id uuid references clients(id) on delete set null,
  type notification_type not null,
  channel notification_channel not null,
  status notification_status not null,
  error_message text,
  sent_at timestamptz not null default now()
);

create index notification_log_profile_id_idx on notification_log (profile_id, sent_at desc);

-- ============================================================================
-- updated_at triggers
-- ============================================================================

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_set_updated_at before update on profiles
  for each row execute function set_updated_at();
create trigger services_set_updated_at before update on services
  for each row execute function set_updated_at();
create trigger clients_set_updated_at before update on clients
  for each row execute function set_updated_at();
create trigger bookings_set_updated_at before update on bookings
  for each row execute function set_updated_at();
