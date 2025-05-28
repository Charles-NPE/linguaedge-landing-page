
import { Json } from "@/integrations/supabase/types";

export interface Correction {
  id: string;
  submission_id: string | null;
  level: string;
  errors: {
    grammar?: string[];
    vocabulary?: string[];
    cohesion?: string[];
    other?: string[];
  };
  recommendations: string[];
  teacher_feedback: string | null;
  word_count: number | null;
  created_at: string;
  read_at: string | null;
  submissions?: {
    assignments: {
      title: string;
    };
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
