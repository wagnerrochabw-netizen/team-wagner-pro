import { UserStats, ScoreBreakdown, WorkoutLog } from './types';
import { getMealGlobalTotals } from './meal-service';
import { getWaterGlobalTotals } from './water-service';
import { getSleepGlobalTotals } from './sleep-service';

export interface RegisteredAthlete {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  goalType?: string;
  monthlyWorkouts: number;
  streakDays: number;
  weeklyGoalCompleted: number;
  weeklyGoalTarget: number;
  consistencyPercentage: number;
  workoutPoints?: number;
  mealPoints: number;
  mealPhotosCount: number;
  mealStreakDays: number;
  waterPoints: number;
  sleepPoints: number;
  lastWorkoutDate?: string;
  totalMinutes?: number;
  updatedAt: number;
}

export interface RankedAthlete extends RegisteredAthlete {
  rank: number;
  score: number;
  weeklyScore: number;
  monthlyScore: number;
  scoreBreakdown: ScoreBreakdown;
  isCurrentUser: boolean;
}

const STORAGE_KEY = 'team_wagner_registered_athletes';

export const INITIAL_RANKED_ATHLETES: RegisteredAthlete[] = [
  {
    id: 'ath_1',
    name: 'Felipe Siqueira',
    email: 'felipe@teamwagner.com',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    goalType: 'Hipertrofia & Definição',
    monthlyWorkouts: 16,
    streakDays: 14,
    weeklyGoalCompleted: 4,
    weeklyGoalTarget: 4,
    consistencyPercentage: 96,
    workoutPoints: 2400, // 16 x 150 pts
    mealPoints: 1200,
    mealPhotosCount: 56,
    mealStreakDays: 12,
    waterPoints: 950,
    sleepPoints: 850,
    updatedAt: Date.now(),
  },
  {
    id: 'ath_2',
    name: 'Camila Duarte',
    email: 'camila@teamwagner.com',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    goalType: 'Emagrecimento & Força',
    monthlyWorkouts: 15,
    streakDays: 11,
    weeklyGoalCompleted: 4,
    weeklyGoalTarget: 4,
    consistencyPercentage: 92,
    workoutPoints: 2200,
    mealPoints: 1150,
    mealPhotosCount: 48,
    mealStreakDays: 9,
    waterPoints: 900,
    sleepPoints: 800,
    updatedAt: Date.now(),
  },
  {
    id: 'ath_3',
    name: 'Lucas Albuquerque',
    email: 'lucas@teamwagner.com',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    goalType: 'Condicionamento Físico',
    monthlyWorkouts: 14,
    streakDays: 8,
    weeklyGoalCompleted: 3,
    weeklyGoalTarget: 4,
    consistencyPercentage: 88,
    workoutPoints: 2000,
    mealPoints: 1000,
    mealPhotosCount: 42,
    mealStreakDays: 7,
    waterPoints: 800,
    sleepPoints: 750,
    updatedAt: Date.now(),
  },
  {
    id: 'ath_4',
    name: 'Renata Vasconcelos',
    email: 'renata@teamwagner.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    goalType: 'Mobilidade & Tônus',
    monthlyWorkouts: 12,
    streakDays: 7,
    weeklyGoalCompleted: 3,
    weeklyGoalTarget: 4,
    consistencyPercentage: 84,
    workoutPoints: 1750,
    mealPoints: 900,
    mealPhotosCount: 38,
    mealStreakDays: 6,
    waterPoints: 750,
    sleepPoints: 700,
    updatedAt: Date.now(),
  },
  {
    id: 'ath_5',
    name: 'Marcos Vinicius',
    email: 'marcos@teamwagner.com',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
    goalType: 'Ganho de Massa Muscular',
    monthlyWorkouts: 11,
    streakDays: 5,
    weeklyGoalCompleted: 3,
    weeklyGoalTarget: 4,
    consistencyPercentage: 78,
    workoutPoints: 1600,
    mealPoints: 800,
    mealPhotosCount: 32,
    mealStreakDays: 4,
    waterPoints: 700,
    sleepPoints: 650,
    updatedAt: Date.now(),
  },
  {
    id: 'ath_6',
    name: 'Beatriz Mendes',
    email: 'beatriz@teamwagner.com',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    goalType: 'Performance & Corrida',
    monthlyWorkouts: 10,
    streakDays: 4,
    weeklyGoalCompleted: 2,
    weeklyGoalTarget: 4,
    consistencyPercentage: 75,
    workoutPoints: 1450,
    mealPoints: 750,
    mealPhotosCount: 28,
    mealStreakDays: 3,
    waterPoints: 650,
    sleepPoints: 600,
    updatedAt: Date.now(),
  },
  {
    id: 'ath_7',
    name: 'Rodrigo Tavares',
    email: 'rodrigo@teamwagner.com',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
    goalType: 'Saúde & Longevidade',
    monthlyWorkouts: 9,
    streakDays: 3,
    weeklyGoalCompleted: 2,
    weeklyGoalTarget: 4,
    consistencyPercentage: 70,
    workoutPoints: 1300,
    mealPoints: 650,
    mealPhotosCount: 24,
    mealStreakDays: 2,
    waterPoints: 600,
    sleepPoints: 550,
    updatedAt: Date.now(),
  }
];

/**
 * Regra oficial de pontuação integrada para o Ranking Team Wagner:
 * - Treino concluído na data programada: +150 pontos (ou +100 pontos avulso)
 * - Refeições: até +100 pontos por dia (conforme % das refeições do plano)
 * - Água: 100% (+100 pts), 75-99% (+75 pts), 50-74% (+50 pts), 25-49% (+25 pts)
 * - Sono: 100% (+100 pts), 75-99% (+75 pts), 50-74% (+50 pts), 25-49% (+25 pts)
 * - Bônus de consistência e sequência de dias
 */
export function calculateScoreBreakdown(athlete: {
  monthlyWorkouts: number;
  streakDays: number;
  consistencyPercentage: number;
  mealPoints?: number;
  waterPoints?: number;
  sleepPoints?: number;
  workoutPoints?: number;
}): ScoreBreakdown {
  const workoutsScore = athlete.workoutPoints !== undefined
    ? athlete.workoutPoints
    : (athlete.monthlyWorkouts || 0) * 150;
  const mealsScore = athlete.mealPoints || 0;
  const waterScore = athlete.waterPoints || 0;
  const sleepScore = athlete.sleepPoints || 0;
  
  // Bônus de consistência e streaks
  const consistencyBonus = Math.round((athlete.streakDays || 0) * 30 + (athlete.consistencyPercentage || 0) * 5);
  
  const totalScore = workoutsScore + mealsScore + waterScore + sleepScore + consistencyBonus;

  return {
    workoutsScore,
    mealsScore,
    waterScore,
    sleepScore,
    consistencyBonus,
    totalScore,
  };
}

export function getStoredAthletes(): RegisteredAthlete[] {
  if (typeof window === 'undefined') return INITIAL_RANKED_ATHLETES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RANKED_ATHLETES));
      return INITIAL_RANKED_ATHLETES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RANKED_ATHLETES));
    return INITIAL_RANKED_ATHLETES;
  } catch {
    return INITIAL_RANKED_ATHLETES;
  }
}

export function saveStoredAthletes(athletes: RegisteredAthlete[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(athletes));
  } catch {
    // ignore
  }
}

/**
 * Sincroniza o usuário atual (stats) na lista de atletas cadastrados
 * com seus dados REAIS de treinos, refeições, água e sono.
 */
export function syncCurrentAthlete(
  stats: UserStats,
  lastWorkoutDate?: string,
  workouts?: WorkoutLog[]
): RegisteredAthlete[] {
  if (!stats || !stats.name) return getStoredAthletes();

  const athletes = getStoredAthletes();
  const currentEmail = stats.email ? stats.email.trim().toLowerCase() : '';
  const currentName = stats.name.trim();

  // 1. Refeições
  let realMealPoints = 0;
  let realMealPhotos = 0;
  let realMealStreak = 0;
  try {
    const mealTotals = getMealGlobalTotals(stats.email || 'current_user', stats.dailyMealsTarget || 4);
    realMealPoints = mealTotals.totalMealPoints;
    realMealPhotos = mealTotals.totalPhotos;
    realMealStreak = mealTotals.currentStreak;
  } catch {
    // ignore
  }

  // 2. Água (Total acumulado de pontos de água de todos os dias registrados)
  let realWaterPoints = 0;
  try {
    const waterTotals = getWaterGlobalTotals();
    realWaterPoints = waterTotals.totalWaterPoints;
  } catch {
    // ignore
  }

  // 3. Sono (Total acumulado de pontos de sono de todos os dias registrados)
  let realSleepPoints = 0;
  try {
    const sleepTotals = getSleepGlobalTotals();
    realSleepPoints = sleepTotals.totalSleepPoints;
  } catch {
    // ignore
  }

  // 4. Treinos (+150 pontos se data programada/em dia, ou +100 pontos por treino concluído)
  let realWorkoutPoints = 0;
  if (Array.isArray(workouts) && workouts.length > 0) {
    realWorkoutPoints = workouts.reduce((sum, w) => {
      const pts = w.points || (w.isOnScheduledDay === false ? 100 : 150);
      return sum + pts;
    }, 0);
  } else {
    realWorkoutPoints = (stats.monthlyWorkouts || 0) * 150;
  }

  // Procura por email ou por nome
  const existingIdx = athletes.findIndex((a) => {
    if (currentEmail && a.email && a.email.toLowerCase() === currentEmail) return true;
    return a.name.toLowerCase() === currentName.toLowerCase();
  });

  const updatedEntry: RegisteredAthlete = {
    id: existingIdx >= 0 ? athletes[existingIdx].id : `athlete_${Date.now()}`,
    name: stats.name,
    email: stats.email,
    avatarUrl: stats.avatarUrl,
    monthlyWorkouts: stats.monthlyWorkouts || 0,
    streakDays: stats.streakDays || 0,
    weeklyGoalCompleted: stats.weeklyGoalCompleted || 0,
    weeklyGoalTarget: stats.weeklyGoalTarget || 4,
    consistencyPercentage: stats.consistencyPercentage || 0,
    workoutPoints: realWorkoutPoints,
    mealPoints: realMealPoints,
    mealPhotosCount: realMealPhotos,
    mealStreakDays: realMealStreak,
    waterPoints: realWaterPoints,
    sleepPoints: realSleepPoints,
    lastWorkoutDate: lastWorkoutDate || (existingIdx >= 0 ? athletes[existingIdx].lastWorkoutDate : undefined),
    updatedAt: Date.now(),
  };

  if (existingIdx >= 0) {
    athletes[existingIdx] = { ...athletes[existingIdx], ...updatedEntry };
  } else {
    athletes.push(updatedEntry);
  }

  saveStoredAthletes(athletes);
  return athletes;
}

export function registerNewAthlete(newAthlete: Omit<RegisteredAthlete, 'id' | 'updatedAt' | 'mealPoints' | 'mealPhotosCount' | 'mealStreakDays' | 'waterPoints' | 'sleepPoints' | 'workoutPoints'>): RegisteredAthlete {
  const athletes = getStoredAthletes();
  const id = `athlete_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const fullAthlete: RegisteredAthlete = {
    ...newAthlete,
    id,
    workoutPoints: (newAthlete.monthlyWorkouts || 0) * 150,
    mealPoints: 600,
    mealPhotosCount: 20,
    mealStreakDays: 3,
    waterPoints: 500,
    sleepPoints: 450,
    updatedAt: Date.now(),
  };

  athletes.push(fullAthlete);
  saveStoredAthletes(athletes);
  return fullAthlete;
}

/**
 * Retorna os atletas ordenados com cálculo completo de pontuação geral, semanal e mensal
 */
export function getRankedAthletes(
  currentStats: UserStats,
  lastWorkoutDate?: string,
  timeframe: 'geral' | 'mensal' | 'semanal' = 'geral',
  workouts?: WorkoutLog[]
): RankedAthlete[] {
  const athletes = syncCurrentAthlete(currentStats, lastWorkoutDate, workouts);

  const currentEmail = currentStats.email ? currentStats.email.trim().toLowerCase() : '';
  const currentName = currentStats.name.trim().toLowerCase();

  const ranked: RankedAthlete[] = athletes.map((a) => {
    const isCurrentUser =
      (currentEmail && a.email && a.email.toLowerCase() === currentEmail) ||
      a.name.toLowerCase() === currentName;

    const breakdown = calculateScoreBreakdown(a);

    // Ajuste proporcional para ranking mensal e semanal
    const monthlyScore = Math.round(breakdown.totalScore * 0.7);
    const weeklyScore = Math.round(breakdown.totalScore * 0.28);

    let effectiveScore = breakdown.totalScore;
    if (timeframe === 'mensal') effectiveScore = monthlyScore;
    if (timeframe === 'semanal') effectiveScore = weeklyScore;

    return {
      ...a,
      rank: 0,
      score: effectiveScore,
      weeklyScore,
      monthlyScore,
      scoreBreakdown: breakdown,
      isCurrentUser: !!isCurrentUser,
    };
  });

  // Ordena decrescente: pontuação geral > treinos > streak
  ranked.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.monthlyWorkouts !== a.monthlyWorkouts) return b.monthlyWorkouts - a.monthlyWorkouts;
    return b.streakDays - a.streakDays;
  });

  // Atribui posições (1º, 2º, 3º...)
  return ranked.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}

/**
 * Retorna lista inicial segura para SSR e primeira renderização do cliente,
 * sem acessar o localStorage para eliminar qualquer risco de erro de hidratação.
 */
export function getInitialRankedAthletes(
  currentStats: UserStats,
  timeframe: 'geral' | 'mensal' | 'semanal' = 'geral'
): RankedAthlete[] {
  const currentEmail = currentStats.email ? currentStats.email.trim().toLowerCase() : '';
  const currentName = currentStats.name ? currentStats.name.trim().toLowerCase() : 'atleta';

  const ranked: RankedAthlete[] = INITIAL_RANKED_ATHLETES.map((a) => {
    const isCurrentUser =
      Boolean(currentEmail && a.email && a.email.toLowerCase() === currentEmail) ||
      a.name.toLowerCase() === currentName;

    const breakdown = calculateScoreBreakdown(a);
    const monthlyScore = Math.round(breakdown.totalScore * 0.7);
    const weeklyScore = Math.round(breakdown.totalScore * 0.28);

    let effectiveScore = breakdown.totalScore;
    if (timeframe === 'mensal') effectiveScore = monthlyScore;
    if (timeframe === 'semanal') effectiveScore = weeklyScore;

    return {
      ...a,
      rank: 0,
      score: effectiveScore,
      weeklyScore,
      monthlyScore,
      scoreBreakdown: breakdown,
      isCurrentUser,
    };
  });

  ranked.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.monthlyWorkouts !== a.monthlyWorkouts) return b.monthlyWorkouts - a.monthlyWorkouts;
    return b.streakDays - a.streakDays;
  });

  return ranked.map((item, index) => ({
    ...item,
    rank: index + 1,
  }));
}

