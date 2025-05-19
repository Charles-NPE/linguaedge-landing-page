
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import the components and hooks
import { useClassData } from "@/components/classes/hooks/useClassData";
import ClassHeader from "@/components/classes/ClassHeader";
import { StudentsList } from "@/components/classes/StudentsList";
import ClassForum from "@/components/classes/ClassForum";
import InviteStudentDialog from "@/components/classes/InviteStudentDialog";
import DeleteClassDialog from "@/components/classes/DeleteClassDialog";

const ClassDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, profile } = useAuth();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const {
    classRow,
    students,
    posts,
    isLoading,
    hasAccess,
    defaultTab,
    removeStudent,
    inviteStudent,
    deleteClass,
    submitPost,
    submitReply,
    deletePost,
    deleteReply,
    updatePost,
    updateReply,
  } = useClassData({ 
    classId: id || '', 
    userId: user?.id, 
    userRole: profile?.role 
  });

  if (isLoading) {
    return (
      <DashboardLayout title="Loading class...">
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!classRow || !hasAccess) {
    return null; // Navigation to home will happen in the useEffect
  }

  const isTeacher = profile?.role === "teacher" && classRow.teacher_id === user?.id;

  return (
    <DashboardLayout title={classRow.name}>
      <ClassHeader 
        classRow={classRow}
        userRole={profile?.role}
        isTeacher={isTeacher}
        onDeleteClick={() => setIsDeleteDialogOpen(true)}
      />
      
      <Tabs defaultValue={defaultTab} className="mt-4">
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="forum">Forum</TabsTrigger>
        </TabsList>

        {/* Students tab */}
        <TabsContent value="students">
          <StudentsList 
            students={students} 
            isTeacher={profile?.role === 'teacher'} 
            onInviteClick={() => setIsInviteDialogOpen(true)} 
            onRemoveStudent={removeStudent} 
          />
        </TabsContent>

        {/* Forum tab */}
        <TabsContent value="forum">
          <ClassForum 
            posts={posts} 
            onSubmitPost={submitPost} 
            onSubmitReply={submitReply}
            onDeletePost={deletePost}
            onDeleteReply={deleteReply}
            onEditPost={updatePost}
            onEditReply={updateReply}
            currentUserId={user?.id}
            isTeacher={isTeacher}
          />
        </TabsContent>
      </Tabs>
      
      {/* Dialogs */}
      <InviteStudentDialog 
        open={isInviteDialogOpen} 
        onOpenChange={setIsInviteDialogOpen} 
        onInvite={inviteStudent} 
      />
      
      <DeleteClassDialog 
        open={isDeleteDialogOpen} 
        onOpenChange={setIsDeleteDialogOpen} 
        onConfirmDelete={deleteClass} 
      />
    </DashboardLayout>
  );
};

export default ClassDetail;
