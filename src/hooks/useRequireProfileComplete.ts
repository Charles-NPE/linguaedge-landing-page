
import { useEffect, useState } from "react";
import { useProfileQuery } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";

export const useRequireProfileComplete = () => {
  const { user } = useAuth();
  const { data: profile, isLoading } = useProfileQuery(user?.id);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isLoading || !profile) return;
    const needsCompletion = !profile.full_name?.trim();
    setShowModal(needsCompletion);
  }, [isLoading, profile]);

  return { showModal, dismiss: () => setShowModal(false) };
};
