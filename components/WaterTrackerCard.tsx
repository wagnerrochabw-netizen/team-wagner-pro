'use client';

import React, { useState, useEffect } from 'react';
import { Droplets, Minus, Info, RotateCcw, Bell, Clock } from 'lucide-react';
import { getWaterTier, WATER_TIERS, WaterTierInfo } from '@/lib/water-helpers';
import { useWaterLiters, setStoredWater } from '@/lib/water-store';
import {
  getWaterReminderConfig,
  WaterReminderConfig,
  saveWaterReminderConfig,
  playWaterChime
} from '@/lib/water-reminder';
import { WaterReminderModal } from './WaterReminderModal';
import { WaterReminderToast } from './WaterReminderToast';

interface WaterTrackerCardProps {
  className?: string;
}

export const WaterTrackerCard: React.FC<WaterTrackerCardProps> = ({
  className = '',
}) => {
  const liters = useWaterLiters();
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [showReminderModal, setShowReminderModal] = useState<boolean>(false);
  const [showReminderToast, setShowReminderToast] = useState<boolean>(false);
  const [reminderConfig, setReminderConfig] = useState<WaterReminderConfig>(() => {
    return {
      enabled: true,
      intervalMinutes: 60,
      cupMl: 250,
      startHour: 7,
      endHour: 22,
      browserNotification: false,
      soundEnabled: true,
      lastDrinkTimestamp: 1729780000000,
    };
  });

  // Hydrate client reminder config safely after mount
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setReminderConfig(getWaterReminderConfig());
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Listen to reminder config changes
  useEffect(() => {
    const handleUpdate = () => {
      setReminderConfig(getWaterReminderConfig());
    };
    window.addEventListener('team_wagner_water_reminder_updated', handleUpdate);
    return () => {
      window.removeEventListener('team_wagner_water_reminder_updated', handleUpdate);
    };
  }, []);

  // Periodic reminder checker
  useEffect(() => {
    if (!reminderConfig.enabled) return;

    const intervalId = setInterval(() => {
      const currentHour = new Date().getHours();
      // Only remind within active hours
      if (currentHour >= reminderConfig.startHour && currentHour <= reminderConfig.endHour) {
        const now = Date.now();
        const diffMinutes = (now - reminderConfig.lastDrinkTimestamp) / (1000 * 60);

        if (diffMinutes >= reminderConfig.intervalMinutes) {
          setShowReminderToast(true);
          if (reminderConfig.soundEnabled) {
            playWaterChime();
          }
          if (reminderConfig.browserNotification && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('💧 Hora de beber água! - Team Wagner', {
              body: `Tome um copo de ${reminderConfig.cupMl}ml de água para manter seu ritmo de hidratação.`,
              icon: '/logo.png',
            });
          }
          // Reset timer timestamp
          const updated = { ...reminderConfig, lastDrinkTimestamp: now };
          saveWaterReminderConfig(updated);
          setReminderConfig(updated);
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(intervalId);
  }, [reminderConfig]);

  const handleAdd = (deltaLiters: number) => {
    setStoredWater(liters + deltaLiters);
    if (reminderConfig.soundEnabled) {
      playWaterChime();
    }
    // Update last drink timestamp so reminder resets
    const updated = { ...reminderConfig, lastDrinkTimestamp: Date.now() };
    saveWaterReminderConfig(updated);
    setReminderConfig(updated);
  };

  const handleReset = () => {
    setStoredWater(0);
  };

  const currentTier: WaterTierInfo = getWaterTier(liters);

  // Progress relative to 3.5L scale
  const progressPercent = Math.min(100, Math.round((liters / 3.5) * 100));

  return (
    <>
      <div
        className={`bg-[#12161F] border border-[#222938] hover:border-[#00E5FF]/40 rounded-2xl p-4 sm:p-5 shadow-xl transition-all relative overflow-hidden ${className}`}
      >
        {/* Background soft ambient glow based on tier */}
        <div
          className="absolute -right-10 -top-10 w-36 h-36 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-500"
          style={{ backgroundColor: currentTier.color }}
        />

        {/* Header */}
        <div className="flex items-center justify-between relative z-10 mb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center border transition-colors shadow-sm"
              style={{
                backgroundColor: currentTier.bgColor,
                borderColor: currentTier.borderColor,
              }}
            >
              <Droplets
                className="w-5 h-5 transition-transform duration-300"
                style={{ color: currentTier.color }}
              />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-space font-bold text-sm text-white leading-tight">
                  Meta Diária de Água
                </h3>
                <button
                  type="button"
                  onClick={() => setShowInfoModal(true)}
                  className="text-[#849396] hover:text-[#00E5FF] transition-colors p-0.5 cursor-pointer"
                  title="Ver tabela oficial de metas de água"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[11px] text-[#849396] font-mono leading-none mt-0.5">
                Hidratação & Performance
              </p>
            </div>
          </div>

          {/* Current Tier Badge */}
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

        {/* Lembrete de Água Active Bar Button */}
        <div className="mb-3.5 relative z-10 flex items-center justify-between p-2 rounded-xl bg-[#0B0E14] border border-[#222938]">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                reminderConfig.enabled ? 'bg-[#00E5FF] animate-pulse' : 'bg-[#849396]'
              }`}
            />
            <span className="text-[11px] font-space text-[#BAC9CC]">
              {reminderConfig.enabled ? (
                <>
                  Lembrete: a cada{' '}
                  <strong className="text-white font-mono">
                    {reminderConfig.intervalMinutes} min
                  </strong>{' '}
                  ({reminderConfig.cupMl}ml)
                </>
              ) : (
                'Lembrete de água desativado'
              )}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                playWaterChime();
                setShowReminderToast(true);
              }}
              className="px-2 py-1 rounded-lg bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 text-[11px] font-mono text-[#00E5FF] flex items-center gap-1 border border-[#00E5FF]/30 transition-colors cursor-pointer"
              title="Testar som do lembrete"
            >
              <Bell className="w-3 h-3 text-[#00E5FF]" />
              <span>Testar Som</span>
            </button>

            <button
              type="button"
              onClick={() => setShowReminderModal(true)}
              className="px-2 py-1 rounded-lg bg-[#171B26] hover:bg-[#222938] text-[11px] font-mono text-[#BAC9CC] hover:text-white flex items-center gap-1 border border-[#222938] transition-colors cursor-pointer"
              title="Configurar Lembrete de Água"
            >
              <span>Ajustar</span>
            </button>
          </div>
        </div>

        {/* Big Counter and Current Range */}
        <div className="flex items-baseline justify-between mb-3 relative z-10">
          <div className="flex items-baseline gap-1.5">
            <span className="font-space text-3xl font-extrabold text-white tracking-tight">
              {liters.toFixed(1)}
            </span>
            <span className="font-space text-sm text-[#00E5FF] font-semibold">Litros</span>
            <span className="text-xs text-[#849396] font-mono ml-2">
              ({Math.round(liters * 1000)} ml)
            </span>
          </div>

          <span
            className="text-xs font-mono font-medium"
            style={{ color: currentTier.color }}
          >
            {currentTier.rangeText}
          </span>
        </div>

        {/* Multi-tier Progress Bar */}
        <div className="space-y-1.5 mb-4 relative z-10">
          <div className="w-full h-3 bg-[#0B0E14] rounded-full overflow-hidden p-0.5 border border-[#222938] relative">
            {/* Milestone markers at 1L (28.5%), 2L (57.1%), 3L (85.7%) */}
            <div className="absolute top-0 bottom-0 left-[28.5%] w-px bg-[#222938] z-10" />
            <div className="absolute top-0 bottom-0 left-[57.1%] w-px bg-[#222938] z-10" />
            <div className="absolute top-0 bottom-0 left-[85.7%] w-px bg-[#222938] z-10" />

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

          {/* Range Labels */}
          <div className="flex justify-between text-[10px] font-mono text-[#849396] px-0.5">
            <span className="text-red-400">🔴 &lt; 1L</span>
            <span className="text-orange-400">🟠 1–2L</span>
            <span className="text-emerald-400">🟢 2–3L</span>
            <span className="text-[#00E5FF]">⭐ &gt; 3L</span>
          </div>
        </div>

        {/* Motivational description based on tier */}
        <p className="text-xs text-[#BAC9CC] leading-relaxed mb-4 bg-[#0B0E14]/70 p-2.5 rounded-xl border border-[#222938]">
          {currentTier.description}
        </p>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-4 gap-2 relative z-10">
          <button
            type="button"
            onClick={() => handleAdd(0.25)}
            className="py-2 px-1.5 rounded-xl bg-[#171B26] hover:bg-[#1D2026] active:scale-95 border border-[#222938] hover:border-[#00E5FF]/40 text-xs font-mono font-bold text-white flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer"
          >
            <span className="text-[#00E5FF] text-[10px]">+250ml</span>
            <span className="text-[9px] text-[#849396] font-sans">Copo</span>
          </button>

          <button
            type="button"
            onClick={() => handleAdd(0.5)}
            className="py-2 px-1.5 rounded-xl bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 active:scale-95 border border-[#00E5FF]/40 text-xs font-mono font-bold text-[#00E5FF] flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,229,255,0.15)]"
          >
            <span className="text-[10px] font-extrabold">+500ml</span>
            <span className="text-[9px] text-[#00E5FF]/80 font-sans">Garrafa</span>
          </button>

          <button
            type="button"
            onClick={() => handleAdd(1.0)}
            className="py-2 px-1.5 rounded-xl bg-[#171B26] hover:bg-[#1D2026] active:scale-95 border border-[#222938] hover:border-[#00E5FF]/40 text-xs font-mono font-bold text-white flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer"
          >
            <span className="text-[#00E5FF] text-[10px]">+1.0 L</span>
            <span className="text-[9px] text-[#849396] font-sans">Garrafão</span>
          </button>

          <div className="flex gap-1">
            <button
              type="button"
              disabled={liters <= 0}
              onClick={() => handleAdd(-0.25)}
              className="flex-1 py-2 rounded-xl bg-[#171B26] hover:bg-red-950/30 disabled:opacity-30 disabled:hover:bg-[#171B26] active:scale-95 border border-[#222938] hover:border-red-500/40 text-xs font-mono text-[#BAC9CC] hover:text-red-400 flex items-center justify-center transition-all cursor-pointer"
              title="Remover 250ml"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              disabled={liters <= 0}
              onClick={handleReset}
              className="px-2 py-2 rounded-xl bg-[#171B26] hover:bg-[#1D2026] disabled:opacity-30 active:scale-95 border border-[#222938] text-xs font-mono text-[#849396] hover:text-white flex items-center justify-center transition-all cursor-pointer"
              title="Zerar ingestão de hoje"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Info Modal with Full Breakdown */}
        {showInfoModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#11141C] border border-[#222938] rounded-2xl p-6 max-w-sm w-full space-y-4 text-white shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-[#222938] pb-3">
                <div className="flex items-center gap-2">
                  <Droplets className="w-5 h-5 text-[#00E5FF]" />
                  <h3 className="font-space font-bold text-base text-white">
                    Metas de Água Team Wagner
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
                A hidratação correta é responsável por até 15% do ganho de força e recuperação muscular. Acompanhe suas faixas diárias:
              </p>

              {/* The 4 official tiers list */}
              <div className="space-y-2.5">
                {WATER_TIERS.map((tier) => (
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
                      {tier.tier === 'regular' && '🟠'}
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
                  Para atletas de alta intensidade e dias quentes, a meta ⭐ <strong>Excelente (&gt; 3 L)</strong> é fortemente recomendada quando compatível com a sua rotina e necessidade corporal.
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
      </div>

      {/* Water Reminder Configuration Modal */}
      <WaterReminderModal
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        onTriggerTestReminder={() => {
          setShowReminderModal(false);
          setShowReminderToast(true);
        }}
      />

      {/* In-App Floating Water Reminder Toast */}
      <WaterReminderToast
        isOpen={showReminderToast}
        cupMl={reminderConfig.cupMl}
        onDismiss={() => setShowReminderToast(false)}
        onDrinkLogged={(amount) => {
          const updated = { ...reminderConfig, lastDrinkTimestamp: Date.now() };
          saveWaterReminderConfig(updated);
          setReminderConfig(updated);
        }}
      />
    </>
  );
};
