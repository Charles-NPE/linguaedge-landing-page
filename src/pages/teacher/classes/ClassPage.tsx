
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentsList } from "@/components/classes/StudentsList";
import { ClassHeader } from "@/components/classes/ClassHeader";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DeleteClassDialog } from "@/components/classes/DeleteClassDialog";
import { InviteStudentDialog } from "@/components/classes/InviteStudentDialog";

export default function ClassPage() {
  const { id } = useParams<{ id: string }>();
  const [classData, setClassData] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchClassData();
      fetchStudents();
    }
  }, [id]);

  const fetchClassData = async () => {
    try {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setClassData(data);
    } catch (error: any) {
      console.error("Error fetching class:", error);
      toast.error("Failed to load class data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data, error } = await supabase
        .from("class_students")
        .select("student_id, profiles:student_id(id)")
        .eq("class_id", id);

      if (error) throw error;
      setStudents(data || []);
    } catch (error: any) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load student data");
    }
  };

  return (
    <div className="container mx-auto p-4">
      {!isLoading && classData && (
        <>
          <ClassHeader
            name={classData.name}
            code={classData.code}
            studentCount={students.length}
          />

          <div className="mt-6 flex justify-end space-x-2">
            <InviteStudentDialog classId={id || ""} />
            <DeleteClassDialog classId={id || ""} className="ml-2" />
          </div>

          <div className="mt-6">
            <Tabs defaultValue="students">
              <TabsList>
                <TabsTrigger value="students">Students</TabsTrigger>
                <TabsTrigger value="assignments">Assignments</TabsTrigger>
              </TabsList>
              <TabsContent value="students" className="mt-4">
                <StudentsList students={students} />
              </TabsContent>
              <TabsContent value="assignments">
                <div className="text-center p-8 text-gray-500">
                  Assignment functionality coming soon
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
}
