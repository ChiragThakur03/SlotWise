import { NextResponse } from "next/server";
import { getStripe, PLAN_PRICE_ENV } from "@/lib/stripe";
import { getCurrentProfile } from "@/lib/data";

// Creates a Stripe Checkout session to upgrade/downgrade the pro's subscription
// plan. Requires STRIPE_SECRET_KEY and STRIPE_PRICE_* price IDs.
export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe isn't configured yet — add STRIPE_SECRET_KEY to enable this." });
  }

  const { plan } = await request.json();
  const priceId = PLAN_PRICE_ENV[plan];
  if (!priceId) {
    return NextResponse.json({ error: `No Stripe price configured for the ${plan} plan.` });
  }

  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Not authenticated." }, { status: 401 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer: profile.stripeCustomerId ?? undefined,
      customer_email: profile.stripeCustomerId ? undefined : profile.contactEmail ?? undefined,
      success_url: `${appUrl}/settings?billing=success`,
      cancel_url: `${appUrl}/settings?billing=cancelled`,
      metadata: { profileId: profile.id, plan },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to start checkout." });
  }
}
