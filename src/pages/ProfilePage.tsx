
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import StudentProfileForm from "@/components/profile/StudentProfileForm";
import AcademyProfileForm from "@/components/profile/AcademyProfileForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const ProfilePage = () => {
  const { profile } = useAuth();
  const isStudent = profile?.role === 'student';
  const isTeacher = profile?.role === 'teacher';
  
  return (
    <div>
      {isTeacher && (
        <Alert className="mb-6 border-primary/20 bg-primary/5">
          <AlertTriangle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-slate-800 dark:text-slate-200">
            <strong>Required Information:</strong> The "Academy Name" and "Admin Name" 
            fields are required to continue using LinguaEdgeAI.
          </AlertDescription>
        </Alert>
      )}
      
      {isStudent ? <StudentProfileForm /> : <AcademyProfileForm />}
    </div>
  );
};

export default ProfilePage;
