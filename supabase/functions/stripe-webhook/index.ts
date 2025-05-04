
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.7.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logEvent = (event: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[WEBHOOK] ${event}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the signature and payload
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response("Missing Stripe signature", { status: 400 });
    }

    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      throw new Error("Missing Stripe webhook secret");
    }

    const body = await req.text();
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });

    // Verify event
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      logEvent("Webhook signature verification failed", { error: errorMessage });
      return new Response(`Webhook signature verification failed: ${errorMessage}`, { status: 400 });
    }

    logEvent("Received event", { type: event.type });

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        logEvent("Processing checkout session completed", { 
          session_id: session.id,
          customer: session.customer
        });
        
        // Process the checkout session
        if (session.subscription) {
          await processSubscriptionUpdate(session.customer as string, session.subscription as string, stripe, supabase);
        }
        break;
        
      case 'invoice.payment_succeeded':
        const successInvoice = event.data.object;
        logEvent("Processing successful payment", { 
          invoice_id: successInvoice.id,
          subscription: successInvoice.subscription
        });
        
        if (successInvoice.subscription) {
          await processSubscriptionUpdate(successInvoice.customer as string, successInvoice.subscription as string, stripe, supabase);
        }
        break;
        
      case 'invoice.payment_failed':
        const failedInvoice = event.data.object;
        logEvent("Processing failed payment", { 
          invoice_id: failedInvoice.id, 
          subscription: failedInvoice.subscription 
        });
        
        if (failedInvoice.subscription) {
          await processSubscriptionUpdate(failedInvoice.customer as string, failedInvoice.subscription as string, stripe, supabase);
        }
        break;
        
      case 'customer.subscription.deleted':
      case 'customer.subscription.updated':
        const subscription = event.data.object;
        logEvent("Processing subscription change", { 
          subscription_id: subscription.id,
          status: subscription.status
        });
        
        await processSubscriptionUpdate(subscription.customer as string, subscription.id, stripe, supabase);
        break;
        
      default:
        logEvent("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[WEBHOOK] Error: ${errorMessage}`);
    
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// Helper function to process subscription changes
async function processSubscriptionUpdate(
  stripeCustomerId: string, 
  subscriptionId: string, 
  stripe: Stripe,
  supabase: any
) {
  try {
    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Get product info to determine plan name
    let stripePlan = "unknown";
    if (subscription.items.data.length > 0) {
      const priceId = subscription.items.data[0].price.id;
      const price = await stripe.prices.retrieve(priceId, {
        expand: ['product']
      });
      
      if (typeof price.product !== 'string') {
        stripePlan = price.product.name.toLowerCase();
      }
    }
    
    // Get user by customer ID from profiles table
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('stripe_customer_id', stripeCustomerId);
      
    if (profileError) {
      throw new Error(`Error fetching profiles: ${profileError.message}`);
    }
    
    if (profiles.length === 0) {
      // Try to get customer by email
      const customer = await stripe.customers.retrieve(stripeCustomerId);
      if (!customer || customer.deleted) {
        throw new Error("Customer not found or deleted");
      }
      
      // Find user by email
      const { data: userProfiles, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', customer.email);
        
      if (userError) {
        throw new Error(`Error fetching user profiles: ${userError.message}`);
      }
      
      if (userProfiles.length === 0) {
        throw new Error(`No user found for customer: ${stripeCustomerId}`);
      }
      
      // Update the user's stripe_customer_id
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', userProfiles[0].id);
        
      // Continue with the first user found
      profiles[0] = userProfiles[0];
    }
    
    // Update the profile with subscription info
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        stripe_subscription_id: subscription.id,
        stripe_plan: stripePlan,
        stripe_status: subscription.status
      })
      .eq('stripe_customer_id', stripeCustomerId);
      
    if (updateError) {
      throw new Error(`Error updating profile: ${updateError.message}`);
    }
    
    logEvent("Updated profile subscription status", {
      customer_id: stripeCustomerId,
      subscription_id: subscription.id,
      status: subscription.status,
      plan: stripePlan
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logEvent("Error processing subscription update", { error: errorMessage });
    throw error;
  }
}
