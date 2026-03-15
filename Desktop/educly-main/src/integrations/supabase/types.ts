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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_manual_metrics: {
        Row: {
          created_at: string | null
          created_by: string | null
          emails_clicked: number | null
          emails_opened: number | null
          emails_sent: number | null
          id: string
          metric_date: string
          notes: string | null
          nps_score: number | null
          support_tickets_opened: number | null
          support_tickets_resolved: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          emails_clicked?: number | null
          emails_opened?: number | null
          emails_sent?: number | null
          id?: string
          metric_date?: string
          notes?: string | null
          nps_score?: number | null
          support_tickets_opened?: number | null
          support_tickets_resolved?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          emails_clicked?: number | null
          emails_opened?: number | null
          emails_sent?: number | null
          id?: string
          metric_date?: string
          notes?: string | null
          nps_score?: number | null
          support_tickets_opened?: number | null
          support_tickets_resolved?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_tools: {
        Row: {
          category: Database["public"]["Enums"]["ai_tool_category"]
          color_gradient: string
          created_at: string | null
          description: string
          icon_name: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          category: Database["public"]["Enums"]["ai_tool_category"]
          color_gradient: string
          created_at?: string | null
          description: string
          icon_name: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          category?: Database["public"]["Enums"]["ai_tool_category"]
          color_gradient?: string
          created_at?: string | null
          description?: string
          icon_name?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      billing_access_audit_log: {
        Row: {
          accessed_at: string
          action_type: string
          admin_user_id: string
          id: string
          ip_address: string | null
          records_accessed: number | null
          user_agent: string | null
        }
        Insert: {
          accessed_at?: string
          action_type?: string
          admin_user_id: string
          id?: string
          ip_address?: string | null
          records_accessed?: number | null
          user_agent?: string | null
        }
        Update: {
          accessed_at?: string
          action_type?: string
          admin_user_id?: string
          id?: string
          ip_address?: string | null
          records_accessed?: number | null
          user_agent?: string | null
        }
        Relationships: []
      }
      billing_event_logs: {
        Row: {
          created_at: string | null
          email: string
          error_message: string | null
          event_type: string
          expires_at: string | null
          id: string
          is_premium_set: boolean | null
          payload: Json | null
          processed: boolean | null
          processed_at: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          error_message?: string | null
          event_type: string
          expires_at?: string | null
          id?: string
          is_premium_set?: boolean | null
          payload?: Json | null
          processed?: boolean | null
          processed_at?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          error_message?: string | null
          event_type?: string
          expires_at?: string | null
          id?: string
          is_premium_set?: boolean | null
          payload?: Json | null
          processed?: boolean | null
          processed_at?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      challenge_days: {
        Row: {
          ai_tool_id: string | null
          challenge_id: string
          created_at: string | null
          day_number: number
          description: string | null
          focus_area: string | null
          id: string
          title: string
        }
        Insert: {
          ai_tool_id?: string | null
          challenge_id: string
          created_at?: string | null
          day_number: number
          description?: string | null
          focus_area?: string | null
          id?: string
          title: string
        }
        Update: {
          ai_tool_id?: string | null
          challenge_id?: string
          created_at?: string | null
          day_number?: number
          description?: string | null
          focus_area?: string | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_days_ai_tool_id_fkey"
            columns: ["ai_tool_id"]
            isOneToOne: false
            referencedRelation: "ai_tools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_days_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          challenge_type: string
          created_at: string | null
          description: string
          difficulty: string | null
          duration_days: number | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          order_index: number | null
          slug: string
        }
        Insert: {
          challenge_type: string
          created_at?: string | null
          description: string
          difficulty?: string | null
          duration_days?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          order_index?: number | null
          slug: string
        }
        Update: {
          challenge_type?: string
          created_at?: string | null
          description?: string
          difficulty?: string | null
          duration_days?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          order_index?: number | null
          slug?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          ai_assistant_type: string | null
          ai_tool_context: string | null
          content: string
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          ai_assistant_type?: string | null
          ai_tool_context?: string | null
          content: string
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          ai_assistant_type?: string | null
          ai_tool_context?: string | null
          content?: string
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          component_name: string | null
          created_at: string | null
          error_message: string
          id: string
          page_url: string | null
          severity: string | null
          stack_trace: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          component_name?: string | null
          created_at?: string | null
          error_message: string
          id?: string
          page_url?: string | null
          severity?: string | null
          stack_trace?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          component_name?: string | null
          created_at?: string | null
          error_message?: string
          id?: string
          page_url?: string | null
          severity?: string | null
          stack_trace?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      freelancer_medals: {
        Row: {
          color: string
          created_at: string
          description: string
          icon_name: string
          id: string
          name: string
          order_index: number
          slug: string
          tier: string
          unlock_condition: Json
        }
        Insert: {
          color?: string
          created_at?: string
          description: string
          icon_name: string
          id?: string
          name: string
          order_index?: number
          slug: string
          tier?: string
          unlock_condition: Json
        }
        Update: {
          color?: string
          created_at?: string
          description?: string
          icon_name?: string
          id?: string
          name?: string
          order_index?: number
          slug?: string
          tier?: string
          unlock_condition?: Json
        }
        Relationships: []
      }
      freelancer_module_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          module_number: number
          step_index: number
          total_steps: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          module_number: number
          step_index?: number
          total_steps?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          module_number?: number
          step_index?: number
          total_steps?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          category: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          expires_at: string | null
          external_url: string | null
          hourly_rate: number
          icon_name: string | null
          id: string
          is_active: boolean | null
          platform: string | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          expires_at?: string | null
          external_url?: string | null
          hourly_rate: number
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          expires_at?: string | null
          external_url?: string | null
          hourly_rate?: number
          icon_name?: string | null
          id?: string
          is_active?: boolean | null
          platform?: string | null
          title?: string
        }
        Relationships: []
      }
      landing_chat_rate_limits: {
        Row: {
          created_at: string | null
          ip_address: string
          request_count: number
          window_start: string
        }
        Insert: {
          created_at?: string | null
          ip_address: string
          request_count?: number
          window_start?: string
        }
        Update: {
          created_at?: string | null
          ip_address?: string
          request_count?: number
          window_start?: string
        }
        Relationships: []
      }
      lesson_steps: {
        Row: {
          challenge_day_id: string | null
          content: string | null
          created_at: string
          id: string
          image_url: string | null
          phase_id: string | null
          quiz_feedback: string | null
          quiz_options: Json | null
          quiz_question: string | null
          step_number: number
          step_type: string
          title: string
        }
        Insert: {
          challenge_day_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          phase_id?: string | null
          quiz_feedback?: string | null
          quiz_options?: Json | null
          quiz_question?: string | null
          step_number: number
          step_type: string
          title: string
        }
        Update: {
          challenge_day_id?: string | null
          content?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          phase_id?: string | null
          quiz_feedback?: string | null
          quiz_options?: Json | null
          quiz_question?: string | null
          step_number?: number
          step_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_steps_challenge_day_id_fkey"
            columns: ["challenge_day_id"]
            isOneToOne: false
            referencedRelation: "challenge_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_steps_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "trail_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      personalized_plans: {
        Row: {
          brief: Json
          challenge_id: string | null
          created_at: string
          generated_plan: Json
          id: string
          status: string
          updated_at: string
          user_id: string
          version: number
        }
        Insert: {
          brief?: Json
          challenge_id?: string | null
          created_at?: string
          generated_plan?: Json
          id?: string
          status?: string
          updated_at?: string
          user_id: string
          version?: number
        }
        Update: {
          brief?: Json
          challenge_id?: string | null
          created_at?: string
          generated_plan?: Json
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "personalized_plans_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      premium_whitelist: {
        Row: {
          created_at: string | null
          email: string
          granted_by: string | null
          reason: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          granted_by?: string | null
          reason?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          granted_by?: string | null
          reason?: string | null
        }
        Relationships: []
      }
      product_definitions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          language: string | null
          name: string
          product_id: string
          product_type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          language?: string | null
          name: string
          product_id: string
          product_type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          language?: string | null
          name?: string
          product_id?: string
          product_type?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cover_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          onboarding_quiz_completed: boolean | null
          personalized_trail_quiz_completed: boolean | null
          preferred_language: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          cover_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          onboarding_quiz_completed?: boolean | null
          personalized_trail_quiz_completed?: boolean | null
          preferred_language?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          cover_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          onboarding_quiz_completed?: boolean | null
          personalized_trail_quiz_completed?: boolean | null
          preferred_language?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      trail_phases: {
        Row: {
          ai_tool_id: string
          created_at: string | null
          description: string
          id: string
          phase_number: number
          task_description: string
          title: string
          video_url: string | null
        }
        Insert: {
          ai_tool_id: string
          created_at?: string | null
          description: string
          id?: string
          phase_number: number
          task_description: string
          title: string
          video_url?: string | null
        }
        Update: {
          ai_tool_id?: string
          created_at?: string | null
          description?: string
          id?: string
          phase_number?: number
          task_description?: string
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trail_phases_ai_tool_id_fkey"
            columns: ["ai_tool_id"]
            isOneToOne: false
            referencedRelation: "ai_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      user_bugs: {
        Row: {
          component_stack: string | null
          created_at: string | null
          error_message: string | null
          id: string
          platform: string | null
        }
        Insert: {
          component_stack?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          platform?: string | null
        }
        Update: {
          component_stack?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          platform?: string | null
        }
        Relationships: []
      }
      user_certificates: {
        Row: {
          certificate_type: string
          certificate_url: string | null
          challenge_id: string | null
          created_at: string
          earned_at: string
          id: string
          tool_slug: string
          user_full_name: string | null
          user_id: string
        }
        Insert: {
          certificate_type?: string
          certificate_url?: string | null
          challenge_id?: string | null
          created_at?: string
          earned_at?: string
          id?: string
          tool_slug: string
          user_full_name?: string | null
          user_id: string
        }
        Update: {
          certificate_type?: string
          certificate_url?: string | null
          challenge_id?: string | null
          created_at?: string
          earned_at?: string
          id?: string
          tool_slug?: string
          user_full_name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_certificates_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_challenge_progress: {
        Row: {
          challenge_id: string
          completed_at: string | null
          created_at: string | null
          current_day: number | null
          id: string
          is_active: boolean | null
          started_at: string | null
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed_at?: string | null
          created_at?: string | null
          current_day?: number | null
          id?: string
          is_active?: boolean | null
          started_at?: string | null
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed_at?: string | null
          created_at?: string | null
          current_day?: number | null
          id?: string
          is_active?: boolean | null
          started_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_challenge_progress_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_day_progress: {
        Row: {
          challenge_day_id: string
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          challenge_day_id: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          challenge_day_id?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_day_progress_challenge_day_id_fkey"
            columns: ["challenge_day_id"]
            isOneToOne: false
            referencedRelation: "challenge_days"
            referencedColumns: ["id"]
          },
        ]
      }
      user_freelancer_medals: {
        Row: {
          created_at: string
          earned_at: string
          id: string
          medal_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          earned_at?: string
          id?: string
          medal_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          earned_at?: string
          id?: string
          medal_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_freelancer_medals_medal_id_fkey"
            columns: ["medal_id"]
            isOneToOne: false
            referencedRelation: "freelancer_medals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lesson_attempts: {
        Row: {
          answered_at: string
          attempt_number: number
          created_at: string
          id: string
          is_correct: boolean | null
          selected_options: Json | null
          step_id: string
          user_id: string
        }
        Insert: {
          answered_at?: string
          attempt_number?: number
          created_at?: string
          id?: string
          is_correct?: boolean | null
          selected_options?: Json | null
          step_id: string
          user_id: string
        }
        Update: {
          answered_at?: string
          attempt_number?: number
          created_at?: string
          id?: string
          is_correct?: boolean | null
          selected_options?: Json | null
          step_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_lesson_attempts_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "lesson_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      user_levels: {
        Row: {
          created_at: string
          current_level: number
          current_xp: number
          id: string
          total_xp_earned: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: number
          current_xp?: number
          id?: string
          total_xp_earned?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: number
          current_xp?: number
          id?: string
          total_xp_earned?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_onboarding: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          tutorial_completed: boolean
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          tutorial_completed?: boolean
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          tutorial_completed?: boolean
          user_id?: string
        }
        Relationships: []
      }
      user_premium_access: {
        Row: {
          created_at: string | null
          expires_at: string | null
          hotmart_transaction_id: string | null
          id: string
          is_premium: boolean | null
          plan_type: string | null
          plan_updated_at: string | null
          purchased_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          hotmart_transaction_id?: string | null
          id?: string
          is_premium?: boolean | null
          plan_type?: string | null
          plan_updated_at?: string | null
          purchased_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          hotmart_transaction_id?: string | null
          id?: string
          is_premium?: boolean | null
          plan_type?: string | null
          plan_updated_at?: string | null
          purchased_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_product_access: {
        Row: {
          created_at: string | null
          expires_at: string | null
          granted_at: string | null
          id: string
          is_active: boolean | null
          product_id: string
          product_type: string
          revoked_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          id?: string
          is_active?: boolean | null
          product_id: string
          product_type: string
          revoked_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          granted_at?: string | null
          id?: string
          is_active?: boolean | null
          product_id?: string
          product_type?: string
          revoked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          id: string
          phase_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          phase_id: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          phase_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "trail_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          id: string
          last_ping_at: string | null
          started_at: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          last_ping_at?: string | null
          started_at?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          last_ping_at?: string | null
          started_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_step_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          step_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          step_id: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          step_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_step_progress_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "lesson_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      user_streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string
          email: string
          evento: string
          id: string
          plano_aplicado: string | null
          processed_at: string
          produto: string | null
          raw_payload: Json | null
        }
        Insert: {
          created_at?: string
          email: string
          evento: string
          id?: string
          plano_aplicado?: string | null
          processed_at?: string
          produto?: string | null
          raw_payload?: Json | null
        }
        Update: {
          created_at?: string
          email?: string
          evento?: string
          id?: string
          plano_aplicado?: string | null
          processed_at?: string
          produto?: string | null
          raw_payload?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      user_session_details: {
        Row: {
          email: string | null
          inicio: string | null
          minutos_ativos: number | null
          nome: string | null
          ultimo_sinal: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      audit_premium_access: {
        Args: never
        Returns: {
          billing_events_count: number
          is_premium: boolean
          plan_type: string
          status: string
          user_email: string
          user_id_val: string
        }[]
      }
      award_certificate: { Args: { p_tool_slug: string }; Returns: boolean }
      check_and_expire_access: {
        Args: never
        Returns: {
          details: Json
          expired_events_count: number
          expired_premium_count: number
          expired_product_count: number
        }[]
      }
      check_premium_access: { Args: { user_email?: string }; Returns: boolean }
      check_product_access: {
        Args: { p_product_type: string }
        Returns: boolean
      }
      generate_challenge_certificate: {
        Args: { p_challenge_id: string; p_user_full_name: string }
        Returns: string
      }
      get_user_products: {
        Args: never
        Returns: {
          is_active: boolean
          product_type: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      log_billing_access: {
        Args: { p_action_type?: string; p_records_accessed?: number }
        Returns: undefined
      }
      process_pending_billing_events: {
        Args: { p_email: string; p_user_id: string }
        Returns: undefined
      }
      process_pending_revocation_events: {
        Args: never
        Returns: {
          details: Json
          processed_count: number
        }[]
      }
    }
    Enums: {
      ai_tool_category:
        | "conversacional"
        | "imagem"
        | "video"
        | "audio"
        | "codigo"
        | "busca"
        | "design"
      app_role: "admin" | "user"
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
      ai_tool_category: [
        "conversacional",
        "imagem",
        "video",
        "audio",
        "codigo",
        "busca",
        "design",
      ],
      app_role: ["admin", "user"],
    },
  },
} as const
