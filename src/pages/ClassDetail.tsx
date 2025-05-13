import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import the components and types
import StudentsList, { Student } from "@/components/classes/StudentsList";
import ClassForum, { Post, Reply, Author } from "@/components/classes/ClassForum";
import InviteStudentDialog from "@/components/classes/InviteStudentDialog";
import DeleteClassDialog from "@/components/classes/DeleteClassDialog";
import { StudentProfile, ClassRow } from "@/types/class.types";

// Helper function to create a default author when data is missing
const createDefaultAuthor = (authorId: string): Author => ({
  id: authorId,
  email: "Anonymous",
  avatar_url: undefined
});

const ClassDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [classRow, setClassRow] = useState<ClassRow | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState("students");

  useEffect(() => {
    if (!user || !profile || !id) return;
    
    // Set default tab based on user role
    if (profile?.role === 'student') {
      setDefaultTab("forum");
    }
    
    fetchClassData();
  }, [user, profile, id]);

  const fetchClassData = async () => {
    if (!user || !id) return;
    
    setIsLoading(true);
    try {
      // Fetch class details
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id, name, code, teacher_id')
        .eq('id', id)
        .single();
        
      if (classError || !classData) {
        throw new Error(classError?.message || "Class not found");
      }
      
      setClassRow(classData);
      
      // Check if student is a member of this class
      let isMember = false;
      if (profile?.role === 'student') {
        const { data: memberData } = await supabase
          .from('class_students')
          .select('*')
          .eq('class_id', id)
          .eq('student_id', user.id);
          
        isMember = !!memberData && memberData.length > 0;
      }
      
      // Determine access
      const hasPermission = 
        (profile?.role === "teacher" && classData.teacher_id === user.id) || 
        (profile?.role === "student" && isMember);
        
      setHasAccess(hasPermission);
      
      if (!hasPermission) {
        toast({
          title: "Access denied",
          description: "You don't have permission to view this class",
          variant: "destructive",
        });
        navigate("/");
        return;
      }
      
      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from('class_students')
        .select('student_id, profiles:student_id(id, email, avatar_url)')
        .eq('class_id', id);
        
      if (studentsError) {
        console.error("Error fetching students:", studentsError);
      } else if (studentsData) {
        // Process the student data to fit our Student interface
        const processedStudents: Student[] = studentsData.map(student => {
          // If it's an error object or doesn't have the expected shape
          if (!student || typeof student !== 'object' || !('student_id' in student)) {
            return {} as Student;
          }
          
          // Process valid student data
          return {
            student_id: student.student_id,
            status: 'enrolled', // Default status
            profiles: student.profiles as StudentProfile | null,
            // If student_id looks like an email, use it as the invited_email
            invited_email: student.student_id && typeof student.student_id === 'string' && 
              student.student_id.includes('@') ? student.student_id : undefined
          };
        }).filter(student => Object.keys(student).length > 0);
        
        setStudents(processedStudents);
      }
      
      // Fetch posts with replies
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id, 
          content, 
          created_at, 
          author_id,
          post_replies(id, author_id, content, created_at, post_id)
        `)
        .eq('class_id', id)
        .order('created_at', { ascending: true });
        
      if (postsError) {
        console.error("Error fetching posts:", postsError);
      } else if (postsData) {
        // Get unique author IDs from posts and replies
        const authorIds = new Set<string>();
        postsData.forEach(post => {
          authorIds.add(post.author_id);
          post.post_replies.forEach(reply => authorIds.add(reply.author_id));
        });
        
        // Fetch author profiles in a single query
        const { data: authorProfiles } = await supabase
          .from('profiles')
          .select('id, email, avatar_url')
          .in('id', Array.from(authorIds));
          
        // Create a map of author profiles by ID
        const authorMap = new Map<string, Author>();
        if (authorProfiles) {
          authorProfiles.forEach(profile => {
            if (profile && typeof profile === 'object' && 'id' in profile) {
              authorMap.set(profile.id, profile as unknown as Author);
            }
          });
        }
        
        // Attach author profiles to posts and replies
        const postsWithAuthors = postsData.map(post => {
          // Handle replies with proper type safety
          const repliesWithAuthors = post.post_replies.map(reply => {
            // Default author or from map
            const replyAuthor = authorMap.get(reply.author_id) || createDefaultAuthor(reply.author_id);
            
            return {
              ...reply,
              author: replyAuthor
            } as Reply;
          });
          
          // Default author or from map
          const postAuthor = authorMap.get(post.author_id) || createDefaultAuthor(post.author_id);
          
          return {
            ...post,
            post_replies: repliesWithAuthors,
            author: postAuthor
          } as Post;
        });
        
        setPosts(postsWithAuthors);
      }
      
      // Subscribe to real-time updates
      setupRealtimeSubscriptions(id);
      
    } catch (error) {
      console.error("Error fetching class data:", error);
      toast({
        title: "Error",
        description: "Failed to load class data",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscriptions = (classId: string) => {
    // Create a single channel for all changes
    const channel = supabase
      .channel(`class_${classId}`)
      // Listen for new students
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'class_students',
        filter: `class_id=eq.${classId}`
      }, () => {
        // Refresh students list
        supabase
          .from('class_students')
          .select('student_id, profiles:student_id(id, email, avatar_url)')
          .eq('class_id', classId)
          .then(({ data, error }) => {
            if (error) {
              console.error("Error fetching updated students:", error);
            } else if (data) {
              // Process student data safely
              const processedStudents: Student[] = data.map(student => {
                if (!student || typeof student !== 'object' || !('student_id' in student)) {
                  return {} as Student;
                }
                
                return {
                  student_id: student.student_id,
                  status: 'enrolled',
                  profiles: student.profiles as StudentProfile | null,
                  invited_email: student.student_id && typeof student.student_id === 'string' && 
                    student.student_id.includes('@') ? student.student_id : undefined
                };
              }).filter(student => Object.keys(student).length > 0);
              
              setStudents(processedStudents);
            }
          });
      })
      // Listen for new posts
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'posts',
        filter: `class_id=eq.${classId}`
      }, async (payload) => {
        const newPost = payload.new as Post;
        
        // Fetch the author information for the new post
        const { data: authorData } = await supabase
          .from('profiles')
          .select('id, email, avatar_url')
          .eq('id', newPost.author_id)
          .single();

        // Create a proper author object
        const postAuthor = (authorData && typeof authorData === 'object' && 'id' in authorData) 
          ? (authorData as unknown as Author) 
          : createDefaultAuthor(newPost.author_id);

        // Add new post to the list with author info
        setPosts(prev => [
          ...prev, 
          { 
            ...newPost,
            post_replies: [],
            author: postAuthor
          }
        ]);
      })
      // Listen for new replies
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'post_replies'
      }, async (payload) => {
        const newReply = payload.new as Reply;
        
        // Only process if this reply belongs to one of our posts
        const postExists = posts.some(post => post.id === newReply.post_id);
        if (!postExists) return;
        
        // Fetch the author information for the new reply
        const { data: authorData } = await supabase
          .from('profiles')
          .select('id, email, avatar_url')
          .eq('id', newReply.author_id)
          .single();
          
        // Create a proper author object
        const replyAuthor = (authorData && typeof authorData === 'object' && 'id' in authorData) 
          ? (authorData as unknown as Author) 
          : createDefaultAuthor(newReply.author_id);
        
        // Add new reply to the appropriate post
        setPosts(prev => prev.map(post => {
          if (post.id === newReply.post_id) {
            return {
              ...post,
              post_replies: [...post.post_replies, {
                ...newReply,
                author: replyAuthor
              } as Reply]
            };
          }
          return post;
        }));
      })
      .subscribe();
      
    // Return cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  };

  const removeStudent = async (studentId: string) => {
    if (!classRow) return;
    
    try {
      const { error } = await supabase
        .from('class_students')
        .delete()
        .eq('class_id', classRow.id)
        .eq('student_id', studentId);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Student removed from class",
      });
      
      // Update UI immediately
      setStudents(students.filter(s => s.student_id !== studentId));
      
    } catch (error) {
      console.error("Error removing student:", error);
      toast({
        title: "Error",
        description: "Failed to remove student",
        variant: "destructive",
      });
    }
  };

  const inviteStudent = async (inviteEmail: string) => {
    if (!classRow) return;
    
    try {
      const { error } = await supabase.functions.invoke('invite-student', {
        body: {
          class_id: classRow.id,
          email: inviteEmail,
          class_name: classRow.name,
          code: classRow.code
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Invitation sent to student",
      });
      
      setIsInviteDialogOpen(false);
      
      // Refresh the students list
      fetchClassData();
      
    } catch (error) {
      console.error("Error inviting student:", error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  const deleteClass = async () => {
    if (!classRow) return;
    
    try {
      const { error } = await supabase
        .from('classes')
        .delete()
        .eq('id', classRow.id);
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Class deleted successfully",
      });
      
      navigate("/teacher/classes");
      
    } catch (error) {
      console.error("Error deleting class:", error);
      toast({
        title: "Error",
        description: "Failed to delete class",
        variant: "destructive",
      });
    }
  };

  const submitPost = async (content: string) => {
    if (!classRow || !content || !user) return;
    
    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          class_id: classRow.id,
          author_id: user.id,
          content: content
        });
        
      if (error) throw error;
      
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    }
  };

  const submitReply = async (postId: string, content: string) => {
    if (!content || !user) return;
    
    try {
      const { error } = await supabase
        .from('post_replies')
        .insert({
          post_id: postId,
          author_id: user.id,
          content: content
        });
        
      if (error) throw error;
      
    } catch (error) {
      console.error("Error replying to post:", error);
      toast({
        title: "Error",
        description: "Failed to submit reply",
        variant: "destructive",
      });
    }
  };

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

  return (
    <DashboardLayout title={classRow.name}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <Link to={profile?.role === "teacher" ? "/teacher/classes" : "/student/dashboard"}>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Back to Dashboard
            </Button>
          </Link>
          <div>
            <span className="text-sm font-medium text-muted-foreground mr-2">Class Code:</span>
            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">{classRow.code}</span>
          </div>
        </div>
        
        {profile?.role === 'teacher' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                Delete Class
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
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
