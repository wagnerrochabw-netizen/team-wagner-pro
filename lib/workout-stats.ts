import { WorkoutLog, UserStats } from './types';

/**
 * Calcula todas as métricas reais do atleta diretamente a partir dos treinos gravados.
 * Garante consistência matemática absoluta sem dados duplicados ou inventados.
 */
export function calculateRealStats(workouts: WorkoutLog[] = [], currentStats: UserStats): UserStats {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentMonthPrefix = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;

  // 1. Treinos reais no mês atual
  const monthWorkouts = (workouts || []).filter((w) => w.date && w.date.startsWith(currentMonthPrefix));
  const monthlyWorkoutsCount = monthWorkouts.length;

  // 2. Minutos totais reais no mês
  const totalMinutes = monthWorkouts.reduce((acc, w) => acc + (Number(w.durationMinutes) || 0), 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const monthlyTotalHoursMinutes = `${hours}h ${minutes}m`;
  const averageMinutesPerSession = monthlyWorkoutsCount > 0 ? Math.round(totalMinutes / monthlyWorkoutsCount) : 0;

  // 3. Sequência real (Streak de dias consecutivos)
  const uniqueDates = Array.from(new Set((workouts || []).map((w) => w.date).filter(Boolean)));
  const dateSet = new Set(uniqueDates);

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  let checkDate: Date | null = null;
  if (dateSet.has(todayStr)) {
    checkDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (dateSet.has(yesterdayStr)) {
    checkDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
  }

  let streakDays = 0;
  if (checkDate) {
    while (true) {
      const y = checkDate.getFullYear();
      const m = String(checkDate.getMonth() + 1).padStart(2, '0');
      const d = String(checkDate.getDate()).padStart(2, '0');
      const ds = `${y}-${m}-${d}`;

      if (dateSet.has(ds)) {
        streakDays++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // 4. Meta semanal real (dias treinados na semana de Segunda a Domingo)
  const dayOfWeek = now.getDay();
  const mondayDiff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const mondayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayDiff);

  let weeklyCompleted = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(mondayDate.getFullYear(), mondayDate.getMonth(), mondayDate.getDate() + i);
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (dateSet.has(ds)) {
      weeklyCompleted++;
    }
  }

  const weeklyGoalTarget = currentStats.weeklyGoalTarget || 4;
  const consistencyPercentage = weeklyGoalTarget > 0
    ? Math.min(100, Math.round((weeklyCompleted / weeklyGoalTarget) * 100))
    : 0;

  return {
    ...currentStats,
    monthlyWorkouts: monthlyWorkoutsCount,
    monthlyActiveDays: monthlyWorkoutsCount,
    streakDays,
    recordStreakDays: Math.max(currentStats.recordStreakDays || 0, streakDays),
    weeklyGoalCompleted: Math.min(weeklyCompleted, weeklyGoalTarget),
    weeklyGoalTarget,
    monthlyTotalHoursMinutes,
    averageMinutesPerSession,
    consistencyPercentage,
  };
}
