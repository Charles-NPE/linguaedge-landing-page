
import { useEffect, useState } from "react";
import { useProfileQuery } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";

export const useRequireProfileComplete = () => {
  const { user, profile } = useAuth();
  const { data: profileData, isLoading } = useProfileQuery(user?.id);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isLoading || !user?.id) return;
    
    // Don't show this modal for teachers - they have their own academy profile modal
    if (profile?.role === 'teacher') {
      setShowModal(false);
      return;
    }
    
    // Only show modal for students if profile exists but full_name is missing
    if (profileData) {
      const needsCompletion = !profileData.full_name?.trim();
      setShowModal(needsCompletion);
    } else {
      // If no profile data yet, don't show modal
      setShowModal(false);
    }
  }, [isLoading, profileData, user?.id, profile?.role]);

  return { showModal, dismiss: () => setShowModal(false) };
};
