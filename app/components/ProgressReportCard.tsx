'use client';

import React, { useState } from 'react';
import {
  FileText,
  Dumbbell,
  Droplets,
  Moon,
  Sparkles,
  Share2,
  Copy,
  Check,
  Award,
  ChevronRight,
  TrendingUp,
  Flame,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import {
  WeekReportData,
  MonthReportData,
  formatReportForSharing
} from '@/lib/progress-reports';

interface ProgressReportCardProps {
  weekReport: WeekReportData;
  monthReport: MonthReportData;
  onOpenFullReportModal?: (type: 'semanal' | 'mensal') => void;
  className?: string;
}

export const ProgressReportCard: React.FC<ProgressReportCardProps> = ({
  weekReport,
  monthReport,
  onOpenFullReportModal,
  className = '',
}) => {
  const [reportType, setReportType] = useState<'semanal' | 'mensal'>('semanal');
  const [copied, setCopied] = useState(false);

  const handleCopyReport = () => {
    const text = formatReportForSharing(reportType, weekReport, monthReport);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const isWeekly = reportType === 'semanal';

  return (
    <div
      className={`bg-[#12161F] border border-[#222938] hover:border-[#00E5FF]/40 rounded-2xl p-4 sm:p-5 shadow-xl transition-all relative overflow-hidden space-y-4 ${className}`}
    >
      {/* Background soft ambient glow */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Switch */}
      <div className="flex flex-wrap items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF]">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-space font-bold text-sm text-white leading-tight">
                Boletim & Relatório de Progresso
              </h3>
              <span className="text-[10px] font-mono text-[#00E5FF] px-1.5 py-0.5 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/30 font-bold">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-[#849396] font-mono">
              {isWeekly ? weekReport.periodLabel : monthReport.periodLabel}
            </p>
          </div>
        </div>

        {/* Tab Toggle: Semanal vs Mensal */}
        <div className="flex items-center p-0.5 bg-[#0B0E14] border border-[#222938] rounded-xl text-xs font-space">
          <button
            type="button"
            onClick={() => setReportType('semanal')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              isWeekly
                ? 'bg-[#00E5FF] text-[#0B0E14] font-bold shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                : 'text-[#849396] hover:text-white'
            }`}
          >
            Semanal
          </button>
          <button
            type="button"
            onClick={() => setReportType('mensal')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              !isWeekly
                ? 'bg-[#00E5FF] text-[#0B0E14] font-bold shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                : 'text-[#849396] hover:text-white'
            }`}
          >
            Mensal
          </button>
        </div>
      </div>

      {/* Global Performance Header Banner */}
      <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-[#222938] flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#171B26] border border-[#00E5FF]/40 flex flex-col items-center justify-center">
            <span className="text-[10px] font-mono text-[#849396] uppercase leading-none">Score</span>
            <span className="font-space text-lg font-extrabold text-[#00E5FF]">
              {isWeekly ? weekReport.globalScore : monthReport.globalScore}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-space text-sm font-bold text-white">
                {isWeekly ? weekReport.statusBadge : monthReport.statusBadge}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 font-bold">
                {isWeekly ? `Nota ${weekReport.coachDiagnosis.grade}` : monthReport.coachDiagnosis.seal}
              </span>
            </div>
            <p className="text-[11px] text-[#BAC9CC] mt-0.5 line-clamp-1">
              {isWeekly ? weekReport.coachDiagnosis.highlight : monthReport.coachDiagnosis.highlight}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyReport}
          className="p-2 rounded-xl bg-[#171B26] hover:bg-[#222938] border border-[#222938] text-[#BAC9CC] hover:text-[#00E5FF] transition-all flex items-center gap-1.5 text-xs font-mono shrink-0 cursor-pointer"
          title="Copiar relatório formatado para WhatsApp"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
              <span className="text-emerald-400 text-[11px]">Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Copiar</span>
            </>
          )}
        </button>
      </div>

      {/* 3 Pillars Breakdown Cards */}
      <div className="grid grid-cols-3 gap-2 relative z-10">
        {/* Pillar 1: TREINOS */}
        <div className="p-3 rounded-xl bg-[#0B0E14] border border-[#222938] hover:border-[#FF9100]/40 transition-colors space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-space font-bold uppercase text-[#FF9100] flex items-center gap-1">
              <Dumbbell className="w-3 h-3" />
              Treinos
            </span>
            <span className="text-[9px] font-mono text-[#BAC9CC]">
              {isWeekly ? `${weekReport.workoutsAdherence}%` : `+${monthReport.workoutsGrowthPercent}%`}
            </span>
          </div>

          <div className="font-space text-base font-bold text-white">
            {isWeekly ? `${weekReport.workoutsTotal} de ${weekReport.workoutsTarget}` : `${monthReport.workoutsTotal} treinos`}
          </div>

          <p className="text-[10px] text-[#849396] font-mono truncate">
            {isWeekly ? `${weekReport.workoutsMinutes} min total` : `${monthReport.workoutsActiveDays} dias ativos`}
          </p>
        </div>

        {/* Pillar 2: ÁGUA */}
        <div className="p-3 rounded-xl bg-[#0B0E14] border border-[#222938] hover:border-[#00E5FF]/40 transition-colors space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-space font-bold uppercase text-[#00E5FF] flex items-center gap-1">
              <Droplets className="w-3 h-3" />
              Água
            </span>
            <span className="text-[9px] font-mono text-[#BAC9CC]">
              {isWeekly ? `${weekReport.waterDaysMetTarget}/7d` : `${monthReport.waterDaysOptimal}d >2.5L`}
            </span>
          </div>

          <div className="font-space text-base font-bold text-white">
            {isWeekly ? `${weekReport.waterAvgLiters} L/dia` : `${monthReport.waterAvgLiters} L/dia`}
          </div>

          <p className="text-[10px] text-[#849396] font-mono truncate">
            {isWeekly ? `${weekReport.waterTotalLiters} L no total` : `${monthReport.waterTotalLiters} L no mês`}
          </p>
        </div>

        {/* Pillar 3: SONO */}
        <div className="p-3 rounded-xl bg-[#0B0E14] border border-[#222938] hover:border-[#C084FC]/40 transition-colors space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-space font-bold uppercase text-[#C084FC] flex items-center gap-1">
              <Moon className="w-3 h-3" />
              Sono
            </span>
            <span className="text-[9px] font-mono text-[#BAC9CC]">
              {isWeekly ? `${weekReport.sleepGoodNights}/7d` : `${monthReport.sleepRecoveryScore}%`}
            </span>
          </div>

          <div className="font-space text-base font-bold text-white">
            {isWeekly ? `${weekReport.sleepAvgHours} h/dia` : `${monthReport.sleepAvgHours} h/dia`}
          </div>

          <p className="text-[10px] text-[#849396] font-mono truncate">
            {isWeekly ? `${weekReport.sleepTotalHours} h dormidas` : `${monthReport.sleepOptimalNights} noites ideais`}
          </p>
        </div>
      </div>

      {/* Coach Diagnostic Feedback */}
      <div className="p-3.5 rounded-xl bg-[#0B0E14] border border-[#222938] space-y-2 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
            <span className="font-space text-xs font-bold text-white">
              {isWeekly ? weekReport.coachDiagnosis.title : monthReport.coachDiagnosis.title}
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#00E5FF] font-semibold">
            Feedback Oficial
          </span>
        </div>

        <p className="text-xs text-[#BAC9CC] leading-relaxed">
          {isWeekly ? weekReport.coachDiagnosis.analysis : monthReport.coachDiagnosis.analysis}
        </p>

        {/* Action Items List */}
        <div className="pt-2 border-t border-[#1D2026] space-y-1.5">
          <span className="text-[10px] font-space font-bold text-[#849396] uppercase block">
            {isWeekly ? 'Recomendações do Treinador:' : 'Pontos de Destaque:'}
          </span>
          <div className="space-y-1">
            {(isWeekly ? weekReport.coachDiagnosis.tips : monthReport.coachDiagnosis.strengths).map((item, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-[#E1E2EB]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00E5FF] shrink-0 mt-0.5" />
                <span className="text-[11px] leading-tight">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Button to Open Full Modal */}
      {onOpenFullReportModal && (
        <button
          type="button"
          onClick={() => onOpenFullReportModal(reportType)}
          className="w-full py-2.5 rounded-xl bg-[#171B26] hover:bg-[#222938] border border-[#222938] hover:border-[#00E5FF]/40 text-xs font-space font-bold text-[#00E5FF] flex items-center justify-center gap-2 transition-all cursor-pointer group"
        >
          <span>Visualizar Relatório Executivo Completo ({isWeekly ? 'Semanal' : 'Mensal'})</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      )}
    </div>
  );
};
