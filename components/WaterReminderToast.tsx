'use client';

import React from 'react';
import { Droplets, Check, X, Clock } from 'lucide-react';
import { setStoredWater, useWaterLiters } from '@/lib/water-store';
import { getWaterTier } from '@/lib/water-helpers';

interface WaterReminderToastProps {
  isOpen: boolean;
  cupMl?: number;
  onDismiss: () => void;
  onDrinkLogged: (amountMl: number) => void;
}

export const WaterReminderToast: React.FC<WaterReminderToastProps> = ({
  isOpen,
  cupMl = 250,
  onDismiss,
  onDrinkLogged,
}) => {
  const currentLiters = useWaterLiters();

  if (!isOpen) return null;

  const currentTier = getWaterTier(currentLiters);

  const handleQuickDrink = () => {
    const deltaLiters = cupMl / 1000;
    setStoredWater(currentLiters + deltaLiters);
    onDrinkLogged(cupMl);
    onDismiss();
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-in slide-in-from-top-4 duration-300">
      <div className="bg-[#11141C]/95 backdrop-blur-md border border-[#00E5FF]/60 rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,229,255,0.25)] text-white space-y-3 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -left-10 -top-10 w-24 h-24 bg-[#00E5FF]/20 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-start justify-between gap-3 relative z-10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-[#00E5FF] flex items-center justify-center shrink-0 animate-bounce">
              <Droplets className="w-5 h-5 fill-current" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-space font-bold text-sm text-white">
                  Hora de Beber Água!
                </h4>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#00E5FF]/20 text-[#00E5FF]">
                  +{cupMl}ml
                </span>
              </div>
              <p className="text-xs text-[#BAC9CC] mt-0.5 leading-snug">
                Beba um copo d&apos;água para avançar na sua meta diária de consistência.
              </p>
              <span className="text-[11px] font-mono text-[#00E5FF] block mt-1">
                Progresso atual: {currentLiters.toFixed(1)} L ({currentTier.badge})
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onDismiss}
            className="text-[#849396] hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1 relative z-10">
          <button
            type="button"
            onClick={handleQuickDrink}
            className="flex-1 py-2 px-3 rounded-xl bg-[#00E5FF] hover:bg-[#33EAFF] active:scale-95 text-[#0B0E14] font-space font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(0,229,255,0.4)] transition-all cursor-pointer"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Já Tomei (+{cupMl}ml)</span>
          </button>

          <button
            type="button"
            onClick={onDismiss}
            className="py-2 px-3 rounded-xl bg-[#171B26] hover:bg-[#1D2026] text-[#BAC9CC] hover:text-white border border-[#222938] text-xs font-space font-medium transition-colors cursor-pointer"
          >
            Depois
          </button>
        </div>
      </div>
    </div>
  );
};
