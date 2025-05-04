
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for enhanced debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Use the service role key to perform writes (upsert) in Supabase
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Get the user profile to check if they're a teacher
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (profileError) throw new Error(`Profile error: ${profileError.message}`);
    if (profileData.role !== 'teacher') {
      // Not a teacher, no need to check subscription
      logStep("User is not a teacher, skipping subscription check", { role: profileData.role });
      return new Response(JSON.stringify({ 
        subscribed: false, 
        stripe_status: null,
        subscription_end: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    logStep("User is a teacher, checking subscription status");
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (customers.data.length === 0) {
      logStep("No customer found, updating unsubscribed state");
      await supabaseClient.from("profiles").update({
        stripe_customer_id: null,
        stripe_status: null,
        subscription_end: null,
        updated_at: new Date().toISOString(),
      }).eq('id', user.id);
      
      return new Response(JSON.stringify({ 
        subscribed: false, 
        stripe_status: null,
        subscription_end: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',  // Get all subscriptions including active, trialing, etc.
      limit: 1,
      expand: ['data.latest_invoice'],
    });
    
    let stripeStatus = null;
    let subscriptionEnd = null;
    let isSubscribed = false;
    
    if (subscriptions.data.length > 0) {
      const subscription = subscriptions.data[0];
      stripeStatus = subscription.status;
      subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
      isSubscribed = ['active', 'trialing'].includes(stripeStatus);
      
      logStep("Subscription found", { 
        subscriptionId: subscription.id, 
        status: stripeStatus,
        endDate: subscriptionEnd,
        isSubscribed
      });
    } else {
      logStep("No subscription found");
    }

    // Update the profile with subscription status
    await supabaseClient.from("profiles").update({
      stripe_customer_id: customerId,
      stripe_status: stripeStatus,
      subscription_end: subscriptionEnd,
      updated_at: new Date().toISOString(),
    }).eq('id', user.id);

    logStep("Updated profile with subscription info", { 
      subscribed: isSubscribed, 
      stripe_status: stripeStatus 
    });
    
    return new Response(JSON.stringify({
      subscribed: isSubscribed,
      stripe_status: stripeStatus,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
