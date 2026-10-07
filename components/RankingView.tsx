'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Flame,
  Dumbbell,
  Crown,
  Medal,
  TrendingUp,
  UserPlus,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Sparkles,
  Zap,
  Target,
  Calendar,
  X,
  Plus,
  Utensils,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';
import { UserStats, WorkoutLog } from '@/lib/types';
import { WRLogo } from './WRLogo';
import { CommunityFeed } from './CommunityFeed';
import {
  RankedAthlete,
  getRankedAthletes,
  getInitialRankedAthletes,
  registerNewAthlete,
  RegisteredAthlete,
} from '@/lib/athletes-ranking';

interface RankingViewProps {
  stats: UserStats;
  workouts: WorkoutLog[];
  onOpenRegisterModal: () => void;
  onOpenRegisterClientModal?: () => void;
}

export const RankingView: React.FC<RankingViewProps> = ({
  stats,
  workouts,
  onOpenRegisterModal,
  onOpenRegisterClientModal,
}) => {
  const [activeSection, setActiveSection] = useState<'ranking' | 'feed'>('ranking');
  const [refreshKey, setRefreshKey] = useState(0);
  const [timeframe, setTimeframe] = useState<'geral' | 'mensal' | 'semanal'>('geral');
  const [expandedAthleteId, setExpandedAthleteId] = useState<string | null>(null);
  const [isAddAthleteModalOpen, setIsAddAthleteModalOpen] = useState(false);

  // Form para cadastrar novo aluno real
  const [newAthleteName, setNewAthleteName] = useState('');
  const [newAthleteEmail, setNewAthleteEmail] = useState('');
  const [newAthleteWorkouts, setNewAthleteWorkouts] = useState('12');
  const [newAthleteStreak, setNewAthleteStreak] = useState('5');
  const [newAthleteGoal, setNewAthleteGoal] = useState('Hipertrofia & Força');

  const lastWorkoutDate = workouts && workouts.length > 0 ? workouts[0].date : undefined;

  const rankedList = useMemo(() => {
    void refreshKey;
    return getRankedAthletes(stats, lastWorkoutDate, timeframe, workouts);
  }, [stats, lastWorkoutDate, timeframe, workouts, refreshKey]);

  useEffect(() => {
    const handleUpdate = () => {
      setRefreshKey((k) => k + 1);
    };

    window.addEventListener('team_wagner_meals_updated', handleUpdate);
    window.addEventListener('team_wagner_water_updated', handleUpdate);
    window.addEventListener('team_wagner_sleep_updated', handleUpdate);
    window.addEventListener('team_wagner_workouts_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('team_wagner_meals_updated', handleUpdate);
      window.removeEventListener('team_wagner_water_updated', handleUpdate);
      window.removeEventListener('team_wagner_sleep_updated', handleUpdate);
      window.removeEventListener('team_wagner_workouts_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const currentUserRanked = rankedList.find((a) => a.isCurrentUser) || {
    ...stats,
    rank: 1,
    score: 0,
    weeklyScore: 0,
    monthlyScore: 0,
    mealPoints: 0,
    mealPhotosCount: 0,
    mealStreakDays: 0,
    waterPoints: 150,
    sleepPoints: 150,
    scoreBreakdown: {
      workoutsScore: 0,
      mealsScore: 0,
      waterScore: 150,
      sleepScore: 150,
      consistencyBonus: 0,
      totalScore: 0,
    },
    isCurrentUser: true,
  };

  const handleCreateNewAthlete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAthleteName.trim()) return;

    const wCount = parseInt(newAthleteWorkouts, 10) || 0;
    const sCount = parseInt(newAthleteStreak, 10) || 0;
    const consistency = Math.min(100, Math.round((wCount / 16) * 100));

    registerNewAthlete({
      name: newAthleteName.trim(),
      email: newAthleteEmail.trim() || undefined,
      monthlyWorkouts: wCount,
      streakDays: sCount,
      weeklyGoalCompleted: Math.min(4, Math.ceil(wCount / 4)),
      weeklyGoalTarget: 4,
      consistencyPercentage: consistency,
      goalType: newAthleteGoal,
    });

    const updated = getRankedAthletes(stats, lastWorkoutDate, timeframe);
    setRankedList(updated);
    setNewAthleteName('');
    setNewAthleteEmail('');
    setIsAddAthleteModalOpen(false);
  };

  const toggleExpand = (id: string) => {
    setExpandedAthleteId(expandedAthleteId === id ? null : id);
  };

  return (
    <div className="space-y-4 pb-24 text-[#E1E2EB]">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <WRLogo variant="monogram" size="md" />

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] font-mono text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
          <span>TEAM WAGNER SOCIAL & RANKING</span>
        </div>
      </div>

      {/* Top Navigation Switcher: Ranking vs Comunidade */}
      <div className="grid grid-cols-2 p-1 bg-[#12161F] border border-[#222938] rounded-xl shadow-inner">
        <button
          type="button"
          onClick={() => setActiveSection('ranking')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-space font-bold transition-all cursor-pointer ${
            activeSection === 'ranking'
              ? 'bg-[#00E5FF] text-[#0B0E14] shadow-[0_0_15px_rgba(0,229,255,0.45)]'
              : 'text-[#BAC9CC] hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>🏆 Ranking Alunos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('feed')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-space font-bold transition-all cursor-pointer relative ${
            activeSection === 'feed'
              ? 'bg-[#00E5FF] text-[#0B0E14] shadow-[0_0_15px_rgba(0,229,255,0.45)]'
              : 'text-[#BAC9CC] hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>📸 Feed Comunidade</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#FF9100] text-black font-mono text-[9px] font-black uppercase">
            Social
          </span>
        </button>
      </div>

      {activeSection === 'feed' ? (
        <CommunityFeed stats={stats} />
      ) : (
        <>
          {/* Title & Description */}
          <div>
            <span className="text-[10px] font-mono tracking-wider font-semibold text-[#00E5FF] uppercase block">
              COMPETIÇÃO & CONSISTÊNCIA
            </span>
            <h1 className="font-space text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Ranking de Alunos</span>
              <Trophy className="w-6 h-6 text-[#FFD700]" />
            </h1>
            <p className="text-xs text-[#849396] mt-0.5 font-space">
              Classificação geral baseada em treinos realizados, fotos de refeições registradas, consistência e recuperação.
            </p>
          </div>

      {/* User Position Spotlight Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#12161F] via-[#151D2A] to-[#00E5FF]/10 border border-[#00E5FF]/50 shadow-xl space-y-3.5 relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="relative">
              {stats.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={stats.avatarUrl}
                  alt={stats.name}
                  className="w-13 h-13 rounded-full object-cover border-2 border-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.4)]"
                />
              ) : (
                <div className="w-13 h-13 rounded-full bg-[#171B26] border-2 border-[#00E5FF] text-[#00E5FF] flex items-center justify-center font-space font-bold text-base shadow-[0_0_12px_rgba(0,229,255,0.4)]">
                  {stats.name ? stats.name.slice(0, 2).toUpperCase() : 'WR'}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#00E5FF] text-[#0B0E14] font-bold text-[10px] flex items-center justify-center shadow">
                #{currentUserRanked.rank}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-space font-bold text-white text-base">
                  {stats.name}
                </h3>
                <span className="px-1.5 py-0.5 rounded bg-[#00E5FF]/20 text-[#00E5FF] text-[9px] font-mono font-bold uppercase">
                  Você
                </span>
              </div>
              <p className="text-xs text-[#00E5FF] font-space font-bold mt-0.5">
                Sua posição: {currentUserRanked.rank}º lugar
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="font-space text-2xl font-extrabold text-[#00E5FF]">
              {currentUserRanked.score?.toLocaleString('pt-BR') || 0}
            </span>
            <span className="text-[10px] text-[#849396] block font-mono">PONTOS</span>
          </div>
        </div>

        {/* Score Breakdown (Item 8 da especificação) */}
        <div className="pt-2 border-t border-[#222938] relative z-10 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-space text-[#849396]">
            <span>Discriminação de Pontos:</span>
            <span className="font-mono font-bold text-white">
              Total: {currentUserRanked.scoreBreakdown?.totalScore.toLocaleString('pt-BR')} pts
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[11px] font-mono">
            <div className="p-1.5 rounded-lg bg-[#0B0E14] border border-[#222938] text-center">
              <span className="text-[9px] text-[#849396] block">Treinos</span>
              <strong className="text-white">+{currentUserRanked.scoreBreakdown?.workoutsScore}</strong>
            </div>
            <div className="p-1.5 rounded-lg bg-[#0B0E14] border border-[#C5A059]/40 text-center">
              <span className="text-[9px] text-[#C5A059] block">Refeições</span>
              <strong className="text-[#E5C378]">+{currentUserRanked.scoreBreakdown?.mealsScore}</strong>
            </div>
            <div className="p-1.5 rounded-lg bg-[#0B0E14] border border-[#222938] text-center">
              <span className="text-[9px] text-[#849396] block">Água</span>
              <strong className="text-[#00E5FF]">+{currentUserRanked.scoreBreakdown?.waterScore}</strong>
            </div>
            <div className="p-1.5 rounded-lg bg-[#0B0E14] border border-[#222938] text-center">
              <span className="text-[9px] text-[#849396] block">Sono</span>
              <strong className="text-indigo-300">+{currentUserRanked.scoreBreakdown?.sleepScore}</strong>
            </div>
            <div className="p-1.5 rounded-lg bg-[#0B0E14] border border-[#222938] text-center col-span-2 sm:col-span-1">
              <span className="text-[9px] text-[#849396] block">Consistência</span>
              <strong className="text-emerald-400">+{currentUserRanked.scoreBreakdown?.consistencyBonus}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Timeframe Tabs: Geral | Mensal | Semanal (Item 9 da especificação) */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-[#12161F] border border-[#222938] rounded-xl text-xs font-space">
        <button
          type="button"
          onClick={() => setTimeframe('geral')}
          className={`py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            timeframe === 'geral'
              ? 'bg-[#00E5FF] text-[#0B0E14] shadow-[0_0_12px_rgba(0,229,255,0.4)]'
              : 'text-[#BAC9CC] hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Ranking Geral</span>
        </button>

        <button
          type="button"
          onClick={() => setTimeframe('mensal')}
          className={`py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            timeframe === 'mensal'
              ? 'bg-[#00E5FF] text-[#0B0E14] shadow-[0_0_12px_rgba(0,229,255,0.4)]'
              : 'text-[#BAC9CC] hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Ranking Mensal</span>
        </button>

        <button
          type="button"
          onClick={() => setTimeframe('semanal')}
          className={`py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            timeframe === 'semanal'
              ? 'bg-[#00E5FF] text-[#0B0E14] shadow-[0_0_12px_rgba(0,229,255,0.4)]'
              : 'text-[#BAC9CC] hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Ranking Semanal</span>
        </button>
      </div>

      {/* Athlete Ranking List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-space font-bold uppercase tracking-wider text-[#849396]">
            Classificação ({rankedList.length} Alunos)
          </span>
          <button
            type="button"
            onClick={() => setIsAddAthleteModalOpen(true)}
            className="text-[#00E5FF] hover:underline font-space font-medium flex items-center gap-1 text-[11px] cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Cadastrar Outro Aluno</span>
          </button>
        </div>

        {rankedList.map((athlete, index) => {
          const rank = index + 1;
          const isGold = rank === 1;
          const isSilver = rank === 2;
          const isBronze = rank === 3;
          const isExpanded = expandedAthleteId === athlete.id;

          return (
            <div
              key={athlete.id}
              className={`rounded-2xl border transition-all ${
                athlete.isCurrentUser
                  ? 'bg-[#151D2A] border-[#00E5FF]/60 shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                  : 'bg-[#12161F] border-[#222938] hover:border-[#849396]/50'
              }`}
            >
              {/* Row Header */}
              <div
                onClick={() => toggleExpand(athlete.id)}
                className="p-3.5 flex items-center gap-3 cursor-pointer select-none"
              >
                {/* Rank Badge */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-space font-bold text-xs shrink-0 ${
                    isGold
                      ? 'bg-amber-400 text-[#0B0E14] shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                      : isSilver
                      ? 'bg-slate-300 text-[#0B0E14]'
                      : isBronze
                      ? 'bg-amber-700 text-white'
                      : 'bg-[#171B26] text-[#849396] border border-[#222938]'
                  }`}
                >
                  {isGold ? <Crown className="w-4 h-4 fill-current" /> : `${rank}º`}
                </div>

                {/* Avatar */}
                <div className="relative shrink-0">
                  {athlete.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={athlete.avatarUrl}
                      alt={athlete.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#222938]"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#171B26] border border-[#222938] text-[#00E5FF] flex items-center justify-center font-space font-bold text-xs">
                      {athlete.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Name & Title matching: 1º Nome do aluno — 3.400 pts */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-space font-bold text-sm text-white truncate">
                      {athlete.name}
                    </h4>
                    {athlete.isCurrentUser && (
                      <span className="px-1.5 py-0.2 rounded bg-[#00E5FF]/20 text-[#00E5FF] text-[8px] font-mono font-bold uppercase shrink-0">
                        Você
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#849396] font-mono mt-0.5">
                    <span>{athlete.monthlyWorkouts} treinos</span>
                    <span>•</span>
                    <span className="text-[#E5C378] flex items-center gap-0.5">
                      <Utensils className="w-2.5 h-2.5" />
                      <span>{athlete.mealPoints || 0} pts</span>
                    </span>
                    <span>•</span>
                    <span className="text-[#FF9100] flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5 fill-current" />
                      <span>{athlete.streakDays}d</span>
                    </span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right shrink-0 flex items-center gap-2">
                  <div>
                    <span className="font-space text-base font-extrabold text-white block">
                      {athlete.score?.toLocaleString('pt-BR')} pts
                    </span>
                    <span className="text-[9px] text-[#849396] font-mono">
                      {timeframe.toUpperCase()}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#849396]" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#849396]" />
                  )}
                </div>
              </div>

              {/* Expanded Breakdown */}
              {isExpanded && (
                <div className="px-3.5 pb-3.5 pt-1 border-t border-[#1D2026] space-y-2 bg-[#0B0E14]/40 rounded-b-2xl">
                  <span className="text-[10px] font-space text-[#849396] uppercase tracking-wider block">
                    Composição da Pontuação:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[10px] font-mono">
                    <div className="p-1.5 rounded-lg bg-[#12161F] border border-[#222938]">
                      <span className="text-[#849396] block text-[9px]">Treinos</span>
                      <strong className="text-white">+{athlete.scoreBreakdown?.workoutsScore}</strong>
                    </div>
                    <div className="p-1.5 rounded-lg bg-[#12161F] border border-[#C5A059]/40">
                      <span className="text-[#C5A059] block text-[9px]">Refeições</span>
                      <strong className="text-[#E5C378]">+{athlete.scoreBreakdown?.mealsScore}</strong>
                    </div>
                    <div className="p-1.5 rounded-lg bg-[#12161F] border border-[#222938]">
                      <span className="text-[#849396] block text-[9px]">Água</span>
                      <strong className="text-[#00E5FF]">+{athlete.scoreBreakdown?.waterScore}</strong>
                    </div>
                    <div className="p-1.5 rounded-lg bg-[#12161F] border border-[#222938]">
                      <span className="text-[#849396] block text-[9px]">Sono</span>
                      <strong className="text-indigo-300">+{athlete.scoreBreakdown?.sleepScore}</strong>
                    </div>
                    <div className="p-1.5 rounded-lg bg-[#12161F] border border-[#222938]">
                      <span className="text-[#849396] block text-[9px]">Consistência</span>
                      <strong className="text-emerald-400">+{athlete.scoreBreakdown?.consistencyBonus}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
        </>
      )}

      {/* Add Athlete Modal */}
      {isAddAthleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#11141C] border border-[#222938] rounded-2xl max-w-md w-full p-5 space-y-4 text-white shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#222938] pb-3">
              <h3 className="font-space font-bold text-sm text-white">
                Cadastrar Novo Aluno no Ranking
              </h3>
              <button
                type="button"
                onClick={() => setIsAddAthleteModalOpen(false)}
                className="text-[#849396] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewAthlete} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="text-[#BAC9CC] font-space font-semibold">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={newAthleteName}
                  onChange={(e) => setNewAthleteName(e.target.value)}
                  placeholder="Ex: Gabriel Fontes"
                  className="w-full bg-[#0B0E14] border border-[#222938] rounded-lg p-2 text-white font-space focus:border-[#00E5FF] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#BAC9CC] font-space font-semibold">E-mail (opcional)</label>
                <input
                  type="email"
                  value={newAthleteEmail}
                  onChange={(e) => setNewAthleteEmail(e.target.value)}
                  placeholder="Ex: gabriel@gmail.com"
                  className="w-full bg-[#0B0E14] border border-[#222938] rounded-lg p-2 text-white font-space focus:border-[#00E5FF] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[#BAC9CC] font-space font-semibold">Treinos no Mês</label>
                  <input
                    type="number"
                    min="0"
                    max="31"
                    value={newAthleteWorkouts}
                    onChange={(e) => setNewAthleteWorkouts(e.target.value)}
                    className="w-full bg-[#0B0E14] border border-[#222938] rounded-lg p-2 text-white font-mono focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#BAC9CC] font-space font-semibold">Dias Seguidos</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={newAthleteStreak}
                    onChange={(e) => setNewAthleteStreak(e.target.value)}
                    className="w-full bg-[#0B0E14] border border-[#222938] rounded-lg p-2 text-white font-mono focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddAthleteModalOpen(false)}
                  className="px-3 py-1.5 text-[#849396] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00E5FF] text-[#0B0E14] font-space font-bold rounded-xl hover:bg-[#33EAFF] transition-all"
                >
                  Cadastrar Aluno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankingView;
