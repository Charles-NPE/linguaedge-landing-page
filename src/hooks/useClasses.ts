
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useClasses = (teacherId?: string) =>
  useQuery({
    queryKey: ["classes", teacherId],
    enabled: !!teacherId,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("id, name")
        .eq("teacher_id", teacherId);
      if (error) throw error;
      return data ?? [];
    }
  });
