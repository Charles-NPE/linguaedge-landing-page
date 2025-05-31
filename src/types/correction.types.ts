
export interface Correction {
  id: string;
  submission_id: string | null;
  level: string;
  errors: Record<string, any> | null;
  recommendations: Record<string, any> | null;
  teacher_feedback: string | null;
  word_count: number | null;
  created_at: string;
  read_at: string | null;
  submissions?: {
    id: string;
    text: string | null;
    student_id: string;
    assignments: {
      title: string;
    } | null;
  } | null;
}

// Helper types para cuando necesitemos validación estricta
export interface ErrorsStructure {
  grammar?: string[];
  vocabulary?: string[];
  cohesion?: string[];
  other?: string[];
}

export type RecommendationsArray = string[];
