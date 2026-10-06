'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Moon,
  Clock,
  Calendar as CalendarIcon,
  Trophy,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Bed,
  Sun,
  Star
} from 'lucide-react';
import {
  getTodayDateString,
  getSleepSummaryForDate,
  saveSleepRecord,
  getAllSleepHistory,
  getSleepGoalHours,
  computeHoursFromTimes,
  calculateSleepPoints
} from '@/lib/sleep-service';
import { DailySleepSummary, SleepQuality } from '@/lib/types';

interface SleepModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'register' | 'history';
}

export const SleepModal: React.FC<SleepModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'register',
}) => {
  const [activeTab, setActiveTab] = useState<'register' | 'history'>(initialTab);
  const [prevInitialTab, setPrevInitialTab] = useState(initialTab);
  if (initialTab !== prevInitialTab) {
    setPrevInitialTab(initialTab);
    setActiveTab(initialTab);
  }

  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [mode, setMode] = useState<'times' | 'direct'>('times');
  
  // Opção 1: Horários
  const [bedTime, setBedTime] = useState<string>('23:00');
  const [wakeTime, setWakeTime] = useState<string>('07:00');

  // Opção 2: Horas diretas
  const [directHours, setDirectHours] = useState<number>(8.0);

  // Qualidade
  const [quality, setQuality] = useState<SleepQuality>('boa');

  const [todaySummary, setTodaySummary] = useState<DailySleepSummary>(() =>
    getSleepSummaryForDate(getTodayDateString())
  );
  const [historySummary, setHistorySummary] = useState<DailySleepSummary>(() =>
    getSleepSummaryForDate(getTodayDateString())
  );

  const loadData = useCallback((date: string = selectedDate) => {
    const today = getTodayDateString();
    setTodaySummary(getSleepSummaryForDate(today));
    setHistorySummary(getSleepSummaryForDate(date));
  }, [selectedDate]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        loadData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen, loadData]);

  useEffect(() => {
    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener('team_wagner_sleep_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('team_wagner_sleep_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadData]);

  if (!isOpen) return null;

  const today = getTodayDateString();
  const goalHours = getSleepGoalHours();

  // Cálculo ao vivo de horas
  const calculatedHours = mode === 'times' 
    ? computeHoursFromTimes(bedTime, wakeTime)
    : directHours;

  const previewPoints = calculateSleepPoints(calculatedHours, goalHours);
  const previewPercentage = Math.min(100, Math.round((calculatedHours / goalHours) * 100));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSleepRecord({
      date: selectedDate,
      hours: calculatedHours,
      bedTime: mode === 'times' ? bedTime : undefined,
      wakeTime: mode === 'times' ? wakeTime : undefined,
      quality,
    });
    loadData();
    onClose();
  };

  const formatDateBR = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const formatHoursMinutes = (h: number) => {
    const whole = Math.floor(h);
    const mins = Math.round((h - whole) * 60);
    return mins > 0 ? `${whole}h ${mins}min` : `${whole}h`;
  };

  const allHistory = getAllSleepHistory();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#11141C] border border-[#222938] rounded-2xl max-w-lg w-full p-4 sm:p-6 space-y-4 text-white shadow-2xl relative max-h-[92vh] flex flex-col">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#222938] pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.25)]">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-space font-bold text-base sm:text-lg text-white">
                  Sono & Descanso
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-mono font-bold">
                  Team Wagner
                </span>
              </div>
              <p className="text-[11px] text-[#849396] font-sans">
                Recuperação muscular, liberação de GH e pontuação diária
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-[#849396] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0B0E14] border border-[#222938] rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`py-2 px-2 rounded-lg font-space text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'register'
                ? 'bg-gradient-to-r from-indigo-500 to-[#00E5FF] text-[#0B0E14] shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                : 'text-[#BAC9CC] hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Registrar Sono</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-2 px-2 rounded-lg font-space text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-indigo-500 to-[#00E5FF] text-[#0B0E14] shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                : 'text-[#BAC9CC] hover:text-white'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Histórico de Sono</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          
          {/* TAB 1: REGISTRAR SONO */}
          {activeTab === 'register' && (
            <form onSubmit={handleSave} className="space-y-4">
              
              {/* Live Preview Card */}
              <div className="bg-[#0B0E14] border border-[#222938] rounded-2xl p-4 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#849396] uppercase tracking-wider block">
                      PREVISÃO DE PONTUAÇÃO
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="font-space text-3xl font-extrabold text-indigo-300 drop-shadow-[0_0_15px_rgba(129,140,248,0.4)]">
                        {formatHoursMinutes(calculatedHours)}
                      </span>
                      <span className="text-xs text-[#849396] font-mono">
                        / {goalHours}h (Meta)
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-mono text-xs font-bold inline-flex items-center gap-1 shadow-sm">
                      <Trophy className="w-3.5 h-3.5 text-[#00E5FF]" />
                      <span>+{previewPoints} pts</span>
                    </span>
                    <span className="block text-[11px] text-emerald-400 font-mono mt-1">
                      {previewPercentage}% concluído
                    </span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-[#12161F] rounded-full overflow-hidden border border-[#222938]">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-[#00E5FF] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(previewPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Mode Toggle: Opção 1 (Horários) ou Opção 2 (Horas Diretas) */}
              <div className="space-y-1.5">
                <label className="text-xs font-space font-bold text-[#BAC9CC]">
                  Como deseja informar seu descanso?
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-[#0B0E14] border border-[#222938] rounded-xl">
                  <button
                    type="button"
                    onClick={() => setMode('times')}
                    className={`py-2 px-2 rounded-lg font-space text-xs font-bold transition-all cursor-pointer ${
                      mode === 'times'
                        ? 'bg-[#171B26] text-[#00E5FF] border border-[#00E5FF]/40 shadow-sm'
                        : 'text-[#849396] hover:text-white'
                    }`}
                  >
                    Opção 1: Horários (Dormiu / Acordou)
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode('direct')}
                    className={`py-2 px-2 rounded-lg font-space text-xs font-bold transition-all cursor-pointer ${
                      mode === 'direct'
                        ? 'bg-[#171B26] text-[#00E5FF] border border-[#00E5FF]/40 shadow-sm'
                        : 'text-[#849396] hover:text-white'
                    }`}
                  >
                    Opção 2: Total de Horas
                  </button>
                </div>
              </div>

              {/* Opção 1: Horários */}
              {mode === 'times' && (
                <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-[#222938] space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-space text-[#BAC9CC] flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Que horas dormiu?</span>
                      </label>
                      <input
                        type="time"
                        value={bedTime}
                        onChange={(e) => setBedTime(e.target.value)}
                        className="w-full bg-[#12161F] border border-[#222938] rounded-xl p-2.5 text-sm text-white font-mono focus:border-[#00E5FF] focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-space text-[#BAC9CC] flex items-center gap-1">
                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                        <span>Que horas acordou?</span>
                      </label>
                      <input
                        type="time"
                        value={wakeTime}
                        onChange={(e) => setWakeTime(e.target.value)}
                        className="w-full bg-[#12161F] border border-[#222938] rounded-xl p-2.5 text-sm text-white font-mono focus:border-[#00E5FF] focus:outline-none"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-[#849396] font-sans">
                    💡 O sistema calcula a duração total automaticamente (inclusive viradas de noite).
                  </p>
                </div>
              )}

              {/* Opção 2: Total de Horas Direto */}
              {mode === 'direct' && (
                <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-[#222938] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-space text-[#BAC9CC]">Quantidade de horas dormidas:</span>
                    <strong className="text-indigo-300 font-mono text-base">{formatHoursMinutes(directHours)}</strong>
                  </div>

                  <input
                    type="range"
                    min="3"
                    max="14"
                    step="0.25"
                    value={directHours}
                    onChange={(e) => setDirectHours(parseFloat(e.target.value))}
                    className="w-full accent-[#00E5FF] cursor-pointer"
                  />

                  {/* Preset Pills */}
                  <div className="grid grid-cols-4 gap-1.5 pt-1">
                    {[6.0, 7.0, 7.5, 8.0].map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => setDirectHours(h)}
                        className={`py-1.5 rounded-lg border text-xs font-mono transition-all ${
                          directHours === h
                            ? 'bg-[#00E5FF] text-[#0B0E14] font-bold border-[#00E5FF]'
                            : 'bg-[#12161F] text-[#849396] border-[#222938] hover:text-white'
                        }`}
                      >
                        {formatHoursMinutes(h)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Qualidade do Sono */}
              <div className="space-y-1.5">
                <label className="text-xs font-space font-bold text-[#BAC9CC]">
                  Qualidade do Sono:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['otima', 'boa', 'regular', 'ruim'] as SleepQuality[]).map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setQuality(q)}
                      className={`py-2 rounded-xl border text-xs font-space font-semibold capitalize transition-all cursor-pointer ${
                        quality === q
                          ? 'border-indigo-400 bg-indigo-500/20 text-indigo-300 shadow-sm'
                          : 'border-[#222938] bg-[#0B0E14] text-[#849396] hover:text-white'
                      }`}
                    >
                      {q === 'otima' ? 'Ótima ⭐' : q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-[#00E5FF] hover:from-indigo-400 hover:to-[#22e9ff] active:scale-[0.98] text-[#0B0E14] font-space font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.3)] transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                <span>Salvar Registro de Sono</span>
              </button>
            </form>
          )}

          {/* TAB 2: HISTÓRICO DE SONO */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              
              {/* Date Navigator Header */}
              <div className="bg-[#0B0E14] border border-[#222938] rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-space font-bold text-[#BAC9CC] flex items-center gap-1.5 shrink-0">
                    <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Data do Histórico:</span>
                  </label>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(selectedDate + 'T12:00:00');
                        d.setDate(d.getDate() - 1);
                        const y = d.getFullYear();
                        const m = String(d.getMonth() + 1).padStart(2, '0');
                        const dayNum = String(d.getDate()).padStart(2, '0');
                        setSelectedDate(`${y}-${m}-${dayNum}`);
                      }}
                      className="p-1.5 rounded-lg bg-[#12161F] hover:bg-[#1D2026] text-[#BAC9CC] hover:text-white border border-[#222938] transition-colors cursor-pointer"
                      title="Dia anterior"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>

                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => {
                        if (e.target.value) {
                          setSelectedDate(e.target.value);
                        }
                      }}
                      className="bg-[#12161F] border border-[#222938] rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:border-indigo-400 focus:outline-none"
                    />

                    <button
                      type="button"
                      onClick={() => {
                        const d = new Date(selectedDate + 'T12:00:00');
                        d.setDate(d.getDate() + 1);
                        const y = d.getFullYear();
                        const m = String(d.getMonth() + 1).padStart(2, '0');
                        const dayNum = String(d.getDate()).padStart(2, '0');
                        setSelectedDate(`${y}-${m}-${dayNum}`);
                      }}
                      className="p-1.5 rounded-lg bg-[#12161F] hover:bg-[#1D2026] text-[#BAC9CC] hover:text-white border border-[#222938] transition-colors cursor-pointer"
                      title="Próximo dia"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Quick Date Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {allHistory.slice(0, 6).map((item) => (
                    <button
                      key={item.date}
                      type="button"
                      onClick={() => setSelectedDate(item.date)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-all cursor-pointer ${
                        selectedDate === item.date
                          ? 'bg-indigo-500 text-white font-bold shadow-[0_0_10px_rgba(99,102,241,0.5)]'
                          : 'bg-[#12161F] text-[#849396] hover:text-white border border-[#222938]'
                      }`}
                    >
                      {item.date === today ? 'Hoje' : formatDateBR(item.date)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Day Summary Card (Item 2 da especificação) */}
              <div className="bg-[#12161F] border border-indigo-500/30 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#222938] pb-2.5">
                  <div>
                    <h3 className="font-space font-extrabold text-base text-white">
                      {formatDateBR(selectedDate)}
                    </h3>
                    <span className="text-[11px] font-mono text-[#849396]">
                      Meta: {historySummary.goalHours}h de descanso
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-space font-extrabold text-indigo-300">
                      +{historySummary.points} pontos
                    </span>
                    <span className="block text-[11px] font-mono text-emerald-400">
                      Conclusão: {historySummary.completionPercentage}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#0B0E14] border border-[#222938] text-center">
                    <span className="text-[10px] text-[#849396] block font-space">Sono Real</span>
                    <strong className="text-white font-mono text-sm">
                      {formatHoursMinutes(historySummary.hours)}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0B0E14] border border-[#222938] text-center">
                    <span className="text-[10px] text-[#849396] block font-space">Meta</span>
                    <strong className="text-indigo-400 font-mono text-sm">
                      {historySummary.goalHours}h
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0B0E14] border border-[#222938] text-center">
                    <span className="text-[10px] text-[#849396] block font-space">Qualidade</span>
                    <strong className="text-emerald-400 font-mono text-sm capitalize">
                      {historySummary.quality}
                    </strong>
                  </div>
                </div>

                {historySummary.entry?.bedTime && historySummary.entry?.wakeTime && (
                  <div className="p-2.5 rounded-xl bg-[#0B0E14] border border-[#222938] text-xs font-mono text-[#BAC9CC] flex items-center justify-around">
                    <span>🌙 Dormiu: <strong>{historySummary.entry.bedTime}</strong></span>
                    <span>☀️ Acordou: <strong>{historySummary.entry.wakeTime}</strong></span>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
