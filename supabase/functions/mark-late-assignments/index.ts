
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async () => {
  try {
    console.log("Checking for overdue assignments to mark as late...");
    
    // Update assignment targets where deadline has passed and status is still pending
    const { data, error } = await supabase.rpc('mark_overdue_as_late');
    
    if (error) {
      console.error("Error marking assignments as late:", error);
      return new Response(`Error: ${error.message}`, { status: 500 });
    }

    console.log(`Successfully marked ${data || 0} assignments as late`);
    return new Response(`Marked ${data || 0} assignments as late`, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response("Internal server error", { status: 500 });
  }
});
