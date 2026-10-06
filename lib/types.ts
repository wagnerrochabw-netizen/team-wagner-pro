export type DefaultActivityType = 
  | 'Musculação'
  | 'Corrida'
  | 'Caminhada'
  | 'Cross Training'
  | 'Ciclismo'
  | 'Luta'
  | 'Mobilidade';

export type ActivityType = DefaultActivityType | (string & {});

export type SensationType = 'leve' | 'bom' | 'pesado' | 'muito_pesado';

export interface WorkoutLog {
  id: string;
  date: string; // YYYY-MM-DD
  displayDate: string; // "Ontem", "18 Out", etc.
  activityType: ActivityType;
  durationMinutes: number;
  sensation: SensationType;
  notes?: string;
  photoUrl?: string; // Direct HTML image URL or Data URL
  photoSource?: 'direct_url' | 'upload' | 'preset';
  timestamp: number;
  time?: string; // HH:mm do treino
  status?: 'concluido' | 'agendado';
  points?: number; // 100 pts (avulso) ou 150 pts (na data programada)
  isOnScheduledDay?: boolean;
}

export interface DayProgress {
  dayName: 'SEG' | 'TER' | 'QUA' | 'QUI' | 'SEX' | 'SÁB' | 'DOM';
  fullName: string;
  dateNum: number;
  status: 'done' | 'available' | 'rest';
  activeSessionId?: string;
  isToday?: boolean;
  dateIso?: string;
}

export interface UserStats {
  name: string;
  avatarUrl?: string;
  email?: string;
  birthDate?: string; // Data de nascimento YYYY-MM-DD
  password?: string;
  streakDays: number;
  recordStreakDays: number;
  weeklyGoalTarget: number;
  weeklyGoalCompleted: number;
  dailyMealsTarget?: number; // Quantidade de refeições programadas por dia (ex: 4)
  monthlyWorkouts: number;
  monthlyPreviousWorkouts: number;
  monthlyActiveDays: number;
  monthlyTotalHoursMinutes: string; // e.g. "11h 40m"
  averageMinutesPerSession: number;
  consistencyPercentage: number;
}

export type MealStatus = 'pendente' | 'registrada' | 'nao_realizada';

export interface MealItem {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  plannedMealsCount: number; // Quantidade planejada naquele dia
  mealNumber: number; // 1, 2, 3...
  title: string; // "Refeição 1", "Refeição 2", etc.
  photoUrl?: string; // base64 or URL
  notes?: string; // Observação livre
  time?: string; // HH:mm do registro
  status: MealStatus; // pendente, registrada, nao_realizada
  isExtra?: boolean; // Se foi refeição extra adicionada manualmente
  createdAt: number;
  updatedAt: number;
}

export interface DailyMealDaySummary {
  date: string; // YYYY-MM-DD
  plannedCount: number;
  registeredCount: number;
  extraCount: number;
  completionPercentage: number;
  points: number; // 0, 25, 50, 75, 100
  streakDays: number;
  consistencyBonus: number;
  meals: MealItem[];
}

export interface ScoreBreakdown {
  workoutsScore: number;
  mealsScore: number;
  waterScore: number;
  sleepScore: number;
  consistencyBonus: number;
  totalScore: number;
}

export interface ChallengeItem {
  id: string;
  title: string;
  description: string;
  participantsCount: number;
  daysRemaining: number;
  isJoined: boolean;
  progressPercent: number;
}

export interface ChecklistItem {
  id: string;
  userId: string;
  title: string;
  completed: boolean;
  category?: string;
  date?: string;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  type?: string;
  completed?: boolean;
}

export interface UserNote {
  id: string;
  userId: string;
  title: string;
  content: string;
  createdAt: number;
}

export interface WaterLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  amountMl: number; // e.g. 250, 500, 1000
  createdAt: number;
}

export interface DailyWaterSummary {
  date: string; // YYYY-MM-DD
  totalMl: number;
  goalMl: number;
  completionPercentage: number;
  points: number; // 0, 25, 50, 75, 100
  logs: WaterLogEntry[];
}

export type SleepQuality = 'otima' | 'boa' | 'regular' | 'ruim';

export interface SleepLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  hours: number;
  bedTime?: string; // HH:mm
  wakeTime?: string; // HH:mm
  quality: SleepQuality;
  notes?: string;
  createdAt: number;
  updatedAt?: number;
}

export interface DailySleepSummary {
  date: string; // YYYY-MM-DD
  hours: number;
  goalHours: number;
  completionPercentage: number;
  points: number; // 0, 25, 50, 75, 100
  quality: SleepQuality;
  entry?: SleepLogEntry;
}


