
//  ✨  NO usamos "!author_id" porque la vista no tiene FK.
//     Hacemos un join "implícito" indicando qué columnas queremos de la vista.
//  ✨  Igual para los replies.

export const POST_SELECT = `
  id, content, created_at, author_id,

  author:v_forum_authors (
    id,
    admin_name,
    academy_name
  ),

  post_replies (
    id, content, created_at, author_id,

    author:v_forum_authors (
      id,
      admin_name,
      academy_name
    )
  )
`;
