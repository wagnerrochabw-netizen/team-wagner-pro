'use client';

import { getSupabaseClient, isSupabaseConfigured } from './supabase';
import { WorkoutLog, UserStats, ChecklistItem, CalendarEvent, UserNote } from './types';

// ==========================================
// USER PROFILES
// ==========================================
export async function saveUserToSupabase(userId: string, stats: UserStats): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('users').upsert({
      id: userId,
      name: stats.name,
      email: stats.email || null,
      birth_date: stats.birthDate || null,
      avatar_url: stats.avatarUrl || null,
      streak_days: stats.streakDays,
      record_streak_days: stats.recordStreakDays,
      weekly_goal_target: stats.weeklyGoalTarget,
      weekly_goal_completed: stats.weeklyGoalCompleted,
      monthly_workouts: stats.monthlyWorkouts,
      monthly_active_days: stats.monthlyActiveDays,
      monthly_total_hours_minutes: stats.monthlyTotalHoursMinutes,
      average_minutes_per_session: stats.averageMinutesPerSession,
      consistency_percentage: stats.consistencyPercentage,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn('Supabase saveUser error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase saveUser exception:', err);
    return false;
  }
}

export async function getUserFromSupabase(userId: string): Promise<UserStats | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) return null;

    return {
      name: data.name || 'Atleta',
      email: data.email || undefined,
      birthDate: data.birth_date || undefined,
      avatarUrl: data.avatar_url || undefined,
      streakDays: data.streak_days ?? 0,
      recordStreakDays: data.record_streak_days ?? 0,
      weeklyGoalTarget: data.weekly_goal_target ?? 4,
      weeklyGoalCompleted: data.weekly_goal_completed ?? 0,
      monthlyWorkouts: data.monthly_workouts ?? 0,
      monthlyPreviousWorkouts: 0,
      monthlyActiveDays: data.monthly_active_days ?? 0,
      monthlyTotalHoursMinutes: data.monthly_total_hours_minutes || '0h 0m',
      averageMinutesPerSession: data.average_minutes_per_session ?? 45,
      consistencyPercentage: data.consistency_percentage ?? 80,
    };
  } catch (err) {
    console.error('Supabase getUser exception:', err);
    return null;
  }
}

// ==========================================
// WORKOUTS
// ==========================================
export async function saveWorkoutToSupabase(userId: string, workout: WorkoutLog): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    // Ensure parent user row exists to satisfy foreign key constraint
    await supabase.from('users').upsert({
      id: userId,
      name: 'Atleta',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'id', ignoreDuplicates: true });

    const { error } = await supabase.from('workouts').upsert({
      id: workout.id,
      user_id: userId,
      date: workout.date,
      display_date: workout.displayDate,
      activity_type: workout.activityType,
      duration_minutes: workout.durationMinutes,
      sensation: workout.sensation,
      notes: workout.notes || null,
      photo_url: workout.photoUrl || null,
      photo_source: workout.photoSource || 'direct_url',
      timestamp: workout.timestamp,
    });

    if (error) {
      console.warn('Supabase saveWorkout error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase saveWorkout exception:', err);
    return false;
  }
}

export async function loadWorkoutsFromSupabase(userId: string): Promise<WorkoutLog[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error || !data) return [];

    return data.map((d) => ({
      id: d.id,
      date: d.date,
      displayDate: d.display_date,
      activityType: d.activity_type,
      durationMinutes: d.duration_minutes,
      sensation: d.sensation,
      notes: d.notes || undefined,
      photoUrl: d.photo_url || undefined,
      photoSource: d.photo_source,
      timestamp: Number(d.timestamp),
    }));
  } catch (err) {
    console.error('Supabase loadWorkouts exception:', err);
    return [];
  }
}

export async function deleteWorkoutFromSupabase(workoutId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('workouts').delete().eq('id', workoutId);
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// CHECKLISTS
// ==========================================
export async function saveChecklistToSupabase(item: ChecklistItem): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase.from('checklists').upsert({
      id: item.id,
      user_id: item.userId,
      title: item.title,
      completed: item.completed,
      category: item.category || null,
      date: item.date || null,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function loadChecklistsFromSupabase(userId: string): Promise<ChecklistItem[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('checklists')
      .select('*')
      .eq('user_id', userId);

    if (error || !data) return [];
    return data.map((d) => ({
      id: d.id,
      userId: d.user_id,
      title: d.title,
      completed: Boolean(d.completed),
      category: d.category || undefined,
      date: d.date || undefined,
    }));
  } catch {
    return [];
  }
}

export async function deleteChecklistFromSupabase(itemId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('checklists').delete().eq('id', itemId);
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// NOTES
// ==========================================
export async function saveNoteToSupabase(note: UserNote): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('notes').upsert({
      id: note.id,
      user_id: note.userId,
      title: note.title,
      content: note.content,
      created_at: note.createdAt,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function loadNotesFromSupabase(userId: string): Promise<UserNote[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((d) => ({
      id: d.id,
      userId: d.user_id,
      title: d.title,
      content: d.content,
      createdAt: Number(d.created_at),
    }));
  } catch {
    return [];
  }
}

export async function deleteNoteFromSupabase(noteId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('notes').delete().eq('id', noteId);
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// CALENDAR EVENTS
// ==========================================
export async function saveEventToSupabase(event: CalendarEvent): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('events').upsert({
      id: event.id,
      user_id: event.userId,
      title: event.title,
      date: event.date,
      time: event.time || null,
      type: event.type || null,
      completed: event.completed || false,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function loadEventsFromSupabase(userId: string): Promise<CalendarEvent[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true });

    if (error || !data) return [];
    return data.map((d) => ({
      id: d.id,
      userId: d.user_id,
      title: d.title,
      date: d.date,
      time: d.time || undefined,
      type: d.type || undefined,
      completed: Boolean(d.completed),
    }));
  } catch {
    return [];
  }
}

export async function deleteEventFromSupabase(eventId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;
  try {
    const { error } = await supabase.from('events').delete().eq('id', eventId);
    return !error;
  } catch {
    return false;
  }
}
