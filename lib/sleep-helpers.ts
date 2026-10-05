export type SleepTierLevel = 'ruim' | 'abaixo_ideal' | 'regular' | 'bom' | 'excelente';

export interface SleepTierInfo {
  tier: SleepTierLevel;
  badge: string;
  label: string;
  rangeText: string;
  color: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  description: string;
}

export const SLEEP_TIERS: SleepTierInfo[] = [
  {
    tier: 'ruim',
    badge: '🔴 Ruim',
    label: 'Ruim',
    rangeText: '< 5h',
    color: '#EF4444',
    textColor: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    description: 'Menos de 5 horas de sono. Prejudica síntese proteica, imunidade, foco cognitivo e recuperação hormonal.',
  },
  {
    tier: 'abaixo_ideal',
    badge: '🟠 Abaixo do ideal',
    label: 'Abaixo do ideal',
    rangeText: '5–6h',
    color: '#F97316',
    textColor: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    description: 'Déficit acumulativo de sono. Pode reduzir a progressão de cargas no treino e elevar níveis de cortisol.',
  },
  {
    tier: 'regular',
    badge: '🟡 Regular',
    label: 'Regular',
    rangeText: '6–7h',
    color: '#EAB308',
    textColor: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    description: 'Razoável para a rotina diária, mas ainda abaixo do teto ótimo para máxima reconstrução muscular.',
  },
  {
    tier: 'bom',
    badge: '🟢 Bom',
    label: 'Bom',
    rangeText: '7–8h',
    color: '#10B981',
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    description: 'Faixa recomendada para a maioria dos adultos e atletas. Mantém o corpo anabólico e a disposição alta.',
  },
  {
    tier: 'excelente',
    badge: '⭐ Excelente',
    label: 'Excelente',
    rangeText: '8–9h',
    color: '#00E5FF',
    textColor: 'text-[#00E5FF]',
    bgColor: 'bg-[#00E5FF]/10',
    borderColor: 'border-[#00E5FF]/40',
    description: '8 a 9 horas com boa qualidade. Pico de liberação de GH (hormônio do crescimento), reparo tecidual supremo e foco de elite.',
  },
];

export function getSleepTier(hours: number, goodQuality = true): SleepTierInfo {
  if (hours < 5) {
    return SLEEP_TIERS[0]; // Ruim
  }
  if (hours < 6) {
    return SLEEP_TIERS[1]; // Abaixo do ideal
  }
  if (hours < 7) {
    return SLEEP_TIERS[2]; // Regular
  }
  if (hours < 8) {
    return SLEEP_TIERS[3]; // Bom
  }
  // 8h or more
  if (goodQuality) {
    return SLEEP_TIERS[4]; // Excelente
  }
  return SLEEP_TIERS[3]; // Bom (se qualidade não for boa)
}
