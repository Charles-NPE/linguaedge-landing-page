
import { Json } from "@/integrations/supabase/types";

export interface Correction {
  id: string;
  submission_id: string | null;
  level: string | null;
  errors: Json;
  recommendations: Json;
  teacher_feedback: string | null;
  created_at: string;
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
