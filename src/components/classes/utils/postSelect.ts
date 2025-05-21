
export const POST_SELECT = `
  id, content, created_at, author_id,
  author:profiles ( id, full_name, phone ),
  post_replies (
    id, content, created_at, author_id,
    author:profiles ( id, full_name, phone )
  )
`;
