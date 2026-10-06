'use client';

import { WaterLogEntry, DailyWaterSummary } from './types';
import { setStoredWater } from './water-store';
import { saveWaterLogToDb } from './db-service';
import { saveWaterLogToSupabase, getActiveUserId } from './supabase-service';

const LOGS_STORAGE_KEY = 'team_wagner_water_logs';
const GOAL_STORAGE_KEY = 'team_wagner_water_goal';
export const DEFAULT_WATER_GOAL_ML = 3000; // 3 Litros

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTimeNow(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function getWaterGoalMl(): number {
  if (typeof window === 'undefined') return DEFAULT_WATER_GOAL_ML;
  try {
    const raw = localStorage.getItem(GOAL_STORAGE_KEY);
    if (raw) {
      const val = parseInt(raw, 10);
      if (!isNaN(val) && val > 0) return val;
    }
  } catch {
    // ignore
  }
  return DEFAULT_WATER_GOAL_ML;
}

export function setWaterGoalMl(goalMl: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GOAL_STORAGE_KEY, goalMl.toString());
    window.dispatchEvent(new CustomEvent('team_wagner_water_updated'));
  } catch {
    // ignore
  }
}

export function getAllWaterLogs(): WaterLogEntry[] {
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

export function saveAllWaterLogs(logs: WaterLogEntry[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
    
    // Sincroniza com o consumo de hoje para o contador em Litros
    const today = getTodayDateString();
    const todayTotalMl = logs
      .filter((l) => l.date === today)
      .reduce((acc, curr) => acc + curr.amountMl, 0);
    const todayLiters = todayTotalMl / 1000;
    setStoredWater(todayLiters);

    // Persistência assíncrona no Firestore e Supabase
    try {
      const activeUser = localStorage.getItem('team_wagner_active_user');
      const userId = activeUser ? JSON.parse(activeUser).id || 'wagner_user_default' : 'wagner_user_default';
      saveWaterLogToDb(userId, today, todayLiters).catch(() => {});
      
      const supabaseUserId = getActiveUserId();
      const points = calculateWaterPoints(todayTotalMl);
      saveWaterLogToSupabase(supabaseUserId, today, todayLiters, {
        amountMl: todayTotalMl,
        points,
        time: formatTimeNow(),
      }).catch(() => {});
    } catch {
      // ignore
    }

    window.dispatchEvent(new CustomEvent('team_wagner_water_updated'));
  } catch {
    // ignore
  }
}

/**
 * Regra oficial de pontuação de água:
 * 100% da meta: +100 pontos
 * 75% a 99%: +75 pontos
 * 50% a 74%: +50 pontos
 * 25% a 49%: +25 pontos
 * Menos de 25%: 0 pontos
 */
export function calculateWaterPoints(totalMl: number, goalMl: number = DEFAULT_WATER_GOAL_ML): number {
  if (!goalMl || goalMl <= 0) return 0;
  const ratio = totalMl / goalMl;

  if (ratio >= 1.0) return 100;
  if (ratio >= 0.75) return 75;
  if (ratio >= 0.50) return 50;
  if (ratio >= 0.25) return 25;
  return 0;
}

/**
 * Adiciona um registro de consumo de água
 */
export function addWaterLog(amountMl: number, customDate?: string, customTime?: string): WaterLogEntry {
  const date = customDate || getTodayDateString();
  const time = customTime || formatTimeNow();
  const now = Date.now();

  const newEntry: WaterLogEntry = {
    id: `water_${date}_${now}_${Math.random().toString(36).substring(2, 6)}`,
    date,
    time,
    amountMl: Math.max(10, Math.round(amountMl)),
    createdAt: now,
  };

  const logs = getAllWaterLogs();
  const updatedLogs = [newEntry, ...logs];
  saveAllWaterLogs(updatedLogs);

  return newEntry;
}

/**
 * Remove um registro de água específico
 */
export function deleteWaterLog(id: string): void {
  const logs = getAllWaterLogs();
  const updated = logs.filter((l) => l.id !== id);
  saveAllWaterLogs(updated);
}

/**
 * Retorna o resumo de consumo de água para uma data específica
 */
export function getWaterSummaryForDate(date: string, customGoal?: number): DailyWaterSummary {
  const goalMl = customGoal || getWaterGoalMl();
  const allLogs = getAllWaterLogs();
  const dayLogs = allLogs
    .filter((l) => l.date === date)
    .sort((a, b) => a.createdAt - b.createdAt);

  const totalMl = dayLogs.reduce((acc, curr) => acc + curr.amountMl, 0);
  const completionPercentage = Math.min(100, Math.round((totalMl / Math.max(1, goalMl)) * 100));
  const points = calculateWaterPoints(totalMl, goalMl);

  return {
    date,
    totalMl,
    goalMl,
    completionPercentage,
    points,
    logs: dayLogs,
  };
}

/**
 * Retorna o histórico de todos os dias registrados
 */
export function getAllWaterHistory(goalMl?: number): DailyWaterSummary[] {
  const targetGoal = goalMl || getWaterGoalMl();
  const allLogs = getAllWaterLogs();
  const today = getTodayDateString();

  const datesSet = new Set<string>();
  datesSet.add(today);
  allLogs.forEach((l) => datesSet.add(l.date));

  const sortedDates = Array.from(datesSet).sort((a, b) => b.localeCompare(a));
  return sortedDates.map((d) => getWaterSummaryForDate(d, targetGoal));
}

/**
 * Retorna os totais acumulados de água para o ranking e perfil
 */
export function getWaterGlobalTotals() {
  const history = getAllWaterHistory();
  const today = getTodayDateString();
  const todaySummary = getWaterSummaryForDate(today);

  let totalWaterPoints = 0;
  let daysCompleted = 0;

  history.forEach((day) => {
    totalWaterPoints += day.points;
    if (day.completionPercentage >= 100) {
      daysCompleted++;
    }
  });

  return {
    todayTotalMl: todaySummary.totalMl,
    todayGoalMl: todaySummary.goalMl,
    todayPercentage: todaySummary.completionPercentage,
    todayPoints: todaySummary.points,
    totalWaterPoints,
    daysCompleted,
    history,
  };
}
