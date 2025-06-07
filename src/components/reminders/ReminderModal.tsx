
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckedState } from "@radix-ui/react-checkbox";
import { Clock, Users, User } from "lucide-react";

interface ReminderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: string;
  assignmentTitle: string;
  studentId?: string;
  studentName?: string;
}

interface PendingStudent {
  student_id: string;
  student_name: string;
}

const ReminderModal: React.FC<ReminderModalProps> = ({
  open,
  onOpenChange,
  assignmentId,
  assignmentTitle,
  studentId,
  studentName
}) => {
  const [timing, setTiming] = useState<"15min" | "1hour" | "1day" | "3days">("1hour");
  const [sendEmail, setSendEmail] = useState(true);
  const [sendDashboard, setSendDashboard] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingStudents, setPendingStudents] = useState<PendingStudent[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string>("all");

  const isClassReminder = !studentId;

  const timeOptions = [
    { value: "15min", label: "15 minutes" },
    { value: "1hour", label: "1 hour" },
    { value: "1day", label: "1 day" },
    { value: "3days", label: "3 days" },
  ];

  // Load pending students when modal opens for class reminders
  useEffect(() => {
    if (open && isClassReminder) {
      loadPendingStudents();
    }
  }, [open, isClassReminder, assignmentId]);

  const loadPendingStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("v_assignment_student_status")
        .select("student_id, student_name")
        .eq("assignment_id", assignmentId)
        .in("status", ["pending", "late"]);

      if (error) throw error;

      setPendingStudents(data || []);
      setSelectedStudents("all"); // Default to all students
    } catch (error) {
      console.error("Error loading pending students:", error);
      toast({
        title: "Error",
        description: "Failed to load pending students",
        variant: "destructive"
      });
    }
  };

  const getRunAt = () => {
    const now = new Date();
    switch (timing) {
      case "15min":
        return new Date(now.getTime() + 15 * 60 * 1000);
      case "1hour":
        return new Date(now.getTime() + 60 * 60 * 1000);
      case "1day":
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case "3days":
        return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 60 * 60 * 1000);
    }
  };

  const getNotificationChannel = () => {
    if (sendEmail && sendDashboard) return "both";
    if (sendEmail) return "email";
    if (sendDashboard) return "dashboard";
    return "email"; // fallback
  };

  const handleScheduleReminder = async () => {
    if (!sendEmail && !sendDashboard) {
      toast({
        title: "Error",
        description: "Please select at least one notification method",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const runAt = getRunAt();
      const channel = getNotificationChannel();

      if (isClassReminder) {
        if (selectedStudents === "all") {
          // Use the existing function to create reminders for all pending students
          const { data, error } = await supabase.rpc("create_class_reminders", {
            _assignment_id: assignmentId,
            _run_at: runAt.toISOString(),
            _notification_channel: channel
          });

          if (error) throw error;

          toast({
            title: "Reminders Scheduled",
            description: `${data} reminder(s) scheduled for pending students`
          });
        } else {
          // Create reminder for specific student
          const { error } = await supabase
            .from("reminders")
            .insert({
              assignment_id: assignmentId,
              student_id: selectedStudents,
              run_at: runAt.toISOString(),
              notification_channel: channel
            });

          if (error) throw error;

          const selectedStudent = pendingStudents.find(s => s.student_id === selectedStudents);
          toast({
            title: "Reminder Scheduled",
            description: `Reminder scheduled for ${selectedStudent?.student_name || "student"}`
          });
        }
      } else {
        // Create reminder for specific student (individual reminder)
        const { error } = await supabase
          .from("reminders")
          .insert({
            assignment_id: assignmentId,
            student_id: studentId,
            run_at: runAt.toISOString(),
            notification_channel: channel
          });

        if (error) throw error;

        toast({
          title: "Reminder Scheduled",
          description: `Reminder scheduled for ${studentName}`
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error scheduling reminder:", error);
      toast({
        title: "Error",
        description: "Failed to schedule reminder",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (checked: CheckedState) => {
    setSendEmail(checked === true);
  };

  const handleDashboardChange = (checked: CheckedState) => {
    setSendDashboard(checked === true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Schedule Reminder
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Assignment</Label>
            <p className="text-sm text-muted-foreground mt-1">{assignmentTitle}</p>
          </div>

          <div>
            <Label className="text-sm font-medium">Recipients</Label>
            {isClassReminder ? (
              <div className="mt-2 space-y-2">
                <p className="text-sm text-muted-foreground">
                  {pendingStudents.length} pending student(s)
                </p>
                {pendingStudents.length > 1 && (
                  <Select value={selectedStudents} onValueChange={setSelectedStudents}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select students" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All pending students</SelectItem>
                      {pendingStudents.map((student) => (
                        <SelectItem key={student.student_id} value={student.student_id}>
                          {student.student_name || `Student ${student.student_id.slice(0, 6)}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {pendingStudents.length === 1 && (
                  <p className="text-sm text-muted-foreground">
                    {pendingStudents[0].student_name || `Student ${pendingStudents[0].student_id.slice(0, 6)}`}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">{studentName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="timing">Send reminder in</Label>
            <Select value={timing} onValueChange={(v) => setTiming(v as any)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select timing" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Notification Methods</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="email"
                checked={sendEmail}
                onCheckedChange={handleEmailChange}
              />
              <Label htmlFor="email" className="text-sm">Send email notification</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dashboard"
                checked={sendDashboard}
                onCheckedChange={handleDashboardChange}
              />
              <Label htmlFor="dashboard" className="text-sm">Send dashboard notification</Label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleScheduleReminder}
              disabled={isLoading || (isClassReminder && pendingStudents.length === 0)}
              className="flex-1"
            >
              {isLoading ? "Scheduling..." : "Schedule Reminder"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReminderModal;
