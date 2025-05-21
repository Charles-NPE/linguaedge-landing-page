
import { Author, Reply, Post } from "@/types/class.types";
import { isQueryError } from "./queryUtils";

const fallbackAuthor: Author = {
  id: "unknown",
  full_name: "Unknown",
  role: null,
};

/* ---------- helpers ---------- */

export function sanitizeAuthor(raw: unknown, id: string): Author {
  if (!raw || isQueryError(raw) || typeof raw !== "object") {
    return { ...fallbackAuthor, id };
  }
  
  // Map the author data from profiles
  const a = raw as any;
  
  // Display name logic:
  const displayName = 
    a.full_name && a.full_name.trim() !== ""
      ? a.full_name                      // Use full_name if it exists
      : a.role === "teacher"
          ? "Teacher"                    // Fallback for teachers
          : "Unknown";                   // General fallback
  
  return {
    id: id,
    full_name: displayName,
    role: a.role ?? null,
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
