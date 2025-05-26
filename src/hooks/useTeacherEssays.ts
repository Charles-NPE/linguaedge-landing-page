
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTeacherEssays = (teacherId?: string) =>
  useQuery({
    queryKey: ["essayStats", teacherId],
    enabled: !!teacherId,
    staleTime: 30 * 1000,         // refresca cada 30 s
    queryFn: async () => {
      const { data, error } = await supabase.rpc("teacher_assignment_stats");
      if (error) throw error;
      return data ?? [];
    }
  });
