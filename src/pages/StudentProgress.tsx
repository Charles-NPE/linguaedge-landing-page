
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, TrendingUp, BookOpen, Target } from "lucide-react";

const StudentProgress: React.FC = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout title="My Progress">
      <div className="mb-8">
        <h2 className="text-lg text-slate-900 dark:text-white">
          Track your writing improvement over time
        </h2>
        <p className="text-muted-foreground mt-1">
          View your essay statistics, writing trends, and areas for improvement.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Essays</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Essays submitted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Words</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Per essay
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improvement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Since last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Level</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Based on recent essays
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Writing Progress Over Time</CardTitle>
            <CardDescription>
              Track your improvement across different writing aspects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              <div className="text-center">
                <LineChart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No data available yet</p>
                <p className="text-sm">Submit essays to see your progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Areas for Improvement</CardTitle>
            <CardDescription>
              Focus areas based on recent feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              <div className="text-center">
                <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No feedback data yet</p>
                <p className="text-sm">Complete assignments to get insights</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Your latest essay submissions and corrections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default StudentProgress;
