
import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Pencil } from "lucide-react";
import ReplyBox from "./ReplyBox";

export interface Author {
  id: string;
  email?: string;
  avatar_url?: string;
  academy_name?: string;
  full_name?: string;
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
  onDeletePost?: (id: string) => Promise<void>;
  onDeleteReply?: (id: string) => Promise<void>;
  onEditPost?: (id: string, c: string) => Promise<void>;
  onEditReply?: (id: string, c: string) => Promise<void>;
  currentUserId?: string;
  isTeacher?: boolean;
}

// Helper function to get author name
const authorName = (a?: Author | null) =>
  a?.full_name?.trim() ||
  a?.academy_name?.trim() ||
  a?.email?.split('@')[0] ||
  "Anonymous";

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
  onDeletePost,
  onDeleteReply,
  onEditPost,
  onEditReply,
  currentUserId,
  isTeacher
}) => {
  const canDeleteItem = (authorId: string) => {
    return (currentUserId === authorId) || isTeacher;
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
              <div className="font-semibold">{authorName(p.author)}</div>
              <div className="flex items-center space-x-2">
                <div className="text-xs text-muted-foreground">
                  {formatDate(p.created_at)}
                </div>
                {canDeleteItem(p.author_id) && onEditPost && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => {
                      const c = prompt("Edit post:", p.content);
                      if (c !== null) onEditPost(p.id, c);
                    }}
                    className="h-7 w-7"
                  >
                    <Pencil size={16} />
                  </Button>
                )}
                {canDeleteItem(p.author_id) && onDeletePost && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    onClick={() => onDeletePost(p.id)}
                    className="h-7 w-7"
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
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
                          <span className="font-medium">{authorName(r.author)}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(r.created_at)}
                            </span>
                            {canDeleteItem(r.author_id) && onEditReply && (
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => {
                                  const c = prompt("Edit reply:", r.content);
                                  if (c !== null) onEditReply(r.id, c);
                                }}
                                className="h-6 w-6"
                              >
                                <Pencil size={14} />
                              </Button>
                            )}
                            {canDeleteItem(r.author_id) && onDeleteReply && (
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => onDeleteReply(r.id)}
                                className="h-6 w-6"
                              >
                                <Trash2 size={14} />
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm mt-1 whitespace-pre-line">{r.content}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              <ReplyBox 
                onSubmit={(content) => onSubmitReply(p.id, content)} 
                placeholder="Reply to this post..."
              />
            </CardContent>
          </Card>
        ))
      )}
      
      <div className="pt-4">
        <ReplyBox
          onSubmit={onSubmitPost}
          placeholder="Start a new discussion..."
        />
      </div>
    </div>
  );
};

export default ClassForum;
