
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboards/DashboardLayout";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
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
import { Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

// Extend dayjs with relative time plugin
dayjs.extend(relativeTime);

interface ClassRow {
  id: string;
  name: string;
  code: string;
  teacher_id: string;
}

interface StudentProfile {
  id: string;
  full_name?: string;
  email?: string;
  avatar_url?: string;
}

interface Student {
  profiles: StudentProfile;
}

interface Reply {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
}

interface Post {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  post_replies: Reply[];
}

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
  const [inviteEmail, setInviteEmail] = useState("");
  const [userProfiles, setUserProfiles] = useState<Record<string, string>>({});
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
      const { data: studentsData } = await supabase
        .from('class_students')
        .select('profiles(id, full_name, email, avatar_url)')
        .eq('class_id', id);
        
      if (studentsData) {
        setStudents(studentsData);
        
        // Build a map of user IDs to names for the forum
        const userIds = studentsData.map(s => s.profiles.id);
        if (classData.teacher_id) userIds.push(classData.teacher_id);
        
        // Get profiles for all users
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds);
          
        if (profiles) {
          const profileMap: Record<string, string> = {};
          profiles.forEach(p => {
            profileMap[p.id] = p.full_name || p.email || 'Anonymous';
          });
          setUserProfiles(profileMap);
        }
      }
      
      // Fetch posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('id, author_id, content, created_at, post_replies(id, author_id, content, created_at)')
        .eq('class_id', id)
        .order('created_at', { ascending: true });
        
      if (postsData) {
        setPosts(postsData);
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
    // Subscribe to class_students changes
    const studentsChannel = supabase
      .channel('students-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'class_students',
          filter: `class_id=eq.${classId}`
        },
        () => {
          // Refresh students on any change
          supabase
            .from('class_students')
            .select('profiles(id, full_name, email, avatar_url)')
            .eq('class_id', classId)
            .then(({ data }) => {
              if (data) setStudents(data);
            });
        }
      )
      .subscribe();
      
    // Subscribe to posts changes
    const postsChannel = supabase
      .channel('posts-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
          filter: `class_id=eq.${classId}`
        },
        (payload) => {
          // Add new post to the list
          const newPost = payload.new as Post;
          setPosts(prev => [...prev, { ...newPost, post_replies: [] }]);
        }
      )
      .subscribe();
      
    // Subscribe to post_replies changes
    const repliesChannel = supabase
      .channel('replies-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'post_replies'
        },
        (payload) => {
          // Add new reply to the appropriate post
          const newReply = payload.new as Reply;
          setPosts(prev => prev.map(post => {
            if (post.id === newReply.post_id) {
              return {
                ...post,
                post_replies: [...post.post_replies, newReply]
              };
            }
            return post;
          }));
        }
      )
      .subscribe();
      
    // Return cleanup function
    return () => {
      supabase.removeChannel(studentsChannel);
      supabase.removeChannel(postsChannel);
      supabase.removeChannel(repliesChannel);
    };
  };

  const authorName = (authorId: string) => {
    return userProfiles[authorId] || 'Anonymous';
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
      setStudents(students.filter(s => s.profiles.id !== studentId));
      
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
      // First find the user by email
      const { data: foundUser, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', inviteEmail)
        .single();
        
      if (userError || !foundUser) {
        toast({
          title: "User not found",
          description: "No user found with that email address",
          variant: "destructive",
        });
        return;
      }
      
      // Check if already a member
      const { data: existingMember } = await supabase
        .from('class_students')
        .select('*')
        .eq('class_id', classRow.id)
        .eq('student_id', foundUser.id);
        
      if (existingMember && existingMember.length > 0) {
        toast({
          title: "Already enrolled",
          description: "This student is already in this class",
          variant: "destructive",
        });
        return;
      }
      
      // Add to class
      const { error } = await supabase
        .from('class_students')
        .insert({
          class_id: classRow.id,
          student_id: foundUser.id
        });
        
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Student invited to class",
      });
      
      setInviteEmail("");
      setIsInviteDialogOpen(false);
      
    } catch (error) {
      console.error("Error inviting student:", error);
      toast({
        title: "Error",
        description: "Failed to invite student",
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
      <div className="mb-4 flex justify-between items-center">
        <div>
          <span className="text-sm font-medium text-muted-foreground mr-2">Class Code:</span>
          <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">{classRow.code}</span>
        </div>
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
                {profile?.role === 'teacher' && <TableHead className="w-[100px]">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={profile?.role === 'teacher' ? 3 : 2} className="text-center text-muted-foreground py-8">
                    No students enrolled yet
                  </TableCell>
                </TableRow>
              ) : (
                students.map((s) => (
                  <TableRow key={s.profiles.id}>
                    <TableCell className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={s.profiles.avatar_url || ''} />
                        <AvatarFallback>
                          {(s.profiles.full_name || s.profiles.email || 'S').charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {s.profiles.full_name || s.profiles.email || 'Anonymous'}
                    </TableCell>
                    <TableCell>{s.profiles.email}</TableCell>
                    {profile?.role === 'teacher' && (
                      <TableCell>
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          onClick={() => removeStudent(s.profiles.id)}
                          title="Remove student"
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
                    <div className="font-semibold">{authorName(p.author_id)}</div>
                    <div className="text-xs text-muted-foreground">
                      {dayjs(p.created_at).fromNow()}
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
                                <span className="font-medium">{authorName(r.author_id)}</span>
                                <span className="text-xs text-muted-foreground">
                                  {dayjs(r.created_at).fromNow()}
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
    </DashboardLayout>
  );
};

export default ClassDetail;
