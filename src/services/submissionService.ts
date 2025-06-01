
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

/**
 * Walk any JSON payload and return the first positive integer found
 * under a key that matches /wordcount/i, or any standalone numeric
 * element in the root array.
 */
function extractWordCount(payload: any): number | null {
  // 0️⃣  unwrap { data: [...] } if needed
  const root = Array.isArray(payload?.data) ? payload.data : payload;
  const queue = Array.isArray(root) ? [...root] : [root];

  while (queue.length) {
    const item = queue.shift();

    if (item == null) continue;

    // a) object with Wordcount-like key
    if (typeof item === 'object' && !Array.isArray(item)) {
      for (const [key, val] of Object.entries(item)) {
        if (/^wordcount$/i.test(key)) {
          const digits = String(val).replace(/\D+/g, '');
          const n = parseInt(digits, 10);
          if (n > 0) return n;
        }
        queue.push(val);           // search nested values too
      }
      continue;
    }

    // b) bare number or numeric string
    if (typeof item === 'number' && item > 0) return item;
    if (typeof item === 'string' && /^[0-9]+$/.test(item))
      return parseInt(item, 10);
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
  
  // Check if essay already submitted (prevent resubmission)
  const { count } = await supabase
    .from('submissions')
    .select('id', { count: 'exact', head: true })
    .eq('assignment_id', assignmentId)
    .eq('student_id', userId);

  if (count && count > 0) {
    throw new Error('Essay already submitted.');
  }
  
  // Step 1: Insert submission and get its ID immediately with assignment details
  const { data: newSubmissions, error: submissionError } = await supabase
    .from("submissions")
    .insert({
      assignment_id: assignmentId,
      student_id: userId,
      text: text.trim(),
      submitted_at: new Date().toISOString()
    })
    .select(`
      id, 
      assignment_id,
      assignments(title, instructions)
    `)
    .returns<Array<{
      id: string, 
      assignment_id: string,
      assignments: {
        title: string,
        instructions: string
      } | null
    }>>();

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

  // Prepare payload for webhook with submission_id and assignment context
  const payload = {
    submission_id: newSubmission.id,
    assignment_id: assignmentId,
    student_id: userId,
    text: text.trim(),
    assignment_title: newSubmission.assignments?.title || "",
    assignment_instructions: newSubmission.assignments?.instructions || ""
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

  // Extract word count using robust function
  const wordCount = extractWordCount(webhookFullResponse);

  if (!mainCorrectionObject) {
    console.error("Invalid webhook response format:", webhookFullResponse);
    throw new Error("Webhook returned invalid correction data");
  }

  console.log("Extracted correction data:", mainCorrectionObject);
  console.log("Extracted word count:", wordCount);

  // Save correction to database with proper fallbacks, using the known submission ID
  const { error: correctionError } = await supabase
    .from("corrections")
    .insert({
      submission_id: newSubmission.id, // Use the submission ID we just created
      level: mainCorrectionObject.level || "Unknown",
      errors: mainCorrectionObject.errors || {},
      recommendations: mainCorrectionObject.recommendations || [],
      teacher_feedback: mainCorrectionObject.teacher_feedback || "",
      word_count: wordCount // ✅ now an integer, never mistaken as NULL
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
