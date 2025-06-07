
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Eye } from "lucide-react";
import { format } from "date-fns";

interface Props {
  student: { id: string; full_name: string | null };
  status: "pending" | "submitted" | "late";
  submittedAt?: string | null;
  correctionId?: string | null;
  onReminder: (studentId: string, studentName: string) => void;
  onViewFeedback?: (correctionId: string) => void;
}

const StudentStatusRow: React.FC<Props> = ({ 
  student, 
  status, 
  submittedAt, 
  correctionId,
  onReminder,
  onViewFeedback
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case "submitted":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Submitted</Badge>;
      case "late":
        return <Badge variant="destructive">Late</Badge>;
      default:
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const showReminderButton = status === "pending" || status === "late";
  const showFeedbackButton = correctionId && onViewFeedback;

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-white dark:bg-slate-800 rounded border">
      <div className="flex items-center gap-3">
        <span className="font-medium">
          {student.full_name || `Student ${student.id.slice(0, 6)}`}
        </span>
        {getStatusBadge()}
        {submittedAt && (
          <span className={`text-xs ${status === "late" ? "text-red-600" : "text-muted-foreground"}`}>
            {format(new Date(submittedAt), "PPp")}
          </span>
        )}
        {!submittedAt && status !== "submitted" && (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {showFeedbackButton && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onViewFeedback!(correctionId!)}
            className="h-8 w-8 p-0"
            title="View feedback"
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}
        
        {showReminderButton && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onReminder(student.id, student.full_name || "Student")}
            className="h-8 w-8 p-0"
            title={`Send reminder to ${student.full_name || "student"}`}
          >
            <Mail className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default StudentStatusRow;
