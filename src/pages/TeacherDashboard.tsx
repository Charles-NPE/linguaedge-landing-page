
import React from "react";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useRequireProfileComplete } from "@/hooks/useRequireProfileComplete";
import { ProfileIncompleteModal } from "@/components/modals/ProfileIncompleteModal";
import { useAcademyProfileRequired } from "@/hooks/useAcademyProfileRequired";
import { AcademyProfileRequiredModal } from "@/components/modals/AcademyProfileRequiredModal";
import FeatureCard from "@/components/dashboards/FeatureCard";
import { Link } from "react-router-dom";
import { Users, BarChart3, FileText, PlusCircle } from "lucide-react";

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
    <DashboardLayout title="Teacher Dashboard">
      <div className="mb-8">
        <p className="text-lg text-slate-900 dark:text-white">
          Welcome, {profile?.full_name || "Teacher"}! Here's an overview of your
          classes and assignments.
        </p>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link to="/teacher/classes" className="block">
          <FeatureCard 
            title="My Classes" 
            description="Manage your classes, view students, and track progress." 
            icon={Users} 
          />
        </Link>
        
        <Link to="/teacher/essays" className="block">
          <FeatureCard 
            title="Essays & Corrections" 
            description="Review submitted essays and provide feedback to students." 
            icon={FileText} 
          />
        </Link>
        
        <Link to="/teacher/assign" className="block">
          <FeatureCard 
            title="Create Assignment" 
            description="Create new assignments and distribute them to your classes." 
            icon={PlusCircle} 
          />
        </Link>
        
        <Link to="/teacher/analytics" className="block">
          <FeatureCard 
            title="Analytics" 
            description="View detailed analytics and insights about student performance." 
            icon={BarChart3} 
          />
        </Link>
      </div>
      
      <ProfileIncompleteModal open={showModal} onClose={dismiss} />
      
      {/* Add the modal at the end */}
      <AcademyProfileRequiredModal 
        open={showNotification} 
        onClose={dismissNotification} 
      />
    </DashboardLayout>
  );
};

export default TeacherDashboard;
