
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

    // Track teachers for reminder_sent notifications
    const teacherReminders = new Map<string, { assignmentId: string, assignmentTitle: string, className: string, count: number }>();

    for (const reminder of reminders) {
      try {
        const studentName = reminder.profiles?.full_name || "Student";
        const studentEmail = reminder.profiles?.email;
        const assignmentTitle = reminder.assignments?.title || "Assignment";
        const className = reminder.assignments?.classes?.name || "Class";
        const channel = reminder.notification_channel || "email";

        // Track for teacher notification
        const teacherId = reminder.assignments?.teacher_id;
        if (teacherId) {
          const key = `${teacherId}-${reminder.assignment_id}`;
          if (!teacherReminders.has(key)) {
            teacherReminders.set(key, {
              assignmentId: reminder.assignment_id,
              assignmentTitle,
              className,
              count: 0
            });
          }
          teacherReminders.get(key)!.count++;
        }

        // Send dashboard notification if required
        if (channel === "dashboard" || channel === "both") {
          if (reminder.student_id) {
            await supabase.from("notifications").insert({
              user_id: reminder.student_id,
              type: "reminder",
              message: `Reminder: submit '${assignmentTitle}' (Class ${className})`,
              link: "/student/assignments",
              data: { assignment_id: reminder.assignment_id, class_name: className }
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

    // Send reminder_sent notifications to teachers
    for (const [key, data] of teacherReminders.entries()) {
      const teacherId = key.split('-')[0];
      const message = data.count === 1 
        ? `Reminder sent to student in ${data.className}`
        : `Reminder sent to ${data.count} students in ${data.className}`;

      try {
        await supabase.from("notifications").insert({
          user_id: teacherId,
          type: "reminder_sent",
          message,
          link: `/teacher/essays`,
          data: { 
            assignment_id: data.assignmentId, 
            class_name: data.className,
            student_count: data.count
          }
        });
        console.log(`Teacher notification sent: ${message}`);
      } catch (error) {
        console.error("Error sending teacher notification:", error);
      }
    }

    return new Response(`Successfully processed ${reminders.length} reminders`, { status: 200 });
  } catch (error) {
    console.error("Error in send-reminders function:", error);
    return new Response("Internal server error", { status: 500 });
  }
});
