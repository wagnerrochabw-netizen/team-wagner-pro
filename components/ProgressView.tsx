'use client';

import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  Flame,
  Trophy,
  Check,
  Dumbbell,
  Footprints,
  Timer,
  BookmarkCheck,
  ExternalLink,
  Image as ImageIcon,
  Droplets,
  Moon,
  FileText,
  BarChart2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { UserStats, WorkoutLog } from '@/lib/types';
import { WRLogo } from './WRLogo';
import { getWaterTier } from '@/lib/water-helpers';
import { useWaterLiters } from '@/lib/water-store';
import { getSleepTier } from '@/lib/sleep-helpers';
import { useSleepData } from '@/lib/sleep-store';
import { renderActivityIcon } from '@/lib/activity-helpers';
import { EvolutionCharts } from './EvolutionCharts';
import { ProgressReportCard } from './ProgressReportCard';
import { ProgressReportModal } from './ProgressReportModal';
import {
  getWeeklyReport,
  getMonthlyReport,
} from '@/lib/progress-reports';

interface ProgressViewProps {
  stats: UserStats;
  workouts: WorkoutLog[];
  activeCalendarDays: number[];
  onOpenWorkoutDetails: (workout: WorkoutLog) => void;
  onOpenRegisterModal: () => void;
  onNavigateToProfile?: () => void;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  stats,
  workouts,
  activeCalendarDays,
  onOpenWorkoutDetails,
  onOpenRegisterModal,
  onNavigateToProfile,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'semana' | 'mes' | 'ano' | 'tudo'>('mes');
  const [calendarDate, setCalendarDate] = useState(() => new Date());
  const [activeSubTab, setActiveSubTab] = useState<'geral' | 'graficos' | 'relatorios'>('geral');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [modalReportType, setModalReportType] = useState<'semanal' | 'mensal'>('semanal');

  const waterLiters = useWaterLiters();
  const waterTier = getWaterTier(waterLiters);
  const sleepData = useSleepData();
  const sleepTier = getSleepTier(sleepData.hours, sleepData.quality === 'boa');

  // Compute live reports based on current state
  const weekReport = getWeeklyReport(waterLiters, sleepData, workouts, activeCalendarDays);
  const monthReport = getMonthlyReport(waterLiters, sleepData, workouts, activeCalendarDays, stats);

  // Dynamic calendar calculation
  const currentMonthIndex = calendarDate.getMonth();
  const currentYear = calendarDate.getFullYear();
  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentMonthIndex && today.getFullYear() === currentYear;
  const todayDateNum = today.getDate();

  const monthNamesPt = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const currentMonthName = `${monthNamesPt[currentMonthIndex]} ${currentYear}`;

  const firstDayOfWeek = new Date(currentYear, currentMonthIndex, 1).getDay(); // 0 Dom, 1 Seg...
  const totalDaysInCurrentMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();

  const calendarCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push({ dayNum: null, isActive: false, isToday: false, dateStr: '' });
  }
  for (let day = 1; day <= totalDaysInCurrentMonth; day++) {
    const monthStr = String(calendarDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const cellDateStr = `${calendarDate.getFullYear()}-${monthStr}-${dayStr}`;
    calendarCells.push({
      dayNum: day,
      isActive: workouts.some((w) => w.date === cellDateStr),
      isToday: isCurrentMonth && day === todayDateNum,
      dateStr: cellDateStr,
    });
  }

  const [calendarToast, setCalendarToast] = useState<string | null>(null);

  const handleCalendarDayClick = (cell: { dayNum: number; isActive: boolean; isToday: boolean; dateStr: string }) => {
    if (cell.isToday) {
      onOpenRegisterModal();
    } else if (cell.isActive) {
      const w = workouts.find((item) => item.date === cell.dateStr);
      if (w && onOpenWorkoutDetails) {
        onOpenWorkoutDetails(w);
      } else {
        setCalendarToast(`Dia ${cell.dayNum}: Treino concluído!`);
        setTimeout(() => setCalendarToast(null), 3000);
      }
    } else {
      setCalendarToast('Só é permitido marcar o treino no dia atual (Hoje).');
      setTimeout(() => setCalendarToast(null), 3500);
    }
  };

  const handlePrevMonth = () => {
    setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const handleNextMonth = () => {
    setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const getSensationDisplay = (sensation: string) => {
    switch (sensation) {
      case 'pesado':
        return { label: 'Pesado', emoji: '🔥' };
      case 'muito_pesado':
        return { label: 'Muito pesado', emoji: '💀' };
      case 'bom':
        return { label: 'Bom', emoji: '😃' };
      default:
        return { label: 'Leve', emoji: '😌' };
    }
  };

  const getActivityIcon = (type: string) => {
    return renderActivityIcon(type, undefined, 'w-4 h-4 text-[#00E5FF]');
  };

  const handleOpenFullReport = (type: 'semanal' | 'mensal') => {
    setModalReportType(type);
    setIsReportModalOpen(true);
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Header matching Image 3 with Quick Report Action and Profile Avatar */}
      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={onNavigateToProfile}
          className="cursor-pointer hover:scale-105 active:scale-95 transition-transform focus:outline-none"
          title="Acessar Perfil"
        >
          <WRLogo variant="monogram" size="md" />
        </button>

        <span className="font-space text-lg font-bold text-white">Progresso</span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenFullReport(filterPeriod === 'semana' ? 'semanal' : 'mensal')}
            className="px-2.5 py-1 rounded-xl bg-[#12161F] hover:bg-[#1D2026] border border-[#00E5FF]/40 text-[#00E5FF] text-[11px] font-mono flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(0,229,255,0.15)] cursor-pointer"
            title="Abrir Boletim / Relatório Completo"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Relatório</span>
          </button>

          {/* Bolinha do perfil no header de Progresso */}
          <button
            type="button"
            onClick={onNavigateToProfile}
            className="w-8 h-8 rounded-full border border-[#00E5FF]/40 hover:border-[#00E5FF] hover:ring-2 hover:ring-[#00E5FF]/40 overflow-hidden bg-[#12161F] flex items-center justify-center text-[#00E5FF] text-xs font-mono font-bold transition-all cursor-pointer shadow-[0_0_8px_rgba(0,229,255,0.2)] focus:outline-none shrink-0"
            title="Acessar Perfil"
          >
            {stats.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={stats.avatarUrl} alt={stats.name} className="w-full h-full object-cover" />
            ) : (
              <span>{stats.name ? stats.name.slice(0, 2).toUpperCase() : 'WR'}</span>
            )}
          </button>
        </div>
      </div>

      {/* Title & Live Badge */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[10px] font-mono tracking-wider font-semibold text-[#00E5FF] uppercase block">
            MÉTRICAS, ÁGUA & SONO
          </span>
          <h1 className="font-space text-2xl font-bold text-white tracking-tight">
            Seu Progresso
          </h1>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] font-mono text-[11px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-ping" />
          <span>AO VIVO</span>
        </div>
      </div>

      {/* Sub-Tabs: Geral | Gráficos de Evolução | Relatórios */}
      <div className="flex items-center p-1 bg-[#12161F] border border-[#222938] rounded-xl text-xs font-space">
        <button
          type="button"
          onClick={() => setActiveSubTab('geral')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'geral'
              ? 'bg-[#00E5FF] text-[#0B0E14] font-bold shadow-[0_0_10px_rgba(0,229,255,0.35)]'
              : 'text-[#BAC9CC] hover:text-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Visão Geral</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('graficos')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'graficos'
              ? 'bg-[#00E5FF] text-[#0B0E14] font-bold shadow-[0_0_10px_rgba(0,229,255,0.35)]'
              : 'text-[#BAC9CC] hover:text-white'
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Gráficos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('relatorios')}
          className={`flex-1 py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'relatorios'
              ? 'bg-[#00E5FF] text-[#0B0E14] font-bold shadow-[0_0_10px_rgba(0,229,255,0.35)]'
              : 'text-[#BAC9CC] hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Relatórios</span>
        </button>
      </div>

      {/* Filter Tabs matching Image 3 (Semana | Mês | Ano | Tudo) */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-[#12161F] border border-[#222938] rounded-xl">
        {[
          { id: 'semana', label: 'Semana' },
          { id: 'mes', label: 'Mês' },
          { id: 'ano', label: 'Ano' },
          { id: 'tudo', label: 'Tudo' },
        ].map((tab) => {
          const isActive = filterPeriod === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilterPeriod(tab.id as any)}
              className={`py-2 rounded-lg text-xs font-space font-medium transition-all ${
                isActive
                  ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.25)] font-bold'
                  : 'text-[#BAC9CC] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. INTERACTIVE EVOLUTION CHARTS (Treinos, Água, Sono, Tríade) */}
      {(activeSubTab === 'geral' || activeSubTab === 'graficos') && (
        <EvolutionCharts
          period={filterPeriod === 'semana' ? 'semana' : 'mes'}
          days={filterPeriod === 'semana' ? weekReport.days : monthReport.days}
          weeks={monthReport.weeks}
          onPeriodChange={(p) => setFilterPeriod(p)}
        />
      )}

      {/* 2. PROGRESS REPORT CARD (Weekly & Monthly Report with Coach Diagnosis) */}
      {(activeSubTab === 'geral' || activeSubTab === 'relatorios') && (
        <ProgressReportCard
          weekReport={weekReport}
          monthReport={monthReport}
          onOpenFullReportModal={handleOpenFullReport}
        />
      )}

      {/* 3. CALENDAR & HISTORICAL METRICS (When in Geral or Relatórios) */}
      {activeSubTab === 'geral' && (
        <>
          {/* Interactive Calendar Card matching Image 3 */}
          <div className="bg-[#12161F] border border-[#222938] rounded-2xl p-5 space-y-4">
            {/* Month Header with Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 text-[#00E5FF]">📅</div>
                <span className="font-space text-base font-bold text-white">
                  {currentMonthName}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded bg-[#171B26] border border-[#222938] text-[#BAC9CC] hover:text-white"
                  title="Mês Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded bg-[#171B26] border border-[#222938] text-[#BAC9CC] hover:text-white"
                  title="Próximo Mês"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Toast de aviso caso clique em outro dia */}
            {calendarToast && (
              <div className="p-2.5 bg-amber-500/15 border border-amber-500/50 text-amber-300 text-xs rounded-xl flex items-center justify-between font-space">
                <span>⚠️ {calendarToast}</span>
                <button
                  type="button"
                  onClick={() => setCalendarToast(null)}
                  className="text-amber-400 hover:text-white px-1 text-xs font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-space font-bold text-[#849396]">
              <span>D</span>
              <span>S</span>
              <span>T</span>
              <span>Q</span>
              <span>Q</span>
              <span>S</span>
              <span>S</span>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarCells.map((cell, idx) => {
                if (!cell.dayNum) {
                  return <div key={`empty-${idx}`} className="h-9" />;
                }
                const isToday = cell.isToday;
                return (
                  <button
                    key={`day-${cell.dayNum}`}
                    type="button"
                    onClick={() => handleCalendarDayClick(cell as any)}
                    className={`h-9 rounded-lg font-mono text-xs flex items-center justify-center transition-all cursor-pointer ${
                      cell.isActive
                        ? 'bg-[#00E5FF] text-[#0B0E14] font-bold shadow-[0_0_12px_rgba(0,229,255,0.45)]'
                        : isToday
                        ? 'border-2 border-[#00E5FF] bg-[#00E5FF]/20 text-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.3)] animate-pulse'
                        : 'bg-[#171B26] text-[#849396] hover:border-[#849396] border border-transparent'
                    }`}
                    title={
                      isToday
                        ? cell.isActive ? 'Treino de hoje concluído!' : 'Clique para marcar o treino de hoje'
                        : cell.isActive ? `Dia ${cell.dayNum}: Ver treino` : 'Treinos só podem ser marcados no dia de hoje'
                    }
                  >
                    {cell.dayNum < 10 ? `0${cell.dayNum}` : cell.dayNum}
                  </button>
                );
              })}
            </div>

            {/* Active Streak Banner */}
            <div className="p-3 rounded-xl bg-[#171B26] border border-[#222938] flex items-center justify-between text-xs">
              <span className="text-[#849396] font-space">Sequência Atual Ativa</span>
              <span className="font-mono font-bold text-[#00E5FF] flex items-center gap-1">
                {stats.streakDays === 0 ? (
                  <span className="text-[#849396]">0 Dias • Inicie seu primeiro treino hoje! 🎯</span>
                ) : (
                  <span>{stats.streakDays} {stats.streakDays === 1 ? 'Dia Ativo' : 'Dias Ativos'} 🔥</span>
                )}
              </span>
            </div>

            {/* Heatmap Legend */}
            <div className="flex items-center justify-between text-[11px] text-[#849396] font-mono pt-1">
              <span>Menos ativo</span>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#171B26] border border-[#222938]" />
                <span className="w-3 h-3 rounded bg-[#00838F]/60" />
                <span className="w-3 h-3 rounded bg-[#00E5FF]/70" />
                <span className="w-3 h-3 rounded bg-[#00E5FF] shadow-[0_0_6px_rgba(0,229,255,0.8)]" />
              </div>
              <span>Mais consistente</span>
            </div>
          </div>

          {/* Stats Card: TREINOS matching Image 3 */}
          <div className="bg-[#12161F] border border-[#222938] rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-[#00E5FF] font-space font-bold uppercase tracking-wider">
                <Dumbbell className="w-4 h-4" />
                <span>TREINOS</span>
              </div>
              <div className="px-2.5 py-0.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] font-mono text-xs font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>+{monthReport.workoutsGrowthPercent}% vs mês passado</span>
              </div>
            </div>

            <div className="flex items-baseline gap-2 pt-1">
              <span className="font-space text-4xl font-extrabold text-[#00E5FF]">
                {stats.monthlyWorkouts}
              </span>
              <span className="font-space text-sm text-white">treinos este mês</span>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 border-t border-[#1D2026]">
              <span className="text-[#849396]">Mês anterior: {stats.monthlyPreviousWorkouts}</span>
              <span className="text-[#00E5FF] font-space font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                Meta mensal superada
              </span>
            </div>
          </div>

          {/* 2-Column Stats Grid matching Image 3 */}
          <div className="grid grid-cols-2 gap-3">
            {/* SEQUÊNCIA */}
            <div className="bg-[#12161F] border border-[#222938] rounded-2xl p-4 space-y-2">
              <span className="text-[10px] font-space font-bold uppercase text-[#849396] tracking-wider block">
                SEQUÊNCIA
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-space text-3xl font-bold text-[#00E5FF]">
                  {stats.streakDays}
                </span>
                <span className="font-space text-xs text-white">
                  {stats.streakDays === 1 ? 'dia' : 'dias'}
                </span>
              </div>
              <div className="text-[11px] text-[#00E5FF] font-space flex items-center gap-1">
                <span>Ritmo contínuo</span>
                <Flame className="w-3.5 h-3.5 fill-current" />
              </div>
              <div className="text-[10px] text-[#849396] font-mono flex items-center gap-1 pt-1 border-t border-[#1D2026]">
                <Trophy className="w-3 h-3 text-[#00E5FF]" />
                <span>Recorde: {stats.recordStreakDays || stats.streakDays || 0} {stats.recordStreakDays === 1 ? 'dia' : 'dias'}</span>
              </div>
            </div>

            {/* TEMPO */}
            <div className="bg-[#12161F] border border-[#222938] rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-1 text-[10px] font-space font-bold uppercase text-[#849396] tracking-wider">
                <Clock className="w-3 h-3 text-[#00E5FF]" />
                <span>TEMPO</span>
              </div>
              <div className="font-space text-2xl font-bold text-white truncate">
                {stats.monthlyTotalHoursMinutes}
              </div>
              <div className="text-[11px] text-[#849396] font-space">
                acumulado no mês
              </div>
              <div className="text-[10px] text-[#00E5FF] font-mono flex items-center gap-1 pt-1 border-t border-[#1D2026]">
                <Timer className="w-3 h-3" />
                <span>Média: {stats.averageMinutesPerSession} min/sessão</span>
              </div>
            </div>
          </div>

          {/* Meta de Hidratação Diária */}
          <div className="bg-[#12161F] border border-[#222938] rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center border"
                style={{
                  backgroundColor: waterTier.bgColor,
                  borderColor: waterTier.borderColor,
                }}
              >
                <Droplets className="w-5 h-5" style={{ color: waterTier.color }} />
              </div>
              <div>
                <span className="text-[10px] font-space font-bold uppercase text-[#849396] tracking-wider block">
                  HIDRATAÇÃO HOJE
                </span>
                <span className="font-space text-sm font-bold text-white">
                  {waterLiters.toFixed(1)} L • {waterTier.badge}
                </span>
              </div>
            </div>

            <span
              className="text-xs font-mono font-bold px-2.5 py-1 rounded-full border"
              style={{
                backgroundColor: waterTier.bgColor,
                borderColor: waterTier.borderColor,
                color: waterTier.color,
              }}
            >
              {waterTier.rangeText}
            </span>
          </div>

          {/* Meta de Sono & Descanso */}
          <div className="bg-[#12161F] border border-[#222938] rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center border"
                style={{
                  backgroundColor: sleepTier.bgColor,
                  borderColor: sleepTier.borderColor,
                }}
              >
                <Moon className="w-5 h-5" style={{ color: sleepTier.color }} />
              </div>
              <div>
                <span className="text-[10px] font-space font-bold uppercase text-[#849396] tracking-wider block">
                  SONO & RECUPERAÇÃO HOJE
                </span>
                <span className="font-space text-sm font-bold text-white">
                  {sleepData.hours.toFixed(1)}h • {sleepTier.badge}
                </span>
              </div>
            </div>

            <span
              className="text-xs font-mono font-bold px-2.5 py-1 rounded-full border"
              style={{
                backgroundColor: sleepTier.bgColor,
                borderColor: sleepTier.borderColor,
                color: sleepTier.color,
              }}
            >
              {sleepTier.rangeText}
            </span>
          </div>

          {/* Histórico Recente matching Image 3 */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#00E5FF]" />
                <h3 className="font-space font-bold text-base text-white">
                  Histórico Recente
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleOpenFullReport('mensal')}
                className="text-xs font-mono font-bold text-[#00E5FF] hover:underline uppercase"
              >
                VER RELATÓRIO
              </button>
            </div>

            <div className="space-y-2">
              {workouts.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#12161F] border border-[#222938] text-center space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/20 flex items-center justify-center mx-auto text-[#00E5FF]">
                    <Dumbbell className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-space font-bold text-sm text-white">Nenhum treino registrado ainda</h4>
                    <p className="text-xs text-[#849396] mt-1 max-w-xs mx-auto">
                      Seu histórico está pronto para começar! Conforme você registrar seus treinos, eles aparecerão aqui e marcarão seus dias no calendário.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenRegisterModal}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00E5FF] text-[#0B0E14] font-space font-bold text-xs hover:bg-[#00E5FF]/90 transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)] cursor-pointer"
                  >
                    <span>+ Registrar Primeiro Treino</span>
                  </button>
                </div>
              ) : (
                workouts.map((w) => {
                  const sens = getSensationDisplay(w.sensation);
                  return (
                    <div
                      key={w.id}
                      onClick={() => onOpenWorkoutDetails(w)}
                      className="p-3.5 rounded-xl bg-[#12161F] border border-[#222938] hover:border-[#00E5FF]/50 transition-all flex items-center justify-between cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-[#171B26] border border-[#222938] group-hover:border-[#00E5FF]/40 flex items-center justify-center shrink-0">
                          {getActivityIcon(w.activityType)}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-space font-bold text-sm text-white group-hover:text-[#00E5FF] transition-colors truncate">
                              {w.activityType}
                            </span>
                            <span className="text-[10px] font-mono bg-[#171B26] border border-[#222938] px-1.5 py-0.5 rounded text-[#BAC9CC]">
                              {w.displayDate}
                            </span>
                            {w.photoUrl && (
                              <span className="text-[10px] text-[#00E5FF] flex items-center" title="Foto Anexada">
                                <ImageIcon className="w-3 h-3" />
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-[#849396] flex items-center gap-2 mt-0.5">
                            <span>{w.durationMinutes} min</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <span>{sens.emoji}</span>
                              <span>{sens.label}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-full border border-[#00E5FF]/40 bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Card: Hábito Forjado matching Image 3 */}
          <div className="bg-[#12161F] border border-[#222938] rounded-2xl p-5 flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/40 text-[#00E5FF] flex items-center justify-center shrink-0">
              <BookmarkCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-space font-bold text-base text-white">
                Hábito Forjado
              </h4>
              <p className="text-xs text-[#BAC9CC] mt-1 leading-relaxed">
                Você treinou em {stats.consistencyPercentage}% dos dias neste mês. A disciplina sustenta a evolução constante na tríade treino, água e sono.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Footer Branding com Nome e Instagram na parte inferior da página */}
      <div className="pt-6 pb-2 flex flex-col items-center justify-center gap-1">
        <WRLogo variant="full" size="md" subtext="@treinador.wagner" />
      </div>

      {/* Progress Full Executive Report Modal */}
      <ProgressReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        weekReport={weekReport}
        monthReport={monthReport}
        initialType={modalReportType}
      />
    </div>
  );
};
