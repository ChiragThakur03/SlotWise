import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getProfileByUsername, getServiceById } from "@/lib/data";

// Creates a PaymentIntent for a client's deposit on the public booking page.
// The public page currently renders its own card form; once
// NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is set, swap that form for Stripe
// Elements and confirm the client secret returned here.
export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe isn't configured yet — add STRIPE_SECRET_KEY to enable real payments." });
  }

  const { username, serviceId, bookingDraftId } = await request.json();
  const profile = await getProfileByUsername(username);
  const service = await getServiceById(serviceId);
  if (!profile || !service) {
    return NextResponse.json({ error: "Service not found." }, { status: 404 });
  }
  if (!profile.stripeAccountId) {
    return NextResponse.json({ error: "This pro hasn't connected Stripe yet." }, { status: 400 });
  }

  try {
    const intent = await stripe.paymentIntents.create({
      amount: service.depositAmountCents,
      currency: "usd",
      metadata: { profileId: profile.id, serviceId: service.id, bookingDraftId: bookingDraftId ?? "" },
      transfer_data: { destination: profile.stripeAccountId },
    });

    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed to create payment intent." });
  }
}
