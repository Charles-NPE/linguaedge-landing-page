
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface TeacherStats {
  totalStudents: number;
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
      
      if (!data || typeof data !== 'object') {
        console.error("[useTeacherStats] Invalid response structure:", data);
        throw new Error("Invalid teacher stats response");
      }
      
      // Type assertion for the JSON response from RPC
      const rawData = data as any;
      
      // Ensure we have the expected fields with fallbacks
      const validatedStats: TeacherStats = {
        totalStudents: rawData.totalStudents || 0,
        subscription_tier: rawData.subscription_tier || 'starter'
      };
      
      console.log("[useTeacherStats] Validated stats:", validatedStats);
      
      return validatedStats;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
