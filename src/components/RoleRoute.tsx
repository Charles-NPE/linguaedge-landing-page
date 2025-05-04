
import React from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
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
    return <Navigate to={redirectTo} replace />;
  }

  // Check if user role is allowed
  const userRole = profile?.role;
  const isAllowed = userRole && allowed.includes(userRole);

  if (!isAllowed) {
    // Redirect based on role
    if (userRole === 'teacher') {
      return <Navigate to="/teacher" replace />;
    } else {
      return <Navigate to="/student" replace />;
    }
  }

  // For teachers, check subscription status
  if (userRole === 'teacher') {
    const hasValidSubscription = 
      profile?.stripe_status === 'active' || 
      profile?.stripe_status === 'trialing';
    
    if (!hasValidSubscription) {
      return <Navigate to="/pricing?error=subscription" replace />;
    }
  }

  // If there are children, render them, otherwise render an Outlet
  return <>{children || <Outlet />}</>;
};

export default RoleRoute;
