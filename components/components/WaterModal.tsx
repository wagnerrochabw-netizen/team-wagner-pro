'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Droplets,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Trophy,
  Clock,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import {
  getTodayDateString,
  getWaterSummaryForDate,
  addWaterLog,
  deleteWaterLog,
  getAllWaterHistory,
  getWaterGoalMl,
  setWaterGoalMl,
} from '@/lib/water-service';
import { DailyWaterSummary } from '@/lib/types';
import { playWaterChime } from '@/lib/water-reminder';

interface WaterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'register' | 'history';
}

export const WaterModal: React.FC<WaterModalProps> = ({
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
  const [customAmount, setCustomAmount] = useState<string>('');
  const [todaySummary, setTodaySummary] = useState<DailyWaterSummary>(() =>
    getWaterSummaryForDate(getTodayDateString())
  );
  const [historySummary, setHistorySummary] = useState<DailyWaterSummary>(() =>
    getWaterSummaryForDate(getTodayDateString())
  );

  const loadData = useCallback((date: string = selectedDate) => {
    const today = getTodayDateString();
    setTodaySummary(getWaterSummaryForDate(today));
    setHistorySummary(getWaterSummaryForDate(date));
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
    window.addEventListener('team_wagner_water_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('team_wagner_water_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadData]);

  if (!isOpen) return null;

  const today = getTodayDateString();

  const handleQuickAdd = (amountMl: number) => {
    addWaterLog(amountMl, today);
    try {
      playWaterChime();
    } catch {
      // ignore
    }
    loadData();
  };

  const handleCustomAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customAmount, 10);
    if (!isNaN(val) && val > 0) {
      addWaterLog(val, today);
      try {
        playWaterChime();
      } catch {
        // ignore
      }
      setCustomAmount('');
      loadData();
    }
  };

  const handleDelete = (id: string) => {
    deleteWaterLog(id);
    loadData();
  };

  const formatDateBR = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const allHistory = getAllWaterHistory();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#11141C] border border-[#222938] rounded-2xl max-w-lg w-full p-4 sm:p-6 space-y-4 text-white shadow-2xl relative max-h-[92vh] flex flex-col">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-[#222938] pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.25)]">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-space font-bold text-base sm:text-lg text-white">
                  Hidratação Diária
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00E5FF] text-[10px] font-mono font-bold">
                  Team Wagner
                </span>
              </div>
              <p className="text-[11px] text-[#849396] font-sans">
                Meta de hidratação, registros com horário e pontuação
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
                ? 'bg-[#00E5FF] text-[#0B0E14] shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                : 'text-[#BAC9CC] hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Registrar Água</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-2 px-2 rounded-lg font-space text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#00E5FF] text-[#0B0E14] shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                : 'text-[#BAC9CC] hover:text-white'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Histórico de Água</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          
          {/* TAB 1: REGISTRAR ÁGUA */}
          {activeTab === 'register' && (
            <div className="space-y-4">
              
              {/* Daily Progress Banner */}
              <div className="bg-[#0B0E14] border border-[#222938] rounded-2xl p-4 space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#849396] uppercase tracking-wider block">
                      TOTAL DO DIA • {formatDateBR(today)}
                    </span>
                    <div className="flex items-baseline gap-1.5 mt-0.5">
                      <span className="font-space text-3xl font-extrabold text-[#00E5FF] drop-shadow-[0_0_15px_rgba(0,229,255,0.4)]">
                        {(todaySummary.totalMl / 1000).toFixed(2).replace('.', ',')}
                      </span>
                      <span className="font-space text-base font-bold text-white">L</span>
                      <span className="text-xs text-[#849396] font-mono ml-1">
                        / {(todaySummary.goalMl / 1000).toFixed(1)} L
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/40 text-[#00E5FF] font-mono text-xs font-bold inline-flex items-center gap-1 shadow-sm">
                      <Trophy className="w-3.5 h-3.5 text-[#00E5FF]" />
                      <span>+{todaySummary.points} pts</span>
                    </span>
                    <span className="block text-[11px] text-emerald-400 font-mono mt-1">
                      {todaySummary.completionPercentage}% concluído
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-[#12161F] rounded-full overflow-hidden border border-[#222938]">
                  <div
                    className="h-full bg-gradient-to-r from-[#00A8FF] to-[#00E5FF] rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(0,229,255,0.6)]"
                    style={{ width: `${Math.min(todaySummary.completionPercentage, 100)}%` }}
                  />
                </div>

                <div className="text-[10px] text-[#849396] font-sans flex items-center justify-between">
                  <span>Reinicia automaticamente às 23:59</span>
                  <span className="font-mono text-[#00E5FF]">Meta: {todaySummary.goalMl} ml</span>
                </div>
              </div>

              {/* Quick Add Presets (+250ml, +500ml, +1L) */}
              <div className="space-y-2">
                <label className="text-xs font-space font-bold text-[#BAC9CC] flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Adicionar Hidratação Rápida:</span>
                </label>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickAdd(250)}
                    className="py-3 px-2 rounded-xl bg-[#12161F] hover:bg-[#171B26] active:scale-95 border border-[#222938] hover:border-[#00E5FF]/50 text-white font-mono text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer shadow-sm group"
                  >
                    <span className="text-[#00E5FF] text-sm font-extrabold group-hover:scale-110 transition-transform">
                      +250 ml
                    </span>
                    <span className="text-[10px] text-[#849396] font-sans">Copo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickAdd(500)}
                    className="py-3 px-2 rounded-xl bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 active:scale-95 border border-[#00E5FF]/40 text-[#00E5FF] font-mono text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.2)] group"
                  >
                    <span className="text-sm font-extrabold group-hover:scale-110 transition-transform">
                      +500 ml
                    </span>
                    <span className="text-[10px] text-[#00E5FF]/80 font-sans">Garrafa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickAdd(1000)}
                    className="py-3 px-2 rounded-xl bg-[#12161F] hover:bg-[#171B26] active:scale-95 border border-[#222938] hover:border-[#00E5FF]/50 text-white font-mono text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer shadow-sm group"
                  >
                    <span className="text-[#00E5FF] text-sm font-extrabold group-hover:scale-110 transition-transform">
                      +1 Litro
                    </span>
                    <span className="text-[10px] text-[#849396] font-sans">Garrafão</span>
                  </button>
                </div>
              </div>

              {/* Custom Amount Form */}
              <form onSubmit={handleCustomAdd} className="space-y-1.5 bg-[#0B0E14] p-3 rounded-xl border border-[#222938]">
                <label className="text-xs font-space font-semibold text-[#BAC9CC] block">
                  Ou digite um valor personalizado (ml):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="10"
                    max="5000"
                    step="10"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Ex: 350 ml"
                    className="flex-1 bg-[#12161F] border border-[#222938] rounded-xl px-3 py-2 text-xs text-white placeholder-[#849396] font-mono focus:border-[#00E5FF] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#00E5FF] hover:bg-[#00daf3] active:scale-95 text-[#0B0E14] font-space font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_12px_rgba(0,229,255,0.3)] shrink-0"
                  >
                    Registrar
                  </button>
                </div>
              </form>

              {/* Today's Registration Log List with Timestamps */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-space font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span>Registros de Hoje</span>
                  </h4>
                  <span className="text-[10px] font-mono text-[#849396]">
                    {todaySummary.logs.length} {todaySummary.logs.length === 1 ? 'registro' : 'registros'}
                  </span>
                </div>

                {todaySummary.logs.length === 0 ? (
                  <div className="text-center py-6 bg-[#0B0E14] rounded-xl border border-[#222938]">
                    <Droplets className="w-8 h-8 text-[#849396]/40 mx-auto mb-1.5" />
                    <p className="text-xs text-[#849396] font-space">
                      Nenhum registro de água hoje ainda.
                    </p>
                    <p className="text-[10px] text-[#64748B]">
                      Clique nos botões acima para registrar seu consumo!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {todaySummary.logs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0E14] border border-[#222938] hover:border-[#00E5FF]/30 transition-all text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[#849396] text-[11px]">
                            {log.time}
                          </span>
                          <span className="text-[#222938]">→</span>
                          <span className="font-mono font-bold text-[#00E5FF]">
                            +{log.amountMl >= 1000 ? `${(log.amountMl / 1000).toFixed(1)} L` : `${log.amountMl} ml`}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDelete(log.id)}
                          className="p-1 rounded-lg text-[#849396] hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Excluir este registro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: HISTÓRICO DE ÁGUA */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              
              {/* Date Navigator Header */}
              <div className="bg-[#0B0E14] border border-[#222938] rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-space font-bold text-[#BAC9CC] flex items-center gap-1.5 shrink-0">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#00E5FF]" />
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
                      className="bg-[#12161F] border border-[#222938] rounded-lg px-2.5 py-1 text-xs text-white font-mono focus:border-[#00E5FF] focus:outline-none"
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
                          ? 'bg-[#00E5FF] text-[#0B0E14] font-bold shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                          : 'bg-[#12161F] text-[#849396] hover:text-white border border-[#222938]'
                      }`}
                    >
                      {item.date === today ? 'Hoje' : formatDateBR(item.date)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Day Summary Card (Item 1 da especificação) */}
              <div className="bg-[#12161F] border border-[#00E5FF]/30 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xl">
                <div className="flex items-center justify-between border-b border-[#222938] pb-2.5">
                  <div>
                    <h3 className="font-space font-extrabold text-base text-white">
                      {formatDateBR(selectedDate)}
                    </h3>
                    <span className="text-[11px] font-mono text-[#849396]">
                      Meta: {(historySummary.goalMl / 1000).toFixed(1)} L
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-space font-extrabold text-[#00E5FF]">
                      +{historySummary.points} pontos
                    </span>
                    <span className="block text-[11px] font-mono text-emerald-400">
                      Conclusão: {historySummary.completionPercentage}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#0B0E14] border border-[#222938] text-center">
                    <span className="text-[10px] text-[#849396] block font-space">Consumido</span>
                    <strong className="text-white font-mono text-sm">
                      {(historySummary.totalMl / 1000).toFixed(2).replace('.', ',')} L
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0B0E14] border border-[#222938] text-center">
                    <span className="text-[10px] text-[#849396] block font-space">Meta Diária</span>
                    <strong className="text-[#00E5FF] font-mono text-sm">
                      {(historySummary.goalMl / 1000).toFixed(1)} L
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0B0E14] border border-[#222938] text-center">
                    <span className="text-[10px] text-[#849396] block font-space">Registros</span>
                    <strong className="text-emerald-400 font-mono text-sm">
                      {historySummary.logs.length}
                    </strong>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-[#0B0E14] rounded-full overflow-hidden border border-[#222938]">
                  <div
                    className="h-full bg-gradient-to-r from-[#00A8FF] to-[#00E5FF] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(historySummary.completionPercentage, 100)}%` }}
                  />
                </div>
              </div>

              {/* Day Timeline */}
              <div className="space-y-2">
                <h4 className="text-xs font-space font-bold text-[#BAC9CC] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Horários dos Registros em {formatDateBR(selectedDate)}</span>
                </h4>

                {historySummary.logs.length === 0 ? (
                  <div className="text-center py-5 bg-[#0B0E14] rounded-xl border border-[#222938] text-xs text-[#849396]">
                    Nenhum consumo de água registrado para esta data.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {historySummary.logs.map((l) => (
                      <div
                        key={l.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#0B0E14] border border-[#222938] text-xs"
                      >
                        <span className="font-mono text-[#BAC9CC]">
                          {l.time} → <strong className="text-[#00E5FF]">+{l.amountMl >= 1000 ? `${(l.amountMl / 1000).toFixed(1)} L` : `${l.amountMl} ml`}</strong>
                        </span>
                        <span className="text-[10px] text-[#849396] font-mono">
                          Salvo
                        </span>
                      </div>
                    ))}
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
