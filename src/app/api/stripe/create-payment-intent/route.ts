import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe isn't configured — add STRIPE_SECRET_KEY." }, { status: 500 });
  }

  const { amountCents, description, bookingId } = await request.json();
  if (!amountCents || amountCents < 50) {
    return NextResponse.json({ error: "Invalid amount." }, { status: 400 });
  }

  try {
    const intent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      description,
      automatic_payment_methods: { enabled: true },
      metadata: { bookingId: bookingId ?? "" },
    });
    return NextResponse.json({ clientSecret: intent.client_secret });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create payment." },
      { status: 500 }
    );
  }
}
