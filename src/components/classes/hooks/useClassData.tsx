import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "@/lib/toastShim";
import { ClassRow, Student, Post, Author, Reply } from "@/types/class.types";
import { createDefaultAuthor, processStudentProfile } from "../utils/classUtils";

interface UseClassDataProps {
  classId: string;
  userId?: string;
  userRole?: string;
}

// Define fallback author to use when author data is null
const fallbackAuthor: Author = {
  id: "unknown",
  full_name: "Unknown",
  avatar_url: null,
  email: "unknown",
  academy_name: "Unknown"
};

export const useClassData = ({ classId, userId, userRole }: UseClassDataProps) => {
  const navigate = useNavigate();
  const [classRow, setClassRow] = useState<ClassRow | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [defaultTab, setDefaultTab] = useState("students");

  useEffect(() => {
    if (!userId || !userRole || !classId) return;
    
    // Set default tab based on user role
    if (userRole === 'student') {
      setDefaultTab("forum");
    }
    
    fetchClassData();
    
    return () => {
      // Cleanup subscriptions
      const channels = supabase.getChannels();
      channels.forEach(channel => {
        if (channel.topic === `class_${classId}`) {
          supabase.removeChannel(channel);
        }
      });
    };
  }, [userId, userRole, classId]);

  const fetchClassData = async () => {
    if (!userId || !classId) return;
    
    setIsLoading(true);
    try {
      // Fetch class details
      const { data: classData, error: classError } = await supabase
        .from('classes')
        .select('id, name, code, teacher_id')
        .eq('id', classId)
        .single();
        
      if (classError || !classData) {
        throw new Error(classError?.message || "Class not found");
      }
      
      setClassRow(classData);
      
      // Check if student is a member of this class
      let isMember = false;
      if (userRole === 'student') {
        const { data: memberData } = await supabase
          .from('class_students')
          .select('*')
          .eq('class_id', classId)
          .eq('student_id', userId);
          
        isMember = !!memberData && memberData.length > 0;
      }
      
      // Determine access
      const hasPermission = 
        (userRole === "teacher" && classData.teacher_id === userId) || 
        (userRole === "student" && isMember);
        
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
      
      await Promise.all([
        fetchStudents(classId),
        fetchPosts(classId)
      ]);
      
      // Subscribe to real-time updates
      setupRealtimeSubscriptions(classId);
      
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

  const fetchStudents = async (classId: string) => {
    const { data: studentsData, error: studentsError } = await supabase
      .from('class_students')
      .select('student_id, profiles:student_id(id, email, avatar_url)')
      .eq('class_id', classId);
      
    if (studentsError) {
      console.error("Error fetching students:", studentsError);
      return;
    } else if (studentsData) {
      // Process the student data to fit our Student interface
      const processedStudents: Student[] = studentsData.map(student => {
        // If it's an error object or doesn't have the expected shape
        if (!student || typeof student !== 'object' || !('student_id' in student)) {
          return {} as Student;
        }
        
        // Process the profile data
        const processedProfile = processStudentProfile(student);
        
        // Process valid student data
        return {
          student_id: student.student_id,
          status: 'enrolled', // Default status
          profiles: processedProfile,
          // If student_id looks like an email, use it as the invited_email
          invited_email: student.student_id && typeof student.student_id === 'string' && 
            student.student_id.includes('@') ? student.student_id : undefined
        };
      }).filter(student => Object.keys(student).length > 0);
      
      setStudents(processedStudents);
    }
  };

  const fetchPosts = async (classId: string) => {
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select(`
        id, 
        content, 
        created_at, 
        author_id,
        author:profiles(id, email, avatar_url, academy_name, full_name),
        post_replies(id, author_id, content, created_at, post_id, author:profiles(id, email, avatar_url, academy_name, full_name))
      `)
      .eq('class_id', classId)
      .order('created_at', { ascending: true });
      
    if (postsError) {
      console.error("Error fetching posts:", postsError);
      return;
    } else if (postsData) {
      // Process posts and replies with proper author information
      const processedPosts: Post[] = postsData.map(post => {
        return {
          ...post,
          author: (post.author && 'id' in post.author)
            ? (post.author as Author)
            : { ...fallbackAuthor, id: post.author_id },

          post_replies: post.post_replies.map(reply => ({
            ...reply,
            author: (reply.author && 'id' in reply.author)
              ? (reply.author as Author)
              : { ...fallbackAuthor, id: reply.author_id },
          })),
        };
      });
      
      setPosts(processedPosts);
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
        fetchStudents(classId);
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
        const { data: dbAuthor } = await supabase
          .from('profiles')
          .select('id, email, avatar_url, academy_name, full_name')
          .eq('id', newPost.author_id)
          .single();

        const safeAuthor: Author =
          dbAuthor && 'id' in dbAuthor
            ? (dbAuthor as Author)
            : { ...fallbackAuthor, id: newPost.author_id };

        setPosts(prev => [
          ...prev, 
          { ...newPost, author: safeAuthor, post_replies: [] }
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
        if (!posts.some(p => p.id === newReply.post_id)) return;
        
        // Fetch the author information for the new reply
        const { data: dbAuthor } = await supabase
          .from('profiles')
          .select('id, email, avatar_url, academy_name, full_name')
          .eq('id', newReply.author_id)
          .single();
          
        const safeAuthor: Author =
          dbAuthor && 'id' in dbAuthor
            ? (dbAuthor as Author)
            : { ...fallbackAuthor, id: newReply.author_id };
        
        setPosts(prev =>
          prev.map(p =>
            p.id === newReply.post_id
              ? { ...p, post_replies: [...p.post_replies, { ...newReply, author: safeAuthor }] }
              : p
          )
        );
      })
      // Listen for deleted posts
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'posts'
      }, (payload) => {
        const deletedPostId = payload.old.id;
        setPosts(prev => prev.filter(post => post.id !== deletedPostId));
      })
      // Listen for deleted replies
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'post_replies'
      }, (payload) => {
        const deletedReplyId = payload.old.id;
        setPosts(prev => prev.map(post => ({
          ...post,
          post_replies: post.post_replies.filter(reply => reply.id !== deletedReplyId)
        })));
      })
      .subscribe();
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
    
    // Temporary toast message instead of actual invite
    toast({
      title: "Coming soon",
      description: "Email invites will be enabled later."
    });
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
    if (!classRow || !content || !userId) return;
    
    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          class_id: classRow.id,
          author_id: userId,
          content: content
        });
        
      if (error) {
        toast({
          title: "Error",
          description: "Failed to create post: " + error.message,
          variant: "destructive",
        });
      }
      
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
    if (!content || !userId) return;
    
    try {
      const { error } = await supabase
        .from('post_replies')
        .insert({
          post_id: postId,
          author_id: userId,
          content: content
        });
        
      if (error) {
        toast({
          title: "Error",
          description: "Failed to submit reply: " + error.message,
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error("Error replying to post:", error);
      toast({
        title: "Error",
        description: "Failed to submit reply",
        variant: "destructive",
      });
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
        
      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete post: " + error.message,
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    }
  };

  const deleteReply = async (replyId: string) => {
    try {
      const { error } = await supabase
        .from('post_replies')
        .delete()
        .eq('id', replyId);
        
      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete reply: " + error.message,
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error("Error deleting reply:", error);
      toast({
        title: "Error",
        description: "Failed to delete reply",
        variant: "destructive",
      });
    }
  };

  /* NEW helpers – optimistic update */
  const updatePost = async (postId: string, content: string): Promise<void> => {
    if (!content.trim()) return;
    const patch = { content: content.trim() };
    const { error } = await supabase.from("posts")
      .update(patch).eq("id", postId).select("content").single();
    if (error) {
      toast({ title:"Error", description:error.message, variant:"destructive" });
      return;
    }

    setPosts(p => p.map(x => x.id === postId ? { ...x, ...patch } : x));
  };

  const updateReply = async (replyId: string, content: string): Promise<void> => {
    if (!content.trim()) return;
    const patch = { content: content.trim() };
    const { error } = await supabase.from("post_replies")
      .update(patch).eq("id", replyId).select("content").single();
    if (error) {
      toast({ title:"Error", description:error.message, variant:"destructive" });
      return;
    }

    setPosts(p => p.map(post => ({
      ...post,
      post_replies: post.post_replies.map(r =>
        r.id === replyId ? { ...r, ...patch } : r
      )
    })));
  };

  return {
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
  };
};
