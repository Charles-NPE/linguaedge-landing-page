
import { Author, Reply, Post } from "@/types/class.types";
import { isQueryError } from "./queryUtils";

const fallbackAuthor: Author = {
  id: "unknown",
  admin_name: "Unknown",
  academy_name: "Unknown",
};

/* ---------- helpers ---------- */

export function sanitizeAuthor(raw: unknown, id: string): Author {
  if (!raw || isQueryError(raw) || typeof raw !== "object") {
    return { ...fallbackAuthor, id };
  }
  
  // Map the author data from profiles
  const author = raw as any;
  return {
    id: id,
    admin_name: author.role === 'teacher' ? 'Teacher' : 'Student',
    academy_name: `User ${id.substring(0, 6)}`,
  };
}

export function sanitizeReply(r: any): Reply {
  if (!r || isQueryError(r)) return null as unknown as Reply;
  return {
    ...r,
    author: sanitizeAuthor(r.author, r.author_id),
  };
}

export function sanitizePost(p: any): Post {
  if (!p || isQueryError(p)) return null as unknown as Post;
  return {
    ...p,
    author: sanitizeAuthor(p.author, p.author_id),
    post_replies: Array.isArray(p.post_replies)
      ? p.post_replies.map(sanitizeReply)
      : [],
  };
}
