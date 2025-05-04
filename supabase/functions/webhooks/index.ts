
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
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object;
        logEvent("Processing subscription event", { 
          subscription_id: subscription.id,
          status: subscription.status
        });
        
        // Get customer info
        const customer = await stripe.customers.retrieve(subscription.customer as string);
        if (!customer || customer.deleted) {
          throw new Error("Customer not found or deleted");
        }
        
        // Check for user metadata
        let userId = null;
        let userRole = null;
        
        // Try to get user ID from subscription metadata first
        if (subscription.metadata?.userId) {
          userId = subscription.metadata.userId;
          userRole = subscription.metadata.userRole;
        } 
        // Fall back to customer metadata
        else if (customer.metadata?.userId) {
          userId = customer.metadata.userId;
          userRole = customer.metadata.userRole;
        }
        
        if (!userId) {
          // Try to find user by email
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('id, role')
            .eq('email', customer.email)
            .single();
            
          if (userError || !userData) {
            throw new Error(`Unable to find user for customer: ${customer.email}`);
          }
          
          userId = userData.id;
          userRole = userData.role;
        }
        
        logEvent("Found user", { userId, userRole, email: customer.email });

        // Get product and pricing details
        const isActive = subscription.status === 'active' || subscription.status === 'trialing';
        let subscriptionTier = null;
        let subscriptionEnd = null;
        
        if (isActive && subscription.items.data.length > 0) {
          const priceId = subscription.items.data[0].price.id;
          const price = await stripe.prices.retrieve(priceId, {
            expand: ['product']
          });
          
          if (typeof price.product !== 'string') {
            subscriptionTier = price.product.name;
          }
          
          subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
        }
        
        // Update subscriber record in database
        const { error: upsertError } = await supabase
          .from('subscribers')
          .upsert({
            user_id: userId,
            email: customer.email as string,
            stripe_customer_id: customer.id,
            subscribed: isActive,
            subscription_tier: subscriptionTier,
            subscription_end: subscriptionEnd,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
        
        if (upsertError) {
          throw new Error(`Failed to update subscriber record: ${upsertError.message}`);
        }
        
        logEvent("Updated subscriber record", { 
          userId, 
          isActive, 
          subscriptionTier 
        });
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
