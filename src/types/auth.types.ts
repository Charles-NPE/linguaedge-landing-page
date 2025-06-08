
import { User } from "@supabase/supabase-js";

export type UserRole = 'teacher' | 'student';

export interface UserProfile {
  id: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
  stripe_customer_id?: string | null;
  stripe_status?: string | null;
  subscription_tier?: string | null;
  subscription_end?: string | null;
  full_name?: string | null;
  phone?: string | null;
}

export interface AuthUser extends User {
  profile?: UserProfile;
}
