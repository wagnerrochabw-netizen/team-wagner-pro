'use client';

import React, { useState } from 'react';
import { Database, ShieldCheck, RefreshCw, CheckCircle2, UserCheck, LogIn, LogOut, Cloud, AlertCircle } from 'lucide-react';
import { useAuth } from './FirebaseAuthProvider';
import { UserStats, WorkoutLog } from '@/lib/types';
import { saveUserProfile, saveWorkoutToDb } from '@/lib/db-service';

interface CloudSyncCardProps {
  stats: UserStats;
  workouts: WorkoutLog[];
  onSyncComplete?: () => void;
}

export const CloudSyncCard: React.FC<CloudSyncCardProps> = ({ stats, workouts, onSyncComplete }) => {
  const { user, signIn, signOut, isDbConnected } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  const handleManualSync = async () => {
    if (!user) {
      try {
        await signIn();
      } catch {
        return;
      }
    }

    setIsSyncing(true);
    setSyncStatus('Sincronizando com o banco de dados na nuvem...');
    try {
      const activeUserId = user?.uid || 'offline_user';
      // Save profile
      await saveUserProfile(activeUserId, {
        ...stats,
        email: user?.email || stats.email,
        name: user?.displayName || stats.name,
        avatarUrl: user?.photoURL || stats.avatarUrl,
      });

      // Save all workouts
      for (const w of workouts) {
        await saveWorkoutToDb(activeUserId, w);
      }

      setSyncStatus('Dados sincronizados com sucesso na nuvem!');
      setTimeout(() => setSyncStatus(null), 4000);
      if (onSyncComplete) onSyncComplete();
    } catch (error) {
      console.error('Error syncing to cloud:', error);
      setSyncStatus('Erro ao sincronizar. Verifique a conexão.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-[#12161F] border border-[#222938] rounded-2xl p-5 space-y-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] flex items-center justify-center">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-space font-bold text-sm text-white flex items-center gap-2">
              <span>Banco de Dados em Nuvem</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[11px] text-[#849396] font-mono">
              Persistência Firestore • Proteção & Backup Contínuo
            </p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          {isDbConnected ? 'Ativo' : 'Conectando'}
        </span>
      </div>

      {/* Account Info */}
      <div className="p-3 bg-[#0B0E14] border border-[#1D2026] rounded-xl flex items-center justify-between gap-3">
        {user ? (
          <div className="flex items-center gap-3 min-w-0">
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt={user.displayName || 'Atleta'}
                className="w-9 h-9 rounded-full border border-[#00E5FF] object-cover shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#171B26] border border-[#222938] text-[#00E5FF] font-bold text-xs flex items-center justify-center shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">
                {user.displayName || 'Conta Conectada'}
              </span>
              <span className="text-[10px] text-[#849396] font-mono block truncate">
                {user.email}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <Cloud className="w-5 h-5 text-[#849396]" />
            <div>
              <span className="text-xs font-medium text-white block">
                Conta Local (Dados no dispositivo)
              </span>
              <span className="text-[10px] text-[#849396]">
                Conecte com Google para salvar tudo na nuvem
              </span>
            </div>
          </div>
        )}

        <div>
          {user ? (
            <button
              onClick={() => signOut()}
              className="px-2.5 py-1.5 rounded-lg bg-[#171B26] hover:bg-[#222938] border border-[#222938] text-[11px] font-mono text-[#BAC9CC] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              title="Desconectar da conta Google"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          ) : (
            <button
              onClick={() => signIn()}
              className="px-3 py-1.5 rounded-lg bg-[#00E5FF] hover:bg-[#33EAFF] text-[#0B0E14] font-space font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,229,255,0.4)] transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Conectar Google</span>
            </button>
          )}
        </div>
      </div>

      {/* Sync Action */}
      <div className="flex flex-col gap-2">
        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00E5FF]/20 to-[#00E5FF]/5 border border-[#00E5FF]/40 hover:border-[#00E5FF] text-white font-space font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-[#00E5FF] ${isSyncing ? 'animate-spin' : ''}`} />
          <span>
            {isSyncing ? 'Salvando no Banco de Dados...' : 'Salvar & Sincronizar Tudo na Nuvem'}
          </span>
        </button>

        {syncStatus && (
          <div className="flex items-center gap-1.5 text-xs text-[#00E5FF] font-mono justify-center animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{syncStatus}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono text-[10px] text-[#849396]">
        <div className="p-2 rounded-lg bg-[#0B0E14] border border-[#1D2026]">
          <span className="text-white font-bold block text-xs">{workouts.length}</span>
          <span>Treinos Salvos</span>
        </div>
        <div className="p-2 rounded-lg bg-[#0B0E14] border border-[#1D2026]">
          <span className="text-white font-bold block text-xs">Ativo</span>
          <span>Checklists & Notas</span>
        </div>
        <div className="p-2 rounded-lg bg-[#0B0E14] border border-[#1D2026]">
          <span className="text-emerald-400 font-bold block text-xs">100%</span>
          <span>Segurança</span>
        </div>
      </div>
    </div>
  );
};
