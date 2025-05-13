
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

export interface Author {
  id: string;
  email?: string;
  avatar_url?: string;
}

export interface Reply {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  post_id?: string;
  author?: Author | null;
}

export interface Post {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  post_replies: Reply[];
  author?: Author | null;
}

interface ClassForumProps {
  posts: Post[];
  onSubmitPost: (content: string) => Promise<void>;
  onSubmitReply: (postId: string, content: string) => Promise<void>;
}

// Helper function to get author name
const authorName = (entity: Post | Reply) => {
  if (entity.author && typeof entity.author === 'object' && 'email' in entity.author) {
    return entity.author.email || 'Anonymous';
  }
  return 'Anonymous';
};

// Helper function to format date
const formatDate = (dateString: string) => {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch (error) {
    return 'some time ago';
  }
};

const ClassForum: React.FC<ClassForumProps> = ({
  posts,
  onSubmitPost,
  onSubmitReply,
}) => {
  const [newPost, setNewPost] = useState("");

  const handleSubmitPost = async () => {
    if (!newPost.trim()) return;
    
    await onSubmitPost(newPost.trim());
    setNewPost("");
  };

  const handleReply = async (e: React.KeyboardEvent<HTMLTextAreaElement>, postId: string) => {
    if (e.key !== 'Enter' || !e.ctrlKey) return;
    
    const content = e.currentTarget.value.trim();
    if (!content) return;
    
    await onSubmitReply(postId, content);
    e.currentTarget.value = "";
  };

  return (
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
        <Button onClick={handleSubmitPost} disabled={!newPost.trim()}>
          Post
        </Button>
      </div>
    </div>
  );
};

export default ClassForum;
