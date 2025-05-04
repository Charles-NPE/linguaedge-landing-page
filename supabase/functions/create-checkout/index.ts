
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");
    
    // Get the request body
    const { priceId } = await req.json();
    
    if (!priceId) {
      throw new Error("No price ID provided");
    }
    logStep("Received price ID", { priceId });

    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header provided");
    }
    logStep("Found authorization header");

    // Create a Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Get the user from the authorization header
    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError) {
      logStep("Authentication error", { error: userError.message });
      throw new Error(`Authentication error: ${userError.message}`);
    }
    
    const user = userData.user;
    if (!user?.email) {
      logStep("User not authenticated or email not available");
      throw new Error("User not authenticated or email not available");
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Retrieve the actual price ID from environment variables
    let actualPriceId: string | undefined;
    if (priceId === "STARTER_PRICE_ID") {
      actualPriceId = Deno.env.get("STARTER_PRICE_ID");
      logStep("Using STARTER_PRICE_ID from env", { actualPriceId });
    } else if (priceId === "ACADEMY_PRICE_ID") {
      actualPriceId = Deno.env.get("ACADEMY_PRICE_ID");
      logStep("Using ACADEMY_PRICE_ID from env", { actualPriceId });
    } else {
      actualPriceId = priceId; // Use the provided price ID directly
      logStep("Using direct price ID", { actualPriceId });
    }

    if (!actualPriceId) {
      logStep("Price ID not found in environment variables", { requestedPriceId: priceId });
      throw new Error(`Price ID '${priceId}' not found in environment variables`);
    }

    // Initialize Stripe
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      logStep("STRIPE_SECRET_KEY not set");
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    logStep("Stripe key verified");

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2023-10-16",
    });

    // Check if a Stripe customer record exists for this user
    logStep("Looking up Stripe customer for user", { email: user.email });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      logStep("No existing customer found, will create new");
    }

    // Create a checkout session
    try {
      logStep("Creating checkout session", { 
        customerId, 
        customerEmail: customerId ? undefined : user.email,
        priceId: actualPriceId
      });
      
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : user.email,
        line_items: [
          {
            price: actualPriceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${req.headers.get("origin")}/teacher?checkout=success`,
        cancel_url: `${req.headers.get("origin")}/pricing`,
        subscription_data: {
          trial_period_days: 30,
        },
      });
      
      logStep("Checkout session created", { sessionId: session.id, url: session.url });

      // Return the session URL
      return new Response(JSON.stringify({ url: session.url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    } catch (stripeError: any) {
      logStep("Stripe error creating checkout session", { 
        error: stripeError.message,
        type: stripeError.type,
        code: stripeError.code 
      });
      throw stripeError;
    }
  } catch (error: any) {
    const errorMessage = error.message || "Error creating checkout session";
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({ error: errorMessage }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
