
export const POST_SELECT = `
  id,
  content,
  created_at,
  author_id,
  author:profiles!posts_author_fk (          -- 👈 usa FK explícito
    id,
    full_name
  ),
  post_replies (
    id,
    content,
    created_at,
    author_id,
    author:profiles!post_replies_author_fk (  -- idem para replies
      id,
      full_name
    )
  )
`;
