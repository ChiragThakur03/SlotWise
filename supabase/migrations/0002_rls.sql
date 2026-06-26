-- Row Level Security
-- Model: each `profiles` row is a pro/business. Owners can do anything to
-- their own data. The public booking page reads through anon key and needs
-- narrow read access to live, active data only. Client-submitted bookings
-- are inserted via a server action using the service role key, so there is
-- no anonymous INSERT policy on bookings/clients.

alter table profiles enable row level security;
alter table staff enable row level security;
alter table services enable row level security;
alter table staff_services enable row level security;
alter table availability_rules enable row level security;
alter table availability_breaks enable row level security;
alter table date_overrides enable row level security;
alter table clients enable row level security;
alter table bookings enable row level security;
alter table intake_forms enable row level security;
alter table intake_form_fields enable row level security;
alter table intake_responses enable row level security;
alter table notification_templates enable row level security;
alter table notification_log enable row level security;

-- profiles ------------------------------------------------------------------

create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

create policy "profiles_insert_own" on profiles
  for insert with check (auth.uid() = id);

-- No public SELECT policy on the base table — it holds Stripe IDs and
-- subscription data. The public booking page reads through the
-- `public_profiles` view below, which exposes only booking-page-safe columns.

create view public_profiles as
  select
    id, username, profession, business_name, bio, photo_url, location,
    accent_color, show_social_links, advance_booking_days, min_notice_hours
  from profiles;

grant select on public_profiles to anon, authenticated;

-- staff -----------------------------------------------------------------

create policy "staff_owner_all" on staff
  for all using (auth.uid() = profile_id);

-- services --------------------------------------------------------------

create policy "services_owner_all" on services
  for all using (auth.uid() = profile_id);

create policy "services_select_public_active" on services
  for select using (active = true);

-- staff_services ----------------------------------------------------------

create policy "staff_services_owner_all" on staff_services
  for all using (
    exists (select 1 from staff s where s.id = staff_id and s.profile_id = auth.uid())
  );

-- availability ------------------------------------------------------------

create policy "availability_rules_owner_all" on availability_rules
  for all using (auth.uid() = profile_id);

create policy "availability_rules_select_public" on availability_rules
  for select using (true);

create policy "availability_breaks_owner_all" on availability_breaks
  for all using (
    exists (
      select 1 from availability_rules r
      where r.id = availability_rule_id and r.profile_id = auth.uid()
    )
  );

create policy "availability_breaks_select_public" on availability_breaks
  for select using (true);

create policy "date_overrides_owner_all" on date_overrides
  for all using (auth.uid() = profile_id);

create policy "date_overrides_select_public" on date_overrides
  for select using (true);

-- clients -------------------------------------------------------------------

create policy "clients_owner_all" on clients
  for all using (auth.uid() = profile_id);

-- bookings --------------------------------------------------------------

create policy "bookings_owner_all" on bookings
  for all using (auth.uid() = profile_id);

-- No public policy: the public booking page reads slot availability and
-- inserts new bookings through server actions using the service-role
-- client, so anon never gets row-level access to booking/client data.

-- intake forms ------------------------------------------------------------

create policy "intake_forms_owner_all" on intake_forms
  for all using (auth.uid() = profile_id);

create policy "intake_forms_select_public" on intake_forms
  for select using (true);

create policy "intake_form_fields_owner_all" on intake_form_fields
  for all using (
    exists (select 1 from intake_forms f where f.id = form_id and f.profile_id = auth.uid())
  );

create policy "intake_form_fields_select_public" on intake_form_fields
  for select using (true);

create policy "intake_responses_owner_select" on intake_responses
  for select using (
    exists (select 1 from bookings b where b.id = booking_id and b.profile_id = auth.uid())
  );

-- notifications -------------------------------------------------------------

create policy "notification_templates_owner_all" on notification_templates
  for all using (auth.uid() = profile_id);

create policy "notification_log_owner_select" on notification_log
  for select using (auth.uid() = profile_id);
