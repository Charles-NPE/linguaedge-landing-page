
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
      console.log("[useTeacherStats] Fetching teacher stats...");
      
      const { data, error } = await supabase.rpc('get_teacher_stats');
      
      if (error) {
        console.error("[useTeacherStats] Error fetching teacher stats:", error);
        throw error;
      }
      
      console.log("[useTeacherStats] Raw response:", data);
      
      // Safe casting from Json to TeacherStats with validation
      const stats = data as unknown as TeacherStats;
      
      // Validate the response structure
      if (!stats || typeof stats !== 'object') {
        console.error("[useTeacherStats] Invalid response structure:", stats);
        throw new Error("Invalid teacher stats response");
      }
      
      // Ensure we have the expected fields with fallbacks
      const validatedStats: TeacherStats = {
        totalStudents: stats.totalStudents || 0,
        student_limit: stats.student_limit || 20, // fallback to 20 if not set
        subscription_tier: stats.subscription_tier || 'starter'
      };
      
      console.log("[useTeacherStats] Validated stats:", validatedStats);
      
      return validatedStats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
