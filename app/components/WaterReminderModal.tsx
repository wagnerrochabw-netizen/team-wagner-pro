'use client';

import React, { useState } from 'react';
import {
  Bell,
  Clock,
  Droplets,
  Volume2,
  VolumeX,
  X,
  CheckCircle2,
  Sparkles,
  Zap,
  Play
} from 'lucide-react';
import {
  WaterReminderConfig,
  getWaterReminderConfig,
  saveWaterReminderConfig,
  requestBrowserNotificationPermission,
  playWaterChime
} from '@/lib/water-reminder';

interface WaterReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerTestReminder: () => void;
}

export const WaterReminderModal: React.FC<WaterReminderModalProps> = ({
  isOpen,
  onClose,
  onTriggerTestReminder,
}) => {
  const [config, setConfig] = useState<WaterReminderConfig>(getWaterReminderConfig());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleToggleEnabled = () => {
    const updated = { ...config, enabled: !config.enabled };
    setConfig(updated);
    saveWaterReminderConfig(updated);
  };

  const handleIntervalChange = (mins: number) => {
    const updated = { ...config, intervalMinutes: mins };
    setConfig(updated);
    saveWaterReminderConfig(updated);
  };

  const handleCupChange = (ml: number) => {
    const updated = { ...config, cupMl: ml };
    setConfig(updated);
    saveWaterReminderConfig(updated);
  };

  const handleToggleSound = () => {
    const updated = { ...config, soundEnabled: !config.soundEnabled };
    setConfig(updated);
    saveWaterReminderConfig(updated);
    if (updated.soundEnabled) {
      playWaterChime();
    }
  };

  const handleToggleBrowserNotification = async () => {
    if (!config.browserNotification) {
      const granted = await requestBrowserNotificationPermission();
      const updated = { ...config, browserNotification: granted };
      setConfig(updated);
      saveWaterReminderConfig(updated);
    } else {
      const updated = { ...config, browserNotification: false };
      setConfig(updated);
      saveWaterReminderConfig(updated);
    }
  };

  const handleSaveAndClose = () => {
    saveWaterReminderConfig(config);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 400);
  };

  const handleTestChimeAndNotification = () => {
    if (config.soundEnabled) {
      playWaterChime();
    }
    onTriggerTestReminder();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#11141C] border border-[#222938] rounded-2xl max-w-md w-full p-6 space-y-5 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#222938] pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-space font-bold text-base text-white">
                Lembrete para Beber Água
              </h2>
              <span className="text-[10px] text-[#849396] font-mono block">
                Notificações Inteligentes Team Wagner
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#849396] hover:text-white transition-colors cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Enable / Disable Toggle Switch */}
        <div className="p-4 rounded-xl bg-[#0B0E14] border border-[#222938] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                config.enabled
                  ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40'
                  : 'bg-[#171B26] text-[#849396]'
              }`}
            >
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <span className="font-space font-bold text-sm text-white block">
                Lembretes Ativos
              </span>
              <span className="text-xs text-[#849396]">
                {config.enabled
                  ? `Avisar a cada ${config.intervalMinutes} min`
                  : 'Lembretes pausados'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleEnabled}
            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
              config.enabled ? 'bg-[#00E5FF]' : 'bg-[#222938]'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-[#0B0E14] absolute top-0.5 transition-transform ${
                config.enabled ? 'left-[26px]' : 'left-0.5'
              }`}
            />
          </button>
        </div>

        {/* Interval Selection */}
        <div className="space-y-2">
          <label className="text-xs font-space font-bold text-[#BAC9CC] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>Frequência do Lembrete</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: '30m', mins: 30 },
              { label: '45m', mins: 45 },
              { label: '1 hora', mins: 60 },
              { label: '1h30', mins: 90 },
            ].map((item) => (
              <button
                key={item.mins}
                type="button"
                onClick={() => handleIntervalChange(item.mins)}
                className={`py-2 px-1 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                  config.intervalMinutes === item.mins
                    ? 'border-[#00E5FF] bg-[#00E5FF] text-[#0B0E14] shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                    : 'border-[#222938] bg-[#0B0E14] text-[#BAC9CC] hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dose Sugerida (Copo) */}
        <div className="space-y-2">
          <label className="text-xs font-space font-bold text-[#BAC9CC] flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>Volume Sugerido por Lembrete</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[200, 250, 350, 500].map((ml) => (
              <button
                key={ml}
                type="button"
                onClick={() => handleCupChange(ml)}
                className={`py-2 px-1 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                  config.cupMl === ml
                    ? 'border-[#00E5FF] bg-[#00E5FF]/20 text-[#00E5FF] border-2 shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                    : 'border-[#222938] bg-[#0B0E14] text-[#BAC9CC] hover:text-white'
                }`}
              >
                {ml} ml
              </button>
            ))}
          </div>
        </div>

        {/* Audio and Notification Toggles */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B0E14] border border-[#222938]">
            <div className="flex items-center gap-2.5">
              {config.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#00E5FF]" />
              ) : (
                <VolumeX className="w-4 h-4 text-[#849396]" />
              )}
              <span className="text-xs font-space text-white">
                Som Aquático Suave
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={playWaterChime}
                className="text-[10px] text-[#00E5FF] hover:underline font-mono px-2 py-0.5 rounded bg-[#171B26] border border-[#222938] flex items-center gap-1 cursor-pointer"
                title="Testar som"
              >
                <Play className="w-2.5 h-2.5" />
                <span>Ouvir</span>
              </button>
              <button
                type="button"
                onClick={handleToggleSound}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  config.soundEnabled ? 'bg-[#00E5FF]' : 'bg-[#222938]'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-[#0B0E14] absolute top-0.5 transition-transform ${
                    config.soundEnabled ? 'left-[22px]' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B0E14] border border-[#222938]">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-[#00E5FF]" />
              <div>
                <span className="text-xs font-space text-white block">
                  Notificação do Navegador
                </span>
                <span className="text-[10px] text-[#849396]">
                  Avisa mesmo com a aba em segundo plano
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleToggleBrowserNotification}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                config.browserNotification ? 'bg-[#00E5FF]' : 'bg-[#222938]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-[#0B0E14] absolute top-0.5 transition-transform ${
                  config.browserNotification ? 'left-[22px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Test Button & Save Actions */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={handleTestChimeAndNotification}
            className="w-full py-2.5 px-3 rounded-xl bg-[#171B26] hover:bg-[#1D2026] active:scale-98 border border-[#222938] hover:border-[#00E5FF]/40 text-xs font-space font-semibold text-[#00E5FF] flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>Simular Lembrete Agora</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAndClose}
            className="w-full py-3 rounded-xl bg-[#00E5FF] hover:bg-[#33EAFF] active:scale-98 text-[#0B0E14] font-space font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{savedSuccess ? 'Configuração Salva!' : 'Salvar Preferências'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
