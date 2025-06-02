
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";

interface Props {
  student: { id: string; full_name: string | null };
  status: "pending" | "submitted" | "late";
  onReminder: (studentId: string, studentName: string) => void;
}

const StudentStatusRow: React.FC<Props> = ({ student, status, onReminder }) => {
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

  return (
    <div className="flex items-center justify-between py-2 px-3 bg-white dark:bg-slate-800 rounded border">
      <div className="flex items-center gap-3">
        <span className="font-medium">
          {student.full_name || `Student ${student.id.slice(0, 6)}`}
        </span>
        {getStatusBadge()}
      </div>
      
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
  );
};

export default StudentStatusRow;
