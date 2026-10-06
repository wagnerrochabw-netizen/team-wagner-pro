'use client';

import { useState, useEffect } from 'react';
import { getAllSleepLogs, getTodayDateString } from './sleep-service';

export interface SleepData {
  hours: number;
  quality: 'boa' | 'regular' | 'ruim';
  bedTime: string;
  wakeTime: string;
}

const STORAGE_KEY = 'team_wagner_sleep_record';

const DEFAULT_SLEEP: SleepData = {
  hours: 0, // Novo cliente e nova virada de dia começam com 0h até registrar o sono
  quality: 'boa',
  bedTime: '',
  wakeTime: '',
};

export function subscribeSleep(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('team_wagner_sleep_updated', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('team_wagner_sleep_updated', callback);
    window.removeEventListener('storage', callback);
  };
}

export function getTodaySleepData(): SleepData {
  if (typeof window === 'undefined') return DEFAULT_SLEEP;
  try {
    const today = getTodayDateString();
    const logs = getAllSleepLogs();
    const todayLog = logs.find((l) => l.date === today);
    if (todayLog) {
      return {
        hours: todayLog.hours,
        quality: todayLog.quality === 'otima' || todayLog.quality === 'boa' ? 'boa' : 'regular',
        bedTime: todayLog.bedTime || '',
        wakeTime: todayLog.wakeTime || '',
      };
    }
  } catch {
    // ignore
  }
  return DEFAULT_SLEEP;
}

export function setStoredSleep(data: Partial<SleepData>) {
  if (typeof window === 'undefined') return;
  try {
    const current = getTodaySleepData();
    const updated: SleepData = {
      ...current,
      ...data,
      hours: data.hours !== undefined ? Math.max(0, Math.min(16, Math.round(data.hours * 10) / 10)) : current.hours,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('team_wagner_sleep_updated'));
  } catch {
    // ignore
  }
}

/**
 * Hook seguro para SSR e Hydration no Next.js.
 * Renderiza DEFAULT_SLEEP no SSR para garantir casamento exato de hidratação
 * e carrega o sono real do dia após a montagem.
 */
export function useSleepData(): SleepData {
  const [sleep, setSleep] = useState<SleepData>(DEFAULT_SLEEP);

  useEffect(() => {
    const update = () => {
      setSleep(getTodaySleepData());
    };
    update();
    return subscribeSleep(update);
  }, []);

  return sleep;
}
