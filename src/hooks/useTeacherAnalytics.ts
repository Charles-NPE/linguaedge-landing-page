
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTeacherAnalytics = (teacherId?: string, classId?: string) => {
  return useQuery({
    queryKey: ["analytics", teacherId, classId],
    enabled: !!teacherId,
    staleTime: 30 * 1000,
    queryFn: async () => {
      // Get class stats
      let classQuery = supabase
        .from("v_class_stats")
        .select("*")
        .eq("teacher_id", teacherId);

      if (classId) {
        classQuery = classQuery.eq("class_id", classId);
      }

      const classResult = await classQuery;

      // Get student stats only if a class is selected
      let studentResult = { data: [], error: null };
      if (classId) {
        studentResult = await supabase
          .from("v_student_stats")
          .select("*")
          .eq("class_id", classId);
      }

      if (classResult.error) throw classResult.error;
      if (studentResult.error) throw studentResult.error;

      return {
        classStats: classResult.data ?? [],
        studentStats: studentResult.data ?? []
      };
    }
  });
};
