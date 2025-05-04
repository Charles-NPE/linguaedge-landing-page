import React from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import FeatureCard from "@/components/dashboards/FeatureCard";
import { PenTool, FileCheck, LineChart } from "lucide-react";

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="mb-8">
        <h2 className="text-lg text-gray-600">
          Welcome back, {user?.email?.split('@')[0] || 'Student'}
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          title="Submit Essay"
          description="Write and submit a new essay for AI and teacher feedback."
          icon={PenTool}
        />
        <FeatureCard
          title="My Corrections"
          description="Review feedback and corrections on your submitted essays."
          icon={FileCheck}
        />
        <FeatureCard
          title="Progress"
          description="Track your improvement over time and identify areas to focus on."
          icon={LineChart}
        />
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
