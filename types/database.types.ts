export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      atualizar: {
        Row: {
          created_at: string;
          id: number;
          numero: number | null;
        };
        Insert: {
          created_at?: string;
          id?: number;
          numero?: number | null;
        };
        Update: {
          created_at?: string;
          id?: number;
          numero?: number | null;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          slug: string;
          sort_order: number;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          slug: string;
          sort_order?: number;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          slug?: string;
          sort_order?: number;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "categories_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      order_counters: {
        Row: {
          counter_date: string;
          last_number: number;
          tenant_id: string;
        };
        Insert: {
          counter_date: string;
          last_number?: number;
          tenant_id: string;
        };
        Update: {
          counter_date?: string;
          last_number?: number;
          tenant_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_counters_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          created_at: string;
          id: string;
          notes: string | null;
          order_id: string;
          product_id: string | null;
          product_name_snapshot: string;
          quantity: number;
          tenant_id: string;
          unit_price_cents: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          order_id: string;
          product_id?: string | null;
          product_name_snapshot: string;
          quantity?: number;
          tenant_id: string;
          unit_price_cents: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          order_id?: string;
          product_id?: string | null;
          product_name_snapshot?: string;
          quantity?: number;
          tenant_id?: string;
          unit_price_cents?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_tenant_id_fkey";
            columns: ["order_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "order_items_product_id_tenant_id_fkey";
            columns: ["product_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "order_items_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      order_tracking_status: {
        Row: {
          accepted_at: string | null;
          cancelled_at: string | null;
          completed_at: string | null;
          created_at: string;
          delivered_at: string | null;
          discount_cents: number;
          estimated_ready_at: string | null;
          order_id: string;
          order_number: number;
          order_type: Database["public"]["Enums"]["order_type"];
          preparing_at: string | null;
          ready_at: string | null;
          service_fee_cents: number;
          status: Database["public"]["Enums"]["order_status"];
          subtotal_cents: number;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          accepted_at?: string | null;
          cancelled_at?: string | null;
          completed_at?: string | null;
          created_at: string;
          delivered_at?: string | null;
          discount_cents: number;
          estimated_ready_at?: string | null;
          order_id: string;
          order_number: number;
          order_type: Database["public"]["Enums"]["order_type"];
          preparing_at?: string | null;
          ready_at?: string | null;
          service_fee_cents: number;
          status: Database["public"]["Enums"]["order_status"];
          subtotal_cents: number;
          tenant_id: string;
          updated_at: string;
        };
        Update: {
          accepted_at?: string | null;
          cancelled_at?: string | null;
          completed_at?: string | null;
          created_at?: string;
          delivered_at?: string | null;
          discount_cents?: number;
          estimated_ready_at?: string | null;
          order_id?: string;
          order_number?: number;
          order_type?: Database["public"]["Enums"]["order_type"];
          preparing_at?: string | null;
          ready_at?: string | null;
          service_fee_cents?: number;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal_cents?: number;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_tracking_status_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: true;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_tracking_status_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          accepted_at: string | null;
          cancelled_at: string | null;
          cancelled_reason: string | null;
          completed_at: string | null;
          coupon_code: string | null;
          created_at: string;
          customer_name: string | null;
          customer_phone: string | null;
          delivered_at: string | null;
          discount_cents: number;
          estimated_ready_at: string | null;
          id: string;
          is_priority: boolean;
          notes: string | null;
          order_number: number;
          order_type: Database["public"]["Enums"]["order_type"];
          preparing_at: string | null;
          ready_at: string | null;
          service_fee_cents: number;
          status: Database["public"]["Enums"]["order_status"];
          subtotal_cents: number;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          accepted_at?: string | null;
          cancelled_at?: string | null;
          cancelled_reason?: string | null;
          completed_at?: string | null;
          coupon_code?: string | null;
          created_at?: string;
          customer_name?: string | null;
          customer_phone?: string | null;
          delivered_at?: string | null;
          discount_cents?: number;
          estimated_ready_at?: string | null;
          id?: string;
          is_priority?: boolean;
          notes?: string | null;
          order_number: number;
          order_type?: Database["public"]["Enums"]["order_type"];
          preparing_at?: string | null;
          ready_at?: string | null;
          service_fee_cents?: number;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal_cents?: number;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          accepted_at?: string | null;
          cancelled_at?: string | null;
          cancelled_reason?: string | null;
          completed_at?: string | null;
          coupon_code?: string | null;
          created_at?: string;
          customer_name?: string | null;
          customer_phone?: string | null;
          delivered_at?: string | null;
          discount_cents?: number;
          estimated_ready_at?: string | null;
          id?: string;
          is_priority?: boolean;
          notes?: string | null;
          order_number?: number;
          order_type?: Database["public"]["Enums"]["order_type"];
          preparing_at?: string | null;
          ready_at?: string | null;
          service_fee_cents?: number;
          status?: Database["public"]["Enums"]["order_status"];
          subtotal_cents?: number;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          category_id: string;
          created_at: string;
          description: string | null;
          id: string;
          image_url: string | null;
          is_available: boolean;
          is_featured: boolean;
          is_new: boolean;
          is_published: boolean;
          name: string;
          prep_time_minutes: number;
          price_cents: number;
          sort_order: number;
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          category_id: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_available?: boolean;
          is_featured?: boolean;
          is_new?: boolean;
          is_published?: boolean;
          name: string;
          prep_time_minutes?: number;
          price_cents: number;
          sort_order?: number;
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          category_id?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          image_url?: string | null;
          is_available?: boolean;
          is_featured?: boolean;
          is_new?: boolean;
          is_published?: boolean;
          name?: string;
          prep_time_minutes?: number;
          price_cents?: number;
          sort_order?: number;
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_tenant_id_fkey";
            columns: ["category_id", "tenant_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id", "tenant_id"];
          },
          {
            foreignKeyName: "products_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          full_name: string | null;
          id: string;
          role: Database["public"]["Enums"]["user_role"];
          tenant_id: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          full_name?: string | null;
          id: string;
          role?: Database["public"]["Enums"]["user_role"];
          tenant_id: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          full_name?: string | null;
          id?: string;
          role?: Database["public"]["Enums"]["user_role"];
          tenant_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey";
            columns: ["tenant_id"];
            isOneToOne: false;
            referencedRelation: "tenants";
            referencedColumns: ["id"];
          },
        ];
      };
      tenants: {
        Row: {
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          slug: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          slug: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          slug?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_order: {
        Args: {
          p_customer_name: string;
          p_customer_phone: string;
          p_items: Json;
          p_notes: string;
          p_order_type: Database["public"]["Enums"]["order_type"];
          p_tenant_id: string;
        };
        Returns: Json;
      };
      current_profile_role: {
        Args: never;
        Returns: Database["public"]["Enums"]["user_role"];
      };
      current_profile_tenant: { Args: never; Returns: string };
      is_super_admin: { Args: never; Returns: boolean };
      is_tenant_manager: { Args: { target_tenant: string }; Returns: boolean };
      is_tenant_staff: { Args: { target_tenant: string }; Returns: boolean };
    };
    Enums: {
      order_status:
        | "new"
        | "accepted"
        | "preparing"
        | "ready"
        | "delivered"
        | "completed"
        | "cancelled";
      order_type: "pickup" | "delivery" | "dine_in";
      user_role: "super_admin" | "owner" | "manager" | "kitchen" | "cashier";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      order_status: [
        "new",
        "accepted",
        "preparing",
        "ready",
        "delivered",
        "completed",
        "cancelled",
      ],
      order_type: ["pickup", "delivery", "dine_in"],
      user_role: ["super_admin", "owner", "manager", "kitchen", "cashier"],
    },
  },
} as const;

/**
 * Aliases de conveniência para enums usados fora do bloco gerado (auth,
 * domínio de pedidos). Mantidos fora do bloco gerado para sobreviver a
 * regenerações.
 */
export type UserRole = Database["public"]["Enums"]["user_role"];
export type OrderStatus = Database["public"]["Enums"]["order_status"];
export type OrderType = Database["public"]["Enums"]["order_type"];
