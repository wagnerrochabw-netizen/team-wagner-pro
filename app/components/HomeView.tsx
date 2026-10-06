'use client';

import React, { useState } from 'react';
import { Bell, Dumbbell, Trophy, Plus, Check, Flame, ChevronRight, Info, TrendingUp, BarChart2, FileText, User } from 'lucide-react';
import { UserStats, DayProgress, WorkoutLog } from '@/lib/types';
import { WRLogo } from './WRLogo';
import { WaterTrackerCard } from './WaterTrackerCard';
import { SleepTrackerCard } from './SleepTrackerCard';

interface HomeViewProps {
  stats: UserStats;
  weeklyDays: (DayProgress & { isToday?: boolean; dateIso?: string })[];
  todayFullName?: string;
  workouts?: WorkoutLog[];
  onOpenWorkoutDetails?: (workout: WorkoutLog) => void;
  onOpenRegisterModal: () => void;
  onOpenNotifications: () => void;
  onOpenDirectImageGuide: () => void;
  onNavigateToProgress?: () => void;
  onNavigateToProfile?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  stats,
  weeklyDays,
  todayFullName,
  workouts,
  onOpenWorkoutDetails,
  onOpenRegisterModal,
  onOpenNotifications,
  onOpenDirectImageGuide,
  onNavigateToProgress,
  onNavigateToProfile,
}) => {
  const [dayWarningToast, setDayWarningToast] = useState<string | null>(null);

  const handleDayClick = (d: DayProgress & { isToday?: boolean; activeSessionId?: string }) => {
    if (d.isToday) {
      onOpenRegisterModal();
    } else if (d.status === 'done' && d.activeSessionId && workouts && onOpenWorkoutDetails) {
      const w = workouts.find((item) => item.id === d.activeSessionId);
      if (w) {
        onOpenWorkoutDetails(w);
        return;
      }
    } else {
      setDayWarningToast('Só é permitido registrar o treino no dia atual (Hoje). Mantenha seu ritmo diário!');
      setTimeout(() => setDayWarningToast(null), 3500);
    }
  };

  const weeklyPercent = Math.round(
    (stats.weeklyGoalCompleted / stats.weeklyGoalTarget) * 100
  );

  return (
    <div className="space-y-4 pb-24">
      {/* Top Header matching Image 5 */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={onNavigateToProfile}
          className="cursor-pointer hover:scale-105 active:scale-95 transition-transform focus:outline-none"
          title="Acessar Perfil"
        >
          <WRLogo variant="monogram" size="md" />
        </button>

        <div className="flex items-center gap-2">
          {/* Bell Notifications button */}
          <button
            onClick={onOpenNotifications}
            className="relative w-10 h-10 rounded-full bg-[#12161F] border border-[#222938] text-[#BAC9CC] hover:text-white flex items-center justify-center transition-colors"
            title="Notificações"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#00E5FF] ring-2 ring-[#0B0E14]" />
          </button>
        </div>
      </div>

      {/* Greeting and Profile Avatar ("Bolinha do Perfil") */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar button conectando com a aba Perfil */}
          <button
            type="button"
            onClick={onNavigateToProfile}
            className="relative group cursor-pointer shrink-0 transition-transform active:scale-95 text-left focus:outline-none"
            title="Acessar Perfil do Atleta"
          >
            {stats.avatarUrl ? (
              <div className="w-12 h-12 rounded-full border-2 border-[#00E5FF] group-hover:border-white group-hover:ring-2 group-hover:ring-[#00E5FF] overflow-hidden bg-[#171B26] p-0.5 shadow-[0_0_15px_rgba(0,229,255,0.35)] transition-all">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={stats.avatarUrl}
                  alt={stats.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full border border-[#222938] group-hover:border-[#00E5FF] group-hover:ring-2 group-hover:ring-[#00E5FF]/50 bg-[#12161F] text-[#00E5FF] font-space font-bold text-sm flex items-center justify-center transition-all shadow-sm">
                {stats.name ? stats.name.slice(0, 2).toUpperCase() : 'WR'}
              </div>
            )}
            {/* Badge indicador de perfil */}
            <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#00E5FF] text-[#0B0E14] border-2 border-[#0B0E14] flex items-center justify-center text-[9px] font-bold shadow group-hover:scale-110 transition-transform">
              <User className="w-2.5 h-2.5 stroke-[2.5]" />
            </span>
          </button>

          <button
            type="button"
            onClick={onNavigateToProfile}
            className="min-w-0 text-left cursor-pointer group focus:outline-none"
            title="Acessar Perfil"
          >
            <h1 className="font-space text-xl sm:text-2xl font-bold text-white group-hover:text-[#00E5FF] transition-colors flex items-center gap-1.5 truncate">
              <span className="truncate">Olá, {stats.name}</span>
              <Flame className="w-5 h-5 text-[#FF9100] fill-current animate-pulse shrink-0" />
            </h1>
            <p className="text-xs text-[#849396] group-hover:text-[#BAC9CC] transition-colors mt-0.5 truncate flex items-center gap-1">
              <span>Continue construindo sua consistência</span>
              <ChevronRight className="w-3 h-3 text-[#00E5FF] inline opacity-0 group-hover:opacity-100 transition-opacity" />
            </p>
          </button>
        </div>

        {/* Right floating cyan dumbbell icon */}
        <button
          onClick={onOpenRegisterModal}
          className="w-12 h-12 rounded-full bg-[#12161F] border border-[#00E5FF]/40 text-[#00E5FF] flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.25)] hover:scale-105 active:scale-95 transition-transform shrink-0"
          title="Novo Treino Rápido"
        >
          <Dumbbell className="w-5 h-5" />
        </button>
      </div>

      {/* Hero Card: SEQUÊNCIA ATUAL matching Image 5 */}
      <div className="bg-[#12161F] border border-[#222938] rounded-2xl p-5 relative overflow-hidden shadow-lg">
        {/* Subtle radial bloom */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between text-xs mb-3">
          <span className="px-3 py-1 rounded-full bg-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00E5FF] font-space text-[10px] font-bold tracking-wider uppercase">
            SEQUÊNCIA ATUAL
          </span>
          <span className="text-[#849396] font-space text-[11px] font-semibold uppercase tracking-wider">
            FOCO DIÁRIO
          </span>
        </div>

        {/* Big metric: 5 DIAS */}
        <div className="flex items-baseline gap-2 my-2">
          <span className="font-space text-5xl font-extrabold text-[#00E5FF] tracking-tight drop-shadow-[0_0_20px_rgba(0,229,255,0.4)]">
            {stats.streakDays}
          </span>
          <span className="font-space text-3xl font-bold text-white tracking-wider">
            DIAS
          </span>
        </div>

        {/* Best record sub */}
        <div className="flex items-center gap-2 pt-2 text-xs text-[#849396]">
          <Trophy className="w-4 h-4 text-[#00E5FF]" />
          <span>
            Seu melhor recorde:{' '}
            <strong className="text-[#00E5FF] font-mono">
              {stats.recordStreakDays} dias
            </strong>
          </span>
        </div>
      </div>

      {/* Card: META SEMANAL matching Image 5 */}
      <div className="bg-[#12161F] border border-[#222938] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-[#849396] uppercase tracking-wider block">
              META SEMANAL
            </span>
            <div className="font-space text-lg font-bold text-white">
              {stats.weeklyGoalCompleted} de {stats.weeklyGoalTarget} treinos
            </div>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00E5FF] font-mono text-xs font-bold">
            {weeklyPercent}%
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-[#0B0E14] rounded-full overflow-hidden border border-[#222938]">
          <div
            className="h-full bg-[#00E5FF] rounded-full shadow-[0_0_10px_rgba(0,229,255,0.8)] transition-all duration-500"
            style={{ width: `${Math.min(weeklyPercent, 100)}%` }}
          />
        </div>

        {/* 4 Session Pill Blocks */}
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((sessionIdx) => {
            const isCompleted = sessionIdx <= stats.weeklyGoalCompleted;
            return (
              <button
                key={sessionIdx}
                type="button"
                onClick={onOpenRegisterModal}
                className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                  isCompleted
                    ? 'bg-[#00E5FF]/15 border-[#00E5FF] text-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.15)]'
                    : 'bg-[#171B26] border-[#222938] text-[#849396] hover:border-[#849396]'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3]" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-[#849396]" />
                )}
                <span className="text-[11px] font-space font-medium leading-none">
                  {sessionIdx < 4 ? `Sessão ${sessionIdx}` : 'Meta'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Meta Diária de Água & Hidratação */}
      <WaterTrackerCard />

      {/* Meta de Sono & Descanso */}
      <SleepTrackerCard />

      {/* Big Kinetic CTA: + REGISTRAR TREINO matching Image 5 */}
      <button
        onClick={onOpenRegisterModal}
        className="w-full h-14 rounded-xl bg-[#00E5FF] hover:bg-[#00daf3] active:scale-[0.99] text-[#0B0E14] font-space font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,229,255,0.35)] transition-all cursor-pointer"
      >
        <Plus className="w-5 h-5 stroke-[3]" />
        <span>REGISTRAR TREINO</span>
      </button>

      {/* Toast de aviso se tentar marcar fora do dia atual */}
      {dayWarningToast && (
        <div className="p-3 bg-amber-500/15 border border-amber-500/50 text-amber-300 text-xs rounded-xl flex items-center justify-between shadow-lg">
          <span className="font-space">⚠️ {dayWarningToast}</span>
          <button
            type="button"
            onClick={() => setDayWarningToast(null)}
            className="text-amber-400 hover:text-white text-xs font-bold ml-2 px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Card: VISÃO SEMANAL */}
      <div className="bg-[#12161F] border border-[#222938] rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="font-space font-bold uppercase tracking-wider text-white text-xs block">
              VISÃO SEMANAL
            </span>
          </div>
          <span className="font-mono text-[#00E5FF] text-xs font-semibold">
            Hoje: {todayFullName || 'Segunda-feira'}
          </span>
        </div>

        {/* 7 Days Row */}
        <div className="grid grid-cols-7 gap-1.5 pt-1">
          {weeklyDays.map((d) => {
            const isToday = d.isToday;
            return (
              <button
                key={d.dayName}
                type="button"
                onClick={() => handleDayClick(d)}
                className="flex flex-col items-center gap-2 text-center group cursor-pointer focus:outline-none"
                title={
                  isToday
                    ? d.status === 'done' ? 'Treino de hoje já concluído!' : 'Clique para marcar seu treino de hoje'
                    : d.status === 'done' ? 'Ver detalhes do treino' : 'Treinos só podem ser marcados no dia de hoje'
                }
              >
                <span className={`text-[10px] font-space font-bold transition-colors ${
                  isToday ? 'text-[#00E5FF]' : 'text-[#849396] group-hover:text-white'
                }`}>
                  {d.dayName}
                </span>

                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    d.status === 'done'
                      ? 'bg-[#00E5FF] text-[#0B0E14] font-bold shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                      : isToday
                      ? 'border-2 border-[#00E5FF] bg-[#00E5FF]/20 text-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.3)] animate-pulse'
                      : d.status === 'rest'
                      ? 'text-[#849396] font-mono hover:border-[#849396]/40'
                      : 'border border-[#222938] bg-[#0B0E14] text-[#849396] hover:border-[#849396]'
                  }`}
                >
                  {d.status === 'done' ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : d.status === 'rest' ? (
                    <span className="text-sm font-bold">—</span>
                  ) : isToday ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF]" />
                  ) : (
                    <span className="w-2 h-2 rounded-full border border-[#849396]" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="pt-2 flex items-center justify-between text-[10px] text-[#849396] font-mono border-t border-[#1D2026]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF]" />
            <span>Treino realizado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full border border-[#00E5FF]" />
            <span>Disponível</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold">—</span>
            <span>Descanso</span>
          </div>
        </div>
      </div>

      {/* Banner / Card: Relatórios & Gráficos de Evolução */}
      <div
        onClick={onNavigateToProgress}
        className="p-4 rounded-2xl bg-gradient-to-r from-[#12161F] via-[#151A24] to-[#00E5FF]/10 border border-[#00E5FF]/40 hover:border-[#00E5FF] transition-all cursor-pointer group space-y-2 shadow-xl hover:shadow-[0_0_20px_rgba(0,229,255,0.15)]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/40 text-[#00E5FF] flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-space font-bold text-sm text-white group-hover:text-[#00E5FF] transition-colors block leading-tight">
                  Relatório & Gráficos de Evolução
                </span>
                <span className="text-[9px] font-mono text-[#00E5FF] px-1.5 py-0.5 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/30 font-bold uppercase">
                  Novo
                </span>
              </div>
              <span className="text-[11px] text-[#849396] font-mono block mt-0.5">
                Evolução nos treinos, água e sono (Semanal e Mensal)
              </span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#171B26] border border-[#222938] group-hover:border-[#00E5FF]/50 flex items-center justify-center text-[#00E5FF] shrink-0">
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#222938]/60 text-[11px] font-mono text-[#BAC9CC]">
          <span className="text-[#00E5FF] font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-ping" />
            Tríade: 88/100
          </span>
          <span className="text-[#849396]">Toque para ver gráficos</span>
        </div>
      </div>

      {/* Card: RESUMO DO MÊS matching Image 5 */}
      <div className="bg-[#12161F] border border-[#222938] rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-space font-bold uppercase tracking-wider text-white">
            RESUMO DO MÊS
          </span>
          <span className="font-mono text-[#BAC9CC] text-xs">Outubro</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="bg-[#0B0E14] border border-[#222938] rounded-xl p-3">
            <div className="font-space text-2xl font-bold text-[#00E5FF]">
              {stats.monthlyWorkouts}
            </div>
            <div className="text-[10px] text-[#849396] font-space mt-1">
              Treinos no mês
            </div>
          </div>

          <div className="bg-[#0B0E14] border border-[#222938] rounded-xl p-3">
            <div className="font-space text-2xl font-bold text-white">
              {stats.monthlyActiveDays}
            </div>
            <div className="text-[10px] text-[#849396] font-space mt-1">
              Dias ativos
            </div>
          </div>

          <div className="bg-[#0B0E14] border border-[#222938] rounded-xl p-3">
            <div className="font-space text-2xl font-bold text-[#00E5FF]">
              {stats.streakDays}
            </div>
            <div className="text-[10px] text-[#849396] font-space mt-1">
              Sequência atual
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding matching Image 5 */}
      <div className="pt-4 flex justify-center">
        <WRLogo variant="full" subtext="@treinador.wagner" size="sm" />
      </div>
    </div>
  );
};
