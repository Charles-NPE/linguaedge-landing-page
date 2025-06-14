
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export const BackToDashboard: React.FC = () => {
  const { profile } = useAuth();
  
  // Determine the correct dashboard path based on user role
  const dashboardPath = profile?.role === 'teacher' ? '/teacher' : '/student';
  
  return (
    <div className="mb-6">
      <Button asChild variant="ghost" size="sm" className="gap-1">
        <Link to={dashboardPath}>
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>
    </div>
  );
};
