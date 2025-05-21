
export const POST_SELECT = `
  id,
  content,
  created_at,
  author_id,
  author:profiles!posts_author_fk (
    id,
    full_name
  ),
  post_replies (
    id,
    content,
    created_at,
    author_id,
    author:profiles!post_replies_author_fk (
      id,
      full_name
    )
  )
`;
