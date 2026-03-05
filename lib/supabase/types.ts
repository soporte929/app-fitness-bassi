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
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role: UserRole;
          avatar_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
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
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          profile_id: string;
          trainer_id: string;
          phase: Phase;
          goal: Goal;
          weight_kg: number;
          body_fat_pct?: number | null;
          activity_level: ActivityLevel;
          daily_steps: number;
          target_weight_kg?: number | null;
          joined_date: string;
          notes?: string | null;
          active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "clients_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clients_trainer_id_fkey";
            columns: ["trainer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          client_id: string;
          weight_kg: number;
          body_fat_pct?: number | null;
          logged_at: string;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["weight_logs"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "weight_logs_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          client_id: string;
          waist_cm?: number | null;
          hip_cm?: number | null;
          chest_cm?: number | null;
          arm_cm?: number | null;
          thigh_cm?: number | null;
          measured_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["measurements"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "measurements_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          client_id: string;
          name: string;
          days_per_week: number;
          active: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["workout_plans"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "workout_plans_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
      };

      workout_days: {
        Row: {
          id: string;
          plan_id: string;
          name: string;
          order_index: number;
        };
        Insert: {
          plan_id: string;
          name: string;
          order_index: number;
        };
        Update: Partial<Database["public"]["Tables"]["workout_days"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "workout_days_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "workout_plans";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          day_id: string;
          name: string;
          muscle_group: string;
          target_sets: number;
          target_reps: string;
          target_rir: number;
          order_index: number;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["exercises"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "exercises_day_id_fkey";
            columns: ["day_id"];
            isOneToOne: false;
            referencedRelation: "workout_days";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          client_id: string;
          day_id: string;
          completed: boolean;
          started_at: string;
          finished_at?: string | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["workout_sessions"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "workout_sessions_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workout_sessions_day_id_fkey";
            columns: ["day_id"];
            isOneToOne: false;
            referencedRelation: "workout_days";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          session_id: string;
          exercise_id: string;
          set_number: number;
          weight_kg: number;
          reps: number;
          rir: number;
          completed: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["set_logs"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "set_logs_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "workout_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "set_logs_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercises";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          client_id: string;
          logged_at: string;
          meal_name: string;
          food_name: string;
          calories: number;
          protein_g: number;
          carbs_g: number;
          fat_g: number;
          quantity_g?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["nutrition_logs"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "nutrition_logs_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      activity_level: ActivityLevel;
      goal: Goal;
      phase: Phase;
      user_role: UserRole;
    };
  };
}
