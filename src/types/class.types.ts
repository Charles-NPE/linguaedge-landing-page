
export interface StudentProfile {
  id: string;
  email?: string;
  avatar_url?: string;
  academy_name?: string;
  full_name?: string;
}

export interface Student {
  student_id?: string;
  status?: string;
  profiles?: StudentProfile | null;
  invited_email?: string;
}

export interface Author {
  id: string;
  email?: string;
  avatar_url?: string | null;
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

export interface ClassRow {
  id: string;
  name: string;
  code: string;
  teacher_id: string;
}
