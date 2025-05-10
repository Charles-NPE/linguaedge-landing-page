
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Helper logging function for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("ENV STRIPE_SECRET_KEY missing");
    logStep("Stripe key verified");

    // Initialize Supabase client with the service role key
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // ----- Auth -----
    const jwt = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!jwt) throw new Error("No JWT provided in Authorization header");
    logStep("Authorization header found");

    const { data: userData, error: userErr } = await supabaseClient.auth.getUser(jwt);
    if (userErr) throw new Error(`Auth error: ${userErr.message}`);
    const uid = userData.user?.id;
    if (!uid) throw new Error("Could not extract user id");
    logStep("User OK", { uid });

    // ----- Customer lookup -----
    const { data: profile, error: profErr } = await supabaseClient
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", uid)
      .single();

    if (profErr) throw new Error(`Profile fetch error: ${profErr.message}`);
    if (!profile?.stripe_customer_id)
      throw new Error("stripe_customer_id is NULL for this user");

    const customerId = profile.stripe_customer_id;
    logStep("Customer id found", { customerId });

    // ----- Portal session -----
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const returnUrl = Deno.env.get("STRIPE_PORTAL_RETURN_URL") ||
      `${req.headers.get("origin") || "https://linguaedge-landing-page.lovable.app"}/teacher`;
    
    logStep("Creating portal session", { returnUrl });
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    
    logStep("Portal session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
