
import React, { useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth.types";

interface RoleRouteProps {
  allowed: UserRole[];
  redirectTo?: string;
  requireSubscription?: boolean;
  children?: React.ReactNode;
}

const RoleRoute: React.FC<RoleRouteProps> = ({ 
  allowed, 
  redirectTo = "/login", 
  requireSubscription = false,
  children 
}) => {
  const { user, isLoading, profile, isSubscriptionActive, checkSubscription } = useAuth();
  const navigate = useNavigate();

  // Check subscription status when component mounts if access requires subscription
  useEffect(() => {
    if (user && profile?.role === 'teacher' && requireSubscription) {
      checkSubscription();
    }
  }, [user, profile, requireSubscription, checkSubscription]);

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
    const redirectPath = userRole === 'teacher' ? "/teacher" : "/student";
    return <Navigate to={redirectPath} replace />;
  }

  // Always enforce subscription check for teachers
  // Even if the route doesn't explicitly require subscription
  if (userRole === 'teacher' && !isSubscriptionActive) {
    return <Navigate to="/pricing?subscription=inactive" replace />;
  }

  // If there are children, render them, otherwise render an Outlet
  return <>{children || <Outlet />}</>;
};

export default RoleRoute;
