

export interface StudentProfile {
  id: string;
  avatar_url?: string;
  academy_name?: string;
  full_name?: string | null;
  phone?: string | null;
  email?: string;
}

export interface Student {
  student_id?: string;
  status?: string;
  profiles?: StudentProfile | null;
  invited_email?: string;
}

export interface Author {
  id: string;
  full_name: string;   // nombre a mostrar (Teacher, Charles, Unknown…)
  role: "teacher" | "student" | null;
}

export interface Reply {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  post_id?: string;
  author: Author;
}

export interface Post {
  id: string;
  author_id: string;
  content: string;
  created_at: string;
  post_replies: Reply[];
  author: Author;
}

export interface ClassRow {
  id: string;
  name: string;
  code: string;
  teacher_id: string;
}
