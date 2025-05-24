
import { supabase } from "@/integrations/supabase/client";

export interface CreateAssignmentData {
  class_id: string;
  teacher_id: string;
  title: string;
  instructions: string;
  deadline?: string | null;
  student_ids?: string[];  // Optional array for specific students
}

export interface AssignmentTarget {
  assignment_id: string;
  student_id: string;
  status: 'pending' | 'submitted' | 'late';
}

/**
 * Creates an assignment and automatically generates assignment targets for all students in the class
 * or for specific students if student_ids is provided
 */
export async function createAssignmentWithTargets(assignmentData: CreateAssignmentData) {
  const { student_ids, ...assnData } = assignmentData;

  // Insert the assignment
  const { data: assignment, error: assignmentError } = await supabase
    .from("assignments")
    .insert(assnData)
    .select("id, class_id")
    .single();

  if (assignmentError) throw assignmentError;

  // Get recipients - either specific students or all students in class
  let recipients: string[] = [];
  if (student_ids && student_ids.length > 0) {
    recipients = student_ids;
  } else {
    // Fetch all students in the class
    const { data: students, error: studentsError } = await supabase
      .from("class_students")
      .select("student_id")
      .eq("class_id", assignment.class_id);

    if (studentsError) throw studentsError;
    recipients = (students ?? []).map((s) => s.student_id);
  }

  // Create assignment targets for selected recipients
  if (recipients.length > 0) {
    const targets = recipients.map((studentId) => ({
      assignment_id: assignment.id,
      student_id: studentId,
      status: 'pending' as const
    }));

    const { error: targetsError } = await supabase
      .from("assignment_targets")
      .insert(targets);

    if (targetsError) throw targetsError;
  }

  return assignment;
}

/**
 * Fetches assignments for a specific teacher
 */
export async function getTeacherAssignments(teacherId: string) {
  const { data, error } = await supabase
    .from("assignments")
    .select(`
      *,
      classes!inner(name),
      assignment_targets(
        status,
        student_id,
        submitted_at,
        profiles!inner(full_name)
      )
    `)
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Fetches assignments for a specific student
 */
export async function getStudentAssignments(studentId: string) {
  const { data, error } = await supabase
    .from("assignment_targets")
    .select(`
      *,
      assignments!inner(
        id,
        title,
        instructions,
        deadline,
        created_at,
        classes!inner(name),
        profiles!inner(full_name)
      )
    `)
    .eq("student_id", studentId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
