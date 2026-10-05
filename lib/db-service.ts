'use client';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { WorkoutLog, UserStats, ChecklistItem, CalendarEvent, UserNote } from './types';

// ==========================================
// USER PROFILE
// ==========================================
export async function saveUserProfile(userId: string, stats: UserStats): Promise<void> {
  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(
      userDocRef,
      {
        uid: userId,
        name: stats.name || 'Atleta',
        email: stats.email || '',
        avatarUrl: stats.avatarUrl || '',
        streakDays: stats.streakDays ?? 0,
        recordStreakDays: stats.recordStreakDays ?? 0,
        weeklyGoalCompleted: stats.weeklyGoalCompleted ?? 0,
        weeklyGoalTarget: stats.weeklyGoalTarget ?? 4,
        monthlyWorkouts: stats.monthlyWorkouts ?? 0,
        monthlyActiveDays: stats.monthlyActiveDays ?? 0,
        monthlyTotalHoursMinutes: stats.monthlyTotalHoursMinutes || '0h 0m',
        averageMinutesPerSession: stats.averageMinutesPerSession ?? 45,
        consistencyPercentage: stats.consistencyPercentage ?? 80,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getUserProfile(userId: string): Promise<UserStats | null> {
  const path = `users/${userId}`;
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    return {
      name: data.name || 'Atleta',
      email: data.email,
      avatarUrl: data.avatarUrl,
      streakDays: data.streakDays ?? 0,
      recordStreakDays: data.recordStreakDays ?? 0,
      weeklyGoalCompleted: data.weeklyGoalCompleted ?? 0,
      weeklyGoalTarget: data.weeklyGoalTarget ?? 4,
      monthlyWorkouts: data.monthlyWorkouts ?? 0,
      monthlyPreviousWorkouts: data.monthlyPreviousWorkouts ?? 0,
      monthlyActiveDays: data.monthlyActiveDays ?? 0,
      monthlyTotalHoursMinutes: data.monthlyTotalHoursMinutes || '0h 0m',
      averageMinutesPerSession: data.averageMinutesPerSession ?? 45,
      consistencyPercentage: data.consistencyPercentage ?? 80,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

// ==========================================
// WORKOUTS
// ==========================================
export async function saveWorkoutToDb(userId: string, workout: WorkoutLog): Promise<void> {
  const path = `users/${userId}/workouts/${workout.id}`;
  try {
    const workoutRef = doc(db, 'users', userId, 'workouts', workout.id);
    await setDoc(
      workoutRef,
      {
        id: workout.id,
        userId,
        date: workout.date,
        displayDate: workout.displayDate,
        activityType: workout.activityType,
        durationMinutes: workout.durationMinutes,
        sensation: workout.sensation,
        notes: workout.notes || '',
        photoUrl: workout.photoUrl || '',
        photoSource: workout.photoSource || 'direct_url',
        timestamp: workout.timestamp || Date.now(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteWorkoutFromDb(userId: string, workoutId: string): Promise<void> {
  const path = `users/${userId}/workouts/${workoutId}`;
  try {
    const workoutRef = doc(db, 'users', userId, 'workouts', workoutId);
    await deleteDoc(workoutRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function loadWorkoutsFromDb(userId: string): Promise<WorkoutLog[]> {
  const path = `users/${userId}/workouts`;
  try {
    const colRef = collection(db, 'users', userId, 'workouts');
    const q = query(colRef, orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data() as WorkoutLog);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function subscribeWorkouts(userId: string, callback: (workouts: WorkoutLog[]) => void) {
  const path = `users/${userId}/workouts`;
  const colRef = collection(db, 'users', userId, 'workouts');
  const q = query(colRef, orderBy('timestamp', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const items = snapshot.docs.map((d) => d.data() as WorkoutLog);
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// ==========================================
// WATER & SLEEP
// ==========================================
export async function saveWaterLogToDb(userId: string, date: string, liters: number): Promise<void> {
  const path = `users/${userId}/water_logs/${date}`;
  try {
    const ref = doc(db, 'users', userId, 'water_logs', date);
    await setDoc(
      ref,
      {
        id: date,
        userId,
        date,
        liters,
        timestamp: Date.now(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function saveSleepLogToDb(userId: string, date: string, hours: number, quality = 'Boa'): Promise<void> {
  const path = `users/${userId}/sleep_logs/${date}`;
  try {
    const ref = doc(db, 'users', userId, 'sleep_logs', date);
    await setDoc(
      ref,
      {
        id: date,
        userId,
        date,
        hours,
        quality,
        timestamp: Date.now(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ==========================================
// CHECKLISTS / HABITS
// ==========================================
export async function saveChecklistItem(userId: string, item: ChecklistItem): Promise<void> {
  const path = `users/${userId}/checklists/${item.id}`;
  try {
    const ref = doc(db, 'users', userId, 'checklists', item.id);
    await setDoc(ref, { ...item, userId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteChecklistItem(userId: string, itemId: string): Promise<void> {
  const path = `users/${userId}/checklists/${itemId}`;
  try {
    const ref = doc(db, 'users', userId, 'checklists', itemId);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeChecklists(userId: string, callback: (items: ChecklistItem[]) => void) {
  const path = `users/${userId}/checklists`;
  const colRef = collection(db, 'users', userId, 'checklists');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items = snapshot.docs.map((d) => d.data() as ChecklistItem);
      callback(items);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// ==========================================
// CALENDAR EVENTS & SCHEDULE
// ==========================================
export async function saveEvent(userId: string, event: CalendarEvent): Promise<void> {
  const path = `users/${userId}/events/${event.id}`;
  try {
    const ref = doc(db, 'users', userId, 'events', event.id);
    await setDoc(ref, { ...event, userId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteEvent(userId: string, eventId: string): Promise<void> {
  const path = `users/${userId}/events/${eventId}`;
  try {
    const ref = doc(db, 'users', userId, 'events', eventId);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeEvents(userId: string, callback: (events: CalendarEvent[]) => void) {
  const path = `users/${userId}/events`;
  const colRef = collection(db, 'users', userId, 'events');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const events = snapshot.docs.map((d) => d.data() as CalendarEvent);
      callback(events);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

// ==========================================
// ATHLETE NOTES
// ==========================================
export async function saveNote(userId: string, note: UserNote): Promise<void> {
  const path = `users/${userId}/notes/${note.id}`;
  try {
    const ref = doc(db, 'users', userId, 'notes', note.id);
    await setDoc(ref, { ...note, userId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteNote(userId: string, noteId: string): Promise<void> {
  const path = `users/${userId}/notes/${noteId}`;
  try {
    const ref = doc(db, 'users', userId, 'notes', noteId);
    await deleteDoc(ref);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export function subscribeNotes(userId: string, callback: (notes: UserNote[]) => void) {
  const path = `users/${userId}/notes`;
  const colRef = collection(db, 'users', userId, 'notes');
  return onSnapshot(
    colRef,
    (snapshot) => {
      const notes = snapshot.docs.map((d) => d.data() as UserNote);
      callback(notes);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}
