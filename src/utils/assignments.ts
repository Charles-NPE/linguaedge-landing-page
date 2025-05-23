
import { supabase } from "@/integrations/supabase/client";

export interface CreateAssignmentData {
  class_id: string;
  teacher_id: string;
  title: string;
  instructions: string;
  deadline?: string | null;
}

export interface AssignmentTarget {
  assignment_id: string;
  student_id: string;
  status: 'pending' | 'submitted' | 'late';
}

/**
 * Creates an assignment and automatically generates assignment targets for all students in the class
 */
export async function createAssignmentWithTargets(assignmentData: CreateAssignmentData) {
  // Insert the assignment
  const { data: assignment, error: assignmentError } = await supabase
    .from("assignments")
    .insert(assignmentData)
    .select("id")
    .single();

  if (assignmentError) throw assignmentError;

  // Fetch students in the class
  const { data: students, error: studentsError } = await supabase
    .from("class_students")
    .select("student_id")
    .eq("class_id", assignmentData.class_id);

  if (studentsError) throw studentsError;

  // Create assignment targets for each student
  if (students && students.length > 0) {
    const targets: Omit<AssignmentTarget, 'status'>[] = students.map((student) => ({
      assignment_id: assignment.id,
      student_id: student.student_id,
    }));

    const { error: targetsError } = await supabase
      .from("assignment_targets")
      .insert(targets.map(target => ({ ...target, status: 'pending' as const })));

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
