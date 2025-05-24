import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import FeatureCard from "@/components/dashboards/FeatureCard";
import AssignEssayModal from "@/components/assignments/AssignEssayModal";
import { BookOpen, BarChart, Users, CreditCard, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const TeacherDashboard: React.FC = () => {
  const {
    user,
    profile,
    isSubscriptionActive,
    checkSubscription
  } = useAuth();
  const navigate = useNavigate();
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [classes, setClasses] = useState<{id: string; name: string}[]>([]);

  // Fetch teacher's classes
  useEffect(() => {
    if (!user) return;
    supabase
      .from("classes")
      .select("id, name")
      .eq("teacher_id", user.id)
      .then(({ data }) => setClasses(data ?? []));
  }, [user]);

  useEffect(() => {
    // Check subscription when the dashboard loads
    const checkSubscriptionStatus = async () => {
      try {
        await checkSubscription();
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    };
    checkSubscriptionStatus();

    // Check for successful checkout in URL params
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      toast({
        title: "Subscription Active",
        description: "Your subscription has been activated successfully."
      });

      // Clean the URL
      navigate('/teacher', {
        replace: true
      });
    }
  }, [checkSubscription, navigate]);

  // Route guard: redirect to pricing if no active subscription
  useEffect(() => {
    if (profile && profile.role === 'teacher' && profile.stripe_status !== undefined && !isSubscriptionActive && !['active', 'trialing'].includes(profile.stripe_status || '')) {
      navigate('/pricing?subscription=inactive');
    }
  }, [profile, isSubscriptionActive, navigate]);

  // Show a loading state until we determine subscription status
  if (profile?.role === 'teacher' && profile.stripe_status === undefined) {
    return <DashboardLayout title="Teacher Dashboard">
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </DashboardLayout>;
  }
  
  return <DashboardLayout title="Teacher Dashboard">
      <div className="mb-8">
        <h2 className="text-lg text-slate-900 dark:text-slate-100">
          Welcome back, {user?.email?.split('@')[0] || 'Teacher'}
        </h2>
        
        {/* Show subscription status */}
        {profile?.stripe_status && <div className="mt-4">
            
          </div>}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link to="/teacher/classes" className="block">
          <FeatureCard 
            title="Manage Classes" 
            description="Create and organize classes, add students, and track progress." 
            icon={Users} 
          />
        </Link>
        <div className="card cursor-pointer" onClick={() => setAssignModalOpen(true)}>
          <FeatureCard 
            title="Assign Essays" 
            description="Create new writing assignments for your students." 
            icon={BookOpen} 
          />
        </div>
        <Link to="/teacher/essays" className="block">
          <FeatureCard 
            title="My Essays" 
            description="View all assignments with delivery stats and schedule reminders." 
            icon={FileText} 
          />
        </Link>
        <div className="card">
          <FeatureCard 
            title="View Analytics" 
            description="Track student progress and identify areas for improvement." 
            icon={BarChart} 
          />
        </div>
      </div>

      <AssignEssayModal 
        open={assignModalOpen} 
        onOpenChange={setAssignModalOpen} 
        classes={classes} 
      />
    </DashboardLayout>;
};

export default TeacherDashboard;
