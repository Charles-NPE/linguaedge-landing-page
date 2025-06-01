
import { useEffect, useState } from "react";
import { useProfileQuery } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";

export const useRequireProfileComplete = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfileQuery(user?.id);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isLoading || !profile) return;
    // Extra guard: only show modal when we have profile data and it's incomplete
    const needsCompletion = !isLoading && profile && !profile.full_name?.trim();
    setShowModal(needsCompletion);
  }, [isLoading, profile]);

  return { showModal, dismiss: () => setShowModal(false) };
};
