
import { User } from "@supabase/supabase-js";

export type UserRole = 'teacher' | 'student';

export interface UserProfile {
  id: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface AuthUser extends User {
  profile?: UserProfile;
}
