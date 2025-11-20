export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      event_sites: {
        Row: {
          config: Json | null
          created_at: string | null
          event_id: string
          id: string
          sections: Json | null
          styles: Json | null
          theme: string | null
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          event_id: string
          id?: string
          sections?: Json | null
          styles?: Json | null
          theme?: string | null
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          event_id?: string
          id?: string
          sections?: Json | null
          styles?: Json | null
          theme?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_sites_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_sites_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "public_events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          banner_url: string | null
          created_at: string | null
          custom_fields: Json | null
          description: string | null
          encryption_key: string
          end_date: string | null
          id: string
          is_published: boolean | null
          name: string
          slug: string
          start_date: string
          updated_at: string | null
          user_id: string
          venue: string | null
        }
        Insert: {
          banner_url?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          description?: string | null
          encryption_key: string
          end_date?: string | null
          id?: string
          is_published?: boolean | null
          name: string
          slug: string
          start_date: string
          updated_at?: string | null
          user_id: string
          venue?: string | null
        }
        Update: {
          banner_url?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          description?: string | null
          encryption_key?: string
          end_date?: string | null
          id?: string
          is_published?: boolean | null
          name?: string
          slug?: string
          start_date?: string
          updated_at?: string | null
          user_id?: string
          venue?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      registrations: {
        Row: {
          check_in_status: boolean | null
          check_in_time: string | null
          created_at: string | null
          email: string
          event_id: string
          form_data: Json | null
          full_name: string
          id: string
          image_url: string | null
          payment_id: string | null
          payment_status: string | null
          phone: string | null
          ticket_token: string | null
          ticket_type: string | null
        }
        Insert: {
          check_in_status?: boolean | null
          check_in_time?: string | null
          created_at?: string | null
          email: string
          event_id: string
          form_data?: Json | null
          full_name: string
          id?: string
          image_url?: string | null
          payment_id?: string | null
          payment_status?: string | null
          phone?: string | null
          ticket_token?: string | null
          ticket_type?: string | null
        }
        Update: {
          check_in_status?: boolean | null
          check_in_time?: string | null
          created_at?: string | null
          email?: string
          event_id?: string
          form_data?: Json | null
          full_name?: string
          id?: string
          image_url?: string | null
          payment_id?: string | null
          payment_status?: string | null
          phone?: string | null
          ticket_token?: string | null
          ticket_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "public_events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_events: {
        Row: {
          banner_url: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string | null
          is_published: boolean | null
          name: string | null
          slug: string | null
          start_date: string | null
          updated_at: string | null
          venue: string | null
        }
        Insert: {
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string | null
          is_published?: boolean | null
          name?: string | null
          slug?: string | null
          start_date?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Update: {
          banner_url?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string | null
          is_published?: boolean | null
          name?: string | null
          slug?: string | null
          start_date?: string | null
          updated_at?: string | null
          venue?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_in_registrant: {
        Args: { event_uuid: string; ticket_token_input: string }
        Returns: Json
      }
      decrypt_text: {
        Args: { encrypted_data: string; encryption_key: string }
        Returns: string
      }
      encrypt_text: {
        Args: { data: string; encryption_key: string }
        Returns: string
      }
      get_event_registrations: {
        Args: { encryption_key: string; event_uuid: string }
        Returns: {
          created_at: string
          email: string
          event_id: string
          form_data: Json
          full_name: string
          id: string
          payment_id: string
          payment_status: string
          phone: string
          ticket_type: string
        }[]
      }
      get_event_registrations_auto: {
        Args: { event_uuid: string }
        Returns: {
          check_in_status: boolean
          check_in_time: string
          created_at: string
          email: string
          event_id: string
          form_data: Json
          full_name: string
          image_url: string
          payment_id: string
          payment_status: string
          phone: string
          registration_id: string
          ticket_token: string
          ticket_type: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
