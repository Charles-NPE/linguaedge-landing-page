
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const useStripeStudentLimit = () => {
  const { profile } = useAuth();
  const [studentLimit, setStudentLimit] = useState<number>(20); // Default to starter
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStudentLimitFromStats = async () => {
      if (!profile) {
        setStudentLimit(20); // Default to starter if no profile
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        console.log("[useStripeStudentLimit] Fetching teacher stats for student limit...");
        
        // Use the corrected get_teacher_stats function that returns student_limit directly
        const { data, error } = await supabase.rpc('get_teacher_stats');
        
        if (error) {
          console.error("[useStripeStudentLimit] Error calling get_teacher_stats:", error);
          setStudentLimit(20); // Fallback to starter
          return;
        }

        console.log("[useStripeStudentLimit] Raw teacher stats:", data);
        
        // Extract student_limit directly from the response
        const limit = data?.student_limit;
        
        if (limit && typeof limit === 'number') {
          setStudentLimit(limit);
          console.log("[useStripeStudentLimit] Applied student limit:", limit);
        } else {
          // If student_limit is null/undefined, determine from subscription_tier
          const tier = data?.subscription_tier || 'starter';
          const calculatedLimit = tier === 'academy' ? 60 : 20;
          setStudentLimit(calculatedLimit);
          console.log("[useStripeStudentLimit] Calculated limit from tier:", { tier, calculatedLimit });
        }

      } catch (error) {
        console.error("[useStripeStudentLimit] Error fetching student limit:", error);
        setStudentLimit(20); // Fallback to starter
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudentLimitFromStats();
  }, [profile?.id, profile?.subscription_tier]);

  return { studentLimit, isLoading };
};
