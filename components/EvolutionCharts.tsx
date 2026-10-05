'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  Dumbbell,
  Droplets,
  Moon,
  Sparkles,
  Info,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Flame,
  Award
} from 'lucide-react';
import { DayEvolutionPoint, MonthWeekSummary } from '@/lib/progress-reports';

interface EvolutionChartsProps {
  period: 'semana' | 'mes';
  days: DayEvolutionPoint[];
  weeks?: MonthWeekSummary[];
  onPeriodChange?: (period: 'semana' | 'mes') => void;
}

type MetricTab = 'triade' | 'treinos' | 'agua' | 'sono';

export const EvolutionCharts: React.FC<EvolutionChartsProps> = ({
  period,
  days,
  weeks = [],
  onPeriodChange,
}) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricTab>('triade');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Default active index to today (or the last day with activity)
  const activeHover = hoveredIndex !== null ? hoveredIndex : days.findIndex((d) => d.isToday) !== -1 ? days.findIndex((d) => d.isToday) : days.length - 1;
  const currentPoint = days[activeHover] || days[0];

  // Helper values for weekly or monthly charts
  const maxWorkoutMinutes = Math.max(75, ...days.map((d) => d.workout.minutes));
  const maxWaterLiters = Math.max(3.5, ...days.map((d) => d.water.liters));
  const maxSleepHours = 10;

  // Chart dimensions for SVG
  const chartHeight = 170;
  const chartWidth = 320;
  const paddingX = 20;
  const paddingY = 24;
  const availableWidth = chartWidth - paddingX * 2;
  const availableHeight = chartHeight - paddingY * 2;

  return (
    <div className="bg-[#12161F] border border-[#222938] rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#A855F7]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Title and Period Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-space font-bold text-sm text-white flex items-center gap-1.5">
              <span>Gráficos de Evolução</span>
              <span className="text-[10px] font-mono text-[#00E5FF] px-1.5 py-0.5 rounded bg-[#00E5FF]/10 border border-[#00E5FF]/20">
                Interativo
              </span>
            </h3>
            <p className="text-[11px] text-[#849396] font-mono">
              Consistência nos 3 pilares corporais
            </p>
          </div>
        </div>

        {/* Period Selector Tabs (Semana vs Mês) */}
        {onPeriodChange && (
          <div className="flex items-center p-0.5 bg-[#0B0E14] border border-[#222938] rounded-xl text-xs font-space">
            <button
              type="button"
              onClick={() => onPeriodChange('semana')}
              className={`px-3 py-1 rounded-lg transition-all ${
                period === 'semana'
                  ? 'bg-[#00E5FF] text-[#0B0E14] font-bold shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                  : 'text-[#849396] hover:text-white'
              }`}
            >
              Semanal
            </button>
            <button
              type="button"
              onClick={() => onPeriodChange('mes')}
              className={`px-3 py-1 rounded-lg transition-all ${
                period === 'mes'
                  ? 'bg-[#00E5FF] text-[#0B0E14] font-bold shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                  : 'text-[#849396] hover:text-white'
              }`}
            >
              Mensal
            </button>
          </div>
        )}
      </div>

      {/* Metric Selector Buttons (Pillars) */}
      <div className="grid grid-cols-4 gap-1 p-1 bg-[#0B0E14] border border-[#222938] rounded-xl relative z-10">
        <button
          type="button"
          onClick={() => setSelectedMetric('triade')}
          className={`py-1.5 px-1 rounded-lg text-[11px] font-space font-medium transition-all flex items-center justify-center gap-1 ${
            selectedMetric === 'triade'
              ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/60 font-bold shadow-[0_0_10px_rgba(0,229,255,0.2)]'
              : 'text-[#849396] hover:text-white'
          }`}
        >
          <Sparkles className="w-3 h-3 text-[#00E5FF]" />
          <span>Tríade</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedMetric('treinos')}
          className={`py-1.5 px-1 rounded-lg text-[11px] font-space font-medium transition-all flex items-center justify-center gap-1 ${
            selectedMetric === 'treinos'
              ? 'bg-[#FF9100]/20 text-[#FF9100] border border-[#FF9100]/60 font-bold shadow-[0_0_10px_rgba(255,145,0,0.2)]'
              : 'text-[#849396] hover:text-white'
          }`}
        >
          <Dumbbell className="w-3 h-3 text-[#FF9100]" />
          <span>Treinos</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedMetric('agua')}
          className={`py-1.5 px-1 rounded-lg text-[11px] font-space font-medium transition-all flex items-center justify-center gap-1 ${
            selectedMetric === 'agua'
              ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/60 font-bold shadow-[0_0_10px_rgba(0,229,255,0.2)]'
              : 'text-[#849396] hover:text-white'
          }`}
        >
          <Droplets className="w-3 h-3 text-[#00E5FF]" />
          <span>Água</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedMetric('sono')}
          className={`py-1.5 px-1 rounded-lg text-[11px] font-space font-medium transition-all flex items-center justify-center gap-1 ${
            selectedMetric === 'sono'
              ? 'bg-[#A855F7]/20 text-[#C084FC] border border-[#A855F7]/60 font-bold shadow-[0_0_10px_rgba(168,85,247,0.2)]'
              : 'text-[#849396] hover:text-white'
          }`}
        >
          <Moon className="w-3 h-3 text-[#C084FC]" />
          <span>Sono</span>
        </button>
      </div>

      {/* Highlighted Tooltip Inspector Card */}
      {currentPoint && (
        <div className="p-3 rounded-xl bg-[#0B0E14] border border-[#222938] flex items-center justify-between text-xs relative z-10 transition-all">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-white px-2 py-0.5 rounded bg-[#171B26] border border-[#222938]">
              {currentPoint.dayLabel} {currentPoint.isToday && '⭐ HOJE'}
            </span>
            <span className="text-[#849396] text-[11px]">
              Score: <strong className="text-[#00E5FF] font-mono">{currentPoint.integratedScore}/100</strong>
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-[#FF9100] flex items-center gap-1" title="Treino">
              <Dumbbell className="w-3 h-3" />
              {currentPoint.workout.completed ? `${currentPoint.workout.minutes}m` : 'Descanso'}
            </span>
            <span className="text-[#00E5FF] flex items-center gap-1" title="Água">
              <Droplets className="w-3 h-3" />
              {currentPoint.water.liters.toFixed(1)}L
            </span>
            <span className="text-[#C084FC] flex items-center gap-1" title="Sono">
              <Moon className="w-3 h-3" />
              {currentPoint.sleep.hours.toFixed(1)}h
            </span>
          </div>
        </div>
      )}

      {/* SVG Chart Container */}
      <div className="relative w-full pt-1">
        {/* Weekly View (7 Days) */}
        {period === 'semana' && (
          <div className="w-full">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-44 overflow-visible select-none"
            >
              <defs>
                <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="orangeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF9100" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#FF9100" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#A855F7" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#A855F7" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="scoreAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00E5FF" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#00E5FF" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Horizontal Lines */}
              <line
                x1={paddingX}
                y1={paddingY}
                x2={chartWidth - paddingX}
                y2={paddingY}
                stroke="#222938"
                strokeDasharray="3 3"
              />
              <line
                x1={paddingX}
                y1={paddingY + availableHeight / 2}
                x2={chartWidth - paddingX}
                y2={paddingY + availableHeight / 2}
                stroke="#1B212D"
                strokeDasharray="3 3"
              />
              <line
                x1={paddingX}
                y1={paddingY + availableHeight}
                x2={chartWidth - paddingX}
                y2={paddingY + availableHeight}
                stroke="#222938"
              />

              {/* Reference Meta Line for specific metrics */}
              {selectedMetric === 'agua' && (
                <g>
                  {/* Meta 3.0L line */}
                  <line
                    x1={paddingX}
                    y1={paddingY + availableHeight * (1 - 3.0 / maxWaterLiters)}
                    x2={chartWidth - paddingX}
                    y2={paddingY + availableHeight * (1 - 3.0 / maxWaterLiters)}
                    stroke="#00E5FF"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.6"
                  />
                  <text
                    x={chartWidth - paddingX}
                    y={paddingY + availableHeight * (1 - 3.0 / maxWaterLiters) - 4}
                    fill="#00E5FF"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    Meta: 3.0 L
                  </text>
                </g>
              )}

              {selectedMetric === 'sono' && (
                <g>
                  {/* Meta 8.0h line */}
                  <line
                    x1={paddingX}
                    y1={paddingY + availableHeight * (1 - 8.0 / maxSleepHours)}
                    x2={chartWidth - paddingX}
                    y2={paddingY + availableHeight * (1 - 8.0 / maxSleepHours)}
                    stroke="#C084FC"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                    opacity="0.6"
                  />
                  <text
                    x={chartWidth - paddingX}
                    y={paddingY + availableHeight * (1 - 8.0 / maxSleepHours) - 4}
                    fill="#C084FC"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    Ideal: 8.0 h
                  </text>
                </g>
              )}

              {/* BARS / SHAPES FOR THE 7 DAYS */}
              {days.map((d, i) => {
                const stepX = availableWidth / (days.length - 1);
                const cx = paddingX + i * stepX;
                const isHovered = activeHover === i;
                const barWidth = 24;

                // 1. TRÍADE SCORE VIEW
                if (selectedMetric === 'triade') {
                  const barH = (d.integratedScore / 100) * availableHeight;
                  const barY = paddingY + availableHeight - barH;

                  return (
                    <g
                      key={`triade-${d.dayNum}`}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onClick={() => setHoveredIndex(i)}
                      className="cursor-pointer"
                    >
                      {/* Hover column background */}
                      {isHovered && (
                        <rect
                          x={cx - barWidth / 2 - 4}
                          y={paddingY}
                          width={barWidth + 8}
                          height={availableHeight}
                          fill="#00E5FF"
                          opacity="0.08"
                          rx="6"
                        />
                      )}

                      {/* Background slot */}
                      <rect
                        x={cx - barWidth / 2}
                        y={paddingY}
                        width={barWidth}
                        height={availableHeight}
                        fill="#171B26"
                        rx="5"
                      />

                      {/* Filled Score bar */}
                      <rect
                        x={cx - barWidth / 2}
                        y={barY}
                        width={barWidth}
                        height={barH}
                        fill={d.integratedScore >= 80 ? 'url(#cyanGrad)' : '#00838F'}
                        stroke={isHovered ? '#00E5FF' : '#00E5FF88'}
                        strokeWidth={isHovered ? 2 : 1}
                        rx="5"
                      />

                      {/* Top value */}
                      <text
                        x={cx}
                        y={barY - 5}
                        fill={isHovered ? '#00E5FF' : '#849396'}
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {d.integratedScore}
                      </text>

                      {/* Bottom Day label */}
                      <text
                        x={cx}
                        y={chartHeight - 4}
                        fill={d.isToday ? '#00E5FF' : '#BAC9CC'}
                        fontSize="10"
                        fontWeight={d.isToday ? 'bold' : 'normal'}
                        fontFamily="var(--font-space, sans-serif)"
                        textAnchor="middle"
                      >
                        {d.dayShort}
                      </text>
                    </g>
                  );
                }

                // 2. TREINOS VIEW (Minutes trained)
                if (selectedMetric === 'treinos') {
                  const minutes = d.workout.minutes;
                  const barH = minutes > 0 ? (minutes / maxWorkoutMinutes) * availableHeight : 4;
                  const barY = paddingY + availableHeight - barH;

                  return (
                    <g
                      key={`workout-${d.dayNum}`}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onClick={() => setHoveredIndex(i)}
                      className="cursor-pointer"
                    >
                      {/* Hover column background */}
                      {isHovered && (
                        <rect
                          x={cx - barWidth / 2 - 4}
                          y={paddingY}
                          width={barWidth + 8}
                          height={availableHeight}
                          fill="#FF9100"
                          opacity="0.08"
                          rx="6"
                        />
                      )}

                      {/* Background slot */}
                      <rect
                        x={cx - barWidth / 2}
                        y={paddingY}
                        width={barWidth}
                        height={availableHeight}
                        fill="#171B26"
                        rx="5"
                      />

                      {/* Filled Workout bar */}
                      <rect
                        x={cx - barWidth / 2}
                        y={barY}
                        width={barWidth}
                        height={barH}
                        fill={d.workout.completed ? 'url(#orangeGrad)' : '#222938'}
                        stroke={d.workout.completed ? (isHovered ? '#FF9100' : '#FF9100aa') : '#333D4F'}
                        strokeWidth={isHovered ? 2 : 1}
                        rx="5"
                      />

                      {/* Top value */}
                      <text
                        x={cx}
                        y={barY - 5}
                        fill={d.workout.completed ? (isHovered ? '#FF9100' : '#BAC9CC') : '#556172'}
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {minutes > 0 ? `${minutes}m` : '—'}
                      </text>

                      {/* Bottom Day label */}
                      <text
                        x={cx}
                        y={chartHeight - 4}
                        fill={d.isToday ? '#FF9100' : '#BAC9CC'}
                        fontSize="10"
                        fontWeight={d.isToday ? 'bold' : 'normal'}
                        fontFamily="var(--font-space, sans-serif)"
                        textAnchor="middle"
                      >
                        {d.dayShort}
                      </text>
                    </g>
                  );
                }

                // 3. ÁGUA VIEW (Liters)
                if (selectedMetric === 'agua') {
                  const liters = d.water.liters;
                  const barH = (liters / maxWaterLiters) * availableHeight;
                  const barY = paddingY + availableHeight - barH;

                  return (
                    <g
                      key={`water-${d.dayNum}`}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onClick={() => setHoveredIndex(i)}
                      className="cursor-pointer"
                    >
                      {/* Hover column background */}
                      {isHovered && (
                        <rect
                          x={cx - barWidth / 2 - 4}
                          y={paddingY}
                          width={barWidth + 8}
                          height={availableHeight}
                          fill="#00E5FF"
                          opacity="0.08"
                          rx="6"
                        />
                      )}

                      {/* Background slot */}
                      <rect
                        x={cx - barWidth / 2}
                        y={paddingY}
                        width={barWidth}
                        height={availableHeight}
                        fill="#171B26"
                        rx="5"
                      />

                      {/* Filled Water bar */}
                      <rect
                        x={cx - barWidth / 2}
                        y={barY}
                        width={barWidth}
                        height={barH}
                        fill="url(#cyanGrad)"
                        stroke={isHovered ? '#00E5FF' : '#00E5FFaa'}
                        strokeWidth={isHovered ? 2 : 1}
                        rx="5"
                      />

                      {/* Top value */}
                      <text
                        x={cx}
                        y={barY - 5}
                        fill={isHovered ? '#00E5FF' : '#BAC9CC'}
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {liters.toFixed(1)}L
                      </text>

                      {/* Bottom Day label */}
                      <text
                        x={cx}
                        y={chartHeight - 4}
                        fill={d.isToday ? '#00E5FF' : '#BAC9CC'}
                        fontSize="10"
                        fontWeight={d.isToday ? 'bold' : 'normal'}
                        fontFamily="var(--font-space, sans-serif)"
                        textAnchor="middle"
                      >
                        {d.dayShort}
                      </text>
                    </g>
                  );
                }

                // 4. SONO VIEW (Hours)
                if (selectedMetric === 'sono') {
                  const hours = d.sleep.hours;
                  const barH = (hours / maxSleepHours) * availableHeight;
                  const barY = paddingY + availableHeight - barH;

                  return (
                    <g
                      key={`sleep-${d.dayNum}`}
                      onMouseEnter={() => setHoveredIndex(i)}
                      onClick={() => setHoveredIndex(i)}
                      className="cursor-pointer"
                    >
                      {/* Hover column background */}
                      {isHovered && (
                        <rect
                          x={cx - barWidth / 2 - 4}
                          y={paddingY}
                          width={barWidth + 8}
                          height={availableHeight}
                          fill="#A855F7"
                          opacity="0.08"
                          rx="6"
                        />
                      )}

                      {/* Background slot */}
                      <rect
                        x={cx - barWidth / 2}
                        y={paddingY}
                        width={barWidth}
                        height={availableHeight}
                        fill="#171B26"
                        rx="5"
                      />

                      {/* Filled Sleep bar */}
                      <rect
                        x={cx - barWidth / 2}
                        y={barY}
                        width={barWidth}
                        height={barH}
                        fill="url(#purpleGrad)"
                        stroke={isHovered ? '#C084FC' : '#A855F7aa'}
                        strokeWidth={isHovered ? 2 : 1}
                        rx="5"
                      />

                      {/* Top value */}
                      <text
                        x={cx}
                        y={barY - 5}
                        fill={isHovered ? '#C084FC' : '#BAC9CC'}
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {hours.toFixed(1)}h
                      </text>

                      {/* Bottom Day label */}
                      <text
                        x={cx}
                        y={chartHeight - 4}
                        fill={d.isToday ? '#C084FC' : '#BAC9CC'}
                        fontSize="10"
                        fontWeight={d.isToday ? 'bold' : 'normal'}
                        fontFamily="var(--font-space, sans-serif)"
                        textAnchor="middle"
                      >
                        {d.dayShort}
                      </text>
                    </g>
                  );
                }

                return null;
              })}
            </svg>
          </div>
        )}

        {/* Monthly View (4 Weeks Breakdown + Trend) */}
        {period === 'mes' && (
          <div className="space-y-3">
            {/* 4 Weeks Bars */}
            <div className="grid grid-cols-4 gap-2">
              {weeks.map((w, idx) => (
                <div
                  key={`month-week-${w.weekNumber}`}
                  className="p-2.5 rounded-xl bg-[#0B0E14] border border-[#222938] hover:border-[#00E5FF]/40 transition-all text-center space-y-1"
                >
                  <span className="text-[10px] font-space font-bold text-[#849396] block truncate">
                    Semana {w.weekNumber}
                  </span>

                  <div className="font-space text-lg font-bold text-white">
                    {selectedMetric === 'triade' && (
                      <span className="text-[#00E5FF]">{w.consistencyScore}%</span>
                    )}
                    {selectedMetric === 'treinos' && (
                      <span className="text-[#FF9100]">{w.workoutsCount} treinos</span>
                    )}
                    {selectedMetric === 'agua' && (
                      <span className="text-[#00E5FF]">{w.waterAvg} L/dia</span>
                    )}
                    {selectedMetric === 'sono' && (
                      <span className="text-[#C084FC]">{w.sleepAvg} h/dia</span>
                    )}
                  </div>

                  {/* Progress fill mini bar */}
                  <div className="w-full h-1.5 bg-[#171B26] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${w.consistencyScore}%`,
                        backgroundColor:
                          selectedMetric === 'treinos'
                            ? '#FF9100'
                            : selectedMetric === 'sono'
                            ? '#C084FC'
                            : '#00E5FF',
                      }}
                    />
                  </div>

                  <span className="text-[9px] font-mono text-[#BAC9CC] block">
                    {w.workoutsMinutes} min tot.
                  </span>
                </div>
              ))}
            </div>

            {/* Monthly Trend Heatwave (All 31 Days) */}
            <div className="p-3 rounded-xl bg-[#0B0E14] border border-[#222938] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-space text-white font-bold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" />
                  Evolução Diária em Outubro (31 Dias)
                </span>
                <span className="font-mono text-[10px] text-[#00E5FF]">
                  {days.filter((d) => d.workout.completed).length} dias ativos
                </span>
              </div>

              {/* 31 days micro bars */}
              <div className="grid grid-cols-31 gap-0.5 h-10 items-end">
                {days.map((d, idx) => {
                  let barColor = '#171B26';
                  let barHeight = '15%';

                  if (selectedMetric === 'triade') {
                    barHeight = `${Math.max(15, d.integratedScore)}%`;
                    barColor =
                      d.integratedScore >= 80
                        ? '#00E5FF'
                        : d.integratedScore >= 60
                        ? '#00838F'
                        : '#171B26';
                  } else if (selectedMetric === 'treinos') {
                    barHeight = d.workout.completed ? `${Math.min(100, (d.workout.minutes / 60) * 100)}%` : '15%';
                    barColor = d.workout.completed ? '#FF9100' : '#171B26';
                  } else if (selectedMetric === 'agua') {
                    barHeight = `${Math.min(100, (d.water.liters / 3.5) * 100)}%`;
                    barColor = d.water.liters >= 3.0 ? '#00E5FF' : d.water.liters >= 2.0 ? '#00838F' : '#FF9100';
                  } else if (selectedMetric === 'sono') {
                    barHeight = `${Math.min(100, (d.sleep.hours / 9.0) * 100)}%`;
                    barColor = d.sleep.hours >= 7.5 ? '#C084FC' : d.sleep.hours >= 6.5 ? '#7E22CE' : '#FF9100';
                  }

                  return (
                    <div
                      key={`micro-${d.dayNum}`}
                      onClick={() => setHoveredIndex(idx)}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      title={`Dia ${d.dayNum}: ${d.workout.completed ? `${d.workout.minutes}m treino` : 'Descanso'} • ${d.water.liters.toFixed(1)}L água • ${d.sleep.hours.toFixed(1)}h sono`}
                      className={`h-full flex items-end cursor-pointer group`}
                    >
                      <div
                        className={`w-full rounded-t-sm transition-all ${
                          d.isToday ? 'ring-1 ring-white' : ''
                        }`}
                        style={{ height: barHeight, backgroundColor: barColor }}
                      />
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[9px] font-mono text-[#849396] pt-1">
                <span>01 Out</span>
                <span>15 Out</span>
                <span className="text-[#00E5FF]">24 Out (Hoje)</span>
                <span>31 Out</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KPI Performance Bar */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#1D2026]">
        <div className="text-center">
          <span className="text-[10px] font-space text-[#849396] uppercase block">
            {selectedMetric === 'treinos' ? 'Total Minutos' : selectedMetric === 'agua' ? 'Média Água' : selectedMetric === 'sono' ? 'Média Sono' : 'Consistência'}
          </span>
          <span className="font-space text-sm font-bold text-white">
            {selectedMetric === 'treinos' && `${days.reduce((s, d) => s + d.workout.minutes, 0)} min`}
            {selectedMetric === 'agua' && `${(days.reduce((s, d) => s + d.water.liters, 0) / days.length).toFixed(1)} L/dia`}
            {selectedMetric === 'sono' && `${(days.reduce((s, d) => s + d.sleep.hours, 0) / days.length).toFixed(1)} h/noite`}
            {selectedMetric === 'triade' && `${Math.round(days.reduce((s, d) => s + d.integratedScore, 0) / days.length)}% Tríade`}
          </span>
        </div>

        <div className="text-center border-x border-[#1D2026]">
          <span className="text-[10px] font-space text-[#849396] uppercase block">
            Pico Registrado
          </span>
          <span className="font-space text-sm font-bold text-[#00E5FF]">
            {selectedMetric === 'treinos' && `${Math.max(...days.map((d) => d.workout.minutes))} min`}
            {selectedMetric === 'agua' && `${Math.max(...days.map((d) => d.water.liters)).toFixed(1)} L`}
            {selectedMetric === 'sono' && `${Math.max(...days.map((d) => d.sleep.hours)).toFixed(1)} h`}
            {selectedMetric === 'triade' && `${Math.max(...days.map((d) => d.integratedScore))}/100`}
          </span>
        </div>

        <div className="text-center">
          <span className="text-[10px] font-space text-[#849396] uppercase block">
            Meta do Protocolo
          </span>
          <span className="font-space text-sm font-bold text-[#BAC9CC]">
            {selectedMetric === 'treinos' && '4 sessões/sem'}
            {selectedMetric === 'agua' && '3.0 L/dia'}
            {selectedMetric === 'sono' && '8.0 h/noite'}
            {selectedMetric === 'triade' && '>= 80% Elite'}
          </span>
        </div>
      </div>
    </div>
  );
};
