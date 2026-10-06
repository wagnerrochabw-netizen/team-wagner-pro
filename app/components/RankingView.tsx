'use client';

import React, { useState, useEffect } from 'react';
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
  Plus
} from 'lucide-react';
import { UserStats, WorkoutLog } from '@/lib/types';
import { WRLogo } from './WRLogo';
import {
  RankedAthlete,
  getRankedAthletes,
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
  const [rankedList, setRankedList] = useState<RankedAthlete[]>([]);
  const [filterMode, setFilterMode] = useState<'geral' | 'treinos' | 'streak'>('geral');
  const [comparingWith, setComparingWith] = useState<RankedAthlete | null>(null);
  const [isAddAthleteModalOpen, setIsAddAthleteModalOpen] = useState(false);

  // Form para cadastrar novo aluno real
  const [newAthleteName, setNewAthleteName] = useState('');
  const [newAthleteEmail, setNewAthleteEmail] = useState('');
  const [newAthleteWorkouts, setNewAthleteWorkouts] = useState('10');
  const [newAthleteStreak, setNewAthleteStreak] = useState('3');
  const [newAthleteGoal, setNewAthleteGoal] = useState('Hipertrofia & Força');

  const lastWorkoutDate = workouts && workouts.length > 0 ? workouts[0].date : undefined;

  useEffect(() => {
    const list = getRankedAthletes(stats, lastWorkoutDate);
    setRankedList(list);
  }, [stats, workouts, lastWorkoutDate]);

  // Ordenação de acordo com o filtro selecionado
  const displayedList = [...rankedList].sort((a, b) => {
    if (filterMode === 'treinos') {
      return b.monthlyWorkouts - a.monthlyWorkouts || b.score - a.score;
    }
    if (filterMode === 'streak') {
      return b.streakDays - a.streakDays || b.score - a.score;
    }
    return b.score - a.score;
  });

  const currentUserRanked = rankedList.find((a) => a.isCurrentUser) || {
    ...stats,
    rank: 1,
    score: 0,
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

    // Atualiza lista
    const updated = getRankedAthletes(stats, lastWorkoutDate);
    setRankedList(updated);
    setNewAthleteName('');
    setNewAthleteEmail('');
    setIsAddAthleteModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-24 text-[#E1E2EB]">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <WRLogo variant="monogram" size="md" />

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] font-mono text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
          <span>RANKING OFICIAL</span>
        </div>
      </div>

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
          Classificação real baseada no volume de treinos, sequência e disciplina dos alunos cadastrados.
        </p>
      </div>

      {/* User Position Spotlight Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#12161F] via-[#151A24] to-[#00E5FF]/10 border border-[#00E5FF]/40 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {stats.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={stats.avatarUrl}
                  alt={stats.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#00E5FF]"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-[#171B26] border-2 border-[#00E5FF] text-[#00E5FF] flex items-center justify-center font-space font-bold text-sm">
                  {stats.name ? stats.name.slice(0, 2).toUpperCase() : 'WR'}
                </div>
              )}
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#00E5FF] text-[#0B0E14] font-bold text-[10px] flex items-center justify-center shadow">
                #{currentUserRanked.rank || 1}
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
              <p className="text-[11px] text-[#849396]">
                {currentUserRanked.rank === 1
                  ? '👑 Liderando a consultoria neste mês!'
                  : `Você está na posição #${currentUserRanked.rank} do ranking.`}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="font-space text-xl font-extrabold text-[#00E5FF]">
              {currentUserRanked.score?.toLocaleString('pt-BR') || 0}
            </span>
            <span className="text-[10px] text-[#849396] block font-mono">PONTOS</span>
          </div>
        </div>

        {/* 3 Metrics Row */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#1D2026] text-center">
          <div className="p-2 rounded-xl bg-[#0B0E14]/70 border border-[#222938]">
            <span className="text-[10px] text-[#849396] block font-space">Treinos Mês</span>
            <span className="font-space font-bold text-white text-sm">
              {stats.monthlyWorkouts || 0}
            </span>
          </div>
          <div className="p-2 rounded-xl bg-[#0B0E14]/70 border border-[#222938]">
            <span className="text-[10px] text-[#849396] block font-space">Sequência</span>
            <span className="font-space font-bold text-[#FF9100] text-sm flex items-center justify-center gap-0.5">
              <span>{stats.streakDays || 0}d</span>
              <Flame className="w-3.5 h-3.5 fill-current" />
            </span>
          </div>
          <div className="p-2 rounded-xl bg-[#0B0E14]/70 border border-[#222938]">
            <span className="text-[10px] text-[#849396] block font-space">Consistência</span>
            <span className="font-space font-bold text-[#00E5FF] text-sm">
              {stats.consistencyPercentage || 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs: Geral | Treinos | Sequência */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-[#12161F] border border-[#222938] rounded-xl text-xs font-space">
        <button
          type="button"
          onClick={() => setFilterMode('geral')}
          className={`py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
            filterMode === 'geral'
              ? 'bg-[#00E5FF] text-[#0B0E14] font-bold shadow-[0_0_10px_rgba(0,229,255,0.35)]'
              : 'text-[#BAC9CC] hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Geral</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterMode('treinos')}
          className={`py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
            filterMode === 'treinos'
              ? 'bg-[#00E5FF] text-[#0B0E14] font-bold shadow-[0_0_10px_rgba(0,229,255,0.35)]'
              : 'text-[#BAC9CC] hover:text-white'
          }`}
        >
          <Dumbbell className="w-3.5 h-3.5" />
          <span>Mais Treinos</span>
        </button>

        <button
          type="button"
          onClick={() => setFilterMode('streak')}
          className={`py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
            filterMode === 'streak'
              ? 'bg-[#00E5FF] text-[#0B0E14] font-bold shadow-[0_0_10px_rgba(0,229,255,0.35)]'
              : 'text-[#BAC9CC] hover:text-white'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>Maior Sequência</span>
        </button>
      </div>

      {/* Athlete Ranking List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs px-1">
          <span className="font-space font-bold uppercase tracking-wider text-[#849396]">
            Classificação ({displayedList.length} {displayedList.length === 1 ? 'Aluno' : 'Alunos'})
          </span>
          <button
            type="button"
            onClick={() => setIsAddAthleteModalOpen(true)}
            className="text-[#00E5FF] hover:underline font-space font-medium flex items-center gap-1 text-[11px]"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ Cadastrar Outro Aluno</span>
          </button>
        </div>

        {displayedList.map((athlete, index) => {
          const rank = index + 1;
          const isGold = rank === 1;
          const isSilver = rank === 2;
          const isBronze = rank === 3;

          return (
            <div
              key={athlete.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                athlete.isCurrentUser
                  ? 'bg-[#151D2A] border-[#00E5FF]/60 shadow-[0_0_15px_rgba(0,229,255,0.15)]'
                  : 'bg-[#12161F] border-[#222938] hover:border-[#849396]/50'
              }`}
            >
              <div className="flex items-center gap-3">
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

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-space font-bold text-sm text-white truncate">
                      {athlete.name}
                    </h4>
                    {athlete.isCurrentUser && (
                      <span className="px-1 py-0.2 rounded bg-[#00E5FF]/20 text-[#00E5FF] text-[8px] font-mono font-bold uppercase shrink-0">
                        Você
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#849396] font-mono mt-0.5">
                    <span className="flex items-center gap-1">
                      <Dumbbell className="w-3 h-3 text-[#00E5FF]" />
                      <span>{athlete.monthlyWorkouts} treinos</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-[#FF9100]">
                      <Flame className="w-3 h-3 fill-current" />
                      <span>{athlete.streakDays}d</span>
                    </span>
                  </div>
                </div>

                {/* Points & Compare Action */}
                <div className="text-right shrink-0">
                  <span className="font-space font-extrabold text-[#00E5FF] text-sm block">
                    {athlete.score.toLocaleString('pt-BR')} pts
                  </span>
                  {!athlete.isCurrentUser ? (
                    <button
                      type="button"
                      onClick={() => setComparingWith(athlete)}
                      className="text-[10px] text-[#849396] hover:text-[#00E5FF] hover:underline font-space transition-colors cursor-pointer mt-0.5"
                    >
                      Comparar vs Você
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-400 font-mono">
                      {rank === 1 ? '1º Lugar' : `${rank}º Lugar`}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA Button: REGISTRAR TREINO PARA PONTUAR */}
      <div className="pt-2 space-y-2">
        <button
          onClick={onOpenRegisterModal}
          className="w-full h-14 rounded-xl bg-[#00E5FF] hover:bg-[#00daf3] active:scale-[0.99] text-[#0B0E14] font-space font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all cursor-pointer"
        >
          <Zap className="w-5 h-5 fill-current" />
          <span>REGISTRAR TREINO HOJE PARA PONTUAR</span>
        </button>
        <p className="text-center text-[11px] text-[#849396] font-mono">
          Cada treino registrado soma 100 pontos + bônus de sequência ativa!
        </p>
      </div>

      {/* Modal: Comparação Lado a Lado (Head-to-Head) */}
      {comparingWith && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-[#12161F] border border-[#222938] rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#00E5FF]" />
                <h3 className="font-space font-bold text-white text-base">
                  Comparativo Direto
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setComparingWith(null)}
                className="w-7 h-7 rounded-full bg-[#171B26] text-[#BAC9CC] hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Side-by-side header */}
            <div className="grid grid-cols-2 gap-2 text-center p-3 rounded-xl bg-[#0B0E14] border border-[#222938]">
              <div>
                <span className="text-[10px] text-[#00E5FF] font-mono uppercase font-bold block">
                  Você
                </span>
                <span className="font-space font-bold text-white text-sm truncate block">
                  {stats.name}
                </span>
                <span className="text-xs font-mono text-[#00E5FF] font-extrabold">
                  {currentUserRanked.score} pts
                </span>
              </div>
              <div className="border-l border-[#222938]">
                <span className="text-[10px] text-[#849396] font-mono uppercase font-bold block">
                  Adversário
                </span>
                <span className="font-space font-bold text-white text-sm truncate block">
                  {comparingWith.name}
                </span>
                <span className="text-xs font-mono text-amber-400 font-extrabold">
                  {comparingWith.score} pts
                </span>
              </div>
            </div>

            {/* Metrics Breakdown */}
            <div className="space-y-2 text-xs font-space">
              {/* Treinos no mês */}
              <div className="p-2.5 rounded-lg bg-[#171B26] flex items-center justify-between">
                <span className="font-bold text-[#00E5FF]">
                  {stats.monthlyWorkouts || 0}
                </span>
                <span className="text-[#849396] text-[11px]">Treinos este Mês</span>
                <span className="font-bold text-white">
                  {comparingWith.monthlyWorkouts || 0}
                </span>
              </div>

              {/* Sequência Atual */}
              <div className="p-2.5 rounded-lg bg-[#171B26] flex items-center justify-between">
                <span className="font-bold text-[#FF9100]">
                  {stats.streakDays || 0} dias
                </span>
                <span className="text-[#849396] text-[11px]">Sequência Ativa</span>
                <span className="font-bold text-white">
                  {comparingWith.streakDays || 0} dias
                </span>
              </div>

              {/* Consistência */}
              <div className="p-2.5 rounded-lg bg-[#171B26] flex items-center justify-between">
                <span className="font-bold text-[#00E5FF]">
                  {stats.consistencyPercentage || 0}%
                </span>
                <span className="text-[#849396] text-[11px]">Consistência</span>
                <span className="font-bold text-white">
                  {comparingWith.consistencyPercentage || 0}%
                </span>
              </div>
            </div>

            {/* Diagnosis verdict */}
            <div className="p-3 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-center">
              <span className="text-xs font-space font-bold text-white block">
                {currentUserRanked.score >= comparingWith.score
                  ? '🔥 Você está na frente! Mantenha a sequência.'
                  : `🎯 Você precisa de mais ${Math.ceil((comparingWith.score - currentUserRanked.score) / 100)} treinos para ultrapassar!`}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setComparingWith(null)}
              className="w-full py-2.5 rounded-xl bg-[#171B26] hover:bg-[#1D2026] text-white text-xs font-space font-medium border border-[#222938]"
            >
              Fechar Comparação
            </button>
          </div>
        </div>
      )}

      {/* Modal: Cadastrar Outro Aluno Real na Consultoria */}
      {isAddAthleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-[#12161F] border border-[#222938] rounded-2xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#00E5FF]" />
                <h3 className="font-space font-bold text-white text-base">
                  Cadastrar Aluno no Ranking
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddAthleteModalOpen(false)}
                className="w-7 h-7 rounded-full bg-[#171B26] text-[#BAC9CC] hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#849396]">
              Cadastre outro aluno real da consultoria Team Wagner para comparar posições no ranking.
            </p>

            <form onSubmit={handleCreateNewAthlete} className="space-y-3">
              <div>
                <label className="text-[11px] font-space text-[#BAC9CC] block mb-1">
                  Nome do Aluno *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Mendes"
                  value={newAthleteName}
                  onChange={(e) => setNewAthleteName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0E14] border border-[#222938] rounded-xl text-white text-xs focus:border-[#00E5FF] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-space text-[#BAC9CC] block mb-1">
                  E-mail (opcional)
                </label>
                <input
                  type="email"
                  placeholder="carlos@exemplo.com"
                  value={newAthleteEmail}
                  onChange={(e) => setNewAthleteEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0E14] border border-[#222938] rounded-xl text-white text-xs focus:border-[#00E5FF] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-space text-[#BAC9CC] block mb-1">
                    Treinos no Mês
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={newAthleteWorkouts}
                    onChange={(e) => setNewAthleteWorkouts(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0E14] border border-[#222938] rounded-xl text-white text-xs focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-space text-[#BAC9CC] block mb-1">
                    Sequência (dias)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={newAthleteStreak}
                    onChange={(e) => setNewAthleteStreak(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0E14] border border-[#222938] rounded-xl text-white text-xs focus:border-[#00E5FF] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-space text-[#BAC9CC] block mb-1">
                  Foco / Objetivo
                </label>
                <select
                  value={newAthleteGoal}
                  onChange={(e) => setNewAthleteGoal(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0E14] border border-[#222938] rounded-xl text-white text-xs focus:border-[#00E5FF] focus:outline-none"
                >
                  <option value="Hipertrofia & Força">Hipertrofia & Força</option>
                  <option value="Emagrecimento & Definição">Emagrecimento & Definição</option>
                  <option value="Condicionamento & Performance">Condicionamento & Performance</option>
                  <option value="Saúde & Longevidade">Saúde & Longevidade</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddAthleteModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#171B26] text-[#BAC9CC] text-xs font-space font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#00E5FF] text-[#0B0E14] text-xs font-space font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                >
                  Salvar Aluno
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer Coach Wagner */}
      <div className="pt-4 flex justify-center border-t border-[#1D2026]">
        <WRLogo variant="full" subtext="@treinador.wagner" size="sm" />
      </div>
    </div>
  );
};
