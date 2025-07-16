export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          message: string
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          message: string
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          message?: string
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      furniture_items: {
        Row: {
          condition: string | null
          created_at: string | null
          id: string
          item_name: string
          room_id: string | null
          updated_at: string | null
        }
        Insert: {
          condition?: string | null
          created_at?: string | null
          id?: string
          item_name: string
          room_id?: string | null
          updated_at?: string | null
        }
        Update: {
          condition?: string | null
          created_at?: string | null
          id?: string
          item_name?: string
          room_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "furniture_items_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          id: string
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      requests: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          description: string
          id: string
          priority: string | null
          room_number: string | null
          status: string | null
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          description: string
          id?: string
          priority?: string | null
          room_number?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          description?: string
          id?: string
          priority?: string | null
          room_number?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      room_assignments: {
        Row: {
          assigned_at: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          room_id: string | null
          student_id: string | null
          vacated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          room_id?: string | null
          student_id?: string | null
          vacated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          room_id?: string | null
          student_id?: string | null
          vacated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "room_assignments_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          condition: string | null
          created_at: string | null
          current_occupancy: number | null
          floor: string
          id: string
          last_inspection: string | null
          max_occupancy: number | null
          room_number: string
          room_size: string | null
          room_type: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          condition?: string | null
          created_at?: string | null
          current_occupancy?: number | null
          floor: string
          id?: string
          last_inspection?: string | null
          max_occupancy?: number | null
          room_number: string
          room_size?: string | null
          room_type?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          condition?: string | null
          created_at?: string | null
          current_occupancy?: number | null
          floor?: string
          id?: string
          last_inspection?: string | null
          max_occupancy?: number | null
          room_number?: string
          room_size?: string | null
          room_type?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      student_registrations: {
        Row: {
          academic_year: number | null
          additional_reports: string | null
          age: number
          created_at: string | null
          full_name: string
          graduation_status: string | null
          id: string
          id_number: string
          phone: string
          photo_url: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["registration_status"] | null
          telephone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          academic_year?: number | null
          additional_reports?: string | null
          age: number
          created_at?: string | null
          full_name: string
          graduation_status?: string | null
          id?: string
          id_number: string
          phone: string
          photo_url?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["registration_status"] | null
          telephone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          academic_year?: number | null
          additional_reports?: string | null
          age?: number
          created_at?: string | null
          full_name?: string
          graduation_status?: string | null
          id?: string
          id_number?: string
          phone?: string
          photo_url?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["registration_status"] | null
          telephone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "student"
      registration_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff", "student"],
      registration_status: ["pending", "approved", "rejected"],
    },
  },
} as const
