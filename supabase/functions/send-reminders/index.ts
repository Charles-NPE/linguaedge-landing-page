
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async () => {
  try {
    console.log("Checking for pending reminders...");
    
    // Pick pending reminders that are due
    const { data: reminders, error } = await supabase
      .from("reminders")
      .select(`
        id, run_at, assignment_id,
        assignments ( title, teacher_id, classes ( name ) ),
        student_id,
        profiles:student_id ( full_name )
      `)
      .eq("sent", false)
      .lte("run_at", new Date().toISOString());

    if (error) {
      console.error("Error fetching reminders:", error);
      return new Response("Error fetching reminders", { status: 500 });
    }

    if (!reminders || reminders.length === 0) {
      console.log("No pending reminders found");
      return new Response("No reminders to send", { status: 200 });
    }

    console.log(`Found ${reminders.length} reminders to send`);

    for (const reminder of reminders) {
      try {
        // Get webhook URL from environment
        const webhookUrl = Deno.env.get("REMINDER_WEBHOOK_URL");
        
        if (webhookUrl) {
          // Send webhook notification
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              student_name: reminder.profiles?.full_name || "Student",
              assignment: reminder.assignments?.title || "Assignment",
              class_name: reminder.assignments?.classes?.name || "Class",
              deadline: reminder.run_at,
              type: "assignment_reminder"
            })
          });
        }

        // Mark reminder as sent
        await supabase
          .from("reminders")
          .update({ sent: true })
          .eq("id", reminder.id);

        console.log(`Sent reminder for assignment: ${reminder.assignments?.title}`);
      } catch (error) {
        console.error("Error sending individual reminder:", error);
      }
    }

    return new Response(`Successfully sent ${reminders.length} reminders`, { status: 200 });
  } catch (error) {
    console.error("Error in send-reminders function:", error);
    return new Response("Internal server error", { status: 500 });
  }
});
