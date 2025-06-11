
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

// === Sanity-check de secretos ================
const REQUIRED_SECRETS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY"
] as const;

REQUIRED_SECRETS.forEach((k) => {
  if (!Deno.env.get(k)) {
    console.error(`[STRIPE-WEBHOOK] ❌ Falta la variable ${k}`);
  }
});
// =============================================

// Price IDs from environment variables
const STARTER_PRICE_ID = "price_1RKzjAGULVEx6ff4xe51d6YT";
const ACADEMY_PRICE_ID = "price_1RKzrHGULVEx6ff4JmxatsFu";

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });

// Helper function for logging
const logWebhook = (type: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE] ${type}${detailsStr}`);
};

// Helper function to determine subscription tier from price_id
const getSubscriptionTier = (priceId: string): string => {
  const starterPriceId = Deno.env.get("STARTER_PRICE_ID") ?? STARTER_PRICE_ID;
  const academyPriceId = Deno.env.get("ACADEMY_PRICE_ID") ?? ACADEMY_PRICE_ID;
  
  logWebhook("Determining tier", { priceId, starterPriceId, academyPriceId });
  
  if (priceId === academyPriceId) {
    return 'academy';
  } else if (priceId === starterPriceId) {
    return 'starter';
  }
  
  // Default to starter for unknown price IDs
  return 'starter';
};

serve(async (req) => {
  try {
    // Get the signature from the header
    const sig = req.headers.get("stripe-signature");
    if (!sig) {
      logWebhook("No signature found");
      return new Response("OK", { status: 200 });
    }
    
    const body = await req.text();
    
    // Verify the signature - determine which secret to use
    let event: Stripe.Event;
    try {
      // First try to construct event to get livemode info
      const tempEvent = JSON.parse(body);
      const isLivemode = tempEvent?.livemode ?? true;
      
      const WH_SECRET = isLivemode
        ? Deno.env.get("STRIPE_WEBHOOK_SECRET")!
        : Deno.env.get("STRIPE_WEBHOOK_SECRET_TEST")!;
      
      logWebhook("Using webhook secret", { isLivemode, hasSecret: !!WH_SECRET });
      
      event = stripe.webhooks.constructEvent(body, sig, WH_SECRET);
    } catch (err) {
      console.error("[STRIPE] Firma inválida:", err.message);
      return new Response("OK", { status: 200 }); // Always return 200 to prevent retries
    }
    
    // Log the event type
    logWebhook(event.type);
    
    // Handle multiple subscription-related events
    const HANDLED_EVENTS = [
      "checkout.session.completed",
      "invoice.finalized",
      "invoice.payment_succeeded",
      "customer.subscription.created"
    ] as const;

    if (HANDLED_EVENTS.includes(event.type as any)) {
      // 1️⃣ obtener session o subscription según el tipo
      let subscriptionId: string | undefined;
      let metadata: Record<string,string> = {};

      switch (event.type) {
        case "checkout.session.completed":
          const session = event.data.object as Stripe.Checkout.Session;
          subscriptionId = session.subscription as string;
          metadata = session.metadata ?? {};
          break;

        case "invoice.finalized":
        case "invoice.payment_succeeded":
          const invoice = event.data.object as Stripe.Invoice;
          subscriptionId = invoice.subscription as string;
          // Try to get metadata from subscription if available
          if (subscriptionId) {
            try {
              const subscription = await stripe.subscriptions.retrieve(subscriptionId);
              metadata = subscription.metadata ?? {};
            } catch (error) {
              logWebhook("Error retrieving subscription for metadata", { error: error.message });
              metadata = {};
            }
          }
          break;

        case "customer.subscription.created":
          const sub = event.data.object as Stripe.Subscription;
          subscriptionId = sub.id;
          metadata = sub.metadata ?? {};
          break;
      }

      logWebhook(`${event.type} processed`, { 
        subscriptionId,
        metadata
      });

      // Only proceed if we have the user ID in metadata
      if (metadata.supabase_uid && subscriptionId) {
        // Create Supabase client
        const supabaseAdmin = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
          { auth: { persistSession: false } }
        );
        
        // 2️⃣ recuperar subscriptionTier y customer info
        let subscriptionTier = 'starter';
        let customerId: string | null = null;
        let stripeStatus = 'active';
        
        try {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          customerId = subscription.customer as string;
          stripeStatus = subscription.status;
          
          if (subscription.items.data.length > 0) {
            const priceId = subscription.items.data[0].price.id;
            subscriptionTier = getSubscriptionTier(priceId);
            logWebhook("Subscription tier determined", { priceId, subscriptionTier });
          }
        } catch (error) {
          logWebhook("Error retrieving subscription details", { error: error.message });
        }
        
        // 3️⃣ Update profile with subscription info
        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({ 
            stripe_customer_id: customerId,
            stripe_status: stripeStatus,
            subscription_tier: subscriptionTier
          })
          .eq("id", metadata.supabase_uid);
          
        if (updateError) {
          console.error("[STRIPE] Error updating profile:", updateError);
        } else {
          logWebhook("Profile updated successfully", { 
            userId: metadata.supabase_uid,
            subscriptionTier,
            stripeStatus
          });

          // ⚡ Enhanced logging - verify database state after update
          try {
            const { data: profileData, error: profileError } = await supabaseAdmin
              .from("profiles")
              .select("subscription_tier, student_limit, stripe_status")
              .eq("id", metadata.supabase_uid)
              .single();
            
            if (profileError) {
              logWebhook("❌ Error fetching profile after update", { error: profileError.message });
            } else {
              logWebhook("⚡ DB row after update", {
                subscription_tier: profileData.subscription_tier,
                student_limit: profileData.student_limit,
                stripe_status: profileData.stripe_status
              });
            }
          } catch (verifyError) {
            logWebhook("❌ Verification query failed", { error: verifyError.message });
          }
        }
        
        // Send welcome email via Resend if API key is available and it's a checkout completion
        if (event.type === "checkout.session.completed") {
          const resendKey = Deno.env.get("RESEND_API_KEY");
          const session = event.data.object as Stripe.Checkout.Session;
          if (resendKey && session.customer_details?.email) {
            try {
              const resend = new Resend(resendKey);
              await resend.emails.send({
                from: "no-reply@linguaedge.ai",
                to: session.customer_details.email,
                subject: "Your LinguaEdge Subscription is Active",
                html: `
                  <h1>Welcome to LinguaEdge!</h1>
                  <p>Thank you for subscribing to our ${subscriptionTier} plan. Your account is now active and you have full access to all premium features.</p>
                  <p>If you have any questions, please don't hesitate to contact our support team.</p>
                  <p>Best regards,<br>The LinguaEdge Team</p>
                `
              });
              console.log("[RESEND] Welcome email sent successfully");
            } catch (emailError) {
              console.error("[RESEND] Error sending welcome email:", emailError);
            }
          }
        }
      } else {
        console.warn("[STRIPE] Metadata sin supabase_uid o subscriptionId faltante", { 
          hasUid: !!metadata.supabase_uid,
          hasSubscriptionId: !!subscriptionId 
        });
      }
    }
    
    // For all other event types, just acknowledge receipt
    
  } catch (e) {
    console.error("[STRIPE] Webhook error:", e);
  }

  // Always return 200 OK to Stripe to avoid retries
  return new Response("OK", { status: 200 });
});
