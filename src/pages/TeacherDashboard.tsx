import React from "react";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useRequireProfileComplete } from "@/hooks/useRequireProfileComplete";
import { ProfileIncompleteModal } from "@/components/modals/ProfileIncompleteModal";
import { useAcademyProfileRequired } from "@/hooks/useAcademyProfileRequired";
import { AcademyProfileRequiredModal } from "@/components/modals/AcademyProfileRequiredModal";

const TeacherDashboard = () => {
  const { profile } = useAuth();
  const { showModal, dismiss } = useRequireProfileComplete();
  
  // Add academy profile check
  const { 
    isCheckingProfile, 
    showNotification, 
    dismissNotification 
  } = useAcademyProfileRequired();

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-4">Teacher Dashboard</h1>
      <p>
        Welcome, {profile?.full_name || "Teacher"}! Here's an overview of your
        classes and assignments.
      </p>
      
      <ProfileIncompleteModal open={showModal} />
      
      {/* Add the modal at the end */}
      <AcademyProfileRequiredModal 
        open={showNotification} 
        onClose={dismissNotification} 
      />
    </DashboardLayout>
  );
};

export default TeacherDashboard;
