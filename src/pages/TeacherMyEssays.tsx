
import React, { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTeacherEssays } from "@/hooks/useTeacherEssays";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { Clock, Users, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import StudentStatusRow from "@/components/assignments/StudentStatusRow";

type StatObj = { pending: number; submitted: number; late: number };

function toStats(j: any): StatObj {
  try {
    if (typeof j === "object") return j as StatObj;
    return JSON.parse(j) as StatObj;       // handle json string
  } catch {
    return { pending: 0, submitted: 0, late: 0 };
  }
}

type AssignmentRow = {
  id: string;
  title: string;
  deadline: string | null;
  created_at: string;
  class_name: string;
  stats: StatObj;
};

interface DetailCache {
  [assignmentId: string]: {
    rows: {
      student: { id: string; full_name: string | null };
      status: "pending" | "submitted" | "late";
    }[];
  };
}

const TeacherMyEssays: React.FC = () => {
  const { user } = useAuth();
  const { data: rows = [], isLoading } = useTeacherEssays(user?.id);
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<DetailCache>({});

  const assignments = rows.map((r: any) => ({
    ...r,
    stats: toStats(r.stats)
  }));

  const toggleDetail = async (id: string) => {
    if (openId === id) { 
      setOpenId(null); 
      return; 
    }
    setOpenId(id);
    
    if (detail[id]) return; // already cached
    
    const { data, error } = await supabase
      .from("assignment_targets")
      .select(`
        status, student_id,
        profiles:student_id ( id, full_name )
      `)
      .eq("assignment_id", id);

    if (error) {
      console.error("Error fetching student details:", error);
      toast({ title: "Error", description: "Failed to load student details", variant: "destructive" });
      return;
    }

    const rows = (data ?? []).map((r: any) => ({
      student: { id: r.profiles.id, full_name: r.profiles.full_name },
      status: r.status
    }));
    
    setDetail(prev => ({ ...prev, [id]: { rows } }));
  };

  const remindOne = async (assignmentId: string, studentId: string, name: string | null) => {
    const delay = prompt(`Minutes from now to remind ${name ?? "student"}:`, "120");
    if (!delay) return;
    
    const minutes = parseInt(delay) || 0;
    const run_at = new Date(Date.now() + minutes * 60000).toISOString();
    
    const { error } = await supabase.from("reminders").insert({ 
      assignment_id: assignmentId, 
      student_id: studentId, 
      run_at 
    });
    
    if (error) {
      console.error("Error scheduling reminder:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Reminder scheduled", description: `Will remind ${name ?? "student"} in ${minutes} minutes` });
    }
  };

  const getCardColor = (stats: StatObj) => {
    if (stats.late > 0) return "border-red-200 bg-red-50";
    if (stats.pending > 0) return "border-yellow-200 bg-yellow-50";
    if (stats.submitted === 0) return "border-blue-200 bg-blue-50";
    return "border-green-200 bg-green-50";
  };

  const getStatusIcon = (stats: StatObj) => {
    if (stats.late > 0) return <AlertCircle className="h-4 w-4 text-red-600" />;
    if (stats.pending > 0) return <Clock className="h-4 w-4 text-yellow-600" />;
    return <CheckCircle className="h-4 w-4 text-green-600" />;
  };

  const scheduleReminder = async (assignmentId: string, assignmentTitle: string) => {
    const minutesStr = prompt(`Schedule reminder for "${assignmentTitle}" in how many minutes?`, "120");
    if (!minutesStr) return;

    const minutes = parseInt(minutesStr);
    if (isNaN(minutes) || minutes < 1) {
      toast({ title: "Invalid input", description: "Please enter a valid number of minutes", variant: "destructive" });
      return;
    }

    const runAt = new Date(Date.now() + minutes * 60000);

    try {
      const { error } = await supabase.from("reminders").insert({
        assignment_id: assignmentId,
        run_at: runAt.toISOString()
      });

      if (error) {
        console.error("Error scheduling reminder:", error);
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ 
          title: "Reminder scheduled", 
          description: `Reminder will be sent at ${format(runAt, "PPp")}` 
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({ title: "Error", description: "Failed to schedule reminder", variant: "destructive" });
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="My Essays">
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Essays">
      <Link to="/teacher" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
        ← Back to Dashboard
      </Link>
      
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No assignments found.</p>
            </CardContent>
          </Card>
        ) : (
          assignments.map(assignment => {
            const totalStudents = assignment.stats.pending + assignment.stats.submitted + assignment.stats.late;
            
            return (
              <Card key={assignment.id} className={`${getCardColor(assignment.stats)} transition-all hover:shadow-md`}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(assignment.stats)}
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {assignment.deadline 
                            ? `Due • ${format(new Date(assignment.deadline), "PPp")}` 
                            : "No deadline"
                          }
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Created {format(new Date(assignment.created_at), "PP")}
                        </p>
                      </div>
                      <button 
                        onClick={() => toggleDetail(assignment.id)} 
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {openId === assignment.id ? <ChevronUp size={18}/> : <ChevronDown size={18}/> }
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {assignment.class_name}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-4 text-sm">
                      <span className="text-green-600">
                        ✓ {assignment.stats.submitted} submitted
                      </span>
                      <span className="text-yellow-600">
                        ⏳ {assignment.stats.pending} pending
                      </span>
                      <span className="text-red-600">
                        ⚠ {assignment.stats.late} late
                      </span>
                      <span className="text-muted-foreground">
                        ({assignment.stats.submitted}/{totalStudents} total)
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => scheduleReminder(assignment.id, assignment.title)}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Schedule reminder
                    </Button>
                  </div>
                  
                  {openId === assignment.id && detail[assignment.id] && (
                    <div className="mt-3 bg-slate-50 dark:bg-slate-800/30 rounded p-3">
                      <h4 className="text-sm font-medium mb-2">Student Status</h4>
                      {detail[assignment.id].rows.map(sr => (
                        <StudentStatusRow
                          key={sr.student.id}
                          student={sr.student}
                          status={sr.status}
                          onReminder={(sid, name) => remindOne(assignment.id, sid, name)}
                        />
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherMyEssays;
