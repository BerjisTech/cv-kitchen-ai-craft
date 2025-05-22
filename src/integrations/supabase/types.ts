export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      cover_letters: {
        Row: {
          company: string | null
          content: string
          created_at: string
          id: string
          last_updated: string | null
          position: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          content: string
          created_at?: string
          id?: string
          last_updated?: string | null
          position?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          content?: string
          created_at?: string
          id?: string
          last_updated?: string | null
          position?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cv_extracted_data: {
        Row: {
          created_at: string
          document_id: string | null
          extracted_data: Json
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          extracted_data: Json
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_id?: string | null
          extracted_data?: Json
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      job_analyses: {
        Row: {
          analysis: string
          created_at: string
          id: string
          job_description: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis: string
          created_at?: string
          id?: string
          job_description: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis?: string
          created_at?: string
          id?: string
          job_description?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      linkedin_profiles: {
        Row: {
          courses_data: Json | null
          created_at: string
          education_data: Json | null
          id: string
          positions_data: Json | null
          profile_data: Json
          skills_data: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          courses_data?: Json | null
          created_at?: string
          education_data?: Json | null
          id?: string
          positions_data?: Json | null
          profile_data: Json
          skills_data?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          courses_data?: Json | null
          created_at?: string
          education_data?: Json | null
          id?: string
          positions_data?: Json | null
          profile_data?: Json
          skills_data?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          location: string | null
          phone: string | null
          role: string | null
          updated_at: string
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          location?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      tailored_cvs: {
        Row: {
          analysis_id: string
          created_at: string
          cv_content: Json
          id: string
          job_description: string
          template: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis_id: string
          created_at?: string
          cv_content: Json
          id?: string
          job_description: string
          template?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis_id?: string
          created_at?: string
          cv_content?: Json
          id?: string
          job_description?: string
          template?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tailored_cvs_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "job_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_certifications: {
        Row: {
          created_at: string
          date: string | null
          id: string
          issuer: string | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string | null
          id?: string
          issuer?: string | null
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string | null
          id?: string
          issuer?: string | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_connections: {
        Row: {
          access_token: string | null
          created_at: string
          display_name: string | null
          id: string
          profile_url: string | null
          provider: string
          provider_id: string
          refresh_token: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          profile_url?: string | null
          provider: string
          provider_id: string
          refresh_token?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          profile_url?: string | null
          provider?: string
          provider_id?: string
          refresh_token?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_documents: {
        Row: {
          created_at: string
          document_type: string
          file_size: number | null
          file_type: string | null
          filename: string
          filepath: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_type?: string
          file_size?: number | null
          file_type?: string | null
          filename: string
          filepath: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_type?: string
          file_size?: number | null
          file_type?: string | null
          filename?: string
          filepath?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_education: {
        Row: {
          created_at: string
          degree: string
          description: string | null
          end_year: string | null
          id: string
          institution: string
          source: string | null
          start_year: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          degree: string
          description?: string | null
          end_year?: string | null
          id?: string
          institution: string
          source?: string | null
          start_year?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          degree?: string
          description?: string | null
          end_year?: string | null
          id?: string
          institution?: string
          source?: string | null
          start_year?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_experience: {
        Row: {
          company: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          role: string
          source: string | null
          start_date: string | null
          user_id: string
        }
        Insert: {
          company: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          role: string
          source?: string | null
          start_date?: string | null
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          role?: string
          source?: string | null
          start_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_languages: {
        Row: {
          created_at: string
          id: string
          language: string
          level: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language: string
          level: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          level?: string
          user_id?: string
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          created_at: string
          id: string
          level: number | null
          name: string
          source: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: number | null
          name: string
          source?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: number | null
          name?: string
          source?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_unique_username: {
        Args: { full_name: string }
        Returns: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
