
import React, { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import AssignEssayModal from "@/components/assignments/AssignEssayModal";
import { useAuth } from "@/hooks/useAuth";
import { useClasses } from "@/hooks/useClasses";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus } from "lucide-react";

const TeacherAssign: React.FC = () => {
  const { user } = useAuth();
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const { data: classes = [], isLoading: classesLoading } = useClasses(user?.id);

  return (
    <DashboardLayout title="Assign Essays">
      <div className="mb-4">
        <Link to="/teacher" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="mb-6">
        <p className="text-slate-600 dark:text-slate-400">
          Create new writing assignments for your students.
        </p>
      </div>

      <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Create Assignment</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-4">
          Click the button below to create a new essay assignment for your classes
        </p>
        <Button onClick={() => setAssignModalOpen(true)}>
          <Plus className="mr-1 h-4 w-4" /> Create Assignment
        </Button>
      </div>

      <AssignEssayModal 
        open={assignModalOpen} 
        onOpenChange={setAssignModalOpen} 
        classes={classes} 
      />
    </DashboardLayout>
  );
};

export default TeacherAssign;
