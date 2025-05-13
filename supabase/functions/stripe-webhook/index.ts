
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

// Helper function for logging
const logWebhook = (type: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE] ${type}${detailsStr}`);
};

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

serve(async (req) => {
  try {
    // 1. Validate the signature
    const sig = req.headers.get("stripe-signature");
    if (!sig) {
      throw new Error("No Stripe signature found in request headers");
    }

    const body = await req.text();
    
    // Validate the webhook signature using Stripe's SDK
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    
    // Log the event type
    logWebhook(event.type);

    // 2. Handle the events you care about
    switch (event.type) {
      case "checkout.session.completed":
        // Handle completed checkout
        const checkoutSession = event.data.object as Stripe.Checkout.Session;
        logWebhook("checkout.session.completed", { 
          sessionId: checkoutSession.id,
          customerId: checkoutSession.customer
        });
        // TODO: activate subscription / store customerId in database, etc.
        break;

      case "customer.subscription.created":
        // Handle new subscription
        const subscriptionCreated = event.data.object as Stripe.Subscription;
        logWebhook("customer.subscription.created", {
          subscriptionId: subscriptionCreated.id,
          customerId: subscriptionCreated.customer
        });
        break;
        
      case "customer.subscription.updated":
        // Handle subscription updates
        const subscriptionUpdated = event.data.object as Stripe.Subscription;
        logWebhook("customer.subscription.updated", {
          subscriptionId: subscriptionUpdated.id,
          status: subscriptionUpdated.status
        });
        break;

      case "invoice.payment_succeeded":
        // Handle successful payment
        const invoice = event.data.object as Stripe.Invoice;
        logWebhook("invoice.payment_succeeded", {
          invoiceId: invoice.id,
          customerId: invoice.customer
        });
        // TODO: update subscription status in DB
        break;

      case "customer.subscription.deleted":
        // Handle subscription cancellation
        const subscriptionDeleted = event.data.object as Stripe.Subscription;
        logWebhook("customer.subscription.deleted", {
          subscriptionId: subscriptionDeleted.id
        });
        // TODO: update subscription status in DB
        break;

      // Add more cases as needed
      default:
        logWebhook(`Unhandled event type: ${event.type}`);
    }
  } catch (e) {
    // Log the error but DO NOT return an error status to Stripe
    console.error("[STRIPE] Webhook error:", e.message);
    
    // Additional debug information
    if (e instanceof Error) {
      console.error("[STRIPE] Error details:", {
        name: e.name,
        message: e.message,
        stack: e.stack
      });
    }
  }

  // 3. Always acknowledge the event so Stripe stops retrying
  return new Response("OK", { status: 200 });
});
