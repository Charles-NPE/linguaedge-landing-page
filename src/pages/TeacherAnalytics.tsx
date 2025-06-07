
import React, { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useTeacherAnalytics } from "@/hooks/useTeacherAnalytics";
import { useClasses } from "@/hooks/useClasses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronLeft, Users, FileText, CheckCircle, Clock, AlertCircle, Award } from "lucide-react";

type ClassStats = {
  class_id: string;
  class_name: string;
  total_assignments: number;
  submitted: number;
  pending: number;
  late: number;
  avg_grade: number;
  teacher_id: string;
};

type StudentStats = {
  class_id: string;
  class_name: string;
  student_id: string;
  full_name: string;
  total_assignments: number;
  submitted: number;
  pending: number;
  late: number;
  avg_grade: number;
};

const TeacherAnalytics: React.FC = () => {
  const { user } = useAuth();
  const { data: classes = [] } = useClasses(user?.id);
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [selectedStudentId, setSelectedStudentId] = useState<string>("all");

  const { data: analytics, isLoading } = useTeacherAnalytics(
    user?.id,
    selectedClassId === "all" ? undefined : selectedClassId
  );

  const classStats = analytics?.classStats || [];
  const studentStats = analytics?.studentStats || [];

  // Calculate totals
  const totals = classStats.reduce(
    (acc, cur) => ({
      total_assignments: acc.total_assignments + cur.total_assignments,
      submitted: acc.submitted + cur.submitted,
      pending: acc.pending + cur.pending,
      late: acc.late + cur.late,
      gradeSum: acc.gradeSum + (cur.avg_grade || 0) * cur.submitted,
      gradeCnt: acc.gradeCnt + cur.submitted,
    }),
    { total_assignments: 0, submitted: 0, pending: 0, late: 0, gradeSum: 0, gradeCnt: 0 }
  );

  const overallAvgGrade = totals.gradeCnt > 0 ? totals.gradeSum / totals.gradeCnt : 0;

  // Filter data for selected student
  const displayStats = selectedStudentId === "all" 
    ? classStats 
    : studentStats.filter(s => s.student_id === selectedStudentId);

  // Prepare chart data
  const chartData = displayStats.map(stat => ({
    name: stat.class_name || (stat as StudentStats).full_name,
    submitted: stat.submitted || 0,
    pending: stat.pending || 0,
    late: stat.late || 0
  }));

  if (isLoading) {
    return (
      <DashboardLayout title="Analytics">
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Analytics">
      <div className="mb-4">
        <Link to="/teacher" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Filter Controls */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        {/* Class Filter */}
        <div className="min-w-64">
          <Select value={selectedClassId} onValueChange={(value) => {
            setSelectedClassId(value);
            setSelectedStudentId("all"); // Reset student filter when class changes
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All classes</SelectItem>
              {classes.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Student Filter */}
        <div className="min-w-64">
          <Select 
            value={selectedStudentId} 
            onValueChange={setSelectedStudentId}
            disabled={selectedClassId === "all"}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All students</SelectItem>
              {studentStats.map(s => (
                <SelectItem key={s.student_id} value={s.student_id}>
                  {s.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.total_assignments}</div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totals.submitted}</div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{totals.pending}</div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{totals.late}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Grade</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overallAvgGrade > 0 ? `${overallAvgGrade.toFixed(1)}` : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Submission Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="submitted" fill="#22c55e" name="Submitted" />
                  <Bar dataKey="pending" fill="#eab308" name="Pending" />
                  <Bar dataKey="late" fill="#ef4444" name="Late" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Stats */}
      {displayStats.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedStudentId === "all" ? "Class Statistics" : "Student Statistics"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">
                        {stat.class_name || (stat as StudentStats).full_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {stat.total_assignments} assignments total
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <span className="text-green-600">
                      ✓ {stat.submitted || 0} submitted
                    </span>
                    <span className="text-yellow-600">
                      ⏳ {stat.pending || 0} pending
                    </span>
                    <span className="text-red-600">
                      ⚠ {stat.late || 0} late
                    </span>
                    <span className="text-muted-foreground">
                      📊 {stat.avg_grade ? `${stat.avg_grade.toFixed(1)}` : "N/A"} avg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              No analytics data available. Create some assignments to see statistics.
            </p>
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
};

export default TeacherAnalytics;
