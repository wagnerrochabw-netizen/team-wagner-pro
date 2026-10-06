'use client';

import { useState, useEffect } from 'react';
import { getAllWaterLogs, getTodayDateString } from './water-service';

const STORAGE_KEY = 'team_wagner_water_intake';
const DEFAULT_LITERS = 0; // Novos clientes e virada do dia começam com 0L

export function subscribeWater(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('team_wagner_water_updated', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('team_wagner_water_updated', callback);
    window.removeEventListener('storage', callback);
  };
}

export function getTodayWaterLiters(): number {
  if (typeof window === 'undefined') return DEFAULT_LITERS;
  try {
    const today = getTodayDateString();
    const logs = getAllWaterLogs();
    const todayTotalMl = logs
      .filter((l) => l.date === today)
      .reduce((acc, curr) => acc + curr.amountMl, 0);
    return Math.round((todayTotalMl / 1000) * 10) / 10;
  } catch {
    return DEFAULT_LITERS;
  }
}

export function setStoredWater(liters: number) {
  if (typeof window === 'undefined') return;
  const formatted = Math.max(0, Math.round(liters * 10) / 10);
  try {
    localStorage.setItem(STORAGE_KEY, formatted.toString());
  } catch {
    // ignore
  }
  window.dispatchEvent(new CustomEvent('team_wagner_water_updated'));
}

/**
 * Hook seguro para SSR e Hydration no Next.js.
 * Renderiza DEFAULT_LITERS na hidratação inicial para evitar erros de hydration mismatch
 * e carrega o consumo real de hoje logo em seguida no useEffect.
 */
export function useWaterLiters(): number {
  const [liters, setLiters] = useState<number>(DEFAULT_LITERS);

  useEffect(() => {
    const update = () => {
      setLiters(getTodayWaterLiters());
    };
    update();
    return subscribeWater(update);
  }, []);

  return liters;
}
