-- Fix: public_profiles view was using SECURITY DEFINER (default) behaviour,
-- meaning it ran as the view owner (postgres) and bypassed RLS on profiles.
-- Replace with SECURITY INVOKER + column-level grants so the calling role's
-- own privileges and RLS policies are enforced.

-- 1. Drop the existing view
drop view if exists public_profiles;

-- 2. Narrow anon's access on the profiles table to only booking-page-safe
--    columns. This means anon can never reach sensitive fields (stripe_*,
--    subscription_*, contact details) even via a direct REST query.
revoke select on profiles from anon;

grant select (
  id, username, profession, business_name, bio, photo_url, location,
  accent_color, show_social_links, advance_booking_days, min_notice_hours
) on profiles to anon;

-- 3. Allow anon to read any profile row (the column grant above already limits
--    what columns they can see; this policy controls which rows).
create policy "profiles_select_public" on profiles
  for select to anon
  using (true);

-- 4. Recreate the view with security_invoker so it executes as the calling
--    role, not the view owner. RLS and column grants are now enforced normally.
create view public_profiles with (security_invoker = true) as
  select
    id, username, profession, business_name, bio, photo_url, location,
    accent_color, show_social_links, advance_booking_days, min_notice_hours
  from profiles;

grant select on public_profiles to anon, authenticated;
