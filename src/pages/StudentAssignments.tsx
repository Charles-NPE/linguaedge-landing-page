
// @ts-nocheck
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import AssignmentCard from "@/components/assignments/AssignmentCard";
import SubmitBox from "@/components/assignments/SubmitBox";
import { toast } from "@/hooks/use-toast";
import { submitEssayAndCorrect } from "@/services/submissionService";

interface TargetRow {
  assignment_id: string;
  status: "pending" | "submitted" | "late";
  submitted_at: string | null;
  assignments: {
    title: string;
    instructions: string;
    deadline: string | null;
  };
}

const StudentAssignments: React.FC = () => {
  const { user } = useAuth();
  const [targets, setTargets] = useState<TargetRow[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchAssignments();
  }, [user]);

  const fetchAssignments = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("assignment_targets")
      .select(`
        assignment_id, status, submitted_at,
        assignments ( title, instructions, deadline )
      `)
      .eq("student_id", user.id);
    
    const list = (data as TargetRow[] ?? []);
    list.sort((a, b) => {
      const da = a.assignments.deadline;
      const db = b.assignments.deadline;
      if (!da) return 1;
      if (!db) return -1;
      return da.localeCompare(db);
    });
    setTargets(list);
  };

  const handleSubmit = async (essayText: string) => {
    if (!activeId || !user) return;
    
    setLoading(true);
    try {
      // Use the improved submission service that handles everything
      await submitEssayAndCorrect(
        essayText,
        user.id,
        activeId,
        async (text: string) => {
          // This is the original onSubmit callback - now just for compatibility
          // The actual submission insert is handled in submitEssayAndCorrect
          console.log("Processing submission through callback");
        }
      );

      toast({ title: "Essay submitted successfully!" });
      
      // Refresh assignments list
      await fetchAssignments();
      setActiveId(null);
      
    } catch (err: any) {
      console.error("Submit error:", err);
      toast({ 
        title: "Error", 
        description: err.message || "Failed to submit essay", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Assignments">
      <div className="grid gap-6">
        {targets.map(t => (
          <AssignmentCard
            key={t.assignment_id}
            title={t.assignments.title}
            instructions={t.assignments.instructions}
            deadline={t.assignments.deadline}
            status={t.status}
            onSubmit={() => setActiveId(t.assignment_id)}
          />
        ))}
      </div>

      {/* Submit box */}
      {activeId && (
        <SubmitBox
          onSubmit={handleSubmit}
          onCancel={() => setActiveId(null)}
          loading={loading}
        />
      )}
    </DashboardLayout>
  );
};

export default StudentAssignments;
