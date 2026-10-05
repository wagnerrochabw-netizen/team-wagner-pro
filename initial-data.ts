import { WorkoutLog, UserStats, ChallengeItem } from './types';

export const INITIAL_STATS: UserStats = {
  name: 'Atleta',
  streakDays: 0,
  recordStreakDays: 0,
  weeklyGoalTarget: 4,
  weeklyGoalCompleted: 0,
  monthlyWorkouts: 0,
  monthlyPreviousWorkouts: 0,
  monthlyActiveDays: 0,
  monthlyTotalHoursMinutes: '0h 0m',
  averageMinutesPerSession: 0,
  consistencyPercentage: 0,
};

export const DIRECT_IMAGE_PRESETS = [
  {
    id: 'local_gym',
    name: 'Academia Dark (Local)',
    url: '/gym_dark_atmospheric_dumbbells.jpg',
    category: 'Musculação',
    description: 'Halteres de ferro e atmosfera biomecânica'
  },
  {
    id: 'weights_rack',
    name: 'Halteres & Foco',
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    category: 'Musculação',
    description: 'Área de pesos livres com iluminação dramática'
  },
  {
    id: 'running_track',
    name: 'Pista & Corrida',
    url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=800&q=80',
    category: 'Corrida',
    description: 'Pista de corrida ao pôr do sol'
  },
  {
    id: 'cross_training',
    name: 'Cross Training & Corda',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    category: 'Cross Training',
    description: 'Equipamento de alta intensidade e superação'
  },
  {
    id: 'athlete_kettlebell',
    name: 'Treino Funcional',
    url: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80',
    category: 'Cross Training',
    description: 'Treino de explosão e força'
  }
];

// O histórico inicial começa 100% zerado para novos usuários
export const INITIAL_WORKOUTS: WorkoutLog[] = [];

// Calendário inicial começa sem nenhum dia marcado antes do usuário registrar seus treinos
export const INITIAL_OCTOBER_ACTIVE_DAYS: number[] = [];

export const INITIAL_CHALLENGES: ChallengeItem[] = [
  {
    id: 'ch-1',
    title: 'Desafio 21 Dias de Ferro',
    description: 'Mantenha a consistência sem falhar por 21 dias seguidos no plano Team Wagner.',
    participantsCount: 84,
    daysRemaining: 21,
    isJoined: false,
    progressPercent: 0,
  },
  {
    id: 'ch-2',
    title: 'Clube dos 100km do Mês',
    description: 'Acumule 100km somando corrida e esteira com registro de pace.',
    participantsCount: 42,
    daysRemaining: 30,
    isJoined: false,
    progressPercent: 0,
  },
  {
    id: 'ch-3',
    title: 'Volume Monstro: 20 Treinos',
    description: 'Atinja 20 sessões concluídas no mês para destravar a insígnia Titânio.',
    participantsCount: 116,
    daysRemaining: 30,
    isJoined: false,
    progressPercent: 0,
  }
];
