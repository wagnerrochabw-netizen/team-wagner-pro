export type WaterTierLevel = 'ruim' | 'regular' | 'bom' | 'excelente';

export interface WaterTierInfo {
  tier: WaterTierLevel;
  badge: string;
  label: string;
  rangeText: string;
  color: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

export const WATER_TIERS: WaterTierInfo[] = [
  {
    tier: 'ruim',
    badge: '🔴 Ruim',
    label: 'Ruim',
    rangeText: '< 1 L',
    color: '#EF4444',
    textColor: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    description: 'Hidratação crítica. Beba água para evitar fadiga prematura, perda de força e cãibras.',
  },
  {
    tier: 'regular',
    badge: '🟠 Regular',
    label: 'Regular',
    rangeText: '1–2 L',
    color: '#F97316',
    textColor: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    description: 'Nível básico. Quase no ideal! Mantenha uma garrafa sempre por perto no treino.',
  },
  {
    tier: 'bom',
    badge: '🟢 Bom',
    label: 'Bom',
    rangeText: '2–3 L',
    color: '#10B981',
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    description: 'Faixa ideal de consistência. Melhora síntese proteica, digestão e volume muscular.',
  },
  {
    tier: 'excelente',
    badge: '⭐ Excelente',
    label: 'Excelente',
    rangeText: '> 3 L',
    color: '#00E5FF',
    textColor: 'text-[#00E5FF]',
    bgColor: 'bg-[#00E5FF]/10',
    borderColor: 'border-[#00E5FF]/40',
    description: 'Hidratação de alta performance (quando compatível com a rotina e necessidade da pessoa).',
  },
];

export function getWaterTier(liters: number): WaterTierInfo {
  if (liters < 1) {
    return WATER_TIERS[0];
  }
  if (liters < 2) {
    return WATER_TIERS[1];
  }
  if (liters <= 3) {
    return WATER_TIERS[2];
  }
  return WATER_TIERS[3];
}
