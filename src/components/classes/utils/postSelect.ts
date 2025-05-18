
export const POST_SELECT = `
  id, content, created_at, author_id,
  author:v_forum_authors!author_id (
    id, admin_name, academy_name
  ),
  post_replies (
    id, content, created_at, author_id,
    author:v_forum_authors!author_id (
      id, admin_name, academy_name
    )
  )
`;
