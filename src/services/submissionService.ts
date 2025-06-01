
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

// Defensive word count extraction function
function extractWordCount(raw: any[]): number | null {
  if (!Array.isArray(raw)) return null;

  // a) object with Wordcount key
  const obj = raw.find(el => el && typeof el === 'object' && 'Wordcount' in el);
  if (obj) {
    const wordCountString = typeof obj.Wordcount === 'string' 
      ? obj.Wordcount.replace(/\D/g, '') // Remove all non-digits
      : String(obj.Wordcount).replace(/\D/g, '');
    
    const parsed = parseInt(wordCountString, 10);
    return !isNaN(parsed) && parsed > 0 ? parsed : null;
  }

  // b) bare number or numeric string (e.g. second element)
  const bare = raw.find(el => typeof el === 'number' || /^[0-9]+$/.test(String(el)));
  if (bare) {
    const parsed = parseInt(String(bare), 10);
    return !isNaN(parsed) && parsed > 0 ? parsed : null;
  }

  return null;
}

export const submitEssayAndCorrect = async (
  text: string,
  userId: string,
  assignmentId: string,
  onSubmit: (text: string) => Promise<void>
) => {
  console.log("Starting submission process for assignment:", assignmentId);
  
  // Step 1: Insert submission and get its ID immediately
  const { data: newSubmissions, error: submissionError } = await supabase
    .from("submissions")
    .insert({
      assignment_id: assignmentId,
      student_id: userId,
      text: text.trim(),
      submitted_at: new Date().toISOString()
    })
    .select('id, assignment_id')
    .returns<Array<{id: string, assignment_id: string}>>();

  if (submissionError || !newSubmissions || newSubmissions.length === 0) {
    console.error("Submission insert error:", submissionError);
    throw new Error(`Failed to create submission: ${submissionError?.message || 'Unknown error'}`);
  }

  const newSubmission = newSubmissions[0];
  console.log("Created submission:", newSubmission.id);

  // Step 2: Update assignment target status
  await supabase
    .from('assignment_targets')
    .update({ 
      submitted_at: new Date().toISOString(), 
      status: 'submitted' 
    })
    .eq('assignment_id', assignmentId)
    .eq('student_id', userId);

  // Step 3: Call the original onSubmit for any additional processing
  await onSubmit(text.trim());

  // Step 4: Start AI analysis
  toast({ 
    title: "Analyzing essay...", 
    description: "AI is reviewing your submission" 
  });

  // Prepare payload for webhook with submission_id
  const payload = {
    submission_id: newSubmission.id,
    assignment_id: assignmentId,
    student_id: userId,
    text: text.trim()
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

  // Parse webhook response
  const webhookFullResponse = await webhookResponse.json();
  console.log("Webhook raw response:", webhookFullResponse);
  
  // Find the main correction message content
  const mainCorrectionObject = Array.isArray(webhookFullResponse)
    ? webhookFullResponse.find((el: any) => el?.message?.content)?.message.content
    : webhookFullResponse?.message?.content || webhookFullResponse;

  // Extract word count using defensive function
  const extractedWordCount = extractWordCount(webhookFullResponse);

  if (!mainCorrectionObject) {
    console.error("Invalid webhook response format:", webhookFullResponse);
    throw new Error("Webhook returned invalid correction data");
  }

  console.log("Extracted correction data:", mainCorrectionObject);
  console.log("Extracted word count:", extractedWordCount);

  // Save correction to database with proper fallbacks, using the known submission ID
  const { error: correctionError } = await supabase
    .from("corrections")
    .insert({
      submission_id: newSubmission.id, // Use the submission ID we just created
      level: mainCorrectionObject.level || "Unknown",
      errors: mainCorrectionObject.errors || {},
      recommendations: mainCorrectionObject.recommendations || [],
      teacher_feedback: mainCorrectionObject.teacher_feedback || "",
      word_count: extractedWordCount // Use the defensively extracted word count
    });

  if (correctionError) {
    console.error("Supabase correction insert error:", correctionError);
    throw new Error(`Failed to save correction: ${correctionError.message}`);
  }

  console.log("Correction saved successfully for submission:", newSubmission.id);

  toast({ 
    title: "Analysis complete!", 
    description: "Your essay has been analyzed and corrected" 
  });
};
