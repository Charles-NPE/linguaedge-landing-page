
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import ClassCard from "@/components/classes/ClassCard";
import CreateClassDialog from "@/components/classes/CreateClassDialog";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ClassWithStudents {
  id: string;
  name: string;
  code: string;
  class_students: { count: number } | null;
}

const TeacherClassesPage = () => {
  const { user, profile } = useAuth();
  const [classes, setClasses] = useState<ClassWithStudents[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  // Get student limit based on subscription tier
  const getStudentLimit = () => {
    if (!profile) return 20; // Default limit
    
    switch(profile.stripe_status) {
      case "academy":
        return 60;
      case "starter":
      default:
        return 20;
    }
  };

  const fetchClasses = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('classes')
        .select('id, name, code, class_students(count)')
        .eq('teacher_id', user.id);
        
      if (error) throw error;
      
      setClasses(data as ClassWithStudents[]);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast({
        title: "Error",
        description: "Failed to load classes. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, [user]);

  const getTotalStudents = (classList: ClassWithStudents[]) => {
    return classList.reduce((sum, cls) => sum + (cls.class_students?.count || 0), 0);
  };

  const handleCreateClass = async (name: string) => {
    if (!user) return;
    
    try {
      // Check if adding a new class would exceed the student limit
      const studentLimit = getStudentLimit();
      const totalStudents = getTotalStudents(classes);
      
      if (totalStudents >= studentLimit) {
        toast({
          title: "Student Limit Reached",
          description: "You've reached your student limit. Upgrade plan to add more.",
          variant: "destructive"
        });
        return false;
      }
      
      // Generate a random 6-character code
      const code = crypto.randomUUID().slice(0, 6).toUpperCase();
      
      // Insert the new class
      const { error } = await supabase
        .from('classes')
        .insert({ 
          name, 
          code, 
          teacher_id: user.id 
        });
        
      if (error) throw error;
      
      // Re-fetch classes to update the list
      await fetchClasses();
      
      toast({
        title: "Success",
        description: `Class "${name}" created successfully.`
      });
      
      return true;
    } catch (error) {
      console.error("Error creating class:", error);
      toast({
        title: "Error",
        description: "Failed to create class. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  return (
    <DashboardLayout title="Manage Classes">
      <div className="mb-6">
        <p className="text-slate-600 dark:text-slate-400">
          Create and manage your classes. Students can join using the class code.
        </p>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center my-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : (
        <>
          {classes.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <h3 className="text-lg font-medium mb-2">No Classes Yet</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                Create your first class to get started
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-1 h-4 w-4" /> Create Class
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((cls) => (
                <ClassCard
                  key={cls.id}
                  id={cls.id}
                  name={cls.name}
                  code={cls.code}
                  studentCount={cls.class_students?.count || 0}
                  studentLimit={getStudentLimit()}
                  onOpenClass={(id) => navigate(`/teacher/classes/${id}`)}
                />
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Floating action button */}
      {classes.length > 0 && (
        <div className="fixed bottom-6 right-6">
          <Button 
            onClick={() => setIsDialogOpen(true)} 
            size="lg" 
            className="rounded-full shadow-lg"
          >
            <Plus className="mr-1 h-5 w-5" /> New Class
          </Button>
        </div>
      )}
      
      {/* Create class dialog */}
      <CreateClassDialog 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCreate={handleCreateClass}
      />
    </DashboardLayout>
  );
};

export default TeacherClassesPage;
