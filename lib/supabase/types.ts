export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "very_active";
export type PlanPhase = "recomposition" | "deficit" | "volume" | "maintenance";
export type PlanLevel = "beginner" | "intermediate" | "advanced";
export type Goal = "deficit" | "maintenance" | "surplus";
export type Phase = "recomposition" | "deficit" | "volume" | "maintenance" | "surplus";
export type Lifestyle = "sedentary" | "light" | "active" | "very_active";
export type TrainingDays = "3" | "4-5" | "6";
export type Objective = "lose_fat" | "gain_muscle" | "maintenance_high" | "maintenance_normal";
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
          objective: Objective | null;
          weight_kg: number;
          body_fat_pct: number | null;
          age: number | null;
          height_cm: number | null;
          activity_level: ActivityLevel;
          lifestyle: Lifestyle | null;
          training_days: TrainingDays | null;
          daily_steps: number;
          target_weight_kg: number | null;
          joined_date: string;
          notes: string | null;
          trainer_notes: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          profile_id: string;
          trainer_id: string;
          phase: Phase;
          goal: Goal;
          objective?: Objective | null;
          weight_kg: number;
          body_fat_pct?: number | null;
          age?: number | null;
          height_cm?: number | null;
          activity_level: ActivityLevel;
          lifestyle?: Lifestyle | null;
          training_days?: TrainingDays | null;
          daily_steps: number;
          target_weight_kg?: number | null;
          joined_date: string;
          notes?: string | null;
          trainer_notes?: string | null;
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
          client_id: string | null;
          trainer_id: string;
          name: string;
          description: string | null;
          days_per_week: number;
          active: boolean;
          is_template: boolean;
          created_at: string;
        };
        Insert: {
          client_id?: string | null;
          trainer_id: string;
          name: string;
          description?: string | null;
          days_per_week: number;
          active?: boolean;
          is_template?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["workout_plans"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "workout_plans_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workout_plans_trainer_id_fkey";
            columns: ["trainer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
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
          kcal: number | null;
          protein_g: number | null;
          carbs_g: number | null;
          fat_g: number | null;
        };
        Insert: {
          client_id: string;
          logged_at?: string;
          meal_name: string;
          kcal?: number | null;
          protein_g?: number | null;
          carbs_g?: number | null;
          fat_g?: number | null;
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

      nutrition_plans: {
        Row: {
          id: string;
          client_id: string;
          trainer_id: string;
          name: string;
          kcal_target: number | null;
          protein_target_g: number | null;
          carbs_target_g: number | null;
          fat_target_g: number | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          trainer_id: string;
          name?: string;
          kcal_target?: number | null;
          protein_target_g?: number | null;
          carbs_target_g?: number | null;
          fat_target_g?: number | null;
          active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["nutrition_plans"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "nutrition_plans_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "nutrition_plans_trainer_id_fkey";
            columns: ["trainer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      nutrition_plan_meals: {
        Row: {
          id: string;
          plan_id: string;
          name: string;
          kcal_per_100g: number | null;
          protein_per_100g: number | null;
          carbs_per_100g: number | null;
          fat_per_100g: number | null;
          default_grams: number | null;
          meal_time: string | null;
          order_index: number | null;
        };
        Insert: {
          id?: string;
          plan_id: string;
          name: string;
          kcal_per_100g?: number | null;
          protein_per_100g?: number | null;
          carbs_per_100g?: number | null;
          fat_per_100g?: number | null;
          default_grams?: number | null;
          meal_time?: string | null;
          order_index?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["nutrition_plan_meals"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "nutrition_plan_meals_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "nutrition_plans";
            referencedColumns: ["id"];
          }
        ];
      };

      nutrition_meal_logs: {
        Row: {
          id: string;
          client_id: string;
          meal_id: string;
          logged_date: string;
          completed: boolean;
          grams: number | null;
        };
        Insert: {
          id?: string;
          client_id: string;
          meal_id: string;
          logged_date?: string;
          completed?: boolean;
          grams?: number | null;
        };
        Update: Partial<Database["public"]["Tables"]["nutrition_meal_logs"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "nutrition_meal_logs_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "nutrition_meal_logs_meal_id_fkey";
            columns: ["meal_id"];
            isOneToOne: false;
            referencedRelation: "nutrition_plan_meals";
            referencedColumns: ["id"];
          }
        ];
      };

      plans: {
        Row: {
          id: string;
          trainer_id: string;
          name: string;
          description: string | null;
          phase: PlanPhase | null;
          level: PlanLevel | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          trainer_id: string;
          name: string;
          description?: string | null;
          phase?: PlanPhase | null;
          level?: PlanLevel | null;
          active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["plans"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "plans_trainer_id_fkey";
            columns: ["trainer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      plan_routines: {
        Row: {
          id: string;
          plan_id: string;
          workout_plan_id: string;
          order_index: number;
        };
        Insert: {
          plan_id: string;
          workout_plan_id: string;
          order_index?: number;
        };
        Update: Partial<Database["public"]["Tables"]["plan_routines"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "plan_routines_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "plan_routines_workout_plan_id_fkey";
            columns: ["workout_plan_id"];
            isOneToOne: false;
            referencedRelation: "workout_plans";
            referencedColumns: ["id"];
          }
        ];
      };

      client_plans: {
        Row: {
          id: string;
          client_id: string;
          plan_id: string;
          active: boolean;
          assigned_at: string;
        };
        Insert: {
          client_id: string;
          plan_id: string;
          active?: boolean;
          assigned_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["client_plans"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "client_plans_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_plans_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "plans";
            referencedColumns: ["id"];
          }
        ];
      };

      revisions: {
        Row: {
          id: string;
          client_id: string;
          trainer_id: string;
          revision_date: string;
          notes: string | null;
          trainer_feedback: string | null;
          next_revision_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          client_id: string;
          trainer_id: string;
          revision_date: string;
          notes?: string | null;
          trainer_feedback?: string | null;
          next_revision_date?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["revisions"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "revisions_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "revisions_trainer_id_fkey";
            columns: ["trainer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      revision_measurements: {
        Row: {
          id: string;
          revision_id: string;
          weight_kg: number | null;
          body_fat_pct: number | null;
          waist_cm: number | null;
          hip_cm: number | null;
          chest_cm: number | null;
          arm_cm: number | null;
          thigh_cm: number | null;
          kcal_target: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          revision_id: string;
          weight_kg?: number | null;
          body_fat_pct?: number | null;
          waist_cm?: number | null;
          hip_cm?: number | null;
          chest_cm?: number | null;
          arm_cm?: number | null;
          thigh_cm?: number | null;
          kcal_target?: number | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["revision_measurements"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "revision_measurements_revision_id_fkey";
            columns: ["revision_id"];
            isOneToOne: false;
            referencedRelation: "revisions";
            referencedColumns: ["id"];
          }
        ];
      };

      revision_photos: {
        Row: {
          id: string;
          revision_id: string;
          photo_url: string;
          angle: string | null;
          created_at: string;
        };
        Insert: {
          revision_id: string;
          photo_url: string;
          angle?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["revision_photos"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "revision_photos_revision_id_fkey";
            columns: ["revision_id"];
            isOneToOne: false;
            referencedRelation: "revisions";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      create_workout_plan_with_structure: {
        Args: {
          p_trainer_id: string;
          p_name: string;
          p_description: string | null;
          p_days_per_week: number;
          p_is_template: boolean;
          p_client_id: string | null;
          p_days: Json;
        };
        Returns: string;
      };
      update_workout_plan_with_structure: {
        Args: {
          p_plan_id: string;
          p_trainer_id: string;
          p_name: string;
          p_description: string | null;
          p_days_per_week: number;
          p_is_template: boolean;
          p_client_id: string | null;
          p_days: Json;
          p_replace_structure: boolean;
        };
        Returns: boolean;
      };
      clone_workout_plan_to_client: {
        Args: {
          p_plan_id: string;
          p_trainer_id: string;
          p_client_id: string;
        };
        Returns: string;
      };
    };
    Enums: {
      activity_level: ActivityLevel;
      goal: Goal;
      phase: Phase;
      user_role: UserRole;
    };
  };
}
