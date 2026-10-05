'use client';

import React, { useState } from 'react';
import {
  X,
  FileText,
  Dumbbell,
  Droplets,
  Moon,
  Sparkles,
  Share2,
  Copy,
  Check,
  Calendar,
  Award,
  Flame,
  CheckCircle2,
  TrendingUp,
  Download,
  AlertCircle
} from 'lucide-react';
import {
  WeekReportData,
  MonthReportData,
  formatReportForSharing
} from '@/lib/progress-reports';
import { WRLogo } from './WRLogo';

interface ProgressReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekReport: WeekReportData;
  monthReport: MonthReportData;
  initialType?: 'semanal' | 'mensal';
}

export const ProgressReportModal: React.FC<ProgressReportModalProps> = ({
  isOpen,
  onClose,
  weekReport,
  monthReport,
  initialType = 'semanal',
}) => {
  const [reportType, setReportType] = useState<'semanal' | 'mensal'>(initialType);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isWeekly = reportType === 'semanal';

  const handleCopy = () => {
    const text = formatReportForSharing(reportType, weekReport, monthReport);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0E121A] border border-[#222938] rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#1D2026] flex items-center justify-between relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <WRLogo variant="compact" size="sm" subtext="Personal Trainer" />
            <div>
              <h2 className="font-space font-bold text-base text-white">
                Relatório de Performance
              </h2>
              <span className="text-[10px] font-mono text-[#00E5FF]">
                {isWeekly ? weekReport.periodLabel : monthReport.periodLabel}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#171B26] hover:bg-[#222938] border border-[#222938] text-[#849396] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 custom-scrollbar flex-1 relative z-10">
          {/* Switcher Tab */}
          <div className="flex items-center p-1 bg-[#12161F] border border-[#222938] rounded-xl text-xs font-space">
            <button
              type="button"
              onClick={() => setReportType('semanal')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all text-center ${
                isWeekly
                  ? 'bg-[#00E5FF] text-[#0B0E14] shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                  : 'text-[#BAC9CC] hover:text-white'
              }`}
            >
              Relatório Semanal
            </button>
            <button
              type="button"
              onClick={() => setReportType('mensal')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all text-center ${
                !isWeekly
                  ? 'bg-[#00E5FF] text-[#0B0E14] shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                  : 'text-[#BAC9CC] hover:text-white'
              }`}
            >
              Relatório Mensal
            </button>
          </div>

          {/* Top Score Banner */}
          <div className="p-4 rounded-2xl bg-[#12161F] border border-[#00E5FF]/40 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#00E5FF] font-bold block">
                  ÍNDICE INTEGRADO DE EFICIÊNCIA
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-space text-4xl font-extrabold text-[#00E5FF]">
                    {isWeekly ? weekReport.globalScore : monthReport.globalScore}
                  </span>
                  <span className="text-xs text-[#849396] font-mono">/ 100 pontos</span>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 text-xs font-mono font-bold">
                  {isWeekly ? `Classificação: ${weekReport.coachDiagnosis.grade}` : monthReport.coachDiagnosis.seal}
                </span>
                <span className="block text-[11px] font-space text-[#BAC9CC] mt-1">
                  {isWeekly ? weekReport.statusBadge : monthReport.statusBadge}
                </span>
              </div>
            </div>

            <div className="w-full h-2 bg-[#0B0E14] rounded-full overflow-hidden p-0.5 border border-[#222938]">
              <div
                className="h-full bg-[#00E5FF] rounded-full shadow-[0_0_10px_#00E5FF]"
                style={{
                  width: `${isWeekly ? weekReport.globalScore : monthReport.globalScore}%`,
                }}
              />
            </div>
          </div>

          {/* SECTION 1: TREINOS */}
          <div className="bg-[#12161F] border border-[#222938] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1D2026] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FF9100]/15 border border-[#FF9100]/30 flex items-center justify-center text-[#FF9100]">
                  <Dumbbell className="w-4 h-4" />
                </div>
                <h4 className="font-space font-bold text-sm text-white">
                  1. Progresso nos Treinos
                </h4>
              </div>
              <span className="text-xs font-mono text-[#FF9100] font-bold">
                {isWeekly ? `${weekReport.workoutsAdherence}% da meta` : `+${monthReport.workoutsGrowthPercent}% vs mês anterior`}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-[#0B0E14] border border-[#222938]">
                <span className="text-[10px] text-[#849396] font-space block uppercase">Sessões</span>
                <span className="font-space text-lg font-bold text-white">
                  {isWeekly ? `${weekReport.workoutsTotal}/${weekReport.workoutsTarget}` : `${monthReport.workoutsTotal}`}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#0B0E14] border border-[#222938]">
                <span className="text-[10px] text-[#849396] font-space block uppercase">Volume</span>
                <span className="font-space text-lg font-bold text-white">
                  {isWeekly ? `${weekReport.workoutsMinutes}m` : `${Math.round(monthReport.workoutsTotalMinutes / 60)}h ${monthReport.workoutsTotalMinutes % 60}m`}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#0B0E14] border border-[#222938]">
                <span className="text-[10px] text-[#849396] font-space block uppercase">
                  {isWeekly ? 'Média/Sessão' : 'Dias Ativos'}
                </span>
                <span className="font-space text-lg font-bold text-white">
                  {isWeekly ? `${weekReport.workoutsAvgMinutes} min` : `${monthReport.workoutsActiveDays} dias`}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#BAC9CC] leading-relaxed">
              {isWeekly
                ? `Frequência de estímulo mantida com excelência. O foco predominante foi ${weekReport.topActivity}, garantindo adaptações neurais e sobrecarga progressiva controlada.`
                : `No mês de Outubro, foram acumulados ${monthReport.workoutsActiveDays} dias de treino ativo (${monthReport.workoutsConsistencyPercent}% dos dias do mês). O ritmo foi estável em todas as 4 semanas.`}
            </p>
          </div>

          {/* SECTION 2: ÁGUA */}
          <div className="bg-[#12161F] border border-[#222938] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1D2026] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
                  <Droplets className="w-4 h-4" />
                </div>
                <h4 className="font-space font-bold text-sm text-white">
                  2. Hidratação Corporal
                </h4>
              </div>
              <span className="text-xs font-mono text-[#00E5FF] font-bold">
                {isWeekly ? `${weekReport.waterDaysMetTarget} de 7 dias na meta` : `${monthReport.waterDaysOptimal} dias ideais`}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-[#0B0E14] border border-[#222938]">
                <span className="text-[10px] text-[#849396] font-space block uppercase">Média Diária</span>
                <span className="font-space text-lg font-bold text-white">
                  {isWeekly ? `${weekReport.waterAvgLiters} L` : `${monthReport.waterAvgLiters} L`}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#0B0E14] border border-[#222938]">
                <span className="text-[10px] text-[#849396] font-space block uppercase">Total Ingerido</span>
                <span className="font-space text-lg font-bold text-white">
                  {isWeekly ? `${weekReport.waterTotalLiters} L` : `${monthReport.waterTotalLiters} L`}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#0B0E14] border border-[#222938]">
                <span className="text-[10px] text-[#849396] font-space block uppercase">Meta Diária</span>
                <span className="font-space text-lg font-bold text-[#00E5FF]">3.0 L/dia</span>
              </div>
            </div>

            <p className="text-xs text-[#BAC9CC] leading-relaxed">
              A média de {isWeekly ? weekReport.waterAvgLiters : monthReport.waterAvgLiters}L/dia manteve o transporte de eletrólitos ideal. A desidratação mínima foi prevenida, garantindo menos cãibras e melhor resistência durante as séries de força.
            </p>
          </div>

          {/* SECTION 3: SONO & RECUPERAÇÃO */}
          <div className="bg-[#12161F] border border-[#222938] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#1D2026] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#C084FC]/15 border border-[#C084FC]/30 flex items-center justify-center text-[#C084FC]">
                  <Moon className="w-4 h-4" />
                </div>
                <h4 className="font-space font-bold text-sm text-white">
                  3. Sono & Recuperação Sistêmica
                </h4>
              </div>
              <span className="text-xs font-mono text-[#C084FC] font-bold">
                {isWeekly ? `${weekReport.sleepGoodNights} noites reparadoras` : `Recuperação: ${monthReport.sleepRecoveryScore}%`}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-[#0B0E14] border border-[#222938]">
                <span className="text-[10px] text-[#849396] font-space block uppercase">Média Noite</span>
                <span className="font-space text-lg font-bold text-white">
                  {isWeekly ? `${weekReport.sleepAvgHours} h` : `${monthReport.sleepAvgHours} h`}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#0B0E14] border border-[#222938]">
                <span className="text-[10px] text-[#849396] font-space block uppercase">Total Horas</span>
                <span className="font-space text-lg font-bold text-white">
                  {isWeekly ? `${weekReport.sleepTotalHours} h` : `${monthReport.sleepTotalHours} h`}
                </span>
              </div>
              <div className="p-2 rounded-xl bg-[#0B0E14] border border-[#222938]">
                <span className="text-[10px] text-[#849396] font-space block uppercase">Faixa Ideal</span>
                <span className="font-space text-lg font-bold text-[#C084FC]">7h - 9h</span>
              </div>
            </div>

            <p className="text-xs text-[#BAC9CC] leading-relaxed">
              O sono profundo e o sono REM foram preservados na maioria das noites. A secreção natural do hormônio do crescimento (GH) foi favorecida, permitindo reparação microlesional e prontidão para a próxima sessão.
            </p>
          </div>

          {/* SECTION 4: DIAGNÓSTICO DO PERSONAL WAGNER ROCHA */}
          <div className="bg-[#12161F] border border-[#00E5FF]/40 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#00E5FF]" />
              <h4 className="font-space font-bold text-sm text-white">
                Diagnóstico & Plano de Ação - Coach Wagner Rocha
              </h4>
            </div>

            <blockquote className="text-xs text-[#BAC9CC] italic leading-relaxed border-l-2 border-[#00E5FF] pl-3 py-1 bg-[#0B0E14]/60 rounded-r-lg">
              &ldquo;{isWeekly ? weekReport.coachDiagnosis.analysis : monthReport.coachDiagnosis.analysis}&rdquo;
            </blockquote>

            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-space font-bold uppercase text-[#849396] block">
                {isWeekly ? 'Orientações para a Próxima Semana:' : 'Estratégia para o Próximo Mês:'}
              </span>
              <div className="space-y-1">
                {(isWeekly ? weekReport.coachDiagnosis.tips : monthReport.coachDiagnosis.actionPlan).map((action, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-white">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#00E5FF] shrink-0 mt-0.5" />
                    <span className="text-[11px] leading-tight text-[#E1E2EB]">{action}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="p-4 sm:p-5 border-t border-[#1D2026] flex items-center justify-between gap-3 relative z-10 shrink-0 bg-[#0B0E14]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-[#171B26] hover:bg-[#222938] text-xs font-space font-bold text-[#BAC9CC] hover:text-white transition-colors cursor-pointer"
          >
            Fechar
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 py-2.5 rounded-xl bg-[#00E5FF] hover:bg-[#33EAFF] text-[#0B0E14] font-space font-bold text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(0,229,255,0.4)] flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Copiado com Sucesso!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Relatório Formatado</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
