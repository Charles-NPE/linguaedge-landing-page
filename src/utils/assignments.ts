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
  const { error, data: assignmentId } = await supabase.rpc(
    "create_assignment_with_targets",
    {
      _class_id: assignmentData.class_id,
      _teacher_id: assignmentData.teacher_id,
      _title: assignmentData.title,
      _instructions: assignmentData.instructions,
      _deadline: assignmentData.deadline,
      _student_ids: assignmentData.student_ids ?? null
    }
  );

  if (error) throw error;
  return { id: assignmentId };
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
