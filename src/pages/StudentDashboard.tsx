
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import FeatureCard from "@/components/dashboards/FeatureCard";
import { PenTool, FileCheck, LineChart, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JoinClassDialog } from "@/components/student";
import { joinClass } from "@/hooks/useJoinClass";
import { toast } from "@/lib/toastShim";

interface ClassInfo {
  id: string;
  name: string;
  code: string;
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showJoinDialog, setShowJoinDialog] = useState(false);

  const fetchClasses = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const {
        data,
        error
      } = await supabase.from('class_students').select('class_id, classes(id, name, code)').eq('student_id', user.id);

      if (error) throw error;

      if (data) {
        const classesData = data
          .filter(item => item.classes) // Filter out any null values
          .map(item => ({
            id: item.classes.id,
            name: item.classes.name,
            code: item.classes.code
          }));
        setClasses(classesData);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [user]);

  const handleJoinClass = async (code: string) => {
    if (!user) return;
    try {
      const result = await joinClass(code, user.id);
      toast({
        title: "Class joined!",
        description: `Welcome to ${result.name}!`
      });
      setShowJoinDialog(false);
      fetchClasses(); // Refresh classes list
    } catch (error) {
      toast({
        title: "Error joining class",
        description: error instanceof Error ? error.message : "Failed to join class. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="mb-8">
        <h2 className="text-lg text-slate-900 dark:text-white">
          Welcome back, {user?.email?.split('@')[0] || 'Student'}
        </h2>
      </div>

      {/* My Classes Section */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">My Classes</h3>
          <Button size="sm" onClick={() => setShowJoinDialog(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
            Join a class
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : classes.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground">You're not enrolled in any classes yet.</p>
              <p className="text-sm mt-1 mb-4">Ask your teacher for a class code to join.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {classes.map(cls => (
              <Card key={cls.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle>{cls.name}</CardTitle>
                  <CardDescription>Class Code: {cls.code}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button className="w-full mt-2" onClick={() => navigate(`/teacher/classes/${cls.id}`)}>
                      <BookOpen className="mr-2 h-4 w-4" />
                      Open Class
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <h3 className="text-lg font-medium mb-4">Tools</h3>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link to="/student/assignments" className="block">
          <FeatureCard 
            title="Submit Essay" 
            description="Write and submit a new essay for AI and teacher feedback." 
            icon={PenTool} 
          />
        </Link>
        <Link to="/student/corrections" className="block">
          <FeatureCard 
            title="My Corrections" 
            description="Review AI feedback and corrections on your submitted essays." 
            icon={FileCheck} 
          />
        </Link>
        <Link to="/student/progress" className="block">
          <FeatureCard 
            title="Progress" 
            description="Track your improvement over time and identify areas to focus on." 
            icon={LineChart} 
          />
        </Link>
      </div>

      <JoinClassDialog 
        isOpen={showJoinDialog} 
        onOpenChange={setShowJoinDialog} 
        onJoin={handleJoinClass} 
      />
    </DashboardLayout>
  );
};

export default StudentDashboard;
