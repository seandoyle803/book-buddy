-- ============================================================
-- BookBuddy — Supabase Database Schema
-- Apply this in your Supabase project's SQL Editor
-- ============================================================

-- 1. TABLES

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  supabase_auth_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  daily_goal_minutes INTEGER NOT NULL DEFAULT 15,
  reminder_enabled BOOLEAN NOT NULL DEFAULT false,
  reminder_time TIME,
  burnout_window_start TIME,
  burnout_window_end TIME,
  dark_mode BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT,
  total_pages INTEGER NOT NULL DEFAULT 0,
  current_page INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  last_read_at TIMESTAMPTZ,
  is_current BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reading_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  pages_read INTEGER NOT NULL DEFAULT 0,
  minutes_read INTEGER NOT NULL DEFAULT 0,
  start_page INTEGER,
  end_page INTEGER,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. INDEXES

CREATE INDEX IF NOT EXISTS idx_books_user_id ON public.books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_is_current ON public.books(user_id, is_current) WHERE is_current = true;
CREATE INDEX IF NOT EXISTS idx_reading_sessions_user_id ON public.reading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_book_id ON public.reading_sessions(book_id);
CREATE INDEX IF NOT EXISTS idx_reading_sessions_date ON public.reading_sessions(user_id, session_date);

-- 3. AUTH TRIGGER (auto-create user profile on sign up)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (supabase_auth_id, email, daily_goal_minutes, reminder_enabled, dark_mode)
  VALUES (NEW.id, NEW.email, 15, false, true)
  ON CONFLICT (supabase_auth_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. GRANTS (allow authenticated users to access tables)

GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO service_role, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.books TO service_role, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reading_sessions TO service_role, authenticated;
GRANT USAGE ON SCHEMA public TO service_role, anon, authenticated;

-- 5. ROW LEVEL SECURITY

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_sessions ENABLE ROW LEVEL SECURITY;

-- Users RLS
CREATE POLICY "Users can read own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = supabase_auth_id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = supabase_auth_id);

-- Books RLS
CREATE POLICY "Users can read own books"
  ON public.books FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE supabase_auth_id = auth.uid()));

CREATE POLICY "Users can insert own books"
  ON public.books FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE supabase_auth_id = auth.uid()));

CREATE POLICY "Users can update own books"
  ON public.books FOR UPDATE
  USING (user_id IN (SELECT id FROM public.users WHERE supabase_auth_id = auth.uid()));

CREATE POLICY "Users can delete own books"
  ON public.books FOR DELETE
  USING (user_id IN (SELECT id FROM public.users WHERE supabase_auth_id = auth.uid()));

-- Reading Sessions RLS
CREATE POLICY "Users can read own sessions"
  ON public.reading_sessions FOR SELECT
  USING (user_id IN (SELECT id FROM public.users WHERE supabase_auth_id = auth.uid()));

CREATE POLICY "Users can insert own sessions"
  ON public.reading_sessions FOR INSERT
  WITH CHECK (user_id IN (SELECT id FROM public.users WHERE supabase_auth_id = auth.uid()));

CREATE POLICY "Users can update own sessions"
  ON public.reading_sessions FOR UPDATE
  USING (user_id IN (SELECT id FROM public.users WHERE supabase_auth_id = auth.uid()));

CREATE POLICY "Users can delete own sessions"
  ON public.reading_sessions FOR DELETE
  USING (user_id IN (SELECT id FROM public.users WHERE supabase_auth_id = auth.uid()));
