'use client';

import React, { useState, useEffect } from 'react';
import {
  Utensils,
  Flame,
  Plus,
  CheckCircle2,
  Calendar,
  Sparkles,
  Trophy,
  ArrowRight,
  Camera
} from 'lucide-react';
import {
  getDailyMealSummary,
  getMealConsistencyStreak,
  getTodayDateString,
} from '@/lib/meal-service';

interface MealsTodayCardProps {
  dailyMealsTarget?: number;
  onOpenMealsManager: () => void;
  onOpenHistory?: () => void;
}

export const MealsTodayCard: React.FC<MealsTodayCardProps> = ({
  dailyMealsTarget = 4,
  onOpenMealsManager,
  onOpenHistory,
}) => {
  const [summary, setSummary] = useState(() => ({
    date: '',
    plannedCount: dailyMealsTarget,
    registeredCount: 0,
    extraCount: 0,
    completionPercentage: 0,
    points: 0,
    streakDays: 0,
    consistencyBonus: 0,
    meals: [],
  }));
  const [streakData, setStreakData] = useState({ currentStreak: 0, bonusPoints: 0 });

  const loadData = () => {
    const today = getTodayDateString();
    setSummary(getDailyMealSummary(today, dailyMealsTarget));
    setStreakData(getMealConsistencyStreak());
  };

  useEffect(() => {
    const handleUpdate = () => {
      const today = getTodayDateString();
      setSummary(getDailyMealSummary(today, dailyMealsTarget));
      setStreakData(getMealConsistencyStreak());
    };

    const timer = setTimeout(handleUpdate, 0);

    window.addEventListener('team_wagner_meals_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('team_wagner_meals_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [dailyMealsTarget]);

  const { plannedCount, registeredCount, completionPercentage, points } = summary;
  const { currentStreak, bonusPoints } = streakData;

  // Cor da pontuação e status
  const getPointsBadgeClass = () => {
    if (points === 100) return 'bg-[#C5A059]/20 text-[#E5C378] border-[#C5A059]/40';
    if (points >= 75) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (points >= 50) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (points >= 25) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    return 'bg-[#222938] text-[#849396] border-[#222938]';
  };

  return (
    <div className="bg-[#12161F] border border-[#222938] hover:border-[#C5A059]/40 rounded-2xl p-5 space-y-4 shadow-lg transition-all relative overflow-hidden group">
      {/* Background Champagne Glow Accent */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#C5A059]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#0B0E14] border border-[#C5A059]/30 flex items-center justify-center text-[#E5C378] shadow-[0_0_15px_rgba(197,160,89,0.2)]">
            <Utensils className="w-5 h-5 text-[#E5C378]" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-[#849396] uppercase tracking-wider block">
              PLANO ALIMENTAR
            </span>
            <h3 className="font-space text-lg font-bold text-white leading-tight">
              Refeições de Hoje
            </h3>
          </div>
        </div>

        {/* Points Tag */}
        <div className={`px-2.5 py-1 rounded-xl border text-xs font-mono font-bold flex items-center gap-1 shadow-sm ${getPointsBadgeClass()}`}>
          <Trophy className="w-3.5 h-3.5 text-[#E5C378]" />
          <span>+{points} pts</span>
        </div>
      </div>

      {/* Metric Breakdown */}
      <div className="flex items-end justify-between relative z-10 pt-1">
        <div>
          <span className="text-xs text-[#849396] font-space block">
            Refeições Registradas
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="font-space text-3xl font-extrabold text-[#E5C378] drop-shadow-[0_0_15px_rgba(197,160,89,0.4)]">
              {registeredCount}
            </span>
            <span className="font-space text-xl font-bold text-[#849396]">
              / {plannedCount}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-[#849396] font-space block">
            Conclusão Hoje
          </span>
          <div className="font-mono text-xl font-extrabold text-white mt-0.5">
            {completionPercentage}%
          </div>
        </div>
      </div>

      {/* Progress Bar (Champagne Gold Gradient) */}
      <div className="w-full h-2.5 bg-[#0B0E14] rounded-full overflow-hidden border border-[#222938] relative z-10">
        <div
          className="h-full bg-gradient-to-r from-[#C5A059] to-[#E5C378] rounded-full shadow-[0_0_12px_rgba(229,195,120,0.6)] transition-all duration-500"
          style={{ width: `${Math.min(completionPercentage, 100)}%` }}
        />
      </div>

      {/* Consistency Streak Banner */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0E14] border border-[#222938] text-xs relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-base">🔥</span>
          <span className="font-space font-semibold text-white">
            {currentStreak > 0 ? (
              <>
                <strong className="text-[#E5C378]">{currentStreak} {currentStreak === 1 ? 'dia' : 'dias'}</strong> de consistência
              </>
            ) : (
              <span className="text-[#849396]">Inicie sua sequência hoje</span>
            )}
          </span>
        </div>

        {bonusPoints > 0 ? (
          <span className="text-[10px] font-mono font-bold text-[#E5C378] px-2 py-0.5 rounded bg-[#C5A059]/15 border border-[#C5A059]/30">
            +{bonusPoints} pts bônus
          </span>
        ) : (
          <span className="text-[10px] text-[#849396] font-mono">
            Meta: 100% diário
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 relative z-10 pt-1">
        <button
          type="button"
          onClick={onOpenMealsManager}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#C5A059] to-[#E5C378] hover:from-[#d6b068] hover:to-[#edd394] active:scale-[0.98] text-[#0B0E14] font-space font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(197,160,89,0.3)] transition-all cursor-pointer"
        >
          <Camera className="w-4 h-4 stroke-[2.5]" />
          <span>Registrar Refeição</span>
        </button>

        {onOpenHistory && (
          <button
            type="button"
            onClick={onOpenHistory}
            className="w-full py-3 px-4 rounded-xl bg-[#0B0E14] hover:bg-[#171B26] border border-[#222938] hover:border-[#C5A059]/40 text-[#BAC9CC] hover:text-white font-space font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-[#C5A059]" />
            <span>Histórico & Fotos</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default MealsTodayCard;
