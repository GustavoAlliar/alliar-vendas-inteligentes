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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      commissions: {
        Row: {
          amount: number
          id: string
          lead_id: string
          rate: number
          status: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          amount: number
          id?: string
          lead_id: string
          rate: number
          status?: string
          tenant_id: string
          user_id: string
        }
        Update: {
          amount?: number
          id?: string
          lead_id?: string
          rate?: number
          status?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_tenant_id_lead_id_fkey"
            columns: ["tenant_id", "lead_id"]
            isOneToOne: true
            referencedRelation: "leads"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "commissions_tenant_id_user_id_fkey"
            columns: ["tenant_id", "user_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["tenant_id", "user_id"]
          },
        ]
      }
      contacts: {
        Row: {
          company: string
          email: string
          id: string
          name: string
          phone: string
          tenant_id: string
        }
        Insert: {
          company?: string
          email?: string
          id?: string
          name: string
          phone?: string
          tenant_id: string
        }
        Update: {
          company?: string
          email?: string
          id?: string
          name?: string
          phone?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contacts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_events: {
        Row: {
          created_at: string
          id: string
          kind: string
          lead_id: string
          tenant_id: string
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          lead_id: string
          tenant_id: string
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          lead_id?: string
          tenant_id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_events_tenant_id_lead_id_fkey"
            columns: ["tenant_id", "lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      leads: {
        Row: {
          contact_id: string
          created_at: string
          id: string
          owner_id: string
          priority: string
          stage: string
          temp: string
          tenant_id: string
          updated_at: string
          value: number
        }
        Insert: {
          contact_id: string
          created_at?: string
          id?: string
          owner_id: string
          priority?: string
          stage?: string
          temp?: string
          tenant_id: string
          updated_at?: string
          value?: number
        }
        Update: {
          contact_id?: string
          created_at?: string
          id?: string
          owner_id?: string
          priority?: string
          stage?: string
          temp?: string
          tenant_id?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "leads_tenant_id_contact_id_fkey"
            columns: ["tenant_id", "contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["tenant_id", "id"]
          },
          {
            foreignKeyName: "leads_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_tenant_id_owner_id_fkey"
            columns: ["tenant_id", "owner_id"]
            isOneToOne: false
            referencedRelation: "user_roles"
            referencedColumns: ["tenant_id", "user_id"]
          },
          {
            foreignKeyName: "leads_tenant_id_stage_fkey"
            columns: ["tenant_id", "stage"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      pipeline_stages: {
        Row: {
          id: string
          label: string
          position: number
          tenant_id: string
        }
        Insert: {
          id: string
          label: string
          position: number
          tenant_id: string
        }
        Update: {
          id?: string
          label?: string
          position?: number
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string
          display_name: string
          id: string
        }
        Insert: {
          avatar_url?: string
          display_name?: string
          id: string
        }
        Update: {
          avatar_url?: string
          display_name?: string
          id?: string
        }
        Relationships: []
      }
      proposals: {
        Row: {
          base: number
          created_at: string
          discount: number
          id: string
          lead_id: string
          status: string
          tenant_id: string
          total: number | null
        }
        Insert: {
          base: number
          created_at?: string
          discount?: number
          id?: string
          lead_id: string
          status?: string
          tenant_id: string
          total?: number | null
        }
        Update: {
          base?: number
          created_at?: string
          discount?: number
          id?: string
          lead_id?: string
          status?: string
          tenant_id?: string
          total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_tenant_id_lead_id_fkey"
            columns: ["tenant_id", "lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["tenant_id", "id"]
          },
        ]
      }
      tenant_invitations: {
        Row: {
          accepted_at: string | null
          email: string
          expires_at: string
          id: string
          tenant_id: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          email: string
          expires_at?: string
          id?: string
          tenant_id: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          tenant_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_invitations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_settings: {
        Row: {
          commission_rate: number
          pix_key: string
          structure: string
          tenant_id: string
        }
        Insert: {
          commission_rate?: number
          pix_key?: string
          structure?: string
          tenant_id: string
        }
        Update: {
          commission_rate?: number
          pix_key?: string
          structure?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          theme: string
          tour_done: boolean
          user_id: string
          view: string
        }
        Insert: {
          theme?: string
          tour_done?: boolean
          user_id: string
          view?: string
        }
        Update: {
          theme?: string
          tour_done?: boolean
          user_id?: string
          view?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          id?: string
          role: string
          tenant_id: string
          user_id: string
        }
        Update: {
          id?: string
          role?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invitation: { Args: { invite_token: string }; Returns: string }
      create_tenant: { Args: { company_name: string }; Returns: string }
      is_member: { Args: { t: string }; Returns: boolean }
      is_tenant_admin: { Args: { t: string }; Returns: boolean }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
