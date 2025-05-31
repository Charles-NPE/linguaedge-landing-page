
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
  const webhookPayload = await webhookResponse.json();
  console.log("Webhook raw response:", webhookPayload);
  
  let correction: any = {
    level: "Unknown",
    errors: {},
    recommendations: {},
    teacher_feedback: "",
    word_count: null,
  };

  // Handle different response formats from webhook
  if (Array.isArray(webhookPayload)) {
    // Look for the message content in the array
    const messageObj = webhookPayload.find((el) => el?.message?.content);
    if (messageObj?.message?.content) {
      correction = {
        level: messageObj.message.content.level || "Unknown",
        errors: messageObj.message.content.errors || {},
        recommendations: messageObj.message.content.recommendations || {},
        teacher_feedback: messageObj.message.content.teacher_feedback || "",
        word_count: messageObj.message.content.word_count || null
      };
    }
    
    // Look for separate Wordcount object if word_count wasn't in content
    if (!correction.word_count) {
      const wordCountObj = webhookPayload.find((el) => el?.Wordcount || el?.wordcount);
      if (wordCountObj) {
        const wordCountValue = wordCountObj.Wordcount || wordCountObj.wordcount;
        correction.word_count = typeof wordCountValue === 'string' 
          ? parseInt(wordCountValue.replace(/\n/g, '').trim()) 
          : wordCountValue;
      }
    }
  } else if (webhookPayload && typeof webhookPayload === 'object') {
    // Handle direct object response
    correction = {
      level: webhookPayload.level || "Unknown",
      errors: webhookPayload.errors || {},
      recommendations: webhookPayload.recommendations || {},
      teacher_feedback: webhookPayload.teacher_feedback || "",
      word_count: webhookPayload.word_count || null
    };
  }

  console.log("Parsed correction data:", correction);

  // Save correction to database with proper fallbacks
  const { error: correctionError } = await supabase
    .from("corrections")
    .insert({
      submission_id: recentSubmission.id,
      level: correction.level || "Unknown",
      errors: correction.errors || {},
      recommendations: correction.recommendations || {},
      teacher_feedback: correction.teacher_feedback || "",
      word_count: correction.word_count
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
