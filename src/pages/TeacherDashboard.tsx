
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import FeatureCard from "@/components/dashboards/FeatureCard";
import { BookOpen, BarChart, Users } from "lucide-react";
import ManageSubscriptionCard from "@/components/subscription/ManageSubscriptionCard";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const { subscribed } = useSubscription();

  return (
    <DashboardLayout title="Teacher Dashboard">
      <div className="mb-8">
        <h2 className="text-lg text-gray-600">
          Welcome back, {user?.email?.split('@')[0] || 'Teacher'}
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
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
          
          {!subscribed && (
            <Card className="mt-6 border-dashed border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-center">Upgrade Your Account</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mb-4 text-muted-foreground">
                  Subscribe to access all features and help more students improve their language skills.
                </p>
                <Button asChild>
                  <Link to="/pricing">View Plans</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="md:col-span-1">
          <ManageSubscriptionCard />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
