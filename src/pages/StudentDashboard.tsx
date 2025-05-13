
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import FeatureCard from "@/components/dashboards/FeatureCard";
import { PenTool, FileCheck, LineChart, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  useEffect(() => {
    if (!user) return;
    
    const fetchClasses = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('class_students')
          .select('class_id, classes(id, name, code)')
          .eq('student_id', user.id);
          
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
    
    fetchClasses();
  }, [user]);

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="mb-8">
        <h2 className="text-lg text-slate-900 dark:text-white">
          Welcome back, {user?.email?.split('@')[0] || 'Student'}
        </h2>
      </div>

      {/* My Classes Section */}
      <div className="mb-10">
        <h3 className="text-lg font-medium mb-4">My Classes</h3>
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
            {classes.map((cls) => (
              <Card key={cls.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle>{cls.name}</CardTitle>
                  <CardDescription>Class Code: {cls.code}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full mt-2"
                    onClick={() => navigate(`/teacher/classes/${cls.id}`)}
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Open Class
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <h3 className="text-lg font-medium mb-4">Tools</h3>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="card">
          <FeatureCard
            title="Submit Essay"
            description="Write and submit a new essay for AI and teacher feedback."
            icon={PenTool}
          />
        </div>
        <div className="card">
          <FeatureCard
            title="My Corrections"
            description="Review feedback and corrections on your submitted essays."
            icon={FileCheck}
          />
        </div>
        <div className="card">
          <FeatureCard
            title="Progress"
            description="Track your improvement over time and identify areas to focus on."
            icon={LineChart}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
