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
  monthlyWorkouts: number;
  monthlyPreviousWorkouts: number;
  monthlyActiveDays: number;
  monthlyTotalHoursMinutes: string; // e.g. "11h 40m"
  averageMinutesPerSession: number;
  consistencyPercentage: number;
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

