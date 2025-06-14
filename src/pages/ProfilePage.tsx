
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
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Información requerida:</strong> Los campos "Nombre de la Academia" y "Nombre del Administrador" 
            son obligatorios para continuar usando LinguaEdgeAI.
          </AlertDescription>
        </Alert>
      )}
      
      {isStudent ? <StudentProfileForm /> : <AcademyProfileForm />}
    </div>
  );
};

export default ProfilePage;
