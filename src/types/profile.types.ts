
export interface Profile {
  id: string;
  role: "teacher" | "student";
  stripe_customer_id: string | null;
  full_name?: string | null;
  phone?: string | null;
  created_at: string;
  updated_at: string;
}
