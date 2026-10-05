import { WorkoutLog, UserStats } from './types';
import { SleepData } from './sleep-store';

export interface DayEvolutionPoint {
  date: string;
  dayNum: number;
  dayShort: string; // DOM, SEG, TER, QUA...
  dayLabel: string; // Seg 20, Ter 21...
  isToday: boolean;
  workout: {
    completed: boolean;
    minutes: number;
    type?: string;
    sensation?: string;
  };
  water: {
    liters: number;
    target: number;
    percent: number;
  };
  sleep: {
    hours: number;
    target: number;
    quality: 'boa' | 'regular' | 'ruim';
    percent: number;
  };
  integratedScore: number; // 0 to 100
}

export interface WeekReportData {
  periodLabel: string;
  days: DayEvolutionPoint[];
  workoutsTotal: number;
  workoutsTarget: number;
  workoutsMinutes: number;
  workoutsAvgMinutes: number;
  workoutsAdherence: number; // %
  topActivity: string;
  waterTotalLiters: number;
  waterAvgLiters: number;
  waterDaysMetTarget: number;
  waterAdherence: number; // %
  sleepAvgHours: number;
  sleepTotalHours: number;
  sleepGoodNights: number;
  sleepAdherence: number; // %
  globalScore: number;
  statusBadge: string;
  coachDiagnosis: {
    title: string;
    highlight: string;
    analysis: string;
    tips: string[];
    grade: string;
  };
}

export interface MonthWeekSummary {
  weekNumber: number;
  weekLabel: string;
  workoutsCount: number;
  workoutsMinutes: number;
  waterAvg: number;
  sleepAvg: number;
  consistencyScore: number;
}

export interface MonthReportData {
  periodLabel: string;
  monthName: string;
  days: DayEvolutionPoint[];
  weeks: MonthWeekSummary[];
  workoutsTotal: number;
  workoutsPreviousTotal: number;
  workoutsGrowthPercent: number;
  workoutsTotalMinutes: number;
  workoutsActiveDays: number;
  workoutsConsistencyPercent: number;
  waterTotalLiters: number;
  waterAvgLiters: number;
  waterDaysOptimal: number;
  waterGrowthPercent: number;
  sleepAvgHours: number;
  sleepTotalHours: number;
  sleepOptimalNights: number;
  sleepRecoveryScore: number;
  globalScore: number;
  statusBadge: string;
  coachDiagnosis: {
    title: string;
    highlight: string;
    analysis: string;
    strengths: string[];
    actionPlan: string[];
    seal: string;
  };
}

const DOW_SHORT = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

/**
 * Score integrado diário baseado na tríade Treino, Água e Sono
 */
export function calculateIntegratedDailyScore(
  workoutDone: boolean,
  workoutMinutes: number,
  waterLiters: number,
  sleepHours: number,
  sleepQuality: 'boa' | 'regular' | 'ruim'
): number {
  if (!workoutDone && waterLiters === 0 && sleepHours === 0) {
    return 0;
  }

  let score = 0;
  if (workoutDone && workoutMinutes >= 30) {
    score += 40;
  } else if (workoutDone) {
    score += 25;
  }

  // Água: meta 3.0L (30 pts max)
  if (waterLiters > 0) {
    const waterRatio = Math.min(1.2, waterLiters / 3.0);
    score += Math.round(waterRatio * 25);
    if (waterLiters >= 3.0) score += 5;
  }

  // Sono: meta 8.0h (30 pts max)
  if (sleepHours > 0) {
    const sleepRatio = Math.min(1.2, sleepHours / 8.0);
    score += Math.round(sleepRatio * 22);
    if (sleepQuality === 'boa') score += 8;
    else if (sleepQuality === 'regular') score += 4;
  }

  return Math.min(100, Math.round(score));
}

/**
 * Relatório semanal dinâmico baseado na data atual e nos treinos REAIS do usuário
 */
export function getWeeklyReport(
  todayWaterLiters: number,
  todaySleepData: SleepData,
  workouts: WorkoutLog[],
  activeDays: number[]
): WeekReportData {
  const now = new Date();
  const currentDayOfWeek = now.getDay(); // 0 Dom, 1 Seg...
  const todayDateNum = now.getDate();

  // Início da semana (Segunda-feira)
  const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const mondayDate = new Date(now);
  mondayDate.setDate(now.getDate() + mondayOffset);

  const days: DayEvolutionPoint[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(mondayDate);
    d.setDate(mondayDate.getDate() + i);

    const dayNum = d.getDate();
    const isToday = d.toDateString() === now.toDateString();
    const dateStr = d.toISOString().split('T')[0];

    // Verifica se há treino registrado pelo usuário nesta data
    const matchedWorkout = workouts.find((w) => {
      if (w.date === dateStr) return true;
      if (activeDays.includes(dayNum) && (isToday || w.timestamp && new Date(w.timestamp).toDateString() === d.toDateString())) return true;
      return false;
    });

    const hasWorkout = Boolean(matchedWorkout);
    const workoutMinutes = matchedWorkout ? matchedWorkout.durationMinutes : 0;
    const waterLiters = isToday ? todayWaterLiters : 0;
    const sleepHours = isToday ? todaySleepData.hours : 0;
    const sleepQuality = isToday ? todaySleepData.quality : 'boa';

    const score = calculateIntegratedDailyScore(
      hasWorkout,
      workoutMinutes,
      waterLiters,
      sleepHours,
      sleepQuality
    );

    days.push({
      date: dateStr,
      dayNum,
      dayShort: DOW_SHORT[d.getDay()],
      dayLabel: `${DOW_SHORT[d.getDay()]} ${dayNum}`,
      isToday,
      workout: {
        completed: hasWorkout,
        minutes: workoutMinutes,
        type: matchedWorkout?.activityType || 'Treino',
        sensation: matchedWorkout?.sensation || 'bom',
      },
      water: {
        liters: waterLiters,
        target: 3.0,
        percent: Math.min(100, Math.round((waterLiters / 3.0) * 100)),
      },
      sleep: {
        hours: sleepHours,
        target: 8.0,
        quality: sleepQuality,
        percent: Math.min(100, Math.round((sleepHours / 8.0) * 100)),
      },
      integratedScore: score,
    });
  }

  const completedWorkoutsCount = days.filter((d) => d.workout.completed).length;
  const totalWorkoutMinutes = days.reduce((sum, d) => sum + d.workout.minutes, 0);
  const avgWorkoutMinutes =
    completedWorkoutsCount > 0 ? Math.round(totalWorkoutMinutes / completedWorkoutsCount) : 0;
  const targetWorkouts = 4;
  const workoutAdherence = Math.min(100, Math.round((completedWorkoutsCount / targetWorkouts) * 100));

  const totalWater = Math.round(days.reduce((sum, d) => sum + d.water.liters, 0) * 10) / 10;
  const avgWater = Math.round((totalWater / days.length) * 10) / 10;
  const waterDaysMet = days.filter((d) => d.water.liters >= 2.5).length;
  const waterAdherence = Math.round((waterDaysMet / days.length) * 100);

  const totalSleepHours = Math.round(days.reduce((sum, d) => sum + d.sleep.hours, 0) * 10) / 10;
  const avgSleepHours = Math.round((totalSleepHours / days.length) * 10) / 10;
  const sleepGoodNights = days.filter((d) => d.sleep.hours >= 7.0 && d.sleep.quality === 'boa').length;
  const sleepAdherence = Math.round((sleepGoodNights / days.length) * 100);

  const avgGlobalScore = Math.round(
    days.reduce((sum, d) => sum + d.integratedScore, 0) / days.length
  );

  let statusBadge = 'Início de Ciclo 🎯';
  if (completedWorkoutsCount >= 4) statusBadge = 'Alta Performance 🚀';
  else if (completedWorkoutsCount >= 2) statusBadge = 'Ritmo Sólido 🔥';
  else if (completedWorkoutsCount === 1) statusBadge = 'Primeiro Passo Dado 💪';

  const sundayDate = new Date(mondayDate);
  sundayDate.setDate(mondayDate.getDate() + 6);
  const periodLabel = `${mondayDate.getDate()} a ${sundayDate.getDate()} de ${MONTHS_PT[mondayDate.getMonth()]}, ${mondayDate.getFullYear()}`;

  // Se o usuário ainda não registrou nada:
  if (completedWorkoutsCount === 0 && totalWater === 0 && totalSleepHours === 0) {
    return {
      periodLabel,
      days,
      workoutsTotal: 0,
      workoutsTarget: targetWorkouts,
      workoutsMinutes: 0,
      workoutsAvgMinutes: 0,
      workoutsAdherence: 0,
      topActivity: 'Aguardando primeiro treino',
      waterTotalLiters: 0,
      waterAvgLiters: 0,
      waterDaysMetTarget: 0,
      waterAdherence: 0,
      sleepAvgHours: 0,
      sleepTotalHours: 0,
      sleepGoodNights: 0,
      sleepAdherence: 0,
      globalScore: 0,
      statusBadge: 'Novo Atleta 🎯',
      coachDiagnosis: {
        title: 'Diagnóstico Semanal - Coach Wagner Rocha',
        highlight: 'Aguardando Primeiro Registro de Treino',
        analysis: 'Nenhum treino registrado nesta semana ainda. Seu diagnóstico personalizado e análise de performance serão gerados automaticamente conforme você registrar seus treinos, ingestão de água e horas de sono.',
        tips: [
          'Clique no botão "+ Treino" para registrar seu primeiro treino.',
          'Mantenha uma garrafa de água por perto e adicione seus copos ao longo do dia.',
          'Registre suas horas de sono para acompanhar sua recuperação celular.',
        ],
        grade: '—',
      },
    };
  }

  return {
    periodLabel,
    days,
    workoutsTotal: completedWorkoutsCount,
    workoutsTarget: targetWorkouts,
    workoutsMinutes: totalWorkoutMinutes,
    workoutsAvgMinutes: avgWorkoutMinutes,
    workoutsAdherence: workoutAdherence,
    topActivity: workouts[0]?.activityType || 'Musculação',
    waterTotalLiters: totalWater,
    waterAvgLiters: avgWater,
    waterDaysMetTarget: waterDaysMet,
    waterAdherence,
    sleepAvgHours: avgSleepHours,
    sleepTotalHours: totalSleepHours,
    sleepGoodNights,
    sleepAdherence,
    globalScore: avgGlobalScore,
    statusBadge,
    coachDiagnosis: {
      title: 'Diagnóstico Semanal - Coach Wagner Rocha',
      highlight:
        completedWorkoutsCount >= targetWorkouts
          ? 'Meta semanal atingida com excelência!'
          : `Você completou ${completedWorkoutsCount} de ${targetWorkouts} treinos planejados.`,
      analysis: `Você acumulou ${totalWorkoutMinutes} minutos de estímulo com média de ${avgWorkoutMinutes} min por sessão. Hidratação acumulada de ${totalWater}L e média de descanso de ${avgSleepHours}h/noite. Continue com consistência na metodologia Wagner Rocha.`,
      tips: [
        'Mantenha a ingestão de água antes e durante os treinos.',
        'Nos dias de treino intenso, priorize 7h a 8h de sono.',
        'Final de semana: faça mobilidade ativa e recupere energia.',
      ],
      grade: avgGlobalScore >= 80 ? 'A+' : avgGlobalScore >= 50 ? 'B' : 'Em evolução',
    },
  };
}

/**
 * Relatório mensal dinâmico baseado no mês atual e nos treinos REAIS do usuário
 */
export function getMonthlyReport(
  todayWaterLiters: number,
  todaySleepData: SleepData,
  workouts: WorkoutLog[],
  activeDays: number[],
  stats: UserStats
): MonthReportData {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthName = `${MONTHS_PT[currentMonth]} ${currentYear}`;
  const periodLabel = `01 a ${daysInMonth} de ${MONTHS_PT[currentMonth]}, ${currentYear}`;

  const days: DayEvolutionPoint[] = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = day === now.getDate();
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const matchedWorkout = workouts.find((w) => w.date === dateStr);

    const hasWorkout = Boolean(matchedWorkout);
    const workoutMinutes = matchedWorkout ? matchedWorkout.durationMinutes : 0;
    const waterLiters = isToday ? todayWaterLiters : 0;
    const sleepHours = isToday ? todaySleepData.hours : 0;

    const score = calculateIntegratedDailyScore(
      hasWorkout,
      workoutMinutes,
      waterLiters,
      sleepHours,
      'boa'
    );

    const d = new Date(currentYear, currentMonth, day);

    days.push({
      date: dateStr,
      dayNum: day,
      dayShort: DOW_SHORT[d.getDay()],
      dayLabel: `${day} ${MONTHS_PT[currentMonth].slice(0, 3)}`,
      isToday,
      workout: {
        completed: hasWorkout,
        minutes: workoutMinutes,
        type: matchedWorkout?.activityType || 'Musculação',
        sensation: matchedWorkout?.sensation || 'bom',
      },
      water: {
        liters: waterLiters,
        target: 3.0,
        percent: Math.min(100, Math.round((waterLiters / 3.0) * 100)),
      },
      sleep: {
        hours: sleepHours,
        target: 8.0,
        quality: 'boa',
        percent: Math.min(100, Math.round((sleepHours / 8.0) * 100)),
      },
      integratedScore: score,
    });
  }

  const workoutsTotal = workouts.length;
  const activeDaysCount = activeDays.length;
  const totalWorkoutMinutes = workouts.reduce((sum, w) => sum + w.durationMinutes, 0);

  const weeks: MonthWeekSummary[] = [
    {
      weekNumber: 1,
      weekLabel: 'Semana 1',
      workoutsCount: workouts.filter(w => {
        const d = new Date(w.date || w.timestamp).getDate();
        return d >= 1 && d <= 7;
      }).length,
      workoutsMinutes: 0,
      waterAvg: 0,
      sleepAvg: 0,
      consistencyScore: 0,
    },
    {
      weekNumber: 2,
      weekLabel: 'Semana 2',
      workoutsCount: workouts.filter(w => {
        const d = new Date(w.date || w.timestamp).getDate();
        return d >= 8 && d <= 14;
      }).length,
      workoutsMinutes: 0,
      waterAvg: 0,
      sleepAvg: 0,
      consistencyScore: 0,
    },
    {
      weekNumber: 3,
      weekLabel: 'Semana 3',
      workoutsCount: workouts.filter(w => {
        const d = new Date(w.date || w.timestamp).getDate();
        return d >= 15 && d <= 21;
      }).length,
      workoutsMinutes: 0,
      waterAvg: 0,
      sleepAvg: 0,
      consistencyScore: 0,
    },
    {
      weekNumber: 4,
      weekLabel: 'Semana 4',
      workoutsCount: workouts.filter(w => {
        const d = new Date(w.date || w.timestamp).getDate();
        return d >= 22 && d <= 31;
      }).length,
      workoutsMinutes: 0,
      waterAvg: 0,
      sleepAvg: 0,
      consistencyScore: 0,
    },
  ];

  // Se o usuário ainda não tiver treinos
  if (workoutsTotal === 0) {
    return {
      periodLabel,
      monthName,
      days,
      weeks,
      workoutsTotal: 0,
      workoutsPreviousTotal: 0,
      workoutsGrowthPercent: 0,
      workoutsTotalMinutes: 0,
      workoutsActiveDays: 0,
      workoutsConsistencyPercent: 0,
      waterTotalLiters: todayWaterLiters,
      waterAvgLiters: todayWaterLiters,
      waterDaysOptimal: todayWaterLiters >= 2.5 ? 1 : 0,
      waterGrowthPercent: 0,
      sleepAvgHours: todaySleepData.hours,
      sleepTotalHours: todaySleepData.hours,
      sleepOptimalNights: todaySleepData.hours >= 7 ? 1 : 0,
      sleepRecoveryScore: 0,
      globalScore: 0,
      statusBadge: 'Início de Ciclo 🎯',
      coachDiagnosis: {
        title: 'Relatório Mensal - Team Wagner',
        highlight: 'Seu primeiro mês de treino está começando!',
        analysis: 'Seu histórico mensal está limpo e pronto para receber suas sessões de treino. Acompanhe aqui o volume total de horas sob tensão, percentual de consistência e dias ativos no calendário conforme for registrando.',
        strengths: [
          'Cadastro ativo no Team Wagner.',
          'Plano e metas configurados.',
        ],
        actionPlan: [
          'Preencha seus treinos conforme realizar cada sessão.',
          'Bata sua meta de água diária.',
          'Mantenha consistência mínima de 4 treinos por semana.',
        ],
        seal: 'Novo Aluno ⚡',
      },
    };
  }

  const consistencyPercent = Math.round((activeDaysCount / daysInMonth) * 100);

  return {
    periodLabel,
    monthName,
    days,
    weeks,
    workoutsTotal,
    workoutsPreviousTotal: stats.monthlyPreviousWorkouts || 0,
    workoutsGrowthPercent: 10,
    workoutsTotalMinutes: totalWorkoutMinutes,
    workoutsActiveDays: activeDaysCount,
    workoutsConsistencyPercent: consistencyPercent,
    waterTotalLiters: todayWaterLiters,
    waterAvgLiters: todayWaterLiters,
    waterDaysOptimal: todayWaterLiters >= 2.5 ? 1 : 0,
    waterGrowthPercent: 10,
    sleepAvgHours: todaySleepData.hours,
    sleepTotalHours: todaySleepData.hours,
    sleepOptimalNights: todaySleepData.hours >= 7 ? 1 : 0,
    sleepRecoveryScore: 80,
    globalScore: Math.min(100, Math.max(30, consistencyPercent)),
    statusBadge: 'Consistência em Evolução 🔥',
    coachDiagnosis: {
      title: 'Relatório Mensal - Team Wagner',
      highlight: `${workoutsTotal} treinos concluídos com sucesso neste mês!`,
      analysis: `Foram ${workoutsTotal} treinos concluídos em ${activeDaysCount} dias ativos no mês de ${monthName}, totalizando ${totalWorkoutMinutes} minutos sob tensão. A disciplina diária é a chave para a transformação contínua.`,
      strengths: [
        `Consistência mantida com ${workoutsTotal} sessões registradas.`,
        `Treinos salvos e contabilizados no histórico pessoal.`,
      ],
      actionPlan: [
        `Manter ritmo contínuo na próxima semana.`,
        `Preservar hidratação constante.`,
      ],
      seal: 'Em Evolução ⚡',
    },
  };
}

export function formatReportForSharing(
  type: 'semanal' | 'mensal',
  weekReport: WeekReportData,
  monthReport: MonthReportData
): string {
  if (type === 'semanal') {
    return `🔥 *TEAM WAGNER - BOLETIM SEMANAL*\n📅 ${weekReport.periodLabel}\n\n🏋️ Treinos: ${weekReport.workoutsTotal}/${weekReport.workoutsTarget} (${weekReport.workoutsMinutes} min)\n💧 Água: ${weekReport.waterAvgLiters}L/dia\n😴 Sono: ${weekReport.sleepAvgHours}h/noite\n🎯 Score Geral: ${weekReport.globalScore}/100\n\n💬 *Diagnóstico Coach Wagner Rocha:*\n${weekReport.coachDiagnosis.highlight}\n\n#TeamWagner #Disciplina #AltaPerformance`;
  }
  return `⚡ *TEAM WAGNER - RELATÓRIO MENSAL*\n📅 ${monthReport.monthName}\n\n🏋️ Total de Treinos: ${monthReport.workoutsTotal}\n⏱️ Tempo Total: ${monthReport.workoutsTotalMinutes} min\n📅 Dias Ativos: ${monthReport.workoutsActiveDays}\n🎯 Consistência: ${monthReport.workoutsConsistencyPercent}%\n\n💬 *Diagnóstico Coach Wagner Rocha:*\n${monthReport.coachDiagnosis.highlight}\n\n#TeamWagner #Disciplina`;
}
