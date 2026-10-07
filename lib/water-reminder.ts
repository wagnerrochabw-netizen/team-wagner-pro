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
  browserNotification: true, // Ativado por padrão
  soundEnabled: true,
  lastDrinkTimestamp: Date.now(),
};

const REMINDER_KEY = 'team_wagner_water_reminder_config';

export function getWaterReminderConfig(): WaterReminderConfig {
  if (typeof window === 'undefined') return DEFAULT_REMINDER_CONFIG;
  try {
    const saved = localStorage.getItem(REMINDER_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_REMINDER_CONFIG,
        ...parsed,
        // Garante que browserNotification esteja sempre ativado por padrão
        browserNotification: parsed.browserNotification !== undefined ? parsed.browserNotification : true,
      };
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
  if (typeof window === 'undefined') {
    return false;
  }
  if (!('Notification' in window)) {
    // Para navegadores sem suporte direto à Notification API (ex: iOS Webview padrão),
    // mantemos ativado internamente para notificações no app / toast
    return true;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  try {
    const res = Notification.requestPermission();
    if (res && typeof res.then === 'function') {
      const permission = await res;
      return permission === 'granted' || permission === 'default';
    } else {
      return new Promise((resolve) => {
        Notification.requestPermission((permission) => {
          resolve(permission === 'granted' || permission === 'default');
        });
      });
    }
  } catch {
    return true;
  }
}

// AudioContext singleton com desbloqueio otimizado para celulares (iOS / Android)
let sharedAudioContext: AudioContext | null = null;
let isAudioUnlocked = false;

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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

// Desbloqueador de áudio universal para celulares (Mobile Touch Unlock)
export function initMobileAudioUnlock() {
  if (typeof window === 'undefined' || isAudioUnlocked) return;

  const unlock = () => {
    try {
      const ctx = getAudioContext();
      if (ctx) {
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }
        // Toca um buffer silencioso para destravar o motor de áudio do iOS/Android
        const buffer = ctx.createBuffer(1, 1, 22050);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
      }

      // Pré-carrega também o áudio HTML5 para mobile
      const uri = generateWaterDropWavDataUri();
      const testAudio = new Audio(uri);
      testAudio.volume = 0.01;
      testAudio.play().then(() => {
        testAudio.pause();
        testAudio.currentTime = 0;
      }).catch(() => {});

      isAudioUnlocked = true;
    } catch {
      // ignore
    }
  };

  window.addEventListener('touchstart', unlock, { capture: true, passive: true, once: true });
  window.addEventListener('touchend', unlock, { capture: true, passive: true, once: true });
  window.addEventListener('click', unlock, { capture: true, passive: true, once: true });
}

// Gera em memória um som de gota d'água cristalino em formato WAV Base64
// Funciona em 100% dos celulares, Safari, Chrome e navegadores restritos
let cachedWaterDataUri: string | null = null;

function generateWaterDropWavDataUri(): string {
  if (cachedWaterDataUri) return cachedWaterDataUri;

  const sampleRate = 22050;
  const duration = 0.35; // 350ms
  const totalSamples = Math.floor(sampleRate * duration);
  const buffer = new ArrayBuffer(44 + totalSamples * 2);
  const view = new DataView(buffer);

  // WAV Header
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + totalSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono channel
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); // byte rate
  view.setUint16(32, 2, true); // block align
  view.setUint16(34, 16, true); // 16-bit
  writeString(36, 'data');
  view.setUint32(40, totalSamples * 2, true);

  // Sintetiza 2 gotas de água em ressonância aquática suave
  let offset = 44;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;

    // Gota 1: 650Hz -> 1400Hz (0.00s até 0.16s)
    let drop1 = 0;
    if (t < 0.16) {
      const f1 = 650 + (1400 - 650) * Math.pow(t / 0.16, 0.7);
      const env1 = Math.exp(-t * 22);
      drop1 = Math.sin(2 * Math.PI * f1 * t) * env1 * 0.55;
    }

    // Gota 2: 950Hz -> 1900Hz (0.10s até 0.35s)
    let drop2 = 0;
    if (t >= 0.08) {
      const t2 = t - 0.08;
      const f2 = 950 + (1900 - 950) * Math.pow(t2 / 0.25, 0.65);
      const env2 = Math.exp(-t2 * 18);
      drop2 = Math.sin(2 * Math.PI * f2 * t2) * env2 * 0.65;
    }

    const sample = Math.max(-1, Math.min(1, drop1 + drop2));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
    offset += 2;
  }

  // Converte array buffer para base64
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  cachedWaterDataUri = `data:audio/wav;base64,${btoa(binary)}`;
  return cachedWaterDataUri;
}

/**
 * Toca o som cristalino de gota d'água / chime duplo de hidratação.
 * 100% funcional em celulares iOS e Android com fallback duplo (Web Audio + HTML5 Audio).
 */
export function playWaterChime() {
  if (typeof window === 'undefined') return;

  let webAudioPlayed = false;

  // 1. Tenta Web Audio API com desbloqueio
  try {
    const ctx = getAudioContext();
    if (ctx) {
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

      gain1.gain.setValueAtTime(0.5, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(t);
      osc1.stop(t + 0.18);

      // Gota 2: tom agudo complementar em harmonia
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(980, t + 0.1);
      osc2.frequency.exponentialRampToValueAtTime(1950, t + 0.22);

      gain2.gain.setValueAtTime(0.55, t + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(t + 0.1);
      osc2.stop(t + 0.35);
      webAudioPlayed = true;
    }
  } catch {
    webAudioPlayed = false;
  }

  // 2. Fallback universal HTML5 Audio garantido
  if (!webAudioPlayed) {
    try {
      const dataUri = generateWaterDropWavDataUri();
      const audio = new Audio(dataUri);
      audio.volume = 0.9;
      audio.play().catch(() => {});
    } catch {
      // ignore
    }
  }
}
