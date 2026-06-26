import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/server";

// Stripe calls this for Connect account updates, subscription lifecycle
// events, and deposit payment confirmations. Configure the endpoint URL and
// STRIPE_WEBHOOK_SECRET in the Stripe dashboard once a project is deployed.
export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !webhookSecret) {
    return NextResponse.json({ error: "Stripe webhook isn't configured." }, { status: 400 });
  }

  const signature = request.headers.get("stripe-signature");
  const body = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as { metadata?: Record<string, string>; customer?: string; subscription?: string };
      const profileId = session.metadata?.profileId;
      const plan = session.metadata?.plan;
      if (profileId && plan) {
        await supabase
          .from("profiles")
          .update({
            subscription_plan: plan,
            subscription_status: "active",
            stripe_customer_id: session.customer ?? null,
            stripe_subscription_id: session.subscription ?? null,
          })
          .eq("id", profileId);
      }
      break;
    }
    case "account.updated": {
      const account = event.data.object as { id: string; charges_enabled: boolean };
      if (account.charges_enabled) {
        await supabase.from("profiles").update({ stripe_account_id: account.id }).eq("stripe_account_id", account.id);
      }
      break;
    }
    case "payment_intent.succeeded": {
      const intent = event.data.object as { metadata?: Record<string, string> };
      const bookingId = intent.metadata?.bookingId;
      if (bookingId) {
        await supabase.from("bookings").update({ deposit_paid: true }).eq("id", bookingId);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as { id: string };
      await supabase
        .from("profiles")
        .update({ subscription_status: "canceled" })
        .eq("stripe_subscription_id", subscription.id);
      break;
    }
  }

  return NextResponse.json({ received: true });
}
