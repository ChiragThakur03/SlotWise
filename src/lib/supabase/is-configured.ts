// True once NEXT_PUBLIC_SUPABASE_URL points at a real project. Auth screens
// and middleware both fall back to a demo mode (no real account, straight
// into the dashboard's seeded data) until then.
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url || url.includes("placeholder") || url.includes("dvvkhykkevftzfiemslb")) {
    return false;
  }
  return true;
}
