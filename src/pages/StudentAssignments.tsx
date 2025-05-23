
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import AssignmentCard from "@/components/assignments/AssignmentCard";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

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
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("assignment_targets")
      .select(`
        assignment_id, status, submitted_at,
        assignments ( title, instructions, deadline )
      `)
      .eq("student_id", user.id)
      .order("assignments.deadline", { ascending: true })
      .then(({ data }) => setTargets(data as TargetRow[] ?? []));
  }, [user]);

  const handleSend = async () => {
    if (!activeId || !text.trim() || !user) return;
    setLoading(true);
    try {
      await supabase.from("submissions").insert({
        assignment_id: activeId,
        student_id: user.id,
        text: text.trim()
      });
      toast({ title: "Essay submitted!" });
      // refresh list
      const { data } = await supabase
        .from("assignment_targets")
        .select(`
          assignment_id, status, submitted_at,
          assignments ( title, instructions, deadline )
        `)
        .eq("student_id", user.id);
      setTargets(data as TargetRow[] ?? []);
      setActiveId(null);
      setText("");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
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

      {/* editor emergente bajo la lista */}
      {activeId && (
        <div className="fixed inset-x-0 bottom-0 bg-white dark:bg-slate-900 border-t p-4 space-y-2">
          <Textarea
            rows={6}
            placeholder="Paste or write your essay here…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setActiveId(null); setText(""); }}>
              Cancel
            </Button>
            <Button disabled={loading || !text.trim()} onClick={handleSend}>
              {loading ? "Sending…" : "Send Essay"}
            </Button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default StudentAssignments;
