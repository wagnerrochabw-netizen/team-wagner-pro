'use client';

import { SleepLogEntry, DailySleepSummary, SleepQuality } from './types';
import { setStoredSleep } from './sleep-store';
import { saveSleepLogToDb } from './db-service';
import { saveSleepLogToSupabase, getActiveUserId } from './supabase-service';

const LOGS_STORAGE_KEY = 'team_wagner_sleep_logs';
const GOAL_STORAGE_KEY = 'team_wagner_sleep_goal';
export const DEFAULT_SLEEP_GOAL_HOURS = 8.0; // 8 Horas

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getSleepGoalHours(): number {
  if (typeof window === 'undefined') return DEFAULT_SLEEP_GOAL_HOURS;
  try {
    const raw = localStorage.getItem(GOAL_STORAGE_KEY);
    if (raw) {
      const val = parseFloat(raw);
      if (!isNaN(val) && val > 0) return val;
    }
  } catch {
    // ignore
  }
  return DEFAULT_SLEEP_GOAL_HOURS;
}

export function setSleepGoalHours(goalHours: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GOAL_STORAGE_KEY, goalHours.toString());
    window.dispatchEvent(new CustomEvent('team_wagner_sleep_updated'));
  } catch {
    // ignore
  }
}

export function getAllSleepLogs(): SleepLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAllSleepLogs(logs: SleepLogEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));

    // Sincroniza com o sono de hoje
    const today = getTodayDateString();
    const todayLog = logs.find((l) => l.date === today);
    if (todayLog) {
      setStoredSleep({
        hours: todayLog.hours,
        quality: todayLog.quality === 'otima' || todayLog.quality === 'boa' ? 'boa' : 'regular',
        bedTime: todayLog.bedTime,
        wakeTime: todayLog.wakeTime,
      });

      // Persistência no Firestore e Supabase
      try {
        const activeUser = localStorage.getItem('team_wagner_active_user');
        const userId = activeUser ? JSON.parse(activeUser).id || 'wagner_user_default' : 'wagner_user_default';
        saveSleepLogToDb(userId, today, todayLog.hours, todayLog.quality).catch(() => {});

        const supabaseUserId = getActiveUserId();
        const goalHours = getSleepGoalHours();
        const points = calculateSleepPoints(todayLog.hours, goalHours);
        saveSleepLogToSupabase(supabaseUserId, today, todayLog.hours, {
          quality: todayLog.quality,
          bedTime: todayLog.bedTime,
          wakeTime: todayLog.wakeTime,
          points,
        }).catch(() => {});
      } catch {
        // ignore
      }
    }

    window.dispatchEvent(new CustomEvent('team_wagner_sleep_updated'));
  } catch {
    // ignore
  }
}

/**
 * Regra oficial de pontuação de sono:
 * 100% da meta: +100 pontos
 * 75% a 99%: +75 pontos
 * 50% a 74%: +50 pontos
 * 25% a 49%: +25 pontos
 * Menos de 25%: 0 pontos
 */
export function calculateSleepPoints(hours: number, goalHours: number = DEFAULT_SLEEP_GOAL_HOURS): number {
  if (!goalHours || goalHours <= 0) return 0;
  const ratio = hours / goalHours;

  if (ratio >= 1.0) return 100;
  if (ratio >= 0.75) return 75;
  if (ratio >= 0.50) return 50;
  if (ratio >= 0.25) return 25;
  return 0;
}

/**
 * Calcula a quantidade de horas a partir do horário de dormir e acordar
 */
export function computeHoursFromTimes(bedTime: string, wakeTime: string): number {
  const [bedH, bedM] = bedTime.split(':').map(Number);
  const [wakeH, wakeM] = wakeTime.split(':').map(Number);

  let bedMinutes = bedH * 60 + bedM;
  let wakeMinutes = wakeH * 60 + wakeM;

  if (wakeMinutes <= bedMinutes) {
    wakeMinutes += 24 * 60;
  }

  const totalMinutes = wakeMinutes - bedMinutes;
  return Math.round((totalMinutes / 60) * 10) / 10;
}

/**
 * Registra ou atualiza o sono de uma data
 */
export function saveSleepRecord(data: {
  date?: string;
  hours: number;
  bedTime?: string;
  wakeTime?: string;
  quality?: SleepQuality;
  notes?: string;
}): SleepLogEntry {
  const date = data.date || getTodayDateString();
  const allLogs = getAllSleepLogs();
  const existingIdx = allLogs.findIndex((l) => l.date === date);
  const now = Date.now();

  const entry: SleepLogEntry = {
    id: existingIdx >= 0 ? allLogs[existingIdx].id : `sleep_${date}_${now}`,
    date,
    hours: Math.max(0, Math.min(24, Math.round(data.hours * 10) / 10)),
    bedTime: data.bedTime,
    wakeTime: data.wakeTime,
    quality: data.quality || 'boa',
    notes: data.notes?.trim() || undefined,
    createdAt: existingIdx >= 0 ? allLogs[existingIdx].createdAt : now,
    updatedAt: now,
  };

  let updatedLogs: SleepLogEntry[];
  if (existingIdx >= 0) {
    updatedLogs = [...allLogs];
    updatedLogs[existingIdx] = entry;
  } else {
    updatedLogs = [entry, ...allLogs];
  }

  saveAllSleepLogs(updatedLogs);
  return entry;
}

/**
 * Retorna o resumo de sono para uma data específica
 */
export function getSleepSummaryForDate(date: string, customGoal?: number): DailySleepSummary {
  const goalHours = customGoal || getSleepGoalHours();
  const allLogs = getAllSleepLogs();
  const entry = allLogs.find((l) => l.date === date);

  const hours = entry ? entry.hours : 0;
  const quality = entry ? entry.quality : 'boa';
  const completionPercentage = Math.min(100, Math.round((hours / Math.max(1, goalHours)) * 100));
  const points = calculateSleepPoints(hours, goalHours);

  return {
    date,
    hours,
    goalHours,
    completionPercentage,
    points,
    quality,
    entry,
  };
}

/**
 * Retorna o histórico de todos os dias de sono registrados
 */
export function getAllSleepHistory(goalHours?: number): DailySleepSummary[] {
  const targetGoal = goalHours || getSleepGoalHours();
  const allLogs = getAllSleepLogs();
  const today = getTodayDateString();

  const datesSet = new Set<string>();
  datesSet.add(today);
  allLogs.forEach((l) => datesSet.add(l.date));

  const sortedDates = Array.from(datesSet).sort((a, b) => b.localeCompare(a));
  return sortedDates.map((d) => getSleepSummaryForDate(d, targetGoal));
}

/**
 * Retorna totais globais de sono para ranking e perfil
 */
export function getSleepGlobalTotals() {
  const history = getAllSleepHistory();
  const today = getTodayDateString();
  const todaySummary = getSleepSummaryForDate(today);

  let totalSleepPoints = 0;
  let daysCompleted = 0;

  history.forEach((day) => {
    totalSleepPoints += day.points;
    if (day.completionPercentage >= 100) {
      daysCompleted++;
    }
  });

  return {
    todayHours: todaySummary.hours,
    todayGoalHours: todaySummary.goalHours,
    todayPercentage: todaySummary.completionPercentage,
    todayPoints: todaySummary.points,
    totalSleepPoints,
    daysCompleted,
    history,
  };
}
