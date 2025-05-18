
import { Post, Reply, Author } from "@/types/class.types";
import { isQueryError, QueryError } from "./queryUtils";

// Create fallback author for cases where author data is missing or invalid
const fallbackAuthor: Author = {
  id: "unknown",
  academy_name: "Unknown",
  admin_name: "Unknown"
};

/**
 * Sanitizes author data, handling cases where it might be a SelectQueryError
 */
export function sanitizeAuthor(authorData: unknown, id: string): Author {
  // If the author data is an error or doesn't match expected shape, use fallback
  if (!authorData || isQueryError(authorData)) {
    return { ...fallbackAuthor, id };
  }
  
  // Check if it has the expected shape
  if (typeof authorData === "object" && "id" in authorData) {
    return authorData as Author;
  }
  
  // Default fallback
  return { ...fallbackAuthor, id };
}

/**
 * Sanitizes a reply to ensure it has valid author data
 */
export function sanitizeReply(replyData: any): Reply {
  if (!replyData || isQueryError(replyData)) {
    return null as unknown as Reply; // This should not happen with proper filtering
  }

  // Ensure author data is valid
  const sanitizedAuthor = sanitizeAuthor(replyData.author, replyData.author_id);

  return {
    ...replyData,
    author: sanitizedAuthor
  };
}

/**
 * Sanitizes a post and its replies to ensure all data is valid
 */
export function sanitizePost(postData: any): Post {
  if (!postData || isQueryError(postData)) {
    return null as unknown as Post; // This should not happen with proper filtering
  }

  // Sanitize the post author
  const sanitizedAuthor = sanitizeAuthor(postData.author, postData.author_id);
  
  // Sanitize each reply
  const sanitizedReplies: Reply[] = Array.isArray(postData.post_replies) 
    ? postData.post_replies.map(sanitizeReply)
    : [];

  // Construct the sanitized post
  return {
    ...postData,
    author: sanitizedAuthor,
    post_replies: sanitizedReplies
  };
}
