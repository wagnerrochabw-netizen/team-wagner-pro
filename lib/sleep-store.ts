'use client';

import { useSyncExternalStore } from 'react';

export interface SleepData {
  hours: number;
  quality: 'boa' | 'regular' | 'ruim';
  bedTime: string;
  wakeTime: string;
}

const STORAGE_KEY = 'team_wagner_sleep_record';

const DEFAULT_SLEEP: SleepData = {
  hours: 0, // Novo cliente começa com 0h até registrar o sono
  quality: 'boa',
  bedTime: '',
  wakeTime: '',
};

function subscribeSleep(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('team_wagner_sleep_updated', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('team_wagner_sleep_updated', callback);
    window.removeEventListener('storage', callback);
  };
}

function getSleepSnapshot(): string {
  if (typeof window === 'undefined') return JSON.stringify(DEFAULT_SLEEP);
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) return saved;
  } catch {
    // ignore
  }
  return JSON.stringify(DEFAULT_SLEEP);
}

function getServerSleepSnapshot(): string {
  return JSON.stringify(DEFAULT_SLEEP);
}

export function setStoredSleep(data: Partial<SleepData>) {
  if (typeof window === 'undefined') return;
  try {
    const current = getSleepSnapshot();
    const parsed: SleepData = JSON.parse(current);
    const updated: SleepData = {
      ...parsed,
      ...data,
      hours: data.hours !== undefined ? Math.max(0, Math.min(16, Math.round(data.hours * 10) / 10)) : parsed.hours,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('team_wagner_sleep_updated'));
  } catch {
    // ignore
  }
}

export function useSleepData(): SleepData {
  const rawStr = useSyncExternalStore(subscribeSleep, getSleepSnapshot, getServerSleepSnapshot);
  try {
    return JSON.parse(rawStr);
  } catch {
    return DEFAULT_SLEEP;
  }
}
