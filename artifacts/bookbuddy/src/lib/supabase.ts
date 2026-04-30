// rebuild trigger
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables. Check SUPABASE_URL and SUPABASE_ANON_KEY.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: UserRow;
        Insert: Omit<UserRow, "id" | "created_at">;
        Update: Partial<Omit<UserRow, "id" | "created_at">>;
      };
      books: {
        Row: BookRow;
        Insert: Omit<BookRow, "id" | "created_at">;
        Update: Partial<Omit<BookRow, "id" | "created_at">>;
      };
      reading_sessions: {
        Row: ReadingSessionRow;
        Insert: Omit<ReadingSessionRow, "id" | "created_at">;
        Update: Partial<Omit<ReadingSessionRow, "id" | "created_at">>;
      };
    };
  };
};

export interface UserRow {
  id: string;
  email: string;
  supabase_auth_id: string;
  display_name: string | null;
  daily_goal_minutes: number;
  reminder_enabled: boolean;
  reminder_time: string | null;
  burnout_window_start: string | null;
  burnout_window_end: string | null;
  dark_mode: boolean;
  created_at: string;
}

export interface BookRow {
  id: string;
  user_id: string;
  title: string;
  author: string | null;
  total_pages: number;
  current_page: number;
  is_completed: boolean;
  completed_at: string | null;
  last_read_at: string | null;
  is_current: boolean;
  created_at: string;
}

export interface ReadingSessionRow {
  id: string;
  user_id: string;
  book_id: string;
  pages_read: number;
  minutes_read: number;
  start_page: number | null;
  end_page: number | null;
  session_date: string;
  notes: string | null;
  created_at: string;
}
