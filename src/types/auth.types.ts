
export type UserRole = "teacher" | "student";

export interface UserProfile {
  id: string;
  created_at?: string;
  updated_at?: string;
  role: UserRole;
  email?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  stripe_plan?: string;
  stripe_status?: string;
}

// Changed to extend the Supabase User type directly
// This resolves the TypeScript error with identities
import { User } from "@supabase/supabase-js";

export interface AuthUser extends User {
  profile?: UserProfile;
}
