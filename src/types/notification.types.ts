
import { Database } from "@/integrations/supabase/types";

// Allowed values for Supabase.notifications.type
export type NotificationType =
  | "submission"
  | "assignment"
  | "feedback"
  | "reminder"
  | "reminder_sent";

type NotificationBase = Database["public"]["Tables"]["notifications"]["Row"];

/** UI-ready notification */
export interface Notification extends Omit<NotificationBase, "type"> {
  type: NotificationType;          // stricter literal union
  read_at?: string | null;         // optional timestamp when marked read
  link: string | null;             // navigation link for the notification (required, can be null)
  data: NotificationBase["data"];  // additional metadata (Json | null)
}
