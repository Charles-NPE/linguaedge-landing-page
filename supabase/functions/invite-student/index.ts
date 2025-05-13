
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { class_id, email, class_name, code } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";

    if (!supabaseUrl || !supabaseKey || !resendApiKey) {
      throw new Error("Missing environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendApiKey);

    // Check if student already exists in the system
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    // Store either the user ID or email in class_students
    await supabase.from("class_students").insert({
      class_id,
      student_id: existingUser?.id || null,
      invited_email: existingUser ? null : email,
      status: existingUser ? "enrolled" : "invited"
    });

    // Send email invitation
    await resend.emails.send({
      from: "ClassConnect <onboarding@resend.dev>",
      to: email,
      subject: `You've been invited to join ${class_name}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You've been invited to join a class!</h2>
          <p>Hello,</p>
          <p>You've been invited to join <strong>${class_name}</strong>.</p>
          <p>To join this class, please use the class code: <strong>${code}</strong></p>
          <p>Or click <a href="${supabaseUrl}/join?code=${code}" style="color: #4f46e5;">this link</a> to join directly.</p>
          <p>Thank you,<br>ClassConnect Team</p>
        </div>
      `,
    });

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in invite-student function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
        status: 500,
      }
    );
  }
});
