import React from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import FeatureCard from "@/components/dashboards/FeatureCard";
import { BookOpen, BarChart, Users } from "lucide-react";

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Teacher Dashboard">
      <div className="mb-8">
        <h2 className="text-lg text-gray-600">
          Welcome back, {user?.email?.split('@')[0] || 'Teacher'}
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          title="Manage Classes"
          description="Create and organize classes, add students, and track progress."
          icon={Users}
        />
        <FeatureCard
          title="Assign Essays"
          description="Create new writing assignments for your students."
          icon={BookOpen}
        />
        <FeatureCard
          title="View Analytics"
          description="Track student progress and identify areas for improvement."
          icon={BarChart}
        />
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
