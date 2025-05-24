
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Clock, AlertTriangle, Mail } from "lucide-react";

interface Props {
  student: { id: string; full_name: string | null };
  status: "pending" | "submitted" | "late";
  onReminder: (studentId: string, name: string | null) => void;
}

const icon = {
  submitted: <Check className="text-green-600" size={16} />,
  pending:   <Clock className="text-yellow-600" size={16} />,
  late:      <AlertTriangle className="text-red-600" size={16} />
};

const StudentStatusRow: React.FC<Props> = ({ student, status, onReminder }) => (
  <div className="flex justify-between items-center py-1 border-b last:border-0">
    <div className="flex items-center gap-2">
      {icon[status]}
      <span>{student.full_name ?? "Unnamed"}</span>
    </div>
    {status !== "submitted" && (
      <Button
        size="sm"
        variant="ghost"
        title="Send reminder"
        onClick={() => onReminder(student.id, student.full_name)}
        className="h-auto p-1"
      >
        <Mail size={16} />
      </Button>
    )}
  </div>
);

export default StudentStatusRow;
