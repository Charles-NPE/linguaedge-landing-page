
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const N8N_WEBHOOK = 
  "https://n8n-railway-custom-production-c110.up.railway.app/webhook/1f103665-b767-4db5-9394-f251968fce17";

interface WebhookResponse {
  level: string;
  errors: any;
  recommendations: any;
  teacher_feedback: string;
  word_count?: number;
}

export const submitEssayAndCorrect = async (
  text: string,
  userId: string,
  onSubmit: (text: string) => Promise<void>
) => {
  // Call the original onSubmit to handle assignment submission
  await onSubmit(text.trim());
  
  // Now handle the correction workflow
  toast({ 
    title: "Analyzing essay...", 
    description: "AI is reviewing your submission" 
  });

  // Get the most recent submission for this user - with better error handling
  const { data: recentSubmission, error: submissionError } = await supabase
    .from("submissions")
    .select("id, assignment_id")
    .eq("student_id", userId)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .single();

  if (submissionError) {
    console.error("Supabase submission error:", submissionError);
    throw new Error(`Failed to retrieve submission: ${submissionError.message}`);
  }

  if (!recentSubmission) {
    throw new Error("No submission found for analysis");
  }

  console.log("Found submission for correction:", recentSubmission.id);

  // Prepare payload for webhook
  const payload = {
    assignment_id: recentSubmission.assignment_id,
    student_id: userId,
    text: text.trim(),
    file_url: null,
    submitted_at: new Date().toISOString()
  };

  console.log("Sending to webhook:", payload);

  // Send to webhook for AI analysis
  const webhookResponse = await fetch(N8N_WEBHOOK, {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!webhookResponse.ok) {
    throw new Error(`Webhook failed: ${webhookResponse.status}`);
  }

  // Parse webhook response properly
  const response = await webhookResponse.json();
  console.log("Webhook raw response:", response);
  
  // Extract correction data from the nested structure
  let correctionData: any = null;

  if (Array.isArray(response)) {
    // Look for the object with message.content structure
    const messageObj = response.find((item) => item?.message?.content);
    if (messageObj?.message?.content) {
      correctionData = messageObj.message.content;
    }
  } else if (response?.message?.content) {
    // Handle case where response is not an array but has the nested structure
    correctionData = response.message.content;
  } else if (response && typeof response === 'object') {
    // Handle case where response is already the correction data
    correctionData = response;
  }

  if (!correctionData) {
    console.error("Invalid webhook response format:", response);
    throw new Error("Webhook returned invalid correction data");
  }

  console.log("Extracted correction data:", correctionData);

  // Save correction to database with proper fallbacks
  const { error: correctionError } = await supabase
    .from("corrections")
    .insert({
      submission_id: recentSubmission.id,
      level: correctionData.level ?? "Unknown",
      errors: correctionData.errors ?? {},
      recommendations: correctionData.recommendations ?? {},
      teacher_feedback: correctionData.teacher_feedback ?? "",
      word_count: correctionData.word_count ?? null
    });

  if (correctionError) {
    console.error("Supabase correction insert error:", correctionError);
    throw new Error(`Failed to save correction: ${correctionError.message}`);
  }

  console.log("Correction saved successfully for submission:", recentSubmission.id);

  toast({ 
    title: "Analysis complete!", 
    description: "Your essay has been analyzed and corrected" 
  });
};
