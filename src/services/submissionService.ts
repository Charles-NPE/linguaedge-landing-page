
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

  // Get the most recent submission for this user
  const { data: recentSubmission, error: submissionError } = await supabase
    .from("submissions")
    .select("id, assignment_id")
    .eq("student_id", userId)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .single();

  if (submissionError || !recentSubmission) {
    throw new Error("Failed to retrieve submission");
  }

  // Prepare payload for webhook
  const payload = {
    assignment_id: recentSubmission.assignment_id,
    student_id: userId,
    text: text.trim(),
    file_url: null,
    submitted_at: new Date().toISOString()
  };

  // Send to webhook for AI analysis (without Authorization header)
  const webhookResponse = await fetch(N8N_WEBHOOK, {
    method: "POST",
    mode: "cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!webhookResponse.ok) {
    throw new Error(`Webhook failed: ${webhookResponse.status}`);
  }

  // parseamos el array y sacamos el content del primer message
  const webhookPayload = await webhookResponse.json();
  // puede venir un array de chunk responses + un objeto extra, así que buscamos el primer que tenga .message.content
  const firstMsg = Array.isArray(webhookPayload)
    ? webhookPayload.find((el) => el?.message?.content)?.message.content
    : webhookPayload;

  // si no encontramos nada válido le metemos un fallback
  const correction = firstMsg ?? {
    level: "Unknown",
    errors: {},
    recommendations: {},
    teacher_feedback: "",
    word_count: null,
  };

  // Save correction directly to database
  const { error: correctionError } = await supabase
    .from("corrections")
    .insert({
      submission_id: recentSubmission.id,
      level: correction.level ?? "Unknown",
      errors: correction.errors ?? {},
      recommendations: correction.recommendations ?? {},
      teacher_feedback: correction.teacher_feedback ?? "",
      word_count: correction.word_count ?? null
    });

  if (correctionError) {
    console.error("Supabase insert error:", correctionError);
    throw new Error(correctionError.message || "Failed to save correction");
  }

  toast({ 
    title: "Analysis complete!", 
    description: "Your essay has been analyzed and corrected" 
  });
};
