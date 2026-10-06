'use client';

import { UserStats, WorkoutLog } from './types';
import { getWaterSummaryForDate, getTodayDateString } from './water-service';
import { getSleepSummaryForDate } from './sleep-service';
import { getMealsForDate } from './meal-service';

export type NotificationActionType =
  | 'open_register'
  | 'open_water'
  | 'open_sleep'
  | 'open_meals'
  | 'navigate_ranking'
  | 'navigate_history'
  | 'navigate_progress';

export interface AppNotification {
  id: string;
  title: string;
  desc: string;
  time: string;
  category: 'Treino' | 'Hidratação' | 'Alimentação' | 'Sono' | 'Consistência' | 'Ranking';
  iconType: 'workout' | 'water' | 'meal' | 'sleep' | 'streak' | 'trophy' | 'ranking';
  priority?: 'high' | 'normal';
  actionLabel: string;
  actionType: NotificationActionType;
  isRead: boolean;
}

const READ_STORAGE_KEY = 'team_wagner_read_notifications';
const DISMISSED_STORAGE_KEY = 'team_wagner_dismissed_notifications';

export function getReadNotificationIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveReadNotificationIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent('team_wagner_notifications_updated'));
  } catch {
    // ignore
  }
}

export function getDismissedNotificationIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DISMISSED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveDismissedNotificationIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent('team_wagner_notifications_updated'));
  } catch {
    // ignore
  }
}

export function markAsRead(id: string): void {
  const current = getReadNotificationIds();
  if (!current.includes(id)) {
    saveReadNotificationIds([...current, id]);
  }
}

export function markAllAsRead(ids: string[]): void {
  const current = new Set(getReadNotificationIds());
  ids.forEach((id) => current.add(id));
  saveReadNotificationIds(Array.from(current));
}

export function dismissNotification(id: string): void {
  const current = getDismissedNotificationIds();
  if (!current.includes(id)) {
    saveDismissedNotificationIds([...current, id]);
  }
}

export function resetDismissedNotifications(): void {
  saveDismissedNotificationIds([]);
}

/**
 * Constrói a lista de notificações reais e dinâmicas baseadas
 * nos dados reais do atleta cadastrado e logs da sessão atual.
 */
export function generateRealNotifications(
  stats: UserStats,
  workouts: WorkoutLog[] = []
): AppNotification[] {
  const today = getTodayDateString();
  const readIds = new Set(getReadNotificationIds());
  const dismissedIds = new Set(getDismissedNotificationIds());

  const list: AppNotification[] = [];

  // 1. HIDRATAÇÃO (ÁGUA)
  try {
    const waterGoal = stats.dailyWaterGoalMl || 3000;
    const waterSummary = getWaterSummaryForDate(today, waterGoal);
    const waterGoalL = (waterGoal / 1000).toFixed(1);
    const consumedL = (waterSummary.totalMl / 1000).toFixed(1);

    if (waterSummary.totalMl >= waterGoal) {
      list.push({
        id: `water_achieved_${today}`,
        title: 'Meta de Hidratação Atingida! 💧',
        desc: `Parabéns! Você atingiu ${consumedL} L da sua meta de ${waterGoalL} L hoje (+${waterSummary.points} pts).`,
        time: 'Hoje',
        category: 'Hidratação',
        iconType: 'water',
        actionLabel: 'Ver Registro de Água',
        actionType: 'open_water',
        isRead: readIds.has(`water_achieved_${today}`),
      });
    } else {
      const remainingMl = Math.max(0, waterGoal - waterSummary.totalMl);
      list.push({
        id: `water_reminder_${today}`,
        title: 'Lembrete de Hidratação 💧',
        desc: `Você consumiu ${consumedL} L hoje. Faltam ${remainingMl} ml para atingir sua meta diária de ${waterGoalL} L.`,
        time: 'Ativo agora',
        category: 'Hidratação',
        iconType: 'water',
        priority: 'high',
        actionLabel: 'Registrar Água Agora',
        actionType: 'open_water',
        isRead: readIds.has(`water_reminder_${today}`),
      });
    }
  } catch {
    // fallback seguro
  }

  // 2. TREINO DE HOJE
  try {
    const hasWorkoutToday = workouts.some((w) => {
      if (!w.date) return false;
      return w.date === today || w.date.startsWith(today);
    });

    if (hasWorkoutToday) {
      list.push({
        id: `workout_done_${today}`,
        title: 'Treino de Hoje Registrado! 🏋️',
        desc: 'Sua sessão de hoje está salva no histórico e pontuou na tabela geral.',
        time: 'Hoje',
        category: 'Treino',
        iconType: 'workout',
        actionLabel: 'Ver Histórico no Progresso',
        actionType: 'navigate_progress',
        isRead: readIds.has(`workout_done_${today}`),
      });
    } else {
      list.push({
        id: `workout_pending_${today}`,
        title: 'Treino de Hoje Pendente 🏋️',
        desc: 'Mantenha sua disciplina! Registre o treino do dia para manter sua chama de consistência acesa.',
        time: 'Ativo agora',
        category: 'Treino',
        iconType: 'workout',
        priority: 'high',
        actionLabel: 'Registrar Treino Agora',
        actionType: 'open_register',
        isRead: readIds.has(`workout_pending_${today}`),
      });
    }
  } catch {
    // fallback seguro
  }

  // 3. SEQUÊNCIA / CONSISTÊNCIA (STREAK)
  try {
    const streak = stats.streakDays || 0;
    const record = stats.recordStreakDays || 0;

    if (streak > 0) {
      list.push({
        id: `streak_active_${streak}`,
        title: 'Sequência em Chamas! 🔥',
        desc: `Você está com ${streak} ${streak === 1 ? 'dia' : 'dias'} de consistência ininterrupta. Seu recorde atual é de ${record} dias.`,
        time: 'Hoje',
        category: 'Consistência',
        iconType: 'streak',
        actionLabel: 'Ver Gráfico de Progresso',
        actionType: 'navigate_progress',
        isRead: readIds.has(`streak_active_${streak}`),
      });
    } else {
      list.push({
        id: 'streak_start_now',
        title: 'Inicie sua Sequência de Treinos! 🔥',
        desc: 'Registre seu treino hoje para acender a chama de consistência e iniciar um novo recorde pessoal.',
        time: 'Hoje',
        category: 'Consistência',
        iconType: 'streak',
        actionLabel: 'Registrar Treino',
        actionType: 'open_register',
        isRead: readIds.has('streak_start_now'),
      });
    }
  } catch {
    // fallback seguro
  }

  // 4. META SEMANAL
  try {
    const completed = stats.weeklyGoalCompleted || 0;
    const target = stats.weeklyGoalTarget || 4;

    if (completed >= target) {
      list.push({
        id: `weekly_completed_${completed}_${target}`,
        title: 'Meta Semanal 100% Conquistada! 🏆',
        desc: `Sensacional! Você completou ${completed} de ${target} treinos planejados para esta semana.`,
        time: 'Esta semana',
        category: 'Treino',
        iconType: 'trophy',
        actionLabel: 'Ver Progresso Semanal',
        actionType: 'navigate_progress',
        isRead: readIds.has(`weekly_completed_${completed}_${target}`),
      });
    } else {
      const remaining = Math.max(0, target - completed);
      list.push({
        id: `weekly_pending_${completed}_${target}`,
        title: `Meta Semanal: ${completed}/${target} Concluídos 🎯`,
        desc: `Falta apenas ${remaining} ${remaining === 1 ? 'sessão' : 'sessões'} para fechar 100% da sua meta semanal.`,
        time: 'Esta semana',
        category: 'Treino',
        iconType: 'trophy',
        actionLabel: 'Registrar Treino',
        actionType: 'open_register',
        isRead: readIds.has(`weekly_pending_${completed}_${target}`),
      });
    }
  } catch {
    // fallback seguro
  }

  // 5. REFEIÇÕES DO DIA
  try {
    const dailyTarget = stats.dailyMealsTarget || 4;
    const userEmail = stats.email || 'current_user';
    const meals = getMealsForDate(today, dailyTarget, userEmail);
    const registeredCount = meals.filter((m) => m.status === 'registrada').length;

    if (registeredCount >= dailyTarget) {
      list.push({
        id: `meals_completed_${today}`,
        title: 'Plano Nutricional Concluído! 🥗',
        desc: `Excelente! Todas as ${dailyTarget} refeições do dia foram registradas (+100 pts).`,
        time: 'Hoje',
        category: 'Alimentação',
        iconType: 'meal',
        actionLabel: 'Ver Refeições',
        actionType: 'open_meals',
        isRead: readIds.has(`meals_completed_${today}`),
      });
    } else {
      list.push({
        id: `meals_pending_${today}`,
        title: `Refeições de Hoje: ${registeredCount}/${dailyTarget} Registradas 🍽️`,
        desc: `Lembre-se de registrar fotos e horários das suas refeições para pontuar no ranking.`,
        time: 'Ativo agora',
        category: 'Alimentação',
        iconType: 'meal',
        actionLabel: 'Gerenciar Refeições',
        actionType: 'open_meals',
        isRead: readIds.has(`meals_pending_${today}`),
      });
    }
  } catch {
    // fallback seguro
  }

  // 6. SONO & RECUPERAÇÃO
  try {
    const sleepSummary = getSleepSummaryForDate(today);
    if (sleepSummary && sleepSummary.totalHours > 0) {
      list.push({
        id: `sleep_logged_${today}`,
        title: `Noite de Sono Registrada (${sleepSummary.totalHours.toFixed(1)}h) 🌙`,
        desc: `Recuperação avaliada como ${sleepSummary.quality}. O sono correto acelera sua evolução física.`,
        time: 'Hoje',
        category: 'Sono',
        iconType: 'sleep',
        actionLabel: 'Ver Registro de Sono',
        actionType: 'open_sleep',
        isRead: readIds.has(`sleep_logged_${today}`),
      });
    } else {
      list.push({
        id: `sleep_pending_${today}`,
        title: 'Registro de Sono Pendente 🌙',
        desc: 'Registre quantas horas você dormiu na última noite para pontuar na consistência diária.',
        time: 'Hoje',
        category: 'Sono',
        iconType: 'sleep',
        actionLabel: 'Registrar Sono',
        actionType: 'open_sleep',
        isRead: readIds.has(`sleep_pending_${today}`),
      });
    }
  } catch {
    // fallback seguro
  }

  // 7. RANKING DE ATLETAS
  list.push({
    id: 'ranking_standing',
    title: 'Ranking de Atletas Team Wagner 🥇',
    desc: 'Confira sua pontuação atual, seu nível e dispute as primeiras posições com os outros membros.',
    time: 'Geral',
    category: 'Ranking',
    iconType: 'ranking',
    actionLabel: 'Ver Ranking Geral',
    actionType: 'navigate_ranking',
    isRead: readIds.has('ranking_standing'),
  });

  // Filtra as notificações que o usuário dispensou manualmente
  return list.filter((n) => !dismissedIds.has(n.id));
}
