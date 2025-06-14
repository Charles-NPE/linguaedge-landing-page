
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
      // Only check for teachers
      if (!user?.id || profile?.role !== 'teacher') return;
      
      setIsCheckingProfile(true);
      
      try {
        const { data: academyProfile, error } = await supabase
          .from('academy_profiles')
          .select('academy_name, admin_name')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error("Error checking academy profile:", error);
          return;
        }

        // Check if profile is incomplete (academy_name and admin_name are required)
        const isProfileIncomplete = !academyProfile || 
          !academyProfile.academy_name?.trim() || 
          !academyProfile.admin_name?.trim();

        if (isProfileIncomplete) {
          // Show notification first
          setShowNotification(true);
          
          // Auto-redirect if completely empty (no record at all)
          if (!academyProfile) {
            setTimeout(() => {
              navigate('/profile');
            }, 3000); // Give time to see the notification
          }
        }
      } catch (error) {
        console.error("Error checking academy profile:", error);
      } finally {
        setIsCheckingProfile(false);
      }
    };

    checkAcademyProfile();
  }, [user, profile, navigate]);

  // Show toast notification when profile is incomplete
  useEffect(() => {
    if (showNotification) {
      toast({
        title: "Complete su perfil de academia",
        description: "Para continuar usando LinguaEdgeAI, complete la información de su academia en el perfil.",
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
