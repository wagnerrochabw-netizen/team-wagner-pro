'use client';

import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'team_wagner_water_intake';
const DEFAULT_LITERS = 0; // Novos clientes começam com 0L

function subscribeWater(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('team_wagner_water_updated', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('team_wagner_water_updated', callback);
    window.removeEventListener('storage', callback);
  };
}

function getWaterSnapshot(): string {
  if (typeof window === 'undefined') return DEFAULT_LITERS.toString();
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) return saved;
  } catch {
    // ignore
  }
  return DEFAULT_LITERS.toString();
}

function getServerWaterSnapshot(): string {
  return DEFAULT_LITERS.toString();
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

export function useWaterLiters(): number {
  const rawStr = useSyncExternalStore(subscribeWater, getWaterSnapshot, getServerWaterSnapshot);
  const parsed = parseFloat(rawStr);
  return isNaN(parsed) ? DEFAULT_LITERS : parsed;
}
