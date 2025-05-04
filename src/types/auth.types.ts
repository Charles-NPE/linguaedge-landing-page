
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

export interface AuthUser extends User {
  profile?: UserProfile;
}

interface User {
  id: string;
  app_metadata: {
    provider?: string;
    [key: string]: any;
  };
  user_metadata: {
    [key: string]: any;
  };
  aud: string;
  confirmation_sent_at?: string;
  recovery_sent_at?: string;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
  confirmed_at?: string;
  last_sign_in_at?: string;
  role?: string;
  created_at: string;
  updated_at?: string;
  email?: string;
  phone?: string;
  identities?: UserIdentity[];
  preferences?: {
    [key: string]: any;
  };
}

interface UserIdentity {
  id: string;
  user_id: string;
  identity_data: {
    [key: string]: any;
  };
  provider: string;
  created_at?: string;
  updated_at?: string;
  last_sign_in_at?: string;
}
