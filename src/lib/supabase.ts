import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          language_preference: 'en' | 'es' | 'bilingual';
          font_preference: 'regular' | 'dyslexia';
          high_contrast: boolean;
          narration_speed: 'slow' | 'normal' | 'fast';
          auto_play: boolean;
          reading_reminders: string;
          auto_download: 'wifi' | 'always' | 'never';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          language_preference?: 'en' | 'es' | 'bilingual';
          font_preference?: 'regular' | 'dyslexia';
          high_contrast?: boolean;
          narration_speed?: 'slow' | 'normal' | 'fast';
          auto_play?: boolean;
          reading_reminders?: string;
          auto_download?: 'wifi' | 'always' | 'never';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          language_preference?: 'en' | 'es' | 'bilingual';
          font_preference?: 'regular' | 'dyslexia';
          high_contrast?: boolean;
          narration_speed?: 'slow' | 'normal' | 'fast';
          auto_play?: boolean;
          reading_reminders?: string;
          auto_download?: 'wifi' | 'always' | 'never';
          created_at?: string;
          updated_at?: string;
        };
      };
      children: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          pronouns: 'he' | 'she' | 'they';
          age: number | null;
          grade: string | null;
          avatar_url: string | null;
          reading_level: 'A' | 'B' | 'C' | 'D' | 'E' | null;
          interests: string[];
          language_preference: 'en' | 'es' | 'bilingual';
          stories_completed: number;
          badges: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          pronouns?: 'he' | 'she' | 'they';
          age?: number | null;
          grade?: string | null;
          avatar_url?: string | null;
          reading_level?: 'A' | 'B' | 'C' | 'D' | 'E' | null;
          interests?: string[];
          language_preference?: 'en' | 'es' | 'bilingual';
          stories_completed?: number;
          badges?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          pronouns?: 'he' | 'she' | 'they';
          age?: number | null;
          grade?: string | null;
          avatar_url?: string | null;
          reading_level?: 'A' | 'B' | 'C' | 'D' | 'E' | null;
          interests?: string[];
          language_preference?: 'en' | 'es' | 'bilingual';
          stories_completed?: number;
          badges?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      stories: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          subject: string;
          age_min: number;
          age_max: number;
          reading_time: number | null;
          genre: string | null;
          language: 'en' | 'es';
          difficulty: 'easy' | 'medium' | 'hard';
          cover_image_url: string | null;
          content: string | null;
          is_premium: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      library_items: {
        Row: {
          id: string;
          user_id: string;
          story_id: string;
          status: 'saved' | 'reading' | 'completed';
          progress: number;
          last_read_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          story_id: string;
          status?: 'saved' | 'reading' | 'completed';
          progress?: number;
          last_read_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          story_id?: string;
          status?: 'saved' | 'reading' | 'completed';
          progress?: number;
          last_read_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};