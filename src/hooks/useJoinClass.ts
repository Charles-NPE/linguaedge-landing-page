
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface JoinClassResult {
  classId: string;
  name: string;
}

/**
 * Join a class using a class code
 */
export async function joinClass(code: string, userId: string): Promise<JoinClassResult> {
  // Find the class by code
  const { data: classData, error: classError } = await supabase
    .from("classes")
    .select("id, name")
    .eq("code", code)
    .single();

  if (classError || !classData) {
    console.error("Error finding class:", classError);
    throw new Error("Invalid class code. Please check and try again.");
  }

  // Add student to class (using upsert to avoid duplicates)
  const { error: joinError } = await supabase
    .from("class_students")
    .upsert(
      { 
        class_id: classData.id, 
        student_id: userId,
        joined_at: new Date().toISOString() 
      },
      { 
        onConflict: 'class_id,student_id',
        ignoreDuplicates: true 
      }
    );

  if (joinError) {
    console.error("Error joining class:", joinError);
    throw new Error("Failed to join class. Please try again later.");
  }

  return {
    classId: classData.id,
    name: classData.name
  };
}
