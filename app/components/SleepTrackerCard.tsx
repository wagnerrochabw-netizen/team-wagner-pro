'use client';

import React, { useState } from 'react';
import {
  Moon,
  Plus,
  Minus,
  Info,
  Sparkles,
  Clock,
  CheckCircle2,
  Bed,
  Sun,
  RotateCcw
} from 'lucide-react';
import { getSleepTier, SLEEP_TIERS, SleepTierInfo } from '@/lib/sleep-helpers';
import { useSleepData, setStoredSleep } from '@/lib/sleep-store';

interface SleepTrackerCardProps {
  className?: string;
}

export const SleepTrackerCard: React.FC<SleepTrackerCardProps> = ({
  className = '',
}) => {
  const sleepData = useSleepData();
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  // Time picker state for sleeping/waking
  const [bedTime, setBedTime] = useState(sleepData.bedTime || '23:30');
  const [wakeTime, setWakeTime] = useState(sleepData.wakeTime || '07:30');

  const currentTier: SleepTierInfo = getSleepTier(
    sleepData.hours,
    sleepData.quality === 'boa'
  );

  const handleAdjustHours = (delta: number) => {
    const newHours = Math.max(0, Math.min(14, sleepData.hours + delta));
    setStoredSleep({ hours: newHours });
  };

  const handleSetPreset = (targetHours: number) => {
    setStoredSleep({ hours: targetHours });
  };

  const handleToggleQuality = () => {
    const nextQuality = sleepData.quality === 'boa' ? 'regular' : 'boa';
    setStoredSleep({ quality: nextQuality });
  };

  const calculateHoursFromTimes = () => {
    const [bedH, bedM] = bedTime.split(':').map(Number);
    const [wakeH, wakeM] = wakeTime.split(':').map(Number);

    let bedMinutes = bedH * 60 + bedM;
    let wakeMinutes = wakeH * 60 + wakeM;

    // If wake time is on next day (e.g. bed 23:00, wake 07:00)
    if (wakeMinutes <= bedMinutes) {
      wakeMinutes += 24 * 60;
    }

    const totalMinutes = wakeMinutes - bedMinutes;
    const computedHours = Math.round((totalMinutes / 60) * 10) / 10;

    setStoredSleep({
      hours: computedHours,
      bedTime,
      wakeTime,
    });
    setShowTimeModal(false);
  };

  // Progress relative to 10h maximum scale
  const progressPercent = Math.min(100, Math.round((sleepData.hours / 10) * 100));

  const hoursWhole = Math.floor(sleepData.hours);
  const minutesRemainder = Math.round((sleepData.hours - hoursWhole) * 60);

  return (
    <>
      <div
        className={`bg-[#12161F] border border-[#222938] hover:border-[#00E5FF]/40 rounded-2xl p-4 sm:p-5 shadow-xl transition-all relative overflow-hidden ${className}`}
      >
        {/* Ambient glow based on sleep tier color */}
        <div
          className="absolute -right-10 -top-10 w-36 h-36 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-500"
          style={{ backgroundColor: currentTier.color }}
        />

        {/* Card Header */}
        <div className="flex items-center justify-between relative z-10 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center border transition-colors shadow-sm"
              style={{
                backgroundColor: currentTier.bgColor,
                borderColor: currentTier.borderColor,
              }}
            >
              <Moon
                className="w-5 h-5 transition-transform duration-300"
                style={{ color: currentTier.color }}
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-space font-bold text-sm text-white leading-tight">
                  Meta de Sono & Descanso
                </h3>
                <button
                  type="button"
                  onClick={() => setShowInfoModal(true)}
                  className="text-[#849396] hover:text-[#00E5FF] transition-colors p-0.5 cursor-pointer"
                  title="Ver tabela oficial de classificação de sono"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-[#849396] font-mono leading-none mt-0.5">
                Recuperação Muscular & GH
              </p>
            </div>
          </div>

          {/* Current Sleep Tier Badge */}
          <button
            type="button"
            onClick={() => setShowInfoModal(true)}
            className="px-2.5 py-1 rounded-full text-xs font-space font-bold border transition-all flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95"
            style={{
              backgroundColor: currentTier.bgColor,
              borderColor: currentTier.borderColor,
              color: currentTier.color,
            }}
          >
            <span>{currentTier.badge}</span>
          </button>
        </div>

        {/* Big Counter and Current Range */}
        <div className="flex items-baseline justify-between mb-3 relative z-10">
          <div className="flex items-baseline gap-1.5">
            <span className="font-space text-3xl font-extrabold text-white tracking-tight">
              {sleepData.hours.toFixed(1)}
            </span>
            <span className="font-space text-sm text-[#00E5FF] font-semibold">Horas</span>
            <span className="text-xs text-[#849396] font-mono ml-2">
              ({hoursWhole}h {minutesRemainder > 0 ? `${minutesRemainder}m` : '00m'})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleQuality}
              className={`px-2 py-0.5 rounded-lg text-[10px] font-mono border transition-all cursor-pointer ${
                sleepData.quality === 'boa'
                  ? 'border-[#00E5FF]/40 bg-[#00E5FF]/10 text-[#00E5FF]'
                  : 'border-[#222938] bg-[#171B26] text-[#849396]'
              }`}
              title="Clique para alternar qualidade do sono"
            >
              {sleepData.quality === 'boa' ? '⭐ Sono de Qualidade' : 'Sono Regular'}
            </button>
            <span
              className="text-xs font-mono font-medium"
              style={{ color: currentTier.color }}
            >
              {currentTier.rangeText}
            </span>
          </div>
        </div>

        {/* Multi-tier Progress Bar */}
        <div className="space-y-1.5 mb-4 relative z-10">
          <div className="w-full h-3 bg-[#0B0E14] rounded-full overflow-hidden p-0.5 border border-[#222938] relative">
            {/* Milestone markers at 5h (50%), 6h (60%), 7h (70%), 8h (80%) */}
            <div className="absolute top-0 bottom-0 left-[50%] w-px bg-[#222938] z-10" />
            <div className="absolute top-0 bottom-0 left-[60%] w-px bg-[#222938] z-10" />
            <div className="absolute top-0 bottom-0 left-[70%] w-px bg-[#222938] z-10" />
            <div className="absolute top-0 bottom-0 left-[80%] w-px bg-[#222938] z-10" />

            {/* Filled Bar */}
            <div
              className="h-full rounded-full transition-all duration-300 relative shadow-sm"
              style={{
                width: `${Math.max(5, progressPercent)}%`,
                backgroundColor: currentTier.color,
                boxShadow: `0 0 10px ${currentTier.color}88`,
              }}
            />
          </div>

          {/* Range Labels matching requested classification */}
          <div className="grid grid-cols-5 text-[9px] font-mono text-[#849396] text-center px-0.5">
            <span className="text-red-400">🔴 &lt;5h</span>
            <span className="text-orange-400">🟠 5–6h</span>
            <span className="text-yellow-400">🟡 6–7h</span>
            <span className="text-emerald-400">🟢 7–8h</span>
            <span className="text-[#00E5FF]">⭐ 8–9h</span>
          </div>
        </div>

        {/* Motivational description based on tier */}
        <p className="text-xs text-[#BAC9CC] leading-relaxed mb-4 bg-[#0B0E14]/70 p-2.5 rounded-xl border border-[#222938]">
          {currentTier.description}
        </p>

        {/* Quick Action Controls */}
        <div className="grid grid-cols-4 gap-2 relative z-10 mb-2">
          <button
            type="button"
            onClick={() => handleAdjustHours(-0.5)}
            className="py-2 px-1 rounded-xl bg-[#171B26] hover:bg-[#1D2026] active:scale-95 border border-[#222938] hover:border-[#00E5FF]/40 text-xs font-mono font-bold text-white flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer"
          >
            <span className="text-red-400 text-[10px]">-30 min</span>
            <span className="text-[9px] text-[#849396] font-sans">Ajustar</span>
          </button>

          <button
            type="button"
            onClick={() => handleAdjustHours(0.5)}
            className="py-2 px-1 rounded-xl bg-[#171B26] hover:bg-[#1D2026] active:scale-95 border border-[#222938] hover:border-[#00E5FF]/40 text-xs font-mono font-bold text-white flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer"
          >
            <span className="text-[#00E5FF] text-[10px]">+30 min</span>
            <span className="text-[9px] text-[#849396] font-sans">Ajustar</span>
          </button>

          <button
            type="button"
            onClick={() => handleSetPreset(8.0)}
            className="py-2 px-1 rounded-xl bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 active:scale-95 border border-[#00E5FF]/40 text-xs font-mono font-bold text-[#00E5FF] flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,229,255,0.15)]"
          >
            <span className="text-[10px] font-extrabold">8.0 h</span>
            <span className="text-[9px] text-[#00E5FF]/80 font-sans">Ideal ⭐</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTimeModal(true)}
            className="py-2 px-1 rounded-xl bg-[#171B26] hover:bg-[#1D2026] active:scale-95 border border-[#222938] hover:border-[#00E5FF]/40 text-xs font-mono text-white flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer"
            title="Calcular por horário de dormir e acordar"
          >
            <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span className="text-[9px] text-[#BAC9CC] font-sans">Horários</span>
          </button>
        </div>
      </div>

      {/* Info Modal with Official Classification Table */}
      {showInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#11141C] border border-[#222938] rounded-2xl p-6 max-w-sm w-full space-y-4 text-white shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#222938] pb-3">
              <div className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-[#00E5FF]" />
                <h3 className="font-space font-bold text-base text-white">
                  Metas de Sono Team Wagner
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInfoModal(false)}
                className="text-[#849396] hover:text-white transition-colors cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#BAC9CC] leading-relaxed">
              Tabela oficial de classificação de sono para recuperação muscular e saúde metabólica:
            </p>

            {/* Official 5 tiers requested */}
            <div className="space-y-2.5">
              {SLEEP_TIERS.map((tier) => (
                <div
                  key={tier.tier}
                  className="p-3 rounded-xl border flex items-start gap-3 transition-colors"
                  style={{
                    backgroundColor: tier.bgColor,
                    borderColor: tier.borderColor,
                  }}
                >
                  <span className="text-base select-none shrink-0 pt-0.5">
                    {tier.tier === 'ruim' && '🔴'}
                    {tier.tier === 'abaixo_ideal' && '🟠'}
                    {tier.tier === 'regular' && '🟡'}
                    {tier.tier === 'bom' && '🟢'}
                    {tier.tier === 'excelente' && '⭐'}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4
                        className="font-space font-bold text-xs"
                        style={{ color: tier.color }}
                      >
                        {tier.label}: {tier.rangeText}
                      </h4>
                      {tier.tier === currentTier.tier && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-white font-bold">
                          Atual
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#BAC9CC] mt-1 leading-snug">
                      {tier.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-[#0B0E14] border border-[#222938] text-[11px] text-[#849396] space-y-1">
              <span className="text-white font-semibold block">
                Dica Wagner Rocha:
              </span>
              <span>
                Para a maioria dos adultos em treinamento de força, atingir de <strong>7 a 8 horas (🟢 Bom)</strong> ou <strong>8 a 9 horas com boa qualidade (⭐ Excelente)</strong> é o diferencial entre estagnação e evolução real.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowInfoModal(false)}
              className="w-full py-2.5 bg-[#00E5FF] text-[#0B0E14] rounded-xl font-space font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* Sleep Time Calculation Modal */}
      {showTimeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#11141C] border border-[#222938] rounded-2xl p-6 max-w-sm w-full space-y-4 text-white shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#222938] pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#00E5FF]" />
                <h3 className="font-space font-bold text-base text-white">
                  Horário de Dormir e Acordar
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTimeModal(false)}
                className="text-[#849396] hover:text-white transition-colors cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-space font-bold text-[#BAC9CC] flex items-center gap-1.5">
                  <Bed className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Horário que foi dormir:</span>
                </label>
                <input
                  type="time"
                  value={bedTime}
                  onChange={(e) => setBedTime(e.target.value)}
                  className="w-full bg-[#171B26] border border-[#222938] rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#00E5FF]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-space font-bold text-[#BAC9CC] flex items-center gap-1.5">
                  <Sun className="w-3.5 h-3.5 text-[#FF9100]" />
                  <span>Horário que acordou:</span>
                </label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full bg-[#171B26] border border-[#222938] rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#00E5FF]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowTimeModal(false)}
                className="px-4 py-2 text-xs text-[#849396] hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={calculateHoursFromTimes}
                className="px-5 py-2.5 rounded-xl text-xs font-bold font-space bg-[#00E5FF] text-[#0B0E14] hover:bg-[#33EAFF] shadow-[0_0_15px_rgba(0,229,255,0.4)] flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Salvar Horas</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
