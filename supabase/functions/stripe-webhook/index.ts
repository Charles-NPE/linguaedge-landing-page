
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "npm:resend@2.0.0";

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
const WH_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

// Helper function for logging
const logWebhook = (type: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE] ${type}${detailsStr}`);
};

// Helper function to determine subscription tier from price_id
const getSubscriptionTier = (priceId: string): string => {
  const STARTER_PRICE_ID = "price_1RKzjAGULVEx6ff4xe51d6YT";
  const ACADEMY_PRICE_ID = "price_1RKzrHGULVEx6ff4JmxatsFu";
  
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
      return new Response(JSON.stringify({ error: "No signature found" }), { status: 400 });
    }
    
    const body = await req.text();
    
    // Verify the signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, WH_SECRET);
    } catch (err) {
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
    }
    
    // Log the event type
    logWebhook(event.type);
    
    // Handle the checkout.session.completed event specifically
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string;
      const metadata = session.metadata || {}; // Contains supabase_uid sent from Checkout
      
      logWebhook("checkout.session.completed", { 
        sessionId: session.id,
        customerId,
        metadata
      });
      
      // Only proceed if we have the user ID in metadata
      if (metadata.supabase_uid) {
        // Create Supabase client
        const supabaseAdmin = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
          { auth: { persistSession: false } }
        );
        
        // Get subscription details to determine tier
        let subscriptionTier = 'starter';
        
        if (session.subscription) {
          try {
            const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
            if (subscription.items.data.length > 0) {
              const priceId = subscription.items.data[0].price.id;
              subscriptionTier = getSubscriptionTier(priceId);
              logWebhook("Subscription tier determined", { priceId, subscriptionTier });
            }
          } catch (error) {
            logWebhook("Error retrieving subscription details", { error: error.message });
          }
        }
        
        // 1) Store Stripe customer id, subscription status, tier, and student limit in profiles
        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({ 
            stripe_customer_id: customerId, 
            stripe_status: 'active',
            subscription_tier: subscriptionTier,
            student_limit: subscriptionTier === 'academy' ? 60 : 20
          })
          .eq("id", metadata.supabase_uid);
          
        if (updateError) {
          console.error("[STRIPE] Error updating profile:", updateError);
        } else {
          logWebhook("Profile updated successfully", { 
            userId: metadata.supabase_uid,
            subscriptionTier,
            studentLimit: subscriptionTier === 'academy' ? 60 : 20
          });
        }
        
        // 2) Send welcome email via Resend if API key is available
        const resendKey = Deno.env.get("RESEND_API_KEY");
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
      } else {
        console.warn("[STRIPE] Missing supabase_uid in session metadata");
      }
    }
    
    // For all other event types, just acknowledge receipt
    
  } catch (e) {
    console.error("[STRIPE] Webhook error:", e);
  }

  // Always return 200 OK to Stripe to avoid retries
  return new Response("OK", { status: 200 });
});
