'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Utensils,
  Calendar as CalendarIcon,
  Trophy,
  Flame,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { MealItem, DailyMealDaySummary, MealStatus } from '@/lib/types';
import {
  getMealsForDate,
  saveOrUpdateMeal,
  deleteOrResetMeal,
  addExtraMealToDate,
  getDailyMealSummary,
  getMealConsistencyStreak,
  getTodayDateString,
  getAvailableMealDates,
} from '@/lib/meal-service';
import { MealCard } from './MealCard';
import { WRLogo } from './WRLogo';

interface MealsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyMealsTarget?: number;
  initialTab?: 'today' | 'history' | 'rules';
}

export const MealsManagerModal: React.FC<MealsManagerModalProps> = ({
  isOpen,
  onClose,
  dailyMealsTarget = 4,
  initialTab = 'today',
}) => {
  const [activeTab, setActiveTab] = useState<'today' | 'history' | 'rules'>(initialTab);
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);
  if (initialTab !== prevInitialTab) {
    setPrevInitialTab(initialTab);
    setActiveTab(initialTab);
  }

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [todayMeals, setTodayMeals] = useState<MealItem[]>(() =>
    getMealsForDate(getTodayDateString(), dailyMealsTarget)
  );
  const [historyMeals, setHistoryMeals] = useState<MealItem[]>(() =>
    getMealsForDate(getTodayDateString(), dailyMealsTarget)
  );
  const [streakData, setStreakData] = useState(() => getMealConsistencyStreak());

  const loadData = useCallback((targetDate: string = selectedDate) => {
    const today = getTodayDateString();
    setTodayMeals(getMealsForDate(today, dailyMealsTarget));
    setHistoryMeals(getMealsForDate(targetDate, dailyMealsTarget));
    setStreakData(getMealConsistencyStreak());
  }, [selectedDate, dailyMealsTarget]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        loadData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, loadData]);

  useEffect(() => {
    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener('team_wagner_meals_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('team_wagner_meals_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadData]);

  if (!isOpen) return null;

  const today = getTodayDateString();
  const todaySummary = getDailyMealSummary(today, dailyMealsTarget);
  const historySummary = getDailyMealSummary(selectedDate, dailyMealsTarget);

  const handleUpdateMeal = (meal: MealItem) => {
    saveOrUpdateMeal(meal);
    loadData();
  };

  const handleDeleteMeal = (mealId: string) => {
    deleteOrResetMeal(mealId);
    loadData();
  };

  const handleAddExtraMeal = () => {
    const targetDate = activeTab === 'today' ? today : selectedDate;
    addExtraMealToDate(targetDate);
    loadData();
  };

  const availableDates = getAvailableMealDates();

  // Helper para formatar data (DD/MM/YYYY)
  const formatDateBR = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#11141C] border border-[#222938] rounded-2xl max-w-2xl w-full p-4 sm:p-6 space-y-4 text-white shadow-2xl relative max-h-[92vh] flex flex-col">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#222938] pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0B0E14] border border-[#C5A059]/40 flex items-center justify-center text-[#E5C378]">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-space font-bold text-base sm:text-lg text-white">
                  Registro de Refeições
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/30 text-[#E5C378] text-[10px] font-mono font-bold">
                  Team Wagner
                </span>
              </div>
              <p className="text-[11px] text-[#849396] font-sans">
                Acompanhamento fotográfico e consistência diária
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[#849396] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#0B0E14] border border-[#222938] rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('today')}
            className={`py-2 px-2 rounded-lg font-space text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'today'
                ? 'bg-gradient-to-r from-[#C5A059] to-[#E5C378] text-[#0B0E14] shadow-[0_0_12px_rgba(197,160,89,0.3)]'
                : 'text-[#BAC9CC] hover:text-white'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Refeições de Hoje</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-2 px-2 rounded-lg font-space text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-[#C5A059] to-[#E5C378] text-[#0B0E14] shadow-[0_0_12px_rgba(197,160,89,0.3)]'
                : 'text-[#BAC9CC] hover:text-white'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Histórico & Fotos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`py-2 px-2 rounded-lg font-space text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-gradient-to-r from-[#C5A059] to-[#E5C378] text-[#0B0E14] shadow-[0_0_12px_rgba(197,160,89,0.3)]'
                : 'text-[#BAC9CC] hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Pontuação</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          
          {/* TAB 1: REFEIÇÕES DE HOJE */}
          {activeTab === 'today' && (
            <div className="space-y-4">
              
              {/* Daily Status Banner */}
              <div className="bg-[#0B0E14] border border-[#222938] rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#849396] uppercase tracking-wider block">
                      DATA ATUAL • {formatDateBR(today)}
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="font-space text-2xl font-extrabold text-[#E5C378]">
                        {todaySummary.registeredCount} de {todaySummary.plannedCount}
                      </span>
                      <span className="text-xs text-[#849396] font-space">
                        refeições registradas
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-3 py-1 rounded-xl bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#E5C378] font-mono text-xs font-bold inline-flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-[#E5C378]" />
                      <span>+{todaySummary.points} pontos hoje</span>
                    </span>
                    <span className="block text-[11px] text-[#849396] font-mono mt-1">
                      {todaySummary.completionPercentage}% concluído
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-[#12161F] rounded-full overflow-hidden border border-[#222938]">
                  <div
                    className="h-full bg-gradient-to-r from-[#C5A059] to-[#E5C378] rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(229,195,120,0.5)]"
                    style={{ width: `${Math.min(todaySummary.completionPercentage, 100)}%` }}
                  />
                </div>

                {/* Streak Callout */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center gap-1.5 text-white">
                    <span>🔥</span>
                    <span className="font-space font-semibold">
                      {streakData.currentStreak > 0 ? (
                        <>
                          <strong className="text-[#E5C378]">{streakData.currentStreak} {streakData.currentStreak === 1 ? 'dia' : 'dias'}</strong> de consistência
                        </>
                      ) : (
                        <span className="text-[#849396]">Complete 100% hoje para iniciar sua sequência</span>
                      )}
                    </span>
                  </div>

                  {streakData.bonusPoints > 0 && (
                    <span className="text-[10px] font-mono font-bold text-[#00E5FF] px-2 py-0.5 rounded bg-[#00E5FF]/15 border border-[#00E5FF]/30">
                      +{streakData.bonusPoints} pts bônus ativo
                    </span>
                  )}
                </div>
              </div>

              {/* Meals Cards List */}
              <div className="space-y-3">
                {todayMeals.map((meal) => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    onUpdate={handleUpdateMeal}
                    onDelete={handleDeleteMeal}
                  />
                ))}
              </div>

              {/* Add Extra Meal Button */}
              <button
                type="button"
                onClick={handleAddExtraMeal}
                className="w-full py-3 rounded-xl bg-[#0B0E14] hover:bg-[#171B26] border border-dashed border-[#C5A059]/40 hover:border-[#C5A059] text-[#E5C378] hover:text-white font-space font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4 text-[#C5A059]" />
                <span>+ Adicionar Refeição Extra Hoje</span>
              </button>
            </div>
          )}

          {/* TAB 2: HISTÓRICO DE REFEIÇÕES */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              
              {/* Date Navigator Header */}
              <div className="bg-[#0B0E14] border border-[#222938] rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-space font-bold text-[#BAC9CC] flex items-center gap-1.5 shrink-0">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span className="hidden sm:inline">Selecionar Data do Histórico:</span>
                    <span className="sm:hidden">Data:</span>
                  </label>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(selectedDate + 'T12:00:00');
                        d.setDate(d.getDate() - 1);
                        const y = d.getFullYear();
                        const m = String(d.getMonth() + 1).padStart(2, '0');
                        const dayNum = String(d.getDate()).padStart(2, '0');
                        setSelectedDate(`${y}-${m}-${dayNum}`);
                      }}
                      className="p-1.5 rounded-lg bg-[#12161F] hover:bg-[#1D2026] text-[#BAC9CC] hover:text-white border border-[#222938] transition-colors cursor-pointer"
                      title="Dia anterior"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        if (e.target.value) {
                          setSelectedDate(e.target.value);
                        }
                      }}
                      className="bg-[#12161F] border border-[#222938] rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:border-[#C5A059] focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(selectedDate + 'T12:00:00');
                        d.setDate(d.getDate() + 1);
                        const y = d.getFullYear();
                        const m = String(d.getMonth() + 1).padStart(2, '0');
                        const dayNum = String(d.getDate()).padStart(2, '0');
                        setSelectedDate(`${y}-${m}-${dayNum}`);
                      }}
                      className="p-1.5 rounded-lg bg-[#12161F] hover:bg-[#1D2026] text-[#BAC9CC] hover:text-white border border-[#222938] transition-colors cursor-pointer"
                      title="Próximo dia"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick Date Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {availableDates.slice(0, 6).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDate(d)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                        selectedDate === d
                          ? 'bg-[#C5A059] text-[#0B0E14] font-bold shadow-[0_0_10px_rgba(197,160,89,0.4)]'
                          : 'bg-[#12161F] text-[#849396] hover:text-white border border-[#222938]'
                      }`}
                    >
                      {d === today ? 'Hoje' : formatDateBR(d)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Day Summary Card matching user brief */}
              <div className="bg-[#12161F] border border-[#C5A059]/30 rounded-xl p-4 space-y-3 shadow-md">
                <div className="flex items-center justify-between border-b border-[#222938] pb-2.5">
                  <div>
                    <h3 className="font-space font-extrabold text-base text-white">
                      {formatDateBR(selectedDate)}
                    </h3>
                    <span className="text-[11px] font-mono text-[#849396]">
                      Meta: {historySummary.plannedCount} refeições
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-space font-extrabold text-[#E5C378]">
                      +{historySummary.points} pontos
                    </span>
                    <span className="block text-[11px] font-mono text-emerald-400">
                      Conclusão: {historySummary.completionPercentage}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1">
                  <div className="p-2 rounded-lg bg-[#0B0E14] border border-[#222938]">
                    <span className="text-[10px] text-[#849396] block">Previstas</span>
                    <strong className="text-white font-mono">{historySummary.plannedCount}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0B0E14] border border-[#222938]">
                    <span className="text-[10px] text-[#849396] block">Registradas</span>
                    <strong className="text-[#E5C378] font-mono">{historySummary.registeredCount}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0B0E14] border border-[#222938]">
                    <span className="text-[10px] text-[#849396] block">Extras</span>
                    <strong className="text-white font-mono">{historySummary.extraCount}</strong>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0B0E14] border border-[#222938]">
                    <span className="text-[10px] text-[#849396] block">Fotos</span>
                    <strong className="text-[#00E5FF] font-mono">
                      {historyMeals.filter((m) => !!m.photoUrl).length}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Day Photo Gallery if any photos exist */}
              {historyMeals.filter((m) => !!m.photoUrl).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-space font-bold text-[#E5C378] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Galeria de Fotos do Dia</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {historyMeals.filter((m) => !!m.photoUrl).map((m) => (
                      <div key={m.id} className="relative rounded-xl overflow-hidden aspect-video border border-[#222938] group/item">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={m.photoUrl} alt={m.title} className="w-full h-full object-cover group-hover/item:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-1.5">
                          <span className="text-[10px] font-space font-bold text-white leading-tight truncate">
                            {m.title} {m.time ? `• ${m.time}` : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Detailed Meals of this date */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-space font-bold text-[#BAC9CC]">
                    Refeições Detalhadas
                  </h4>
                  <span className="text-[10px] text-[#849396] font-mono">
                    {formatDateBR(selectedDate)}
                  </span>
                </div>
                {historyMeals.map((meal) => (
                  <MealCard
                    key={meal.id}
                    meal={meal}
                    onUpdate={handleUpdateMeal}
                    onDelete={handleDeleteMeal}
                    readOnly={false}
                  />
                ))}

                {/* Add extra meal on selected date */}
                <button
                  type="button"
                  onClick={handleAddExtraMeal}
                  className="w-full py-2.5 rounded-xl bg-[#0B0E14] hover:bg-[#171B26] border border-dashed border-[#C5A059]/40 hover:border-[#C5A059] text-[#E5C378] hover:text-white font-space font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>+ Adicionar Refeição Extra em {formatDateBR(selectedDate)}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: REGRAS & PONTUAÇÃO */}
          {activeTab === 'rules' && (
            <div className="space-y-4">
              
              {/* Pontuação Diária */}
              <div className="bg-[#0B0E14] border border-[#222938] rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#C5A059]" />
                  <h3 className="font-space font-bold text-sm text-white">
                    Critérios de Pontuação Diária
                  </h3>
                </div>
                <p className="text-xs text-[#849396]">
                  A pontuação é proporcional para que todos os alunos tenham chances iguais no ranking, independente do número de refeições do plano:
                </p>

                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30">
                    <span className="font-space font-bold text-emerald-400">100% das refeições concluídas</span>
                    <strong className="text-emerald-300 font-mono text-sm">+100 pts</strong>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30">
                    <span className="font-space font-bold text-emerald-300">Entre 75% e 99% concluído</span>
                    <strong className="text-emerald-200 font-mono">+75 pts</strong>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-blue-950/20 border border-blue-800/30">
                    <span className="font-space font-bold text-blue-300">Entre 50% e 74% concluído</span>
                    <strong className="text-blue-200 font-mono">+50 pts</strong>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/30">
                    <span className="font-space font-bold text-amber-300">Entre 25% e 49% concluído</span>
                    <strong className="text-amber-200 font-mono">+25 pts</strong>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-red-950/20 border border-red-800/30">
                    <span className="font-space font-bold text-red-400">Abaixo de 25% concluído</span>
                    <strong className="text-red-300 font-mono">0 pts</strong>
                  </div>
                </div>
              </div>

              {/* Bônus de Consistência */}
              <div className="bg-[#0B0E14] border border-[#222938] rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#E5C378]" />
                  <h3 className="font-space font-bold text-sm text-white">
                    Bônus de Consistência (Streaks)
                  </h3>
                </div>
                <p className="text-xs text-[#849396]">
                  Manter 100% da meta por dias seguidos desbloqueia bônus automáticos para o ranking geral:
                </p>

                <div className="space-y-2 pt-1 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#C5A059]/10 border border-[#C5A059]/30">
                    <span className="font-space font-bold text-white flex items-center gap-1.5">
                      <span>🔥</span>
                      <span>3 dias consecutivos completos</span>
                    </span>
                    <strong className="text-[#E5C378] font-mono text-sm">+30 pts</strong>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#C5A059]/15 border border-[#C5A059]/40">
                    <span className="font-space font-bold text-white flex items-center gap-1.5">
                      <span>⚡</span>
                      <span>7 dias consecutivos completos</span>
                    </span>
                    <strong className="text-[#E5C378] font-mono text-sm">+100 pts</strong>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#C5A059]/25 border border-[#C5A059]/60">
                    <span className="font-space font-bold text-white flex items-center gap-1.5">
                      <span>👑</span>
                      <span>30 dias consecutivos completos</span>
                    </span>
                    <strong className="text-[#E5C378] font-mono text-sm">+500 pts</strong>
                  </div>
                </div>
              </div>

              {/* Regra de Refeições Extras */}
              <div className="bg-[#12161F] border border-[#222938] rounded-xl p-3.5 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-[#00E5FF] font-space font-bold">
                  <Info className="w-4 h-4" />
                  <span>Transparência no Ranking</span>
                </div>
                <p className="text-[#BAC9CC] leading-relaxed">
                  Refeições extras ficam salvas no seu histórico com fotos e notas, mas a pontuação do dia considera somente a meta diária configurada no seu perfil para manter uma disputa justa e equilibrada no ranking.
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="border-t border-[#222938] pt-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <WRLogo variant="monogram" size="sm" />
            <span className="text-[11px] font-space text-[#849396]">
              Nutrição & Consistência Team Wagner
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#171B26] hover:bg-[#222938] text-white font-space font-bold text-xs transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};

export default MealsManagerModal;
