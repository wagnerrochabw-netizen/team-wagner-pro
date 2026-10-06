-- ====================================================================
-- SCRIPT SQL OFICIAL: BANCO DE DADOS SUPABASE (TEAM WAGNER)
-- ====================================================================
-- Instruções:
-- 1. Acesse o painel do seu projeto no Supabase: https://supabase.com/dashboard
-- 2. No menu lateral esquerdo, clique no ícone "SQL Editor"
-- 3. Clique no botão "+ New Query"
-- 4. Cole todo este código abaixo e clique no botão verde "Run" (ou Ctrl+Enter)
-- ====================================================================

-- 1. TABELA DE USUÁRIOS / ATLETAS
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  birth_date TEXT,
  password_hash TEXT,
  avatar_url TEXT,
  streak_days INTEGER DEFAULT 0,
  record_streak_days INTEGER DEFAULT 0,
  weekly_goal_target INTEGER DEFAULT 4,
  weekly_goal_completed INTEGER DEFAULT 0,
  monthly_workouts INTEGER DEFAULT 0,
  monthly_active_days INTEGER DEFAULT 0,
  monthly_total_hours_minutes TEXT DEFAULT '0h 0m',
  average_minutes_per_session INTEGER DEFAULT 45,
  consistency_percentage INTEGER DEFAULT 80,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir adição de colunas caso a tabela já tenha sido criada anteriormente
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS birth_date TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- 2. TABELA DE TREINOS REGISTRADOS
CREATE TABLE IF NOT EXISTS public.workouts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  display_date TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL,
  sensation TEXT NOT NULL,
  notes TEXT,
  photo_url TEXT,
  photo_source TEXT DEFAULT 'direct_url',
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE CHECKLISTS E METAS DIÁRIAS
CREATE TABLE IF NOT EXISTS public.checklists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  category TEXT,
  date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABELA DE NOTAS DO ATLETA E TREINADOR
CREATE TABLE IF NOT EXISTS public.notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

-- 5. TABELA DE AGENDA E EVENTOS DE TREINOS
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT,
  type TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABELA DE CONSUMO DE ÁGUA
CREATE TABLE IF NOT EXISTS public.water_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  liters NUMERIC NOT NULL,
  amount_ml INTEGER,
  time TEXT,
  points INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir adição de colunas em water_logs
ALTER TABLE public.water_logs ADD COLUMN IF NOT EXISTS amount_ml INTEGER;
ALTER TABLE public.water_logs ADD COLUMN IF NOT EXISTS time TEXT;
ALTER TABLE public.water_logs ADD COLUMN IF NOT EXISTS points INTEGER;

-- 7. TABELA DE REGISTRO DE SONO
CREATE TABLE IF NOT EXISTS public.sleep_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  hours NUMERIC NOT NULL,
  quality TEXT,
  bed_time TEXT,
  wake_time TEXT,
  points INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir adição de colunas em sleep_logs
ALTER TABLE public.sleep_logs ADD COLUMN IF NOT EXISTS bed_time TEXT;
ALTER TABLE public.sleep_logs ADD COLUMN IF NOT EXISTS wake_time TEXT;
ALTER TABLE public.sleep_logs ADD COLUMN IF NOT EXISTS points INTEGER;

-- 8. TABELA DE REFEIÇÕES DO ATLETA
CREATE TABLE IF NOT EXISTS public.meals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  meal_number INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  time TEXT,
  photo_url TEXT,
  status TEXT DEFAULT 'pendente',
  is_extra BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Garantir adição de colunas em workouts
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS time TEXT;
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS status TEXT;
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS points INTEGER;

-- ÍNDICES DE PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON public.workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_checklists_user_id ON public.checklists(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_water_logs_user_id ON public.water_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_user_id ON public.sleep_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_user_id ON public.meals(user_id);

-- POLÍTICAS DE ACESSO (Row Level Security - RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read and write" ON public.users;
CREATE POLICY "Allow public read and write" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read and write" ON public.workouts;
CREATE POLICY "Allow public read and write" ON public.workouts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read and write" ON public.checklists;
CREATE POLICY "Allow public read and write" ON public.checklists FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read and write" ON public.notes;
CREATE POLICY "Allow public read and write" ON public.notes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read and write" ON public.events;
CREATE POLICY "Allow public read and write" ON public.events FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read and write" ON public.water_logs;
CREATE POLICY "Allow public read and write" ON public.water_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read and write" ON public.sleep_logs;
CREATE POLICY "Allow public read and write" ON public.sleep_logs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read and write" ON public.meals;
CREATE POLICY "Allow public read and write" ON public.meals FOR ALL USING (true) WITH CHECK (true);
