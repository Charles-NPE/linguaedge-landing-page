
import React, { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useRequireProfileComplete } from "@/hooks/useRequireProfileComplete";
import { ProfileIncompleteModal } from "@/components/modals/ProfileIncompleteModal";
import { useAcademyProfileRequired } from "@/hooks/useAcademyProfileRequired";
import { AcademyProfileRequiredModal } from "@/components/modals/AcademyProfileRequiredModal";
import FeatureCard from "@/components/dashboards/FeatureCard";
import { Link } from "react-router-dom";
import { Users, BarChart3, FileText, PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const TeacherDashboard = () => {
  const { profile, user } = useAuth();
  const { showModal, dismiss } = useRequireProfileComplete();
  const [academyProfile, setAcademyProfile] = useState<any>(null);
  
  // Add academy profile check
  const { 
    isCheckingProfile, 
    showNotification, 
    dismissNotification 
  } = useAcademyProfileRequired();

  // Fetch academy profile data
  useEffect(() => {
    const fetchAcademyProfile = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('academy_profiles')
          .select('admin_name')
          .eq('user_id', user.id)
          .single();
          
        if (data && !error) {
          setAcademyProfile(data);
        }
      } catch (error) {
        console.error("Error fetching academy profile:", error);
      }
    };
    
    fetchAcademyProfile();
  }, [user]);

  // Get display name from academy profile or fallback
  const getDisplayName = () => {
    if (academyProfile?.admin_name && academyProfile.admin_name.trim()) {
      return academyProfile.admin_name;
    }
    if (profile?.full_name && profile.full_name.trim()) {
      return profile.full_name;
    }
    return user?.email?.split('@')[0] || 'Teacher';
  };

  return (
    <DashboardLayout title="Teacher Dashboard">
      <div className="mb-8">
        <p className="text-lg text-slate-900 dark:text-white">
          Welcome, {getDisplayName()}! Here's an overview of your
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
