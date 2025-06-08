
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TeacherStats {
  totalStudents: number;
  student_limit: number;
  subscription_tier: string;
}

export const useTeacherStats = () => {
  return useQuery({
    queryKey: ["teacher-stats"],
    queryFn: async (): Promise<TeacherStats> => {
      const { data, error } = await supabase.rpc('get_teacher_stats');
      
      if (error) {
        console.error("Error fetching teacher stats:", error);
        throw error;
      }
      
      // Safe casting from Json to TeacherStats
      const stats = data as unknown as TeacherStats;
      
      return stats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
