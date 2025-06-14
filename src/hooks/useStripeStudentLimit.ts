
import { useState, useEffect } from "react";
import { useTeacherStats } from "@/hooks/useTeacherStats";

export const useStripeStudentLimit = () => {
  const { data: teacherStats, isLoading } = useTeacherStats();
  const [studentLimit, setStudentLimit] = useState<number>(20); // Default to starter

  useEffect(() => {
    if (!isLoading && teacherStats) {
      console.log("[useStripeStudentLimit] Using student_limit from database:", teacherStats.student_limit);
      
      // Use the student_limit directly from the database
      setStudentLimit(teacherStats.student_limit);
      
      console.log("[useStripeStudentLimit] Applied student limit:", teacherStats.student_limit);
    }
  }, [teacherStats, isLoading]);

  return { studentLimit, isLoading };
};
