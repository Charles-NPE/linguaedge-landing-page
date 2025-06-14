
import { useEffect, useState } from "react";
import { useProfileQuery } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";

export const useRequireProfileComplete = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfileQuery(user?.id);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isLoading || !user?.id) return;
    
    // Only show modal if we have confirmed the profile exists but full_name is missing
    if (profile) {
      const needsCompletion = !profile.full_name?.trim();
      setShowModal(needsCompletion);
    } else {
      // If no profile data yet, don't show modal
      setShowModal(false);
    }
  }, [isLoading, profile, user?.id]);

  return { showModal, dismiss: () => setShowModal(false) };
};
