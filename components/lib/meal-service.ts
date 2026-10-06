'use client';

import { MealItem, DailyMealDaySummary, MealStatus } from './types';
import { saveMealToSupabase, getActiveUserId } from './supabase-service';

const STORAGE_KEY = 'team_wagner_meals';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTimeNow(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function getAllStoredMeals(): MealItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Erro ao ler refeições do localStorage:', err);
    return [];
  }
}

export function saveAllStoredMeals(meals: MealItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(meals));
    window.dispatchEvent(new CustomEvent('team_wagner_meals_updated'));
  } catch (err) {
    console.error('Erro ao salvar refeições no localStorage:', err);
  }
}

/**
 * Retorna os pontos do dia de acordo com a regra oficial:
 * 100% -> +100
 * 75% a 99% -> +75
 * 50% a 74% -> +50
 * 25% a 49% -> +25
 * < 25% -> 0
 */
export function calculateDailyMealPoints(registeredCount: number, plannedCount: number): number {
  if (!plannedCount || plannedCount <= 0) return 0;
  // Apenas refeições até o limite da meta contam para a pontuação (evita pontos extras injustos)
  const effectiveRegistered = Math.min(registeredCount, plannedCount);
  const ratio = effectiveRegistered / plannedCount;

  if (ratio >= 1.0) return 100;
  if (ratio >= 0.75) return 75;
  if (ratio >= 0.50) return 50;
  if (ratio >= 0.25) return 25;
  return 0;
}

/**
 * Retorna ou inicializa as refeições para uma data específica.
 * Se a data ainda não possuir registros, cria os espaços automáticos
 * de acordo com a meta de refeições planejadas daquele dia (ex: 4 refeições).
 */
export function getMealsForDate(date: string, plannedTarget: number = 4, userId: string = 'current_user'): MealItem[] {
  const allMeals = getAllStoredMeals();
  const dateMeals = allMeals.filter((m) => m.date === date);

  if (dateMeals.length > 0) {
    return dateMeals.sort((a, b) => a.mealNumber - b.mealNumber);
  }

  // Cria os espaços padrão para a data
  const target = Math.max(1, plannedTarget);
  const newMeals: MealItem[] = [];
  const now = Date.now();

  for (let i = 1; i <= target; i++) {
    newMeals.push({
      id: `meal_${date}_${i}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      date,
      plannedMealsCount: target,
      mealNumber: i,
      title: `Refeição ${i}`,
      status: 'pendente',
      isExtra: false,
      createdAt: now,
      updatedAt: now,
    });
  }

  const updatedAll = [...allMeals, ...newMeals];
  saveAllStoredMeals(updatedAll);
  return newMeals;
}

/**
 * Salva ou atualiza uma refeição individual
 */
export function saveOrUpdateMeal(meal: MealItem): MealItem[] {
  const allMeals = getAllStoredMeals();
  const index = allMeals.findIndex((m) => m.id === meal.id);
  const now = Date.now();

  // Se adicionou foto e o status estava pendente, muda automaticamente para 'registrada'
  let newStatus = meal.status;
  if (meal.photoUrl && meal.status === 'pendente') {
    newStatus = 'registrada';
  }

  const updatedMeal: MealItem = {
    ...meal,
    status: newStatus,
    time: meal.time || (newStatus === 'registrada' ? formatTimeNow() : undefined),
    updatedAt: now,
  };

  let updatedList: MealItem[];
  if (index >= 0) {
    updatedList = [...allMeals];
    updatedList[index] = updatedMeal;
  } else {
    updatedList = [...allMeals, updatedMeal];
  }

  saveAllStoredMeals(updatedList);

  // Sincroniza refeição no Supabase
  try {
    const supabaseUserId = getActiveUserId();
    saveMealToSupabase(supabaseUserId, updatedMeal).catch(() => {});
  } catch {
    // ignore
  }

  return updatedList;
}

/**
 * Exclui uma refeição ou reseta para pendente se for uma das refeições programadas
 */
export function deleteOrResetMeal(mealId: string): MealItem[] {
  const allMeals = getAllStoredMeals();
  const meal = allMeals.find((m) => m.id === mealId);
  if (!meal) return allMeals;

  let updatedList: MealItem[];
  if (meal.isExtra) {
    // Refeição extra pode ser deletada inteiramente
    updatedList = allMeals.filter((m) => m.id !== mealId);
  } else {
    // Refeição programada é resetada para limpa/pendente
    updatedList = allMeals.map((m) => {
      if (m.id === mealId) {
        return {
          ...m,
          photoUrl: undefined,
          notes: undefined,
          time: undefined,
          status: 'pendente' as MealStatus,
          updatedAt: Date.now(),
        };
      }
      return m;
    });
  }

  saveAllStoredMeals(updatedList);
  return updatedList;
}

/**
 * Adiciona uma refeição extra no dia sem alterar a meta padrão do perfil
 */
export function addExtraMealToDate(date: string, userId: string = 'current_user'): MealItem {
  const allMeals = getAllStoredMeals();
  const dateMeals = allMeals.filter((m) => m.date === date);
  const extraCount = dateMeals.filter((m) => m.isExtra).length;
  const nextNum = dateMeals.length + 1;
  const now = Date.now();

  const extraMeal: MealItem = {
    id: `meal_extra_${date}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId,
    date,
    plannedMealsCount: dateMeals[0]?.plannedMealsCount || 4,
    mealNumber: nextNum,
    title: `Refeição Extra ${extraCount + 1}`,
    status: 'pendente',
    isExtra: true,
    createdAt: now,
    updatedAt: now,
  };

  const updatedAll = [...allMeals, extraMeal];
  saveAllStoredMeals(updatedAll);
  return extraMeal;
}

/**
 * Calcula o resumo completo do dia
 */
export function getDailyMealSummary(date: string, plannedTarget: number = 4, userId: string = 'current_user'): DailyMealDaySummary {
  const meals = getMealsForDate(date, plannedTarget, userId);
  const plannedCount = meals[0]?.plannedMealsCount || plannedTarget;
  
  const registeredNonExtra = meals.filter((m) => !m.isExtra && m.status === 'registrada').length;
  const registeredExtra = meals.filter((m) => m.isExtra && m.status === 'registrada').length;
  const totalRegistered = registeredNonExtra + registeredExtra;

  const points = calculateDailyMealPoints(registeredNonExtra, plannedCount);
  const completionPercentage = Math.min(100, Math.round((registeredNonExtra / Math.max(1, plannedCount)) * 100));

  return {
    date,
    plannedCount,
    registeredCount: totalRegistered,
    extraCount: registeredExtra,
    completionPercentage,
    points,
    streakDays: 0,
    consistencyBonus: 0,
    meals,
  };
}

/**
 * Calcula a sequência atual de consistência (dias consecutivos com 100% da meta)
 * e o bônus correspondente:
 * - 3 dias consecutivos: +30 pontos
 * - 7 dias consecutivos: +100 pontos
 * - 30 dias consecutivos: +500 pontos
 */
export function getMealConsistencyStreak(userId: string = 'current_user'): {
  currentStreak: number;
  bonusPoints: number;
  historyMap: Record<string, DailyMealDaySummary>;
} {
  const allMeals = getAllStoredMeals();
  if (allMeals.length === 0) {
    return { currentStreak: 0, bonusPoints: 0, historyMap: {} };
  }

  // Agrupa refeições por data
  const dateMap: Record<string, MealItem[]> = {};
  for (const m of allMeals) {
    if (!dateMap[m.date]) dateMap[m.date] = [];
    dateMap[m.date].push(m);
  }

  const historyMap: Record<string, DailyMealDaySummary> = {};
  for (const date in dateMap) {
    const list = dateMap[date];
    const planned = list[0]?.plannedMealsCount || 4;
    const registeredNonExtra = list.filter((m) => !m.isExtra && m.status === 'registrada').length;
    const extraCount = list.filter((m) => m.isExtra && m.status === 'registrada').length;
    const points = calculateDailyMealPoints(registeredNonExtra, planned);
    const completionPercentage = Math.min(100, Math.round((registeredNonExtra / Math.max(1, planned)) * 100));

    historyMap[date] = {
      date,
      plannedCount: planned,
      registeredCount: registeredNonExtra + extraCount,
      extraCount,
      completionPercentage,
      points,
      streakDays: 0,
      consistencyBonus: 0,
      meals: list,
    };
  }

  // Calcula streak regressivo a partir de hoje ou ontem
  const today = getTodayDateString();
  let streak = 0;
  let checkDate = new Date();

  // Verifica se hoje está 100% concluído
  const todaySummary = historyMap[today];
  if (todaySummary && todaySummary.completionPercentage === 100) {
    streak = 1;
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // Se hoje ainda não bateu 100%, começa a contagem de ontem para trás
    checkDate.setDate(checkDate.getDate() - 1);
  }

  // Percorre os dias anteriores
  for (let i = 0; i < 90; i++) {
    const y = checkDate.getFullYear();
    const m = String(checkDate.getMonth() + 1).padStart(2, '0');
    const d = String(checkDate.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    const summary = historyMap[dateStr];
    if (summary && summary.completionPercentage === 100) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calcula bônus de consistência
  let bonusPoints = 0;
  if (streak >= 30) {
    bonusPoints = 500;
  } else if (streak >= 7) {
    bonusPoints = 100;
  } else if (streak >= 3) {
    bonusPoints = 30;
  }

  return {
    currentStreak: streak,
    bonusPoints,
    historyMap,
  };
}

/**
 * Retorna os totais globais de refeições para o perfil e pontuação
 */
export function getMealGlobalTotals(userId: string = 'current_user', plannedTarget: number = 4) {
  const allMeals = getAllStoredMeals();
  const today = getTodayDateString();
  const todaySummary = getDailyMealSummary(today, plannedTarget, userId);
  const { currentStreak, bonusPoints, historyMap } = getMealConsistencyStreak(userId);

  // Total de fotos registradas
  const totalPhotos = allMeals.filter((m) => !!m.photoUrl).length;

  // Soma de pontos de todos os dias registrados
  let totalDailyPoints = 0;
  for (const date in historyMap) {
    totalDailyPoints += historyMap[date].points;
  }

  // Total de pontos de refeições (pontos diários + bônus de consistência)
  const totalMealPoints = totalDailyPoints + bonusPoints;

  // Taxa de conclusão semanal (últimos 7 dias)
  let weeklyPlanned = 0;
  let weeklyRegistered = 0;
  const checkDate = new Date();

  for (let i = 0; i < 7; i++) {
    const y = checkDate.getFullYear();
    const m = String(checkDate.getMonth() + 1).padStart(2, '0');
    const d = String(checkDate.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;

    const sum = historyMap[dateStr];
    if (sum) {
      weeklyPlanned += sum.plannedCount;
      weeklyRegistered += Math.min(sum.registeredCount, sum.plannedCount);
    } else {
      weeklyPlanned += plannedTarget;
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }

  const weeklyCompletionRate = weeklyPlanned > 0
    ? Math.min(100, Math.round((weeklyRegistered / weeklyPlanned) * 100))
    : 0;

  return {
    totalPhotos,
    totalMealPoints,
    bonusPoints,
    todayRegistered: todaySummary.registeredCount,
    todayPlanned: todaySummary.plannedCount,
    todayPoints: todaySummary.points,
    todayPercentage: todaySummary.completionPercentage,
    weeklyCompletionRate,
    currentStreak,
    historyMap,
  };
}

/**
 * Retorna lista de todas as datas disponíveis no histórico de refeições ordenadas decrescente
 */
export function getAvailableMealDates(): string[] {
  const allMeals = getAllStoredMeals();
  const today = getTodayDateString();
  const set = new Set<string>();
  set.add(today);

  for (const m of allMeals) {
    if (m.date) set.add(m.date);
  }

  return Array.from(set).sort((a, b) => b.localeCompare(a));
}
