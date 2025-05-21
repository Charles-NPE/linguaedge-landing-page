
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import StudentProfileForm from "@/components/profile/StudentProfileForm";
import AcademyProfileForm from "@/components/profile/AcademyProfileForm";

const ProfilePage = () => {
  const { profile } = useAuth();
  const isStudent = profile?.role === 'student';
  
  return isStudent ? <StudentProfileForm /> : <AcademyProfileForm />;
};

export default ProfilePage;
