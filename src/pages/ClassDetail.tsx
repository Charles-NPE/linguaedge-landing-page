import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MoreVertical, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter, 
  DialogDescription 
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { formatDistanceToNow } from "date-fns";

interface ClassRow {
  id: string;
  name: string;
  code: string;
  teacher_id: string;
}

interface StudentProfile {
  id: string;
  email?: string;
  avatar_url?: string;
}

interface Student {
  student_id?: string;
  status?: string;
  profiles?: StudentProfile | null;
  // For handling invited students who aren't registered yet
  invited_email?: string;
}

interface Author {
  id: string;
  email?: string;
  avatar_url?: string;
}

interface Reply {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  post_id?: string;
  author?: Author | null;
}

interface Post {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  post_replies: Reply[];
  author?: Author | null;
}

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
  const [newPost, setNewPost] = useState("");
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [defaultTab, setDefaultTab] = useState("students");

  useEffect(() => {
    if (!user || !profile || !id) return;
    
    // Set default tab based on user role
    if (profile.role === 'student') {
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
        .select('student_id, status, profiles:student_id(id, email, avatar_url)')
        .eq('class_id', id);
        
      if (studentsError) {
        console.error("Error fetching students:", studentsError);
      } else if (studentsData) {
        // Ensure we handle the data correctly regardless of errors
        const processedStudents: Student[] = studentsData.map(student => {
          // If profiles exist and are valid, use them
          if (student.profiles && typeof student.profiles === 'object' && 'id' in student.profiles) {
            return student as Student;
          }
          
          // Otherwise, create a default student object
          return {
            student_id: student.student_id,
            status: student.status,
            // If student_id looks like an email, use it as the invited_email
            invited_email: student.student_id && student.student_id.includes('@') ? student.student_id : undefined
          };
        });
        
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
              authorMap.set(profile.id, profile as Author);
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
          .select('student_id, status, profiles:student_id(id, email, avatar_url)')
          .eq('class_id', classId)
          .then(({ data, error }) => {
            if (error) {
              console.error("Error fetching updated students:", error);
            } else if (data) {
              // Process the data to ensure it fits our Student interface
              const processedStudents: Student[] = data.map(student => {
                // If profiles exist and are valid, use them
                if (student.profiles && typeof student.profiles === 'object' && 'id' in student.profiles) {
                  return student as Student;
                }
                
                // Otherwise, create a default student object
                return {
                  student_id: student.student_id,
                  status: student.status,
                  // If student_id looks like an email, use it as the invited_email
                  invited_email: student.student_id && student.student_id.includes('@') ? student.student_id : undefined
                };
              });
              
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
          ? authorData as Author 
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
          ? authorData as Author 
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

  const authorName = (post: Post | Reply) => {
    if (post.author && typeof post.author === 'object' && 'email' in post.author) {
      return post.author.email || 'Anonymous';
    }
    return 'Anonymous';
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return 'some time ago';
    }
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

  const inviteStudent = async () => {
    if (!classRow || !inviteEmail) return;
    
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
      
      setInviteEmail("");
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

  const submitPost = async () => {
    if (!classRow || !newPost.trim() || !user) return;
    
    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          class_id: classRow.id,
          author_id: user.id,
          content: newPost.trim()
        });
        
      if (error) throw error;
      
      setNewPost("");
      
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    }
  };

  const handleReply = async (e: React.KeyboardEvent<HTMLTextAreaElement>, postId: string) => {
    if (e.key !== 'Enter' || !e.ctrlKey || !user) return;
    
    const content = e.currentTarget.value.trim();
    if (!content) return;
    
    try {
      const { error } = await supabase
        .from('post_replies')
        .insert({
          post_id: postId,
          author_id: user.id,
          content
        });
        
      if (error) throw error;
      
      e.currentTarget.value = "";
      
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
                <Trash2 className="mr-2 h-4 w-4" />
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
          {profile?.role === 'teacher' && (
            <Button className="mb-4" onClick={() => setIsInviteDialogOpen(true)}>Invite Student</Button>
          )}
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                {profile?.role === 'teacher' && <TableHead className="w-[100px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={profile?.role === 'teacher' ? 4 : 3} className="text-center text-muted-foreground py-8">
                    No students enrolled yet
                  </TableCell>
                </TableRow>
              ) : (
                students.map((s) => (
                  <TableRow key={s.student_id || s.invited_email || 'pending'}>
                    <TableCell className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {s.profiles && s.profiles.email 
                            ? s.profiles.email.charAt(0).toUpperCase()
                            : s.invited_email 
                              ? s.invited_email.charAt(0).toUpperCase() 
                              : 'S'}
                        </AvatarFallback>
                      </Avatar>
                      {s.profiles ? s.profiles.email : s.invited_email || 'Pending Invitation'}
                    </TableCell>
                    <TableCell>{s.profiles ? s.profiles.email : s.invited_email || 'Pending'}</TableCell>
                    <TableCell>
                      {s.status === 'invited' ? 
                        <span className="text-amber-600 dark:text-amber-500">Invited</span> : 
                        <span className="text-green-600 dark:text-green-500">Enrolled</span>
                      }
                    </TableCell>
                    {profile?.role === 'teacher' && (
                      <TableCell>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => s.student_id ? removeStudent(s.student_id) : null}
                          title="Remove student"
                          disabled={!s.student_id}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TabsContent>

        {/* Forum tab */}
        <TabsContent value="forum">
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-muted-foreground">No posts yet. Start a discussion below!</p>
              </div>
            ) : (
              posts.map((p) => (
                <Card key={p.id}>
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="font-semibold">{authorName(p)}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(p.created_at)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="whitespace-pre-line">{p.content}</p>
                    
                    {p.post_replies.length > 0 && (
                      <>
                        <Separator className="my-2" />
                        <div className="space-y-2">
                          {p.post_replies.map((r) => (
                            <div key={r.id} className="pl-4 border-l border-slate-200 dark:border-slate-700">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{authorName(r)}</span>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(r.created_at)}
                                </span>
                              </div>
                              <p className="text-sm mt-1 whitespace-pre-line">{r.content}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                    
                    <Textarea 
                      placeholder="Reply to this post... (Ctrl+Enter to submit)" 
                      className="mt-2"
                      onKeyDown={(e) => handleReply(e, p.id)}
                    />
                  </CardContent>
                </Card>
              ))
            )}
            
            <div className="pt-4">
              <Textarea
                placeholder="Start a new discussion..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="mb-2"
                rows={3}
              />
              <Button onClick={submitPost} disabled={!newPost.trim()}>
                Post
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Invite Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Student</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Student Email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={inviteStudent}>
              Invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Class Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Class</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this class? This action cannot be undone.
              All students will be removed and all class data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteClass}>
              Delete Class
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ClassDetail;
