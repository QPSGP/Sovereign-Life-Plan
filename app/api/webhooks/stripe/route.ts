import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Stripe webhook: verify signature and update payments + subscription status.
// Set STRIPE_WEBHOOK_SECRET in Vercel to the webhook signing secret.

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2024-09-30.acacia",
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secret || !sig) {
    return NextResponse.json(
      { error: "Missing Stripe webhook secret or signature" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "invoice.paid":
      // TODO: find or create Invoice by metadata.invoiceId, create Payment (currency_type: fiat, payment_provider: stripe, provider_payment_id), update invoice status
      break;
    case "invoice.payment_failed":
      // TODO: mark subscription past_due or notify
      break;
    case "customer.subscription.deleted":
      // TODO: set Subscription.status = canceled, canceledAt = now
      break;
    default:
      // Unhandled event type
      break;
  }

  return NextResponse.json({ received: true });
}
