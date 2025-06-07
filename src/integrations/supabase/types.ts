export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      academy_profiles: {
        Row: {
          academy_name: string
          admin_name: string
          country: string | null
          created_at: string
          default_language: string | null
          id: string
          logo_url: string | null
          phone: string | null
          timezone: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          academy_name: string
          admin_name: string
          country?: string | null
          created_at?: string
          default_language?: string | null
          id: string
          logo_url?: string | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          academy_name?: string
          admin_name?: string
          country?: string | null
          created_at?: string
          default_language?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      assignment_targets: {
        Row: {
          assignment_id: string
          status: Database["public"]["Enums"]["assignment_status"]
          student_id: string
          submitted_at: string | null
        }
        Insert: {
          assignment_id: string
          status?: Database["public"]["Enums"]["assignment_status"]
          student_id: string
          submitted_at?: string | null
        }
        Update: {
          assignment_id?: string
          status?: Database["public"]["Enums"]["assignment_status"]
          student_id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignment_targets_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_targets_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          class_id: string | null
          created_at: string | null
          deadline: string | null
          id: string
          instructions: string
          teacher_id: string | null
          title: string
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          deadline?: string | null
          id?: string
          instructions: string
          teacher_id?: string | null
          title: string
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          deadline?: string | null
          id?: string
          instructions?: string
          teacher_id?: string | null
          title?: string
        }
        Relationships: []
      }
      class_students: {
        Row: {
          class_id: string
          joined_at: string | null
          student_id: string
        }
        Insert: {
          class_id: string
          joined_at?: string | null
          student_id: string
        }
        Update: {
          class_id?: string
          joined_at?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          code: string
          created_at: string | null
          id: string
          name: string
          teacher_id: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          name: string
          teacher_id?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          name?: string
          teacher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_teacher_id_fkey"
            columns: ["teacher_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      corrections: {
        Row: {
          created_at: string
          errors: Json | null
          id: string
          level: string
          read_at: string | null
          recommendations: Json | null
          submission_id: string | null
          teacher_feedback: string | null
          teacher_private_note: string | null
          teacher_public_note: string | null
          word_count: number | null
        }
        Insert: {
          created_at?: string
          errors?: Json | null
          id?: string
          level: string
          read_at?: string | null
          recommendations?: Json | null
          submission_id?: string | null
          teacher_feedback?: string | null
          teacher_private_note?: string | null
          teacher_public_note?: string | null
          word_count?: number | null
        }
        Update: {
          created_at?: string
          errors?: Json | null
          id?: string
          level?: string
          read_at?: string | null
          recommendations?: Json | null
          submission_id?: string | null
          teacher_feedback?: string | null
          teacher_private_note?: string | null
          teacher_public_note?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "corrections_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "corrections_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "v_assignment_student_status"
            referencedColumns: ["submission_id"]
          },
        ]
      }
      email_preferences: {
        Row: {
          allow_emails: boolean
          allow_in_app: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          allow_emails?: boolean
          allow_in_app?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          allow_emails?: boolean
          allow_in_app?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          assignment_id: string | null
          created_at: string | null
          data: Json | null
          id: string
          link: string | null
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          assignment_id?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          link?: string | null
          message: string
          read?: boolean | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          assignment_id?: string | null
          created_at?: string | null
          data?: Json | null
          id?: string
          link?: string | null
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      post_replies: {
        Row: {
          author_id: string | null
          content: string | null
          created_at: string | null
          id: string
          post_id: string | null
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_replies_author_fk"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_replies_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_replies_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string | null
          class_id: string | null
          content: string | null
          created_at: string | null
          id: string
        }
        Insert: {
          author_id?: string | null
          class_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
        }
        Update: {
          author_id?: string | null
          class_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_fk"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          stripe_customer_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          stripe_customer_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          assignment_id: string | null
          created_at: string
          id: string
          notification_channel: string | null
          run_at: string
          sent: boolean
          student_id: string | null
        }
        Insert: {
          assignment_id?: string | null
          created_at?: string
          id?: string
          notification_channel?: string | null
          run_at: string
          sent?: boolean
          student_id?: string | null
        }
        Update: {
          assignment_id?: string | null
          created_at?: string
          id?: string
          notification_channel?: string | null
          run_at?: string
          sent?: boolean
          student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reminders_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reminders_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          ai_flags: Json | null
          ai_level: string | null
          ai_score: number | null
          assignment_id: string | null
          file_url: string | null
          id: string
          status: string | null
          student_id: string | null
          submitted_at: string | null
          text: string | null
        }
        Insert: {
          ai_flags?: Json | null
          ai_level?: string | null
          ai_score?: number | null
          assignment_id?: string | null
          file_url?: string | null
          id?: string
          status?: string | null
          student_id?: string | null
          submitted_at?: string | null
          text?: string | null
        }
        Update: {
          ai_flags?: Json | null
          ai_level?: string | null
          ai_score?: number | null
          assignment_id?: string | null
          file_url?: string | null
          id?: string
          status?: string | null
          student_id?: string | null
          submitted_at?: string | null
          text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          dashboard_density: string | null
          id: string
          language: string | null
          notification_emails: boolean | null
          theme: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dashboard_density?: string | null
          id?: string
          language?: string | null
          notification_emails?: boolean | null
          theme?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dashboard_density?: string | null
          id?: string
          language?: string | null
          notification_emails?: boolean | null
          theme?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_assignment_student_status: {
        Row: {
          assignment_id: string | null
          correction_id: string | null
          has_feedback: boolean | null
          status: Database["public"]["Enums"]["assignment_status"] | null
          student_id: string | null
          submission_created_at: string | null
          submission_id: string | null
          submitted_at: string | null
          teacher_public_note: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignment_targets_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_targets_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      create_assignment_with_targets: {
        Args: {
          _class_id: string
          _teacher_id: string
          _title: string
          _instructions: string
          _deadline?: string
          _student_ids?: string[]
        }
        Returns: string
      }
      create_class_reminders: {
        Args: {
          _assignment_id: string
          _run_at: string
          _notification_channel?: string
        }
        Returns: number
      }
      mark_correction_read: {
        Args: { correction_id: string }
        Returns: undefined
      }
      mark_overdue_as_late: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      teacher_assignment_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          title: string
          deadline: string
          created_at: string
          class_name: string
          stats: Json
        }[]
      }
    }
    Enums: {
      assignment_status: "pending" | "submitted" | "late"
      user_role: "teacher" | "student"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      assignment_status: ["pending", "submitted", "late"],
      user_role: ["teacher", "student"],
    },
  },
} as const
