
import React, { useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth.types";

interface RoleRouteProps {
  allowed: UserRole[];
  redirectTo?: string;
  children?: React.ReactNode;
}

const RoleRoute: React.FC<RoleRouteProps> = ({ 
  allowed, 
  redirectTo = "/login", 
  children 
}) => {
  const { user, isLoading, profile } = useAuth();
  const navigate = useNavigate();

  // Add debugging to help diagnose issues
  useEffect(() => {
    console.log("RoleRoute rendered with:", {
      isLoading,
      user: user?.id,
      profile: profile?.role,
      allowed
    });
  }, [isLoading, user, profile, allowed]);

  if (isLoading) {
    // Show loading state
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    console.log("User not authenticated, redirecting to:", redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  // Check if user role is allowed
  const userRole = profile?.role;
  console.log("Checking if role is allowed:", { userRole, allowed });
  
  const isAllowed = userRole && allowed.includes(userRole);

  if (!isAllowed) {
    // Redirect based on role
    const redirectPath = userRole === 'teacher' ? "/teacher" : "/student";
    console.log("Role not allowed, redirecting to:", redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  console.log("Role is allowed, rendering component/outlet");
  // If there are children, render them, otherwise render an Outlet
  return <>{children || <Outlet />}</>;
};

export default RoleRoute;
