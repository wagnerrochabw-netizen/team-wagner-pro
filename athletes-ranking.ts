import { UserStats } from './types';

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
  lastWorkoutDate?: string;
  totalMinutes?: number;
  updatedAt: number;
}

export interface RankedAthlete extends RegisteredAthlete {
  rank: number;
  score: number;
  isCurrentUser: boolean;
}

const STORAGE_KEY = 'team_wagner_registered_athletes';

export function calculateScore(athlete: {
  monthlyWorkouts: number;
  streakDays: number;
  consistencyPercentage: number;
}): number {
  const workoutPoints = (athlete.monthlyWorkouts || 0) * 100;
  const streakPoints = (athlete.streakDays || 0) * 50;
  const consistencyPoints = Math.round((athlete.consistencyPercentage || 0) * 10);
  return workoutPoints + streakPoints + consistencyPoints;
}

export function getStoredAthletes(): RegisteredAthlete[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
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
 */
export function syncCurrentAthlete(stats: UserStats, lastWorkoutDate?: string): RegisteredAthlete[] {
  if (!stats || !stats.name) return getStoredAthletes();

  const athletes = getStoredAthletes();
  const currentEmail = stats.email ? stats.email.trim().toLowerCase() : '';
  const currentName = stats.name.trim();

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

/**
 * Adiciona um novo atleta cadastrado manualmente pelo app
 */
export function registerNewAthlete(newAthlete: Omit<RegisteredAthlete, 'id' | 'updatedAt'>): RegisteredAthlete {
  const athletes = getStoredAthletes();
  const id = `athlete_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const fullAthlete: RegisteredAthlete = {
    ...newAthlete,
    id,
    updatedAt: Date.now(),
  };

  athletes.push(fullAthlete);
  saveStoredAthletes(athletes);
  return fullAthlete;
}

/**
 * Retorna os atletas ordenados por pontuação real (quem está melhor)
 */
export function getRankedAthletes(currentStats: UserStats, lastWorkoutDate?: string): RankedAthlete[] {
  const athletes = syncCurrentAthlete(currentStats, lastWorkoutDate);

  const currentEmail = currentStats.email ? currentStats.email.trim().toLowerCase() : '';
  const currentName = currentStats.name.trim().toLowerCase();

  const ranked: RankedAthlete[] = athletes.map((a) => {
    const isCurrentUser =
      (currentEmail && a.email && a.email.toLowerCase() === currentEmail) ||
      a.name.toLowerCase() === currentName;

    const score = calculateScore(a);

    return {
      ...a,
      rank: 0,
      score,
      isCurrentUser: !!isCurrentUser,
    };
  });

  // Ordena decrescente:
  // 1. Pontuação geral
  // 2. Total de treinos
  // 3. Sequência ativa
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
