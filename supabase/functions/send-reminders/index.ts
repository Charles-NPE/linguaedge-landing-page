
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
        id, run_at, assignment_id, student_id, notification_channel,
        assignments ( title, teacher_id, classes ( name ) ),
        profiles:student_id ( full_name, email )
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
        const studentName = reminder.profiles?.full_name || "Student";
        const studentEmail = reminder.profiles?.email;
        const assignmentTitle = reminder.assignments?.title || "Assignment";
        const className = reminder.assignments?.classes?.name || "Class";
        const channel = reminder.notification_channel || "email";

        // Send dashboard notification if required
        if (channel === "dashboard" || channel === "both") {
          if (reminder.student_id) {
            await supabase.from("notifications").insert({
              user_id: reminder.student_id,
              title: "Assignment Reminder",
              message: `Reminder: Your assignment "${assignmentTitle}" is due soon for ${className}`,
              type: "reminder",
              assignment_id: reminder.assignment_id
            });
            console.log(`Dashboard notification sent for assignment: ${assignmentTitle}`);
          }
        }

        // Send email if required
        if (channel === "email" || channel === "both") {
          const webhookUrl = Deno.env.get("REMINDER_WEBHOOK_URL");
          
          if (webhookUrl && studentEmail) {
            await fetch(webhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                student_name: studentName,
                student_email: studentEmail,
                assignment: assignmentTitle,
                class_name: className,
                deadline: reminder.run_at,
                type: "assignment_reminder"
              })
            });
            console.log(`Email reminder sent for assignment: ${assignmentTitle}`);
          }
        }

        // Mark reminder as sent
        await supabase
          .from("reminders")
          .update({ sent: true })
          .eq("id", reminder.id);

      } catch (error) {
        console.error("Error sending individual reminder:", error);
      }
    }

    return new Response(`Successfully processed ${reminders.length} reminders`, { status: 200 });
  } catch (error) {
    console.error("Error in send-reminders function:", error);
    return new Response("Internal server error", { status: 500 });
  }
});
