export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type Goal = "deficit" | "maintenance" | "surplus";
export type Phase = "deficit" | "maintenance" | "surplus";
export type UserRole = "trainer" | "client";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };

      clients: {
        Row: {
          id: string;
          profile_id: string;
          trainer_id: string;
          phase: Phase;
          goal: Goal;
          weight_kg: number;
          body_fat_pct: number | null;
          activity_level: ActivityLevel;
          daily_steps: number;
          target_weight_kg: number | null;
          joined_date: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["clients"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
      };

      weight_logs: {
        Row: {
          id: string;
          client_id: string;
          weight_kg: number;
          body_fat_pct: number | null;
          logged_at: string;
          notes: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["weight_logs"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["weight_logs"]["Insert"]>;
      };

      measurements: {
        Row: {
          id: string;
          client_id: string;
          waist_cm: number | null;
          hip_cm: number | null;
          chest_cm: number | null;
          arm_cm: number | null;
          thigh_cm: number | null;
          measured_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["measurements"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["measurements"]["Insert"]>;
      };

      workout_plans: {
        Row: {
          id: string;
          client_id: string;
          name: string;
          days_per_week: number;
          active: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["workout_plans"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["workout_plans"]["Insert"]>;
      };

      workout_days: {
        Row: {
          id: string;
          plan_id: string;
          name: string;
          order_index: number;
        };
        Insert: Omit<Database["public"]["Tables"]["workout_days"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["workout_days"]["Insert"]>;
      };

      exercises: {
        Row: {
          id: string;
          day_id: string;
          name: string;
          muscle_group: string;
          target_sets: number;
          target_reps: string;
          target_rir: number;
          order_index: number;
          notes: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["exercises"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["exercises"]["Insert"]>;
      };

      workout_sessions: {
        Row: {
          id: string;
          client_id: string;
          day_id: string;
          completed: boolean;
          started_at: string;
          finished_at: string | null;
          notes: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["workout_sessions"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["workout_sessions"]["Insert"]>;
      };

      set_logs: {
        Row: {
          id: string;
          session_id: string;
          exercise_id: string;
          set_number: number;
          weight_kg: number;
          reps: number;
          rir: number;
          completed: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["set_logs"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["set_logs"]["Insert"]>;
      };

      nutrition_logs: {
        Row: {
          id: string;
          client_id: string;
          logged_at: string;
          meal_name: string;
          food_name: string;
          calories: number;
          protein_g: number;
          carbs_g: number;
          fat_g: number;
          quantity_g: number | null;
        };
        Insert: Omit<Database["public"]["Tables"]["nutrition_logs"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["nutrition_logs"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      activity_level: ActivityLevel;
      goal: Goal;
      phase: Phase;
      user_role: UserRole;
    };
  };
}
