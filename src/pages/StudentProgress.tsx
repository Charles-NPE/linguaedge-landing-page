import React from "react";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { TrendingUp, TrendingDown, Minus, BookOpen, Target, LineChartIcon, Award, BarChart3, FileText } from "lucide-react";
import { useProgressData } from "@/hooks/useProgressData";
import { InfoButton } from "@/components/ui/InfoButton";

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

  const getAvgErrorDensity = () => {
    if (!progressData || progressData.errorDensityTrend.length === 0) return 0;
    const total = progressData.errorDensityTrend.reduce((sum, entry) => sum + entry.density, 0);
    return total / progressData.errorDensityTrend.length;
  };

  // Colors for pie chart with consistent mapping
  const ERROR_COLORS = {
    Grammar: "#0088FE",
    Vocabulary: "#00C49F", 
    Cohesion: "#FFBB28",
    Other: "#FF8042",
  };

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

        <Card className="text-center py-12">
          <CardContent>
            <LineChartIcon className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2 text-slate-900 dark:text-white">No progress data yet</h3>
            <p className="text-muted-foreground mb-4">
              Submit an essay to start tracking your writing progress.
            </p>
            <p className="text-sm text-muted-foreground">
              Once you complete assignments, you'll see detailed analytics about your improvement over time.
            </p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  // Prepare error breakdown data - filter out zero counts
  const errorBreakdownData = Object.entries({
    Grammar: progressData.errorsByType.find(e => e.type === "Grammar")?.count || 0,
    Vocabulary: progressData.errorsByType.find(e => e.type === "Vocabulary")?.count || 0,
    Cohesion: progressData.errorsByType.find(e => e.type === "Cohesion")?.count || 0,
    Other: progressData.errorsByType.find(e => e.type === "Other")?.count || 0,
  })
    .filter(([, count]) => count > 0)
    .map(([type, count]) => ({ 
      type, 
      count, 
      fill: ERROR_COLORS[type as keyof typeof ERROR_COLORS] 
    }));

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

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              Essays Submitted
              <InfoButton text="Total number of essays you have submitted for correction." />
            </CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressData.totalEssays}</div>
            <p className="text-xs text-muted-foreground">
              Total submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              Average Length
              <InfoButton text="Number of words per essay. Higher word count within the recommended range usually means fuller ideas." />
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressData.averageWords}</div>
            <p className="text-xs text-muted-foreground">
              Words per essay
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              Error Rate
              <InfoButton text="Total errors divided by essay length × 100. Fewer errors per 100 words indicates better accuracy." />
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAvgErrorDensity().toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Errors per 100 words
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              Current Level
              <InfoButton text="Level assigned by AI to your most recent essay following the CEFR scale (A1–C2)." />
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge className={getLevelColor(progressData.currentLevel)}>
                {progressData.currentLevel}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Most recent assessment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Improvement Trend Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getTrendIcon(progressData.improvementTrend)}
            Overall Progress
          </CardTitle>
          <CardDescription>
            Your writing improvement trend based on recent essays
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-lg font-medium mb-2">
            Status: <span className={
              progressData.improvementTrend === "up" ? "text-green-600" :
              progressData.improvementTrend === "down" ? "text-red-600" : 
              "text-gray-600"
            }>
              {getTrendText(progressData.improvementTrend)}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {progressData.improvementTrend === "up" 
              ? "Great job! Your error rate has been decreasing over time." 
              : progressData.improvementTrend === "down"
              ? "Your recent essays show more errors. Consider reviewing feedback and practicing more."
              : "Your performance has been consistent. Keep up the good work!"}
          </p>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2 mb-8">
        {/* Word Count Evolution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              Essay Length Over Time
              <InfoButton text="Number of words you write in each essay. Aim for the recommended range in the assignment." />
            </CardTitle>
            <CardDescription>
              Evolution of your essay length (words per submission)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ minWidth: "240px" }}>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={progressData.wordCountTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} words`, 'Length']} />
                  <Line type="monotone" dataKey="words" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Error Density Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              Error Rate Over Time
              <InfoButton text="Total errors divided by essay length × 100. Fewer errors per 100 words indicates better accuracy." />
            </CardTitle>
            <CardDescription>
              Errors per 100 words (lower is better)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ minWidth: "240px" }}>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={progressData.errorDensityTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} errors/100 words`, 'Error Rate']} />
                  <Line type="monotone" dataKey="density" stroke="#ff7300" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Lexical Diversity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              Vocabulary Richness
              <InfoButton text="Unique words / total words. Closer to 1 = more varied vocabulary." />
            </CardTitle>
            <CardDescription>
              Lexical diversity (unique words / total words)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div style={{ minWidth: "240px" }}>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={progressData.lexicalDiversityTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 1]} />
                  <Tooltip formatter={(value) => [`${(Number(value) * 100).toFixed(1)}%`, 'Diversity']} />
                  <Line type="monotone" dataKey="ratio" stroke="#00C49F" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Error Distribution */}
        <Card className="overflow-visible">
          <CardHeader>
            <CardTitle className="flex items-center">
              Error Types Breakdown
              <InfoButton text="Percentage of each error category (grammar, vocabulary, cohesion, other) across all your essays." />
            </CardTitle>
            <CardDescription>
              Distribution of error types across all essays
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errorBreakdownData.length > 0 ? (
              <div style={{ minWidth: "240px" }}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={errorBreakdownData}
                      cx="50%"
                      cy="40%"
                      labelLine={false}
                      label={({ type, percent }) => `${type} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {errorBreakdownData.map((entry) => (
                        <Cell key={entry.type} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, _name, props) => {
                        const { type } = props.payload;
                        return [`${value} errors`, type];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="mt-4 flex flex-wrap justify-center gap-3 text-sm">
                  {errorBreakdownData.map(({ type, count, fill }) => (
                    <li key={type} className="flex items-center gap-1">
                      <span className="inline-block h-3 w-3 rounded-sm" style={{ background: fill }} />
                      {type} ({count})
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                <div className="text-center">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No errors found</p>
                  <p className="text-sm">Excellent work!</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Level History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            CEFR Level Progression
            <InfoButton text="Level assigned by AI to each essay following the CEFR scale (A1–C2)." />
          </CardTitle>
          <CardDescription>
            Your language level assessment over time
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
                  <p>No level history available</p>
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
