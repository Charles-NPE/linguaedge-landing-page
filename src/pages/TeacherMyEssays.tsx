
import React, { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useTeacherEssays } from "@/hooks/useTeacherEssays";
import { useClasses } from "@/hooks/useClasses";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { Clock, Users, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Download } from "lucide-react";
import StudentStatusRow from "@/components/assignments/StudentStatusRow";
import ReminderModal from "@/components/reminders/ReminderModal";
import TeacherCorrectionView from "@/components/corrections/TeacherCorrectionView";
import { getCardColor, getStatusIcon } from "@/utils/cardHelpers.tsx";
import { exportStudentStatusToCSV } from "@/utils/csvExport";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import type { CheckedState } from "@radix-ui/react-checkbox";

type StatObj = { pending: number; submitted: number; late: number };

function toStats(j: any): StatObj {
  try {
    if (typeof j === "object") return j as StatObj;
    return JSON.parse(j) as StatObj;
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
  class_id: string;
  stats: StatObj;
};

interface DetailCache {
  [assignmentId: string]: {
    rows: {
      student: { id: string; full_name: string | null };
      status: "pending" | "submitted" | "late";
      submitted_at?: string | null;
      correction_id?: string | null;
      teacher_public_note?: string | null;
      has_feedback: boolean;
    }[];
  };
}

const TeacherMyEssays: React.FC = () => {
  const { user } = useAuth();
  const { data: rows = [], isLoading } = useTeacherEssays(user?.id);
  const { data: classes = [] } = useClasses(user?.id);
  const [openId, setOpenId] = useState<string | null>(null);
  const [detail, setDetail] = useState<DetailCache>({});
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), 0, 1), // Start of year
    to: new Date()
  });
  const [onlyIncomplete, setOnlyIncomplete] = useState(false);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<{
    id: string;
    title: string;
    studentId?: string;
    studentName?: string;
  } | null>(null);
  const [feedbackDrawerOpen, setFeedbackDrawerOpen] = useState(false);
  const [selectedCorrectionId, setSelectedCorrectionId] = useState<string | null>(null);

  const assignments = rows.map((r: any) => ({
    ...r,
    stats: toStats(r.stats)
  }));

  // Apply filters
  let filteredAssignments = assignments;

  // Filter by class
  if (selectedClassId !== "all") {
    filteredAssignments = filteredAssignments.filter(a => a.class_id === selectedClassId);
  }

  // Filter by date range
  filteredAssignments = filteredAssignments.filter(a => {
    const createdAt = new Date(a.created_at);
    return createdAt >= dateRange.from && createdAt <= dateRange.to;
  });

  // Filter by completion status
  if (onlyIncomplete) {
    filteredAssignments = filteredAssignments.filter(a => 
      a.stats.pending + a.stats.late > 0
    );
  }

  // Group assignments by class
  const grouped = filteredAssignments.reduce<Record<string, AssignmentRow[]>>(
    (acc, a) => {
      acc[a.class_id] ||= [];
      acc[a.class_id].push(a);
      return acc;
    },
    {}
  );

  const handleOnlyIncomplete = (checked: CheckedState) => {
    setOnlyIncomplete(checked === true);
  };

  const toggleDetail = async (id: string) => {
    if (openId === id) { 
      setOpenId(null); 
      return; 
    }
    setOpenId(id);
    
    if (detail[id]) return; // already cached
    
    // Use the new view instead of nested query
    const { data, error } = await supabase
      .from("v_assignment_student_status")
      .select(`
        status, 
        submitted_at,
        correction_id,
        teacher_public_note,
        has_feedback,
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
      status: r.status,
      submitted_at: r.submitted_at,
      correction_id: r.correction_id,
      teacher_public_note: r.teacher_public_note,
      has_feedback: r.has_feedback
    }));
    
    setDetail(prev => ({ ...prev, [id]: { rows } }));
  };

  const handleViewFeedback = (correctionId: string) => {
    setSelectedCorrectionId(correctionId);
    setFeedbackDrawerOpen(true);
  };

  const handleClassReminder = (assignmentId: string, assignmentTitle: string) => {
    setSelectedAssignment({
      id: assignmentId,
      title: assignmentTitle
    });
    setReminderModalOpen(true);
  };

  const handleStudentReminder = (assignmentId: string, assignmentTitle: string, studentId: string, studentName: string) => {
    setSelectedAssignment({
      id: assignmentId,
      title: assignmentTitle,
      studentId,
      studentName
    });
    setReminderModalOpen(true);
  };

  const handleExportCSV = (assignmentId: string, assignmentTitle: string, className: string) => {
    const assignmentDetail = detail[assignmentId];
    if (!assignmentDetail) {
      toast({ title: "Error", description: "Please expand the assignment first to load student data", variant: "destructive" });
      return;
    }
    
    exportStudentStatusToCSV(assignmentDetail.rows, assignmentTitle, className);
    toast({ title: "Success", description: "CSV file downloaded successfully" });
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
      
      {/* Filter Controls */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        {/* Class Filter */}
        <div className="min-w-64">
          <Select value={selectedClassId} onValueChange={setSelectedClassId}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All classes</SelectItem>
              {classes.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Filter */}
        <DateRangePicker
          value={dateRange}
          onChange={setDateRange}
        />

        {/* Status Filter */}
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="incomplete"
            checked={onlyIncomplete}
            onCheckedChange={handleOnlyIncomplete}
          />
          <label 
            htmlFor="incomplete" 
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Only incomplete
          </label>
        </div>
      </div>
      
      <div className="space-y-8">
        {Object.keys(grouped).length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">No assignments found matching your filters.</p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(grouped).map(([classId, list]) => (
            <section key={classId} className="space-y-4">
              {/* Show class header only if "All classes" is selected */}
              {selectedClassId === "all" && (
                <h3 className="text-base font-semibold flex items-center gap-1">
                  <Users className="h-4 w-4" /> {list[0].class_name}
                </h3>
              )}
              
              {list.map(assignment => {
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
                      <p className="text-sm text-muted-foreground">
                        {assignment.stats.submitted} of {totalStudents} have submitted
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
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleClassReminder(assignment.id, assignment.title)}
                          disabled={assignment.stats.pending + assignment.stats.late === 0}
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Remind Class
                        </Button>
                      </div>
                      
                      {openId === assignment.id && detail[assignment.id] && (
                        <div className="mt-3 bg-slate-50 dark:bg-slate-800/30 rounded p-3">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium">Student Status</h4>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleExportCSV(assignment.id, assignment.title, assignment.class_name)}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Export CSV
                            </Button>
                          </div>
                          {detail[assignment.id].rows.map(sr => (
                            <StudentStatusRow
                              key={sr.student.id}
                              student={sr.student}
                              status={sr.status}
                              submittedAt={sr.submitted_at}
                              correctionId={sr.correction_id}
                              onReminder={(studentId, studentName) => 
                                handleStudentReminder(assignment.id, assignment.title, studentId, studentName)
                              }
                              onViewFeedback={handleViewFeedback}
                            />
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </section>
          ))
        )}
      </div>

      {/* Reminder Modal */}
      {selectedAssignment && (
        <ReminderModal
          open={reminderModalOpen}
          onOpenChange={setReminderModalOpen}
          assignmentId={selectedAssignment.id}
          assignmentTitle={selectedAssignment.title}
          studentId={selectedAssignment.studentId}
          studentName={selectedAssignment.studentName}
        />
      )}

      {/* Feedback Drawer */}
      <Drawer open={feedbackDrawerOpen} onOpenChange={setFeedbackDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>Student Feedback - Teacher View</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto">
            {selectedCorrectionId && (
              <TeacherCorrectionView correctionId={selectedCorrectionId} />
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </DashboardLayout>
  );
};

export default TeacherMyEssays;
