
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, Users, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assignmentId: string;
  assignmentTitle: string;
  studentId?: string;
  studentName?: string;
}

const ReminderModal: React.FC<Props> = ({
  open,
  onOpenChange,
  assignmentId,
  assignmentTitle,
  studentId,
  studentName
}) => {
  const [reminderType, setReminderType] = useState<"class" | "individual">(
    studentId ? "individual" : "class"
  );
  const [timeOption, setTimeOption] = useState<string>("60");
  const [sendEmail, setSendEmail] = useState(true);
  const [sendDashboard, setSendDashboard] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const timeOptions = [
    { value: "30", label: "30 minutes" },
    { value: "60", label: "1 hour" },
    { value: "120", label: "2 hours" },
    { value: "240", label: "4 hours" },
    { value: "480", label: "8 hours" },
    { value: "1440", label: "1 day" },
    { value: "2880", label: "2 days" }
  ];

  const getNotificationChannel = () => {
    if (sendEmail && sendDashboard) return "both";
    if (sendEmail) return "email";
    if (sendDashboard) return "dashboard";
    return "email"; // fallback
  };

  const handleScheduleReminder = async () => {
    if (!sendEmail && !sendDashboard) {
      toast({
        title: "Selection required",
        description: "Please select at least one notification method.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const minutes = parseInt(timeOption);
      const runAt = new Date(Date.now() + minutes * 60000);
      const channel = getNotificationChannel();

      if (reminderType === "class") {
        // Use the database function to create reminders for all pending students
        const { data: reminderCount, error } = await supabase.rpc(
          "create_class_reminders",
          {
            _assignment_id: assignmentId,
            _run_at: runAt.toISOString(),
            _notification_channel: channel
          }
        );

        if (error) throw error;

        toast({
          title: "Class reminder scheduled",
          description: `Reminder scheduled for ${reminderCount} students in ${minutes} minutes`
        });
      } else {
        // Create reminder for individual student
        const { error } = await supabase.from("reminders").insert({
          assignment_id: assignmentId,
          student_id: studentId,
          run_at: runAt.toISOString(),
          notification_channel: channel
        });

        if (error) throw error;

        toast({
          title: "Reminder scheduled",
          description: `Reminder scheduled for ${studentName} in ${minutes} minutes`
        });
      }

      onOpenChange(false);
    } catch (error: any) {
      console.error("Error scheduling reminder:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to schedule reminder",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Reminder</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-sm text-muted-foreground">
            Assignment: <span className="font-medium">{assignmentTitle}</span>
          </div>

          {/* Reminder Type Selection */}
          <div>
            <Label className="text-base font-medium">Send reminder to:</Label>
            <RadioGroup 
              value={reminderType} 
              onValueChange={(v) => setReminderType(v as "class" | "individual")}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="class" id="class" disabled={!!studentId} />
                <Label htmlFor="class" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Entire class (pending students only)
                </Label>
              </div>
              {studentId && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="individual" id="individual" />
                  <Label htmlFor="individual" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {studentName || "Selected student"}
                  </Label>
                </div>
              )}
            </RadioGroup>
          </div>

          {/* Time Selection */}
          <div>
            <Label className="text-base font-medium">Send reminder in:</Label>
            <Select value={timeOption} onValueChange={setTimeOption}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notification Channel Selection */}
          <div>
            <Label className="text-base font-medium">Notification method:</Label>
            <div className="mt-2 space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="email" 
                  checked={sendEmail} 
                  onCheckedChange={setSendEmail}
                />
                <Label htmlFor="email">Send email notification</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="dashboard" 
                  checked={sendDashboard} 
                  onCheckedChange={setSendDashboard}
                />
                <Label htmlFor="dashboard">Send dashboard notification</Label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleScheduleReminder}
            disabled={isLoading || (!sendEmail && !sendDashboard)}
          >
            {isLoading ? "Scheduling..." : "Schedule Reminder"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReminderModal;
