
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, Minus, BookOpen, Target, LineChart as LineChartIcon, Award } from "lucide-react";
import { useProgressData } from "@/hooks/useProgressData";

const StudentProgress: React.FC = () => {
  const { user } = useAuth();
  const { data: progressData, isLoading, error } = useProgressData(user?.id || "");

  const getLevelColor = (level: string) => {
    const colors = {
      'A1': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      'A2': 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      'B1': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      'B2': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'C1': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'C2': 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down": return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendText = (trend: string) => {
    switch (trend) {
      case "up": return "Improving";
      case "down": return "Needs attention";
      default: return "Stable";
    }
  };

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (isLoading) {
    return (
      <DashboardLayout title="My Progress">
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="My Progress">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-red-500">Error loading progress data. Please try again.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (!progressData || progressData.totalEssays === 0) {
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
              <LineChartIcon className="h-4 w-4 text-muted-foreground" />
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
                  <LineChartIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
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
  }

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
            <div className="text-2xl font-bold">{progressData.totalEssays}</div>
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
            <div className="text-2xl font-bold">{progressData.averageWords}</div>
            <p className="text-xs text-muted-foreground">
              Per essay
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improvement</CardTitle>
            {getTrendIcon(progressData.improvementTrend)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTrendText(progressData.improvementTrend)}</div>
            <p className="text-xs text-muted-foreground">
              Based on error density
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Level</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge className={getLevelColor(progressData.currentLevel)}>
                {progressData.currentLevel}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Based on recent essays
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Word Count Evolution */}
        <Card>
          <CardHeader>
            <CardTitle>Word Count Evolution</CardTitle>
            <CardDescription>
              Track how your essay length changes over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={progressData.wordCountTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="words" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Error Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Error Distribution</CardTitle>
            <CardDescription>
              Breakdown of error types across all essays
            </CardDescription>
          </CardHeader>
          <CardContent>
            {progressData.errorsByType.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={progressData.errorsByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {progressData.errorsByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                <div className="text-center">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No errors found</p>
                  <p className="text-sm">Great job!</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Density Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Error Density Over Time</CardTitle>
            <CardDescription>
              Errors per 100 words (lower is better)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={progressData.errorDensityTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} errors/100 words`, 'Error Density']} />
                <Line type="monotone" dataKey="density" stroke="#ff7300" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lexical Diversity */}
        <Card>
          <CardHeader>
            <CardTitle>Lexical Diversity</CardTitle>
            <CardDescription>
              Vocabulary richness (unique words / total words)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={progressData.lexicalDiversityTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 1]} />
                <Tooltip formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`, 'Diversity']} />
                <Line type="monotone" dataKey="ratio" stroke="#00C49F" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Level History */}
      <Card>
        <CardHeader>
          <CardTitle>Level History</CardTitle>
          <CardDescription>
            Your CEFR level progression over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progressData.levelHistory.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {progressData.levelHistory.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <span className="text-sm text-muted-foreground">{entry.date}</span>
                    <Badge className={getLevelColor(entry.level)}>
                      {entry.level}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32 text-muted-foreground">
                <div className="text-center">
                  <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No level data available</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default StudentProgress;
