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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      attendance_records: {
        Row: {
          check_in: string | null
          check_out: string | null
          created_at: string
          date: string
          employee_id: string
          employee_name: string
          hours_worked: number
          id: string
          notes: string | null
          project_id: string | null
          project_name: string | null
          recorded_by: string | null
          status: string
        }
        Insert: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          date: string
          employee_id: string
          employee_name?: string
          hours_worked?: number
          id?: string
          notes?: string | null
          project_id?: string | null
          project_name?: string | null
          recorded_by?: string | null
          status?: string
        }
        Update: {
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          date?: string
          employee_id?: string
          employee_name?: string
          hours_worked?: number
          id?: string
          notes?: string | null
          project_id?: string | null
          project_name?: string | null
          recorded_by?: string | null
          status?: string
        }
        Relationships: []
      }
      billing_stages: {
        Row: {
          amount: number
          created_at: string
          due_date: string | null
          id: string
          invoiced: boolean
          paid: boolean
          project_id: string
          retention_percent: number
          stage_name: string
        }
        Insert: {
          amount?: number
          created_at?: string
          due_date?: string | null
          id?: string
          invoiced?: boolean
          paid?: boolean
          project_id: string
          retention_percent?: number
          stage_name?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string | null
          id?: string
          invoiced?: boolean
          paid?: boolean
          project_id?: string
          retention_percent?: number
          stage_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_stages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          assigned_project: string | null
          classification: string
          contract_type: string
          created_at: string
          daily_rate: number
          id: string
          id_number: string | null
          is_active: boolean
          name: string
          pay_frequency: string
          phone: string | null
          role: string | null
          start_date: string | null
          updated_at: string
        }
        Insert: {
          assigned_project?: string | null
          classification?: string
          contract_type?: string
          created_at?: string
          daily_rate?: number
          id?: string
          id_number?: string | null
          is_active?: boolean
          name?: string
          pay_frequency?: string
          phone?: string | null
          role?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          assigned_project?: string | null
          classification?: string
          contract_type?: string
          created_at?: string
          daily_rate?: number
          id?: string
          id_number?: string | null
          is_active?: boolean
          name?: string
          pay_frequency?: string
          phone?: string | null
          role?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      equipment: {
        Row: {
          assigned_project: string | null
          created_at: string
          current_value: number
          fuel_usage_per_day: number
          id: string
          last_maintenance: string | null
          name: string
          purchase_cost: number
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          assigned_project?: string | null
          created_at?: string
          current_value?: number
          fuel_usage_per_day?: number
          id?: string
          last_maintenance?: string | null
          name?: string
          purchase_cost?: number
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          assigned_project?: string | null
          created_at?: string
          current_value?: number
          fuel_usage_per_day?: number
          id?: string
          last_maintenance?: string | null
          name?: string
          purchase_cost?: number
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      investors: {
        Row: {
          capital_invested: number
          created_at: string
          equity_percent: number
          id: string
          join_date: string | null
          name: string
          returns_paid: number
          updated_at: string
        }
        Insert: {
          capital_invested?: number
          created_at?: string
          equity_percent?: number
          id?: string
          join_date?: string | null
          name?: string
          returns_paid?: number
          updated_at?: string
        }
        Update: {
          capital_invested?: number
          created_at?: string
          equity_percent?: number
          id?: string
          join_date?: string | null
          name?: string
          returns_paid?: number
          updated_at?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          created_at: string
          date: string
          description: string
          id: string
          posted_by: string | null
          reference: string | null
          reference_type: string
        }
        Insert: {
          created_at?: string
          date: string
          description?: string
          id?: string
          posted_by?: string | null
          reference?: string | null
          reference_type?: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string
          id?: string
          posted_by?: string | null
          reference?: string | null
          reference_type?: string
        }
        Relationships: []
      }
      journal_lines: {
        Row: {
          account_code: string
          account_name: string
          credit: number
          debit: number
          id: string
          journal_entry_id: string
        }
        Insert: {
          account_code: string
          account_name?: string
          credit?: number
          debit?: number
          id?: string
          journal_entry_id: string
        }
        Update: {
          account_code?: string
          account_name?: string
          credit?: number
          debit?: number
          id?: string
          journal_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_lines_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      loans: {
        Row: {
          amount: number
          created_at: string
          end_date: string | null
          id: string
          interest_rate: number
          lender: string
          linked_project: string | null
          monthly_repayment: number
          outstanding: number
          purpose: string | null
          start_date: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          end_date?: string | null
          id?: string
          interest_rate?: number
          lender?: string
          linked_project?: string | null
          monthly_repayment?: number
          outstanding?: number
          purpose?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          end_date?: string | null
          id?: string
          interest_rate?: number
          lender?: string
          linked_project?: string | null
          monthly_repayment?: number
          outstanding?: number
          purpose?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      materials: {
        Row: {
          category: string
          created_at: string
          id: string
          last_restocked: string | null
          linked_project: string | null
          location: string | null
          min_stock: number
          name: string
          quantity: number
          unit: string
          unit_cost: number
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          last_restocked?: string | null
          linked_project?: string | null
          location?: string | null
          min_stock?: number
          name?: string
          quantity?: number
          unit?: string
          unit_cost?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          last_restocked?: string | null
          linked_project?: string | null
          location?: string | null
          min_stock?: number
          name?: string
          quantity?: number
          unit?: string
          unit_cost?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: string | null
          created_at: string
          email: string
          id: string
          name: string
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          avatar?: string | null
          created_at?: string
          email?: string
          id: string
          name?: string
          role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          avatar?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          client_name: string
          completion_percent: number
          contract_value: number
          created_at: string
          expected_completion: string | null
          id: string
          name: string
          project_manager: string | null
          site_location: string | null
          start_date: string | null
          status: string
          supervisor: string | null
          updated_at: string
        }
        Insert: {
          client_name?: string
          completion_percent?: number
          contract_value?: number
          created_at?: string
          expected_completion?: string | null
          id?: string
          name: string
          project_manager?: string | null
          site_location?: string | null
          start_date?: string | null
          status?: string
          supervisor?: string | null
          updated_at?: string
        }
        Update: {
          client_name?: string
          completion_percent?: number
          contract_value?: number
          created_at?: string
          expected_completion?: string | null
          id?: string
          name?: string
          project_manager?: string | null
          site_location?: string | null
          start_date?: string | null
          status?: string
          supervisor?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          approved_by: string | null
          category: string
          created_at: string
          date: string | null
          description: string
          id: string
          project_id: string | null
          project_name: string | null
          type: string
          updated_at: string
        }
        Insert: {
          amount?: number
          approved_by?: string | null
          category?: string
          created_at?: string
          date?: string | null
          description?: string
          id?: string
          project_id?: string | null
          project_name?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          approved_by?: string | null
          category?: string
          created_at?: string
          date?: string | null
          description?: string
          id?: string
          project_id?: string | null
          project_name?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
