
import { Author, Reply, Post } from "@/types/class.types";
import { isQueryError } from "./queryUtils";

const fallbackAuthor: Author = {
  id: "unknown",
  admin_name: "Unknown",
  academy_name: "Unknown",
};

/* ---------- helpers ---------- */

export function sanitizeAuthor(raw: unknown, id: string): Author {
  if (!raw || isQueryError(raw) || typeof raw !== "object" || !("user_id" in raw)) {
    return { ...fallbackAuthor, id };
  }
  
  // Map the user_id from academy_profiles to id in our Author type
  const author = raw as any;
  return {
    id: author.user_id || id,
    admin_name: author.admin_name,
    academy_name: author.academy_name,
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
