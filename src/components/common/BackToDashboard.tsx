
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const BackToDashboard: React.FC = () => (
  <div className="mb-6">
    <Button asChild variant="ghost" size="sm" className="gap-1">
      <Link to="/student">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>
    </Button>
  </div>
);
