export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      user_profile: {
        Row: {
          id: string;
          display_name: string;
          height_cm: number;
          weight_unit: "kg" | "lbs";
          distance_unit: "km" | "miles";
          resting_hr: number;
          max_hr: number;
          hrv_baseline: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["user_profile"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["user_profile"]["Insert"]>;
      };
      weight_entries: {
        Row: {
          id: string;
          date: string;
          weight_kg: number;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["weight_entries"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["weight_entries"]["Insert"]>;
      };
      body_measurements: {
        Row: {
          id: string;
          date: string;
          waist_cm: number | null;
          hips_cm: number | null;
          chest_cm: number | null;
          left_arm_cm: number | null;
          right_arm_cm: number | null;
          left_thigh_cm: number | null;
          right_thigh_cm: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["body_measurements"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["body_measurements"]["Insert"]>;
      };
      dexa_scans: {
        Row: {
          id: string;
          date: string;
          body_fat_percent: number;
          fat_mass_kg: number;
          lean_mass_kg: number;
          bone_density: number | null;
          visceral_fat_area: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["dexa_scans"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["dexa_scans"]["Insert"]>;
      };
      hevy_workouts: {
        Row: {
          id: string;
          hevy_id: string;
          title: string;
          start_time: string;
          end_time: string;
          total_volume_kg: number;
          total_sets: number;
          raw_data: Json;
          synced_at: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["hevy_workouts"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["hevy_workouts"]["Insert"]>;
      };
      hevy_exercises: {
        Row: {
          id: string;
          workout_id: string;
          hevy_exercise_id: string;
          exercise_name: string;
          muscle_group: string;
          exercise_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["hevy_exercises"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["hevy_exercises"]["Insert"]>;
      };
      hevy_sets: {
        Row: {
          id: string;
          exercise_id: string;
          set_order: number;
          weight_kg: number;
          reps: number;
          rpe: number | null;
          set_type: "warmup" | "working" | "failure" | "dropset";
          is_pr: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["hevy_sets"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["hevy_sets"]["Insert"]>;
      };
      personal_records: {
        Row: {
          id: string;
          exercise_name: string;
          record_type: "1rm" | "volume" | "reps";
          value: number;
          achieved_at: string;
          workout_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["personal_records"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["personal_records"]["Insert"]>;
      };
      whoop_recovery: {
        Row: {
          id: string;
          whoop_cycle_id: string;
          date: string;
          recovery_score: number;
          hrv_rmssd: number;
          resting_hr: number;
          skin_temp_celsius: number | null;
          spo2_percent: number | null;
          raw_data: Json;
          synced_at: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["whoop_recovery"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["whoop_recovery"]["Insert"]>;
      };
      whoop_sleep: {
        Row: {
          id: string;
          whoop_sleep_id: string;
          date: string;
          total_sleep_minutes: number;
          rem_minutes: number;
          deep_minutes: number;
          light_minutes: number;
          awake_minutes: number;
          sleep_score: number;
          sleep_efficiency: number;
          raw_data: Json;
          synced_at: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["whoop_sleep"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["whoop_sleep"]["Insert"]>;
      };
      whoop_workouts: {
        Row: {
          id: string;
          whoop_workout_id: string;
          date: string;
          sport_name: string;
          strain: number;
          average_hr: number;
          max_hr: number;
          calories: number;
          duration_minutes: number;
          hr_zones: Json;
          raw_data: Json;
          synced_at: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["whoop_workouts"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["whoop_workouts"]["Insert"]>;
      };
      whoop_tokens: {
        Row: {
          id: string;
          access_token_encrypted: string;
          refresh_token_encrypted: string;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["whoop_tokens"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["whoop_tokens"]["Insert"]>;
      };
      vo2_max_entries: {
        Row: {
          id: string;
          date: string;
          value: number;
          source: "whoop" | "apple_watch" | "cooper_test" | "manual";
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["vo2_max_entries"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["vo2_max_entries"]["Insert"]>;
      };
      cardio_sessions: {
        Row: {
          id: string;
          date: string;
          session_type: "zone2" | "hiit_4x4" | "other";
          duration_minutes: number;
          average_hr: number;
          max_hr: number | null;
          time_in_zone_percent: number | null;
          intervals_data: Json | null;
          notes: string | null;
          whoop_workout_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["cardio_sessions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["cardio_sessions"]["Insert"]>;
      };
      functional_tests: {
        Row: {
          id: string;
          date: string;
          test_type: string;
          value: number;
          unit: string;
          side: "left" | "right" | "both" | null;
          is_pr: boolean;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["functional_tests"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["functional_tests"]["Insert"]>;
      };
      targets: {
        Row: {
          id: string;
          domain: "body" | "strength" | "cardio" | "recovery" | "functional";
          metric_name: string;
          baseline_value: number;
          target_3m: number | null;
          target_6m: number | null;
          target_12m: number | null;
          current_value: number;
          unit: string;
          is_lower_better: boolean;
          start_date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["targets"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["targets"]["Insert"]>;
      };
      reviews: {
        Row: {
          id: string;
          review_type: "weekly" | "monthly" | "quarterly";
          period_start: string;
          period_end: string;
          status: "draft" | "completed";
          data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["reviews"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
      };
      wellness_entries: {
        Row: {
          id: string;
          date: string;
          energy_level: number | null;
          stress_level: number | null;
          motivation_level: number | null;
          soreness_level: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["wellness_entries"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["wellness_entries"]["Insert"]>;
      };
      sync_logs: {
        Row: {
          id: string;
          source: "hevy" | "whoop";
          sync_type: "webhook" | "cron" | "manual";
          status: "success" | "error";
          records_synced: number;
          error_message: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["sync_logs"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["sync_logs"]["Insert"]>;
      };
      integration_settings: {
        Row: {
          id: string;
          integration: "hevy" | "whoop";
          api_key_encrypted: string | null;
          webhook_enabled: boolean;
          last_sync_at: string | null;
          last_sync_status: "success" | "error" | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["integration_settings"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["integration_settings"]["Insert"]>;
      };
      progress_photos: {
        Row: {
          id: string;
          date: string;
          photo_type: "front" | "side" | "back";
          storage_path: string;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["progress_photos"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["progress_photos"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Helper types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
