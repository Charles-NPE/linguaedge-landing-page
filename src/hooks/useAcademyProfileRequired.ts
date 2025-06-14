
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const useAcademyProfileRequired = () => {
  const { user, profile } = useAuth();
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAcademyProfile = async () => {
      // Only check for teachers who are logged in
      if (!user?.id || profile?.role !== 'teacher') {
        setShowNotification(false);
        setIsCheckingProfile(false);
        return;
      }
      
      setIsCheckingProfile(true);
      
      try {
        const { data: academyProfile, error } = await supabase
          .from('academy_profiles')
          .select('academy_name, admin_name')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error("Error checking academy profile:", error);
          setShowNotification(false);
          setIsCheckingProfile(false);
          return;
        }

        console.log("Academy profile verification:", {
          hasProfile: !!academyProfile,
          academyName: academyProfile?.academy_name,
          adminName: academyProfile?.admin_name,
          academyNameEmpty: !academyProfile?.academy_name?.trim(),
          adminNameEmpty: !academyProfile?.admin_name?.trim()
        });

        // Check if we have a profile and both required fields are filled
        const hasCompleteProfile = academyProfile && 
          academyProfile.academy_name?.trim() && 
          academyProfile.admin_name?.trim();

        console.log("Profile is complete:", hasCompleteProfile);

        // Only show notification if profile is incomplete
        if (hasCompleteProfile) {
          setShowNotification(false);
        } else {
          setShowNotification(true);
          
          // Auto-redirect only if no profile exists at all
          if (!academyProfile) {
            setTimeout(() => {
              navigate('/profile');
            }, 3000);
          }
        }
      } catch (error) {
        console.error("Error checking academy profile:", error);
        setShowNotification(false);
      } finally {
        setIsCheckingProfile(false);
      }
    };

    // Only run the check if we have a user and profile
    if (user?.id && profile?.role === 'teacher') {
      checkAcademyProfile();
    } else {
      setShowNotification(false);
      setIsCheckingProfile(false);
    }
  }, [user?.id, profile?.role, navigate]);

  // Show toast notification when profile is incomplete
  useEffect(() => {
    if (showNotification) {
      toast({
        title: "Complete your academy profile",
        description: "To continue using LinguaEdgeAI, please complete your academy information in the profile.",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [showNotification, toast]);

  return {
    isCheckingProfile,
    showNotification,
    dismissNotification: () => setShowNotification(false)
  };
};
