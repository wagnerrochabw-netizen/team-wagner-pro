import { DayProgress, WorkoutLog } from './types';

export function getDynamicWeeklyDays(workouts: WorkoutLog[] = []): {
  weeklyDays: (DayProgress & { isToday: boolean; dateIso: string })[];
  todayFullName: string;
  todayShortName: string;
  todayIso: string;
} {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Dom, 1 = Seg, ..., 6 = Sáb

  // Na semana padrão ISO/BR, Segunda-feira é o 1º dia
  const mondayDiff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const mondayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayDiff);

  const dayNames: DayProgress['dayName'][] = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
  const fullNames = [
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
    'Domingo'
  ];

  const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const currentDayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const todayFullName = fullNames[currentDayIndex];
  const todayShortName = dayNames[currentDayIndex];

  const weeklyDays = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(mondayDate.getFullYear(), mondayDate.getMonth(), mondayDate.getDate() + i);
    const dateNum = d.getDate();
    const dateIso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const dayName = dayNames[i];
    const fullName = fullNames[i];
    const isToday = dateIso === todayIso;
    const isPast = d < new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const workoutOnDay = workouts.find((w) => w.date === dateIso);

    let status: 'done' | 'available' | 'rest' = 'available';
    if (workoutOnDay) {
      status = 'done';
    } else if (isPast) {
      status = 'rest';
    } else {
      status = 'available';
    }

    weeklyDays.push({
      dayName,
      fullName,
      dateNum,
      status,
      activeSessionId: workoutOnDay?.id,
      isToday,
      dateIso,
    });
  }

  return { weeklyDays, todayFullName, todayShortName, todayIso };
}
