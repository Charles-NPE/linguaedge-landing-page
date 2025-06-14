
import { useState, useEffect } from "react";
import { useTeacherStats } from "@/hooks/useTeacherStats";

export const useStripeStudentLimit = () => {
  const { data: teacherStats, isLoading } = useTeacherStats();
  const [studentLimit, setStudentLimit] = useState<number>(20); // Default to starter

  useEffect(() => {
    if (!isLoading && teacherStats) {
      console.log("[useStripeStudentLimit] Deriving limit from subscription tier:", teacherStats.subscription_tier);
      
      // Derive student limit from subscription tier
      const limit = teacherStats.subscription_tier === 'academy' ? 60 : 20;
      setStudentLimit(limit);
      
      console.log("[useStripeStudentLimit] Applied student limit:", limit);
    }
  }, [teacherStats, isLoading]);

  return { studentLimit, isLoading };
};
