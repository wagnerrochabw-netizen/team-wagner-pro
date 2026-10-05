'use client';

export interface WaterReminderConfig {
  enabled: boolean;
  intervalMinutes: number; // 45, 60, 90, 120
  cupMl: number; // 200, 250, 350, 500
  startHour: number; // 7
  endHour: number; // 22
  browserNotification: boolean;
  soundEnabled: boolean;
  lastDrinkTimestamp: number;
}

export const DEFAULT_REMINDER_CONFIG: WaterReminderConfig = {
  enabled: true,
  intervalMinutes: 60,
  cupMl: 250,
  startHour: 7,
  endHour: 22,
  browserNotification: false,
  soundEnabled: true,
  lastDrinkTimestamp: Date.now(),
};

const REMINDER_KEY = 'team_wagner_water_reminder_config';

export function getWaterReminderConfig(): WaterReminderConfig {
  if (typeof window === 'undefined') return DEFAULT_REMINDER_CONFIG;
  try {
    const saved = localStorage.getItem(REMINDER_KEY);
    if (saved) {
      return { ...DEFAULT_REMINDER_CONFIG, ...JSON.parse(saved) };
    }
  } catch {
    // ignore
  }
  return DEFAULT_REMINDER_CONFIG;
}

export function saveWaterReminderConfig(config: WaterReminderConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REMINDER_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('team_wagner_water_reminder_updated', { detail: config }));
  } catch {
    // ignore
  }
}

export async function requestBrowserNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission === 'denied') {
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch {
    return false;
  }
}

// AudioContext singleton to reuse and unlock audio on mobile
let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return null;
    if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
      sharedAudioContext = new AudioContextClass();
    }
    if (sharedAudioContext.state === 'suspended') {
      sharedAudioContext.resume().catch(() => {});
    }
    return sharedAudioContext;
  } catch {
    return null;
  }
}

/**
 * Toca o som cristalino de gota d'água / chime duplo de hidratação.
 * Desbloqueado para iOS Safari, Chrome e Android.
 */
export function playWaterChime() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const t = ctx.currentTime;

    // Gota 1: tom ascendente aquático limpo
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(620, t);
    osc1.frequency.exponentialRampToValueAtTime(1450, t + 0.09);

    gain1.gain.setValueAtTime(0.4, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(t);
    osc1.stop(t + 0.18);

    // Gota 2: tom agudo complementar em harmonia
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(980, t + 0.12);
    osc2.frequency.exponentialRampToValueAtTime(1950, t + 0.23);

    gain2.gain.setValueAtTime(0.45, t + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(t + 0.12);
    osc2.stop(t + 0.38);
  } catch (err) {
    console.error('Audio playback error:', err);
  }
}
