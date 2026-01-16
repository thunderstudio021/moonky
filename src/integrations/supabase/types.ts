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
      banners: {
        Row: {
          created_at: string
          display_order: number
          ends_at: string | null
          id: string
          image_url: string
          is_active: boolean
          link_id: string | null
          link_type: string | null
          link_url: string | null
          starts_at: string | null
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          ends_at?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          link_id?: string | null
          link_type?: string | null
          link_url?: string | null
          starts_at?: string | null
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          ends_at?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          link_id?: string | null
          link_type?: string | null
          link_url?: string | null
          starts_at?: string | null
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          created_at: string
          id: string
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      cash_register_sessions: {
        Row: {
          actual_balance: number | null
          closed_at: string | null
          created_at: string
          difference: number | null
          expected_balance: number | null
          id: string
          initial_fund: number
          opened_at: string
          operator_id: string
          status: string
          updated_at: string
        }
        Insert: {
          actual_balance?: number | null
          closed_at?: string | null
          created_at?: string
          difference?: number | null
          expected_balance?: number | null
          id?: string
          initial_fund?: number
          opened_at?: string
          operator_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          actual_balance?: number | null
          closed_at?: string | null
          created_at?: string
          difference?: number | null
          expected_balance?: number | null
          id?: string
          initial_fund?: number
          opened_at?: string
          operator_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      coupon_uses: {
        Row: {
          coupon_id: string
          id: string
          order_id: string | null
          used_at: string
          user_id: string
        }
        Insert: {
          coupon_id: string
          id?: string
          order_id?: string | null
          used_at?: string
          user_id: string
        }
        Update: {
          coupon_id?: string
          id?: string
          order_id?: string | null
          used_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_uses_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_uses_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          current_uses: number
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_uses: number | null
          minimum_order_value: number | null
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number
          description?: string | null
          discount_type?: string
          discount_value: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          minimum_order_value?: number | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          minimum_order_value?: number | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string
          description: string | null
          event_date: string
          event_time: string
          id: string
          image_url: string | null
          is_active: boolean
          location: string | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_date: string
          event_time: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          location?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_date?: string
          event_time?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          location?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          payment_method: string | null
          shipping_address: Json | null
          status: string
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          shipping_address?: Json | null
          status?: string
          total: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          shipping_address?: Json | null
          status?: string
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      points_history: {
        Row: {
          created_at: string
          description: string | null
          id: string
          points: number
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          points: number
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          points?: number
          user_id?: string
        }
        Relationships: []
      }
      product_categories: {
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
      product_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          product_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean | null
          alcohol_content: number | null
          brand_id: string | null
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_on_sale: boolean | null
          name: string
          price: number
          sale_price: number | null
          stock: number | null
          updated_at: string
          volume_ml: number | null
        }
        Insert: {
          active?: boolean | null
          alcohol_content?: number | null
          brand_id?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_on_sale?: boolean | null
          name: string
          price: number
          sale_price?: number | null
          stock?: number | null
          updated_at?: string
          volume_ml?: number | null
        }
        Update: {
          active?: boolean | null
          alcohol_content?: number | null
          brand_id?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_on_sale?: boolean | null
          name?: string
          price?: number
          sale_price?: number | null
          stock?: number | null
          updated_at?: string
          volume_ml?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: Json | null
          avatar_url: string | null
          created_at: string
          date_of_birth: string | null
          full_name: string | null
          gender: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: Json | null
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: Json | null
          avatar_url?: string | null
          created_at?: string
          date_of_birth?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          client_name: string
          client_phone: string
          created_at: string
          id: string
          party_size: number
          reservation_date: string
          reservation_time: string
          table_id: string
          updated_at: string
        }
        Insert: {
          client_name: string
          client_phone: string
          created_at?: string
          id?: string
          party_size?: number
          reservation_date: string
          reservation_time: string
          table_id: string
          updated_at?: string
        }
        Update: {
          client_name?: string
          client_phone?: string
          created_at?: string
          id?: string
          party_size?: number
          reservation_date?: string
          reservation_time?: string
          table_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "tables"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          address: string | null
          created_at: string
          default_theme: string | null
          delivery_cep: string | null
          delivery_city: string | null
          delivery_fee: number | null
          delivery_state: string | null
          email: string | null
          facebook_url: string | null
          free_delivery_threshold: number | null
          id: string
          instagram_url: string | null
          minimum_order_value: number | null
          opening_hours: Json | null
          phone: string | null
          primary_color: string | null
          secondary_color: string | null
          show_age_restriction: boolean | null
          store_description: string | null
          store_logo_url: string | null
          store_name: string
          tiktok_url: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          default_theme?: string | null
          delivery_cep?: string | null
          delivery_city?: string | null
          delivery_fee?: number | null
          delivery_state?: string | null
          email?: string | null
          facebook_url?: string | null
          free_delivery_threshold?: number | null
          id?: string
          instagram_url?: string | null
          minimum_order_value?: number | null
          opening_hours?: Json | null
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          show_age_restriction?: boolean | null
          store_description?: string | null
          store_logo_url?: string | null
          store_name?: string
          tiktok_url?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          default_theme?: string | null
          delivery_cep?: string | null
          delivery_city?: string | null
          delivery_fee?: number | null
          delivery_state?: string | null
          email?: string | null
          facebook_url?: string | null
          free_delivery_threshold?: number | null
          id?: string
          instagram_url?: string | null
          minimum_order_value?: number | null
          opening_hours?: Json | null
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          show_age_restriction?: boolean | null
          store_description?: string | null
          store_logo_url?: string | null
          store_name?: string
          tiktok_url?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      tables: {
        Row: {
          created_at: string
          id: string
          number: number
          status: Database["public"]["Enums"]["table_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          number: number
          status?: Database["public"]["Enums"]["table_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          number?: number
          status?: Database["public"]["Enums"]["table_status"]
          updated_at?: string
        }
        Relationships: []
      }
      ticket_sales: {
        Row: {
          created_at: string
          event_id: string
          id: string
          payment_method: string | null
          payment_status: string
          quantity: number
          ticket_type_id: string
          total_price: number
          unit_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          payment_method?: string | null
          payment_status?: string
          quantity?: number
          ticket_type_id: string
          total_price: number
          unit_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          payment_method?: string | null
          payment_status?: string
          quantity?: number
          ticket_type_id?: string
          total_price?: number
          unit_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_sales_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_sales_ticket_type_id_fkey"
            columns: ["ticket_type_id"]
            isOneToOne: false
            referencedRelation: "ticket_types"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_types: {
        Row: {
          created_at: string
          description: string | null
          event_id: string
          id: string
          is_active: boolean
          name: string
          price: number
          quantity_available: number
          quantity_sold: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          event_id: string
          id?: string
          is_active?: boolean
          name: string
          price: number
          quantity_available?: number
          quantity_sold?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          event_id?: string
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          quantity_available?: number
          quantity_sold?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_types_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount_paid: number | null
          change_amount: number | null
          created_at: string
          discount_amount: number | null
          discount_type: string | null
          discount_value: number | null
          id: string
          items: Json
          operator_id: string
          payment_method: string
          session_id: string
          subtotal: number
          total: number
        }
        Insert: {
          amount_paid?: number | null
          change_amount?: number | null
          created_at?: string
          discount_amount?: number | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          items?: Json
          operator_id: string
          payment_method: string
          session_id: string
          subtotal: number
          total: number
        }
        Update: {
          amount_paid?: number | null
          change_amount?: number | null
          created_at?: string
          discount_amount?: number | null
          discount_type?: string | null
          discount_value?: number | null
          id?: string
          items?: Json
          operator_id?: string
          payment_method?: string
          session_id?: string
          subtotal?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "transactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "cash_register_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_points: {
        Row: {
          created_at: string
          id: string
          points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_user_points: {
        Args: { p_description?: string; p_points: number; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      table_status: "free" | "reserved" | "occupied" | "unavailable"
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
      table_status: ["free", "reserved", "occupied", "unavailable"],
    },
  },
} as const
