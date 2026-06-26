import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getCurrentProfile } from "@/lib/data";

// Starts Stripe Connect Express onboarding for the signed-in pro so deposits
// can be paid out to their bank account. Requires STRIPE_SECRET_KEY.
export async function POST() {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe isn't configured yet — add STRIPE_SECRET_KEY to enable this." });
  }

  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    // A real implementation persists the new account id on `profiles.stripe_account_id`
    // via the admin Supabase client, reusing it on subsequent calls instead of
    // creating a new Connect account every time.
    const account = await stripe.accounts.create({
      type: "express",
      email: profile.contactEmail ?? undefined,
      business_type: "individual",
    });

    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${appUrl}/settings?stripe=refresh`,
      return_url: `${appUrl}/settings?stripe=success`,
      type: "account_onboarding",
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to start Stripe Connect onboarding." });
  }
}
