'use client';

import React, { useState } from 'react';
import {
  Database,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  Copy,
  ExternalLink,
  Key,
  Server,
  Layers,
  Sparkles,
  Check
} from 'lucide-react';
import { isSupabaseConfigured, SUPABASE_CONFIG } from '@/lib/supabase';
import { UserStats, WorkoutLog } from '@/lib/types';
import { saveUserToSupabase, saveWorkoutToSupabase } from '@/lib/supabase-service';

interface SupabaseSyncCardProps {
  stats: UserStats;
  workouts: WorkoutLog[];
  onSyncComplete?: () => void;
}

export const SupabaseSyncCard: React.FC<SupabaseSyncCardProps> = ({ stats, workouts, onSyncComplete }) => {
  const isConnected = isSupabaseConfigured();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    setSyncStatus('Sincronizando dados com o banco Supabase...');

    try {
      const userId = stats.email ? stats.email.replace(/[^a-zA-Z0-9_-]/g, '_') : 'atleta_wagner_1';
      await saveUserToSupabase(userId, stats);

      for (const w of workouts) {
        await saveWorkoutToSupabase(userId, w);
      }

      setSyncStatus('Dados sincronizados com sucesso no Supabase!');
      setTimeout(() => setSyncStatus(null), 4000);
      if (onSyncComplete) onSyncComplete();
    } catch (err) {
      console.error('Error syncing to Supabase:', err);
      setSyncStatus('Erro ao sincronizar. Verifique a URL e Anon Key.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopySql = () => {
    const sql = `-- Copie e cole no SQL Editor do Supabase:
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

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS birth_date TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;

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

CREATE TABLE IF NOT EXISTS public.checklists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  category TEXT,
  date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at BIGINT NOT NULL
);

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

CREATE TABLE IF NOT EXISTS public.water_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  liters NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sleep_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  hours NUMERIC NOT NULL,
  quality TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;

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
CREATE POLICY "Allow public read and write" ON public.sleep_logs FOR ALL USING (true) WITH CHECK (true);`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="bg-[#12161F] border border-[#222938] rounded-2xl p-5 space-y-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#3ECF8E]/15 border border-[#3ECF8E]/40 text-[#3ECF8E] flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-space font-bold text-sm text-white flex items-center gap-2">
              <span>Banco de Dados Supabase</span>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#3ECF8E] animate-pulse' : 'bg-amber-400'}`} />
            </h3>
            <p className="text-[11px] text-[#849396] font-mono">
              PostgreSQL • Persistência de Contas, Treinos & Notas
            </p>
          </div>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 ${
            isConnected
              ? 'bg-[#3ECF8E]/15 border border-[#3ECF8E]/40 text-[#3ECF8E]'
              : 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
          }`}
        >
          <ShieldCheck className="w-3 h-3" />
          {isConnected ? 'Supabase Conectado' : 'Aguardando Secrets'}
        </span>
      </div>

      {/* Connection status box */}
      <div className="p-3 bg-[#0B0E14] border border-[#1D2026] rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#BAC9CC] flex items-center gap-1.5 font-mono">
            <Server className="w-3.5 h-3.5 text-[#3ECF8E]" />
            NEXT_PUBLIC_SUPABASE_URL
          </span>
          <span className="font-mono text-[11px] text-white">
            {SUPABASE_CONFIG.url ? SUPABASE_CONFIG.url.replace(/https:\/\/(.{4}).+/, 'https://$1...supabase.co') : 'Definido no .env.example'}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-[#BAC9CC] flex items-center gap-1.5 font-mono">
            <Key className="w-3.5 h-3.5 text-[#3ECF8E]" />
            NEXT_PUBLIC_SUPABASE_ANON_KEY
          </span>
          <span className="font-mono text-[11px] text-[#3ECF8E]">
            {SUPABASE_CONFIG.hasKey ? 'Configurada no Secrets' : 'Declarada no Secrets'}
          </span>
        </div>
      </div>

      {/* Sync Button */}
      <div className="flex flex-col gap-2">
        <button
          onClick={handleSyncToSupabase}
          disabled={isSyncing}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#3ECF8E]/25 to-[#3ECF8E]/10 border border-[#3ECF8E]/50 hover:border-[#3ECF8E] text-white font-space font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-[0_0_15px_rgba(62,207,142,0.2)]"
        >
          <RefreshCw className={`w-4 h-4 text-[#3ECF8E] ${isSyncing ? 'animate-spin' : ''}`} />
          <span>
            {isSyncing ? 'Enviando para o Supabase...' : 'Sincronizar Dados no Supabase'}
          </span>
        </button>

        {syncStatus && (
          <div className="flex items-center gap-1.5 text-xs text-[#3ECF8E] font-mono justify-center animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{syncStatus}</span>
          </div>
        )}
      </div>

      {/* Copy SQL Schema */}
      <div className="pt-2 border-t border-[#1D2026] flex items-center justify-between">
        <div className="text-[11px] text-[#849396] font-mono">
          Script SQL das tabelas pronto
        </div>

        <button
          onClick={handleCopySql}
          className="px-2.5 py-1.5 rounded-lg bg-[#171B26] hover:bg-[#222938] border border-[#222938] text-[11px] font-space text-[#BAC9CC] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          {copiedSql ? <Check className="w-3.5 h-3.5 text-[#3ECF8E]" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedSql ? 'Copiado!' : 'Copiar SQL do Supabase'}</span>
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono text-[10px] text-[#849396]">
        <div className="p-2 rounded-lg bg-[#0B0E14] border border-[#1D2026]">
          <span className="text-white font-bold block text-xs">{workouts.length}</span>
          <span>Treinos</span>
        </div>
        <div className="p-2 rounded-lg bg-[#0B0E14] border border-[#1D2026]">
          <span className="text-white font-bold block text-xs">Ativo</span>
          <span>Checklists</span>
        </div>
        <div className="p-2 rounded-lg bg-[#0B0E14] border border-[#1D2026]">
          <span className="text-[#3ECF8E] font-bold block text-xs">PostgreSQL</span>
          <span>Supabase DB</span>
        </div>
      </div>
    </div>
  );
};
