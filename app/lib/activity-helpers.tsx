'use client';

import React from 'react';
import {
  Dumbbell,
  Footprints,
  Bike,
  Swords,
  Timer,
  Waves,
  Sparkles,
  Zap,
  HeartPulse,
  Trophy,
  Activity,
  Flame,
  Target
} from 'lucide-react';
import { ActivityType } from './types';

export interface CustomActivityItem {
  id: string;
  name: string;
  iconName?: string;
}

export const DEFAULT_ACTIVITY_ITEMS: { label: ActivityType; iconName: string }[] = [
  { label: 'Musculação', iconName: 'dumbbell' },
  { label: 'Corrida', iconName: 'footprints' },
  { label: 'Caminhada', iconName: 'walk' },
  { label: 'Cross Training', iconName: 'timer' },
  { label: 'Ciclismo', iconName: 'bike' },
  { label: 'Luta', iconName: 'swords' },
];

export const PRESET_SUGGESTIONS = [
  { name: 'Natação', iconName: 'waves' },
  { name: 'Pilates', iconName: 'sparkles' },
  { name: 'Treino Funcional', iconName: 'zap' },
  { name: 'Beach Tennis', iconName: 'target' },
  { name: 'Ioga / Alongamento', iconName: 'sparkles' },
  { name: 'Futebol', iconName: 'trophy' },
  { name: 'Cardio HIIT', iconName: 'heart-pulse' },
  { name: 'Calistenia', iconName: 'flame' },
];

export const AVAILABLE_ICONS = [
  { id: 'dumbbell', label: 'Halter', icon: <Dumbbell className="w-4 h-4" /> },
  { id: 'footprints', label: 'Corrida', icon: <Footprints className="w-4 h-4" /> },
  { id: 'bike', label: 'Bike', icon: <Bike className="w-4 h-4" /> },
  { id: 'swords', label: 'Luta', icon: <Swords className="w-4 h-4" /> },
  { id: 'timer', label: 'Tempo', icon: <Timer className="w-4 h-4" /> },
  { id: 'waves', label: 'Água', icon: <Waves className="w-4 h-4" /> },
  { id: 'zap', label: 'Energia', icon: <Zap className="w-4 h-4" /> },
  { id: 'sparkles', label: 'Flex', icon: <Sparkles className="w-4 h-4" /> },
  { id: 'heart-pulse', label: 'Cardio', icon: <HeartPulse className="w-4 h-4" /> },
  { id: 'trophy', label: 'Esporte', icon: <Trophy className="w-4 h-4" /> },
  { id: 'target', label: 'Alvo', icon: <Target className="w-4 h-4" /> },
  { id: 'flame', label: 'Fogo', icon: <Flame className="w-4 h-4" /> },
];

export function renderActivityIcon(name: string, iconName?: string, className = 'w-4 h-4') {
  if (iconName) {
    switch (iconName) {
      case 'dumbbell':
        return <Dumbbell className={className} />;
      case 'footprints':
      case 'walk':
        return <Footprints className={className} />;
      case 'bike':
        return <Bike className={className} />;
      case 'swords':
        return <Swords className={className} />;
      case 'timer':
        return <Timer className={className} />;
      case 'waves':
        return <Waves className={className} />;
      case 'sparkles':
        return <Sparkles className={className} />;
      case 'zap':
        return <Zap className={className} />;
      case 'heart-pulse':
        return <HeartPulse className={className} />;
      case 'trophy':
        return <Trophy className={className} />;
      case 'target':
        return <Target className={className} />;
      case 'flame':
        return <Flame className={className} />;
      default:
        break;
    }
  }

  const lower = name.toLowerCase();
  if (lower.includes('muscula') || lower.includes('peso') || lower.includes('hipertrofia')) {
    return <Dumbbell className={className} />;
  }
  if (lower.includes('corrida') || lower.includes('correr') || lower.includes('trote')) {
    return <Footprints className={className} />;
  }
  if (lower.includes('caminhada') || lower.includes('passos')) {
    return <Footprints className={`${className} opacity-80`} />;
  }
  if (lower.includes('cross') || lower.includes('tempo') || lower.includes('circuito')) {
    return <Timer className={className} />;
  }
  if (lower.includes('bike') || lower.includes('cicli') || lower.includes('spinning')) {
    return <Bike className={className} />;
  }
  if (lower.includes('luta') || lower.includes('boxe') || lower.includes('jiu') || lower.includes('muay')) {
    return <Swords className={className} />;
  }
  if (lower.includes('nata') || lower.includes('nadar') || lower.includes('aquat') || lower.includes('piscina')) {
    return <Waves className={className} />;
  }
  if (lower.includes('pilates') || lower.includes('ioga') || lower.includes('yoga') || lower.includes('along')) {
    return <Sparkles className={className} />;
  }
  if (lower.includes('funcional') || lower.includes('hiit') || lower.includes('calist')) {
    return <Zap className={className} />;
  }
  if (lower.includes('cardio') || lower.includes('esteira')) {
    return <HeartPulse className={className} />;
  }
  if (lower.includes('futebol') || lower.includes('basquete') || lower.includes('volei') || lower.includes('vôlei')) {
    return <Trophy className={className} />;
  }
  if (lower.includes('tennis') || lower.includes('tênis') || lower.includes('beach')) {
    return <Target className={className} />;
  }
  return <Activity className={className} />;
}

const CUSTOM_ACTIVITIES_KEY = 'team_wagner_custom_activities';

export function getStoredCustomActivities(): CustomActivityItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_ACTIVITIES_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return [];
}

export function saveStoredCustomActivities(items: CustomActivityItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_ACTIVITIES_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('team_wagner_activities_updated'));
  } catch {
    // ignore
  }
}
