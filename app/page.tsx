'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo, useSyncExternalStore } from 'react';
import { HomeView } from '@/components/HomeView';
import { ProgressView } from '@/components/ProgressView';
import { RankingView } from '@/components/RankingView';
import { ProfileView } from '@/components/ProfileView';
import { OnboardingView } from '@/components/OnboardingView';
import { RegisterWorkoutModal } from '@/components/RegisterWorkoutModal';
import { WorkoutDetailsModal } from '@/components/WorkoutDetailsModal';
import { NotificationsDrawer } from '@/components/NotificationsDrawer';
import { WaterModal } from '@/components/WaterModal';
import { SleepModal } from '@/components/SleepModal';
import { DirectImageGuideModal } from '@/components/DirectImageGuideModal';
import { UploadLogoModal } from '@/components/UploadLogoModal';
import { LogoutConfirmationModal } from '@/components/LogoutConfirmationModal';
import { MealsManagerModal } from '@/components/MealsManagerModal';
import { DeviceFrame } from '@/components/DeviceFrame';
import { BottomNav, TabType } from '@/components/BottomNav';
import { WRLogo } from '@/components/WRLogo';
import { generateRealNotifications } from '@/lib/notifications-service';
import {
  INITIAL_STATS,
  INITIAL_WORKOUTS,
  INITIAL_OCTOBER_ACTIVE_DAYS,
  INITIAL_CHALLENGES,
} from '@/lib/initial-data';
import { getDynamicWeeklyDays } from '@/lib/weekly-calendar';
import { syncCurrentAthlete } from '@/lib/athletes-ranking';
import { calculateRealStats } from '@/lib/workout-stats';
import { UserStats, WorkoutLog, DayProgress, ChallengeItem } from '@/lib/types';
import {
  saveWorkoutToSupabase,
  saveUserToSupabase,
  loadWorkoutsFromSupabase,
  getUserFromSupabase,
} from '@/lib/supabase-service';
import { saveWorkoutToDb, saveUserProfile, deleteWorkoutFromDb } from '@/lib/db-service';
import {
  Layers,
  Smartphone,
  Sparkles,
  Link2,
  Flame,
  CheckCircle2,
  RefreshCw,
  Plus,
  Upload,
  LogOut,
  Download
} from 'lucide-react';

export default function App() {
  // Default to single mobile device view (production client mode for athletes)
  const [viewMode, setViewMode] = useState<'panorama' | 'single'>('single');
  const [showDevToolbar, setShowDevToolbar] = useState(false);
  const [singleTab, setSingleTab] = useState<TabType>('home');
  const [singleMode, setSingleMode] = useState<'main' | 'onboarding'>('main');

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isWaterModalOpen, setIsWaterModalOpen] = useState(false);
  const [isSleepModalOpen, setIsSleepModalOpen] = useState(false);
  const [notifTrigger, setNotifTrigger] = useState(0);
  const [isDirectImageGuideOpen, setIsDirectImageGuideOpen] = useState(false);
  const [isUploadLogoOpen, setIsUploadLogoOpen] = useState(false);
  const [isGlobalLogoutModalOpen, setIsGlobalLogoutModalOpen] = useState(false);
  const [isMealsModalOpen, setIsMealsModalOpen] = useState(false);
  const [mealsModalTab, setMealsModalTab] = useState<'today' | 'history' | 'rules'>('today');
  const [isDownloading, setIsDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [logoVersion, setLogoVersion] = useState(1);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutLog | null>(null);
  
  // Safe client hydration detection to prevent server/client markup mismatch
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('dev') === 'true' || params.get('admin') === 'true') {
          setShowDevToolbar(true);
        }
        if (params.get('panorama') === 'true') {
          setShowDevToolbar(true);
          setViewMode('panorama');
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleConfirmLogout = () => {
    // 1. Reset local stats and clear cached user profile
    setStats({
      ...INITIAL_STATS,
      name: 'Wagner',
      avatarUrl: undefined,
      email: undefined,
      streakDays: 0,
      recordStreakDays: 0,
      weeklyGoalCompleted: 0,
      monthlyWorkouts: 0,
      monthlyActiveDays: 0,
      monthlyTotalHoursMinutes: '0h 0m',
    });
    try {
      localStorage.removeItem('team_wagner_active_user');
      localStorage.removeItem('team_wagner_stats');
    } catch {
      // ignore
    }

    // 2. Direct to Onboarding/Login view
    setSingleMode('onboarding');
    setViewMode('single');
    setSingleTab('home');
  };

  // Focus effect when user triggers action from one screen to another
  const screen4Ref = useRef<HTMLDivElement>(null);
  const screen2Ref = useRef<HTMLDivElement>(null);
  const screen3Ref = useRef<HTMLDivElement>(null);

  // Initialize with stable server defaults so SSR matches client hydration perfectly
  const [stats, setStats] = useState<UserStats>(INITIAL_STATS);
  const [workouts, setWorkouts] = useState<WorkoutLog[]>(INITIAL_WORKOUTS);
  const [activeCalendarDays, setActiveCalendarDays] = useState<number[]>(INITIAL_OCTOBER_ACTIVE_DAYS);
  const [challenges, setChallenges] = useState<ChallengeItem[]>(INITIAL_CHALLENGES);

  // Hydrate client-side saved state after mount and purge legacy mock data
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        let currentWorkoutsList: WorkoutLog[] = [];
        const savedWorkouts = localStorage.getItem('team_wagner_workouts');
        if (savedWorkouts) {
          const parsed = JSON.parse(savedWorkouts);
          // Se contiver dados legados de mock (ex: w-1, w-2, 2024-10-24), limpa para iniciar zerado
          if (Array.isArray(parsed) && parsed.some((w: WorkoutLog) => w.id === 'w-1' || w.date === '2024-10-24')) {
            localStorage.removeItem('team_wagner_workouts');
            localStorage.removeItem('team_wagner_days');
            localStorage.removeItem('team_wagner_water_intake');
            localStorage.removeItem('team_wagner_sleep_record');
            localStorage.removeItem('team_wagner_stats');
            setWorkouts([]);
            setActiveCalendarDays([]);
            setStats(INITIAL_STATS);
          } else {
            currentWorkoutsList = parsed;
            setWorkouts(parsed);
          }
        }

        const savedDays = localStorage.getItem('team_wagner_days');
        if (savedDays) {
          const parsedDays = JSON.parse(savedDays);
          if (Array.isArray(parsedDays) && parsedDays.length >= 10 && parsedDays.includes(1) && parsedDays.includes(24)) {
            setActiveCalendarDays([]);
            localStorage.removeItem('team_wagner_days');
          } else {
            setActiveCalendarDays(parsedDays);
          }
        }

        const savedStats = localStorage.getItem('team_wagner_stats');
        let initialOrSavedStats = INITIAL_STATS;
        if (savedStats) {
          const parsedStats = JSON.parse(savedStats);
          if (parsedStats.monthlyWorkouts === 14 && parsedStats.streakDays === 5) {
            initialOrSavedStats = INITIAL_STATS;
            localStorage.removeItem('team_wagner_stats');
          } else {
            initialOrSavedStats = parsedStats;
          }
        }

        // Reconciliação matemática: recalcula as estatísticas reais baseado no histórico real de treinos
        const realStats = calculateRealStats(currentWorkoutsList, initialOrSavedStats);
        setStats(realStats);
        syncCurrentAthlete(realStats);
      } catch {
        // ignore
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const refreshUnreadNotifs = useCallback(() => {
    setNotifTrigger((k) => k + 1);
  }, []);

  useEffect(() => {
    const handleUpdate = () => setNotifTrigger((k) => k + 1);
    window.addEventListener('team_wagner_notifications_updated', handleUpdate);
    window.addEventListener('team_wagner_water_updated', handleUpdate);
    window.addEventListener('team_wagner_sleep_updated', handleUpdate);
    window.addEventListener('team_wagner_meals_updated', handleUpdate);
    window.addEventListener('team_wagner_workouts_updated', handleUpdate);
    return () => {
      window.removeEventListener('team_wagner_notifications_updated', handleUpdate);
      window.removeEventListener('team_wagner_water_updated', handleUpdate);
      window.removeEventListener('team_wagner_sleep_updated', handleUpdate);
      window.removeEventListener('team_wagner_meals_updated', handleUpdate);
      window.removeEventListener('team_wagner_workouts_updated', handleUpdate);
    };
  }, []);

  const unreadNotifCount = useMemo(() => {
    if (!isMounted) return 0;
    void notifTrigger;
    try {
      const notifs = generateRealNotifications(stats, workouts);
      return notifs.filter((n) => !n.isRead).length;
    } catch {
      return 0;
    }
  }, [isMounted, notifTrigger, stats, workouts]);

  // Save to localStorage when state changes
  const saveWorkoutsState = (updatedWorkouts: WorkoutLog[], updatedStats: UserStats, updatedDays: number[]) => {
    try {
      localStorage.setItem('team_wagner_workouts', JSON.stringify(updatedWorkouts));
      localStorage.setItem('team_wagner_stats', JSON.stringify(updatedStats));
      localStorage.setItem('team_wagner_days', JSON.stringify(updatedDays));
    } catch {
      // ignore
    }
  };

  const handleSaveWorkout = (newWorkoutData: Omit<WorkoutLog, 'id' | 'timestamp'>) => {
    const today = new Date();
    const todayDateNum = today.getDate();
    const timeNow = `${String(today.getHours()).padStart(2, '0')}:${String(today.getMinutes()).padStart(2, '0')}`;

    const createdWorkout: WorkoutLog = {
      ...newWorkoutData,
      id: `w-${Date.now()}`,
      timestamp: Date.now(),
      time: newWorkoutData.time || timeNow,
      status: 'concluido',
      isOnScheduledDay: true,
      points: 150, // Concluído na data programada: +150 pontos
    };

    const updatedWorkouts = [createdWorkout, ...workouts];
    setWorkouts(updatedWorkouts);

    // Update calendar active days if today not already included
    let updatedDays = activeCalendarDays;
    if (!activeCalendarDays.includes(todayDateNum)) {
      updatedDays = [...activeCalendarDays, todayDateNum];
      setActiveCalendarDays(updatedDays);
    }

    // Calcula estatísticas reais e matemáticas baseadas na lista atualizada de treinos
    const updatedStats = calculateRealStats(updatedWorkouts, stats);
    setStats(updatedStats);

    saveWorkoutsState(updatedWorkouts, updatedStats, updatedDays);
    syncCurrentAthlete(updatedStats, createdWorkout.date, updatedWorkouts);

    // Dispara evento global para o ranking atualizar em tempo real
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('team_wagner_workouts_updated'));
    }

    // Persist automatically to Firestore and Supabase
    const userId = updatedStats.email ? updatedStats.email.replace(/[^a-zA-Z0-9_-]/g, '_') : 'atleta_wagner_1';
    saveWorkoutToDb(userId, createdWorkout).catch(() => {});
    saveUserProfile(userId, updatedStats).catch(() => {});

    saveUserToSupabase(userId, updatedStats).then(() => {
      saveWorkoutToSupabase(userId, createdWorkout).then((success) => {
        if (success) {
          setToastMessage('Treino e pontuação (+150 pts) salvos com sucesso!');
          setTimeout(() => setToastMessage(null), 3500);
        }
      });
    }).catch(() => {
      setToastMessage('Treino e pontuação (+150 pts) salvos com sucesso!');
      setTimeout(() => setToastMessage(null), 3500);
    });

    // Scroll slightly to Screen 2 to see the updated streak
    if (screen2Ref.current && viewMode === 'panorama') {
      screen2Ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const handleResetData = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('team_wagner_workouts');
      localStorage.removeItem('team_wagner_stats');
      localStorage.removeItem('team_wagner_days');
    }
    setStats(INITIAL_STATS);
    setWorkouts(INITIAL_WORKOUTS);
    setActiveCalendarDays(INITIAL_OCTOBER_ACTIVE_DAYS);
  };

  const handleDeleteWorkout = (workoutId: string) => {
    const updatedWorkouts = workouts.filter((w) => w.id !== workoutId);
    setWorkouts(updatedWorkouts);
    const updatedStats = calculateRealStats(updatedWorkouts, stats);
    setStats(updatedStats);
    saveWorkoutsState(updatedWorkouts, updatedStats, []);
    syncCurrentAthlete(updatedStats, undefined, updatedWorkouts);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('team_wagner_workouts_updated'));
    }
    const userId = stats.email ? stats.email.replace(/[^a-zA-Z0-9_-]/g, '_') : 'atleta_wagner_1';
    deleteWorkoutFromDb(userId, workoutId).catch(() => {});
    setSelectedWorkout(null);
    setToastMessage('Treino excluído com sucesso!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleUpdateStats = (updatedStats: UserStats) => {
    const realStats = calculateRealStats(workouts, updatedStats);
    setStats(realStats);
    syncCurrentAthlete(realStats);
    try {
      localStorage.setItem('team_wagner_stats', JSON.stringify(realStats));
    } catch {
      // ignore
    }
    const userId = realStats.email ? realStats.email.replace(/[^a-zA-Z0-9_-]/g, '_') : 'atleta_wagner_1';
    saveUserToSupabase(userId, realStats).catch(() => {});
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch('/api/download');
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Team-Wagner-App.zip');
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
      }, 1500);
      setToastMessage('Download concluído com sucesso!');
      setTimeout(() => setToastMessage(null), 3000);
    } catch {
      window.open('/api/download', '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleToggleJoinChallenge = (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((c) =>
        c.id === challengeId
          ? {
              ...c,
              isJoined: !c.isJoined,
              participantsCount: c.isJoined ? c.participantsCount - 1 : c.participantsCount + 1,
            }
          : c
      )
    );
  };

  const { weeklyDays, todayFullName } = getDynamicWeeklyDays(workouts);

  const scrollToRegister = () => {
    if (viewMode === 'panorama' && screen4Ref.current) {
      screen4Ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    } else {
      setIsRegisterModalOpen(true);
    }
  };

  const handleNavigateToProfile = () => {
    setViewMode('single');
    setSingleMode('main');
    setSingleTab('profile');
  };

  return (
    <div className="min-h-screen dot-canvas text-[#E1E2EB] flex flex-col select-none">
      
      {/* Top Presentation Bar - ONLY visible if showDevToolbar is active */}
      {showDevToolbar && (
        <header className="sticky top-0 z-40 bg-[#0B0E14]/90 backdrop-blur-md border-b border-[#222938] px-4 py-3">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleNavigateToProfile}
                className="cursor-pointer hover:opacity-80 transition-opacity focus:outline-none"
                title="Acessar Perfil"
              >
                <WRLogo variant="compact" subtext="Personal Trainer" size="sm" />
              </button>
              <div className="hidden md:flex items-center gap-2 pl-3 border-l border-[#222938]">
                <span className="text-[11px] font-mono text-[#00E5FF] px-2 py-0.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30">
                  Visualização 4 Telas Lado a Lado
                </span>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-2">
              <div className="flex items-center p-1 bg-[#12161F] border border-[#222938] rounded-xl">
                <button
                  type="button"
                  onClick={() => setViewMode('panorama')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-space font-medium flex items-center gap-1.5 transition-all ${
                    viewMode === 'panorama'
                      ? 'bg-[#00E5FF] text-[#0B0E14] font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                      : 'text-[#BAC9CC] hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>4 Telas (Como na Imagem)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('single')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-space font-medium flex items-center gap-1.5 transition-all ${
                    viewMode === 'single'
                      ? 'bg-[#00E5FF] text-[#0B0E14] font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                      : 'text-[#BAC9CC] hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Dispositivo Único</span>
                </button>
              </div>

              {/* Direct Image Links Guide */}
              <button
                type="button"
                onClick={() => setIsDirectImageGuideOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-[#12161F] border border-[#00E5FF]/40 text-[#00E5FF] hover:bg-[#00E5FF]/10 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
                title="Links Diretos para Imagens do HTML"
              >
                <Link2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Links de Imagens</span>
              </button>

              {/* Upload Logo Original Button */}
              <button
                type="button"
                onClick={() => setIsUploadLogoOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/60 text-[#00E5FF] hover:bg-[#00E5FF]/25 text-xs font-mono font-medium flex items-center gap-1.5 transition-all shadow-[0_0_10px_rgba(0,229,255,0.2)]"
                title="Substituir arquivo /public/logo.png pelo original"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Logo Original</span>
              </button>

              {/* Download Code ZIP for GitHub */}
              <a
                href="/team-wagner-app.zip"
                download="Team-Wagner-App.zip"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/60 text-emerald-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(16,185,129,0.3)] cursor-pointer"
                title="Baixar arquivo ZIP com todo o código para subir no GitHub"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Baixar ZIP do Projeto</span>
              </a>

              {/* Sair da Conta (Logout) */}
              <button
                type="button"
                onClick={() => setIsGlobalLogoutModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 text-xs font-space font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                title="Sair da Conta (Logout)"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair da Conta</span>
              </button>

              {/* Reset */}
              <button
                type="button"
                onClick={handleResetData}
                className="p-2 rounded-xl bg-[#12161F] border border-[#222938] text-[#849396] hover:text-white transition-colors"
                title="Restaurar dados padrão"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col items-center justify-center ${showDevToolbar ? 'p-4 sm:p-6 lg:p-8' : 'p-0 sm:p-4'}`}>
        
        {viewMode === 'panorama' ? (
          /* PANORAMA MODE: 4 PHONES SIDE BY SIDE MATCHING THE USER'S IMAGE */
          <div className="w-full max-w-[1750px] mx-auto space-y-4">
            
            {/* Horizontal Scroll Guidance on smaller viewports */}
            <div className="flex items-center justify-between text-xs text-[#849396] font-mono px-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
                Role horizontalmente para navegar entre as 4 telas interativas sincronizadas
              </span>
              <span className="hidden sm:inline">4 telas ativas simultaneamente</span>
            </div>

            {/* The 4-Phone Row on Dot Canvas */}
            <div className="w-full overflow-x-auto pb-8 pt-2 custom-scrollbar">
              <div className="flex items-start gap-6 lg:gap-8 min-w-max px-2 mx-auto justify-center">
                
                {/* 1. SCREEN 1: ONBOARDING / BOAS-VINDAS (Image 7) */}
                <div className="flex flex-col">
                  <DeviceFrame label="1. Apresentação & Início" badge="Image 7">
                    <div className="p-2 pb-6">
                      <OnboardingView
                        stats={stats}
                        onUpdateStats={handleUpdateStats}
                        onStartApp={() => {
                          if (screen2Ref.current) {
                            screen2Ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                          }
                        }}
                        onOpenDirectImageGuide={() => setIsDirectImageGuideOpen(true)}
                      />
                    </div>
                  </DeviceFrame>
                </div>

                {/* 2. SCREEN 2: INÍCIO / DASHBOARD (Image 5) */}
                <div ref={screen2Ref} className="flex flex-col">
                  <DeviceFrame label="2. Início / Dashboard" badge="Image 5">
                    <div className="p-4 flex-1">
                      <HomeView
                        stats={stats}
                        weeklyDays={weeklyDays}
                        todayFullName={todayFullName}
                        workouts={workouts}
                        unreadNotificationsCount={unreadNotifCount}
                        onOpenWorkoutDetails={(w) => setSelectedWorkout(w)}
                        onOpenRegisterModal={scrollToRegister}
                        onOpenNotifications={() => setIsNotificationsOpen(true)}
                        onOpenDirectImageGuide={() => setIsDirectImageGuideOpen(true)}
                        onOpenMealsManager={() => {
                          setMealsModalTab('today');
                          setIsMealsModalOpen(true);
                        }}
                        onOpenMealsHistory={() => {
                          setMealsModalTab('history');
                          setIsMealsModalOpen(true);
                        }}
                        onNavigateToProgress={() => {
                          if (screen3Ref.current) {
                            screen3Ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                          }
                        }}
                        onNavigateToProfile={handleNavigateToProfile}
                      />
                    </div>
                    <BottomNav
                      currentTab="home"
                      onChangeTab={(tab) => {
                        if (tab === 'progress' && screen3Ref.current) {
                          screen3Ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                        } else if (tab === 'profile') {
                          handleNavigateToProfile();
                        } else if (tab === 'ranking' || tab === 'groups') {
                          setViewMode('single');
                          setSingleMode('main');
                          setSingleTab('ranking');
                        }
                      }}
                      onOpenRegisterModal={scrollToRegister}
                      isEmbedded={true}
                    />
                  </DeviceFrame>
                </div>

                {/* 3. SCREEN 3: PROGRESSO / CALENDÁRIO (Image 3) */}
                <div ref={screen3Ref} className="flex flex-col">
                  <DeviceFrame label="3. Progresso & Calendário" badge="Image 3">
                    <div className="p-4 flex-1">
                      <ProgressView
                        stats={stats}
                        workouts={workouts}
                        activeCalendarDays={activeCalendarDays}
                        onOpenWorkoutDetails={(w) => setSelectedWorkout(w)}
                        onOpenRegisterModal={scrollToRegister}
                        onNavigateToProfile={handleNavigateToProfile}
                      />
                    </div>
                    <BottomNav
                      currentTab="progress"
                      onChangeTab={(tab) => {
                        if (tab === 'home' && screen2Ref.current) {
                          screen2Ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                        } else if (tab === 'profile') {
                          handleNavigateToProfile();
                        } else if (tab === 'ranking' || tab === 'groups') {
                          setViewMode('single');
                          setSingleMode('main');
                          setSingleTab('ranking');
                        }
                      }}
                      onOpenRegisterModal={scrollToRegister}
                      isEmbedded={true}
                    />
                  </DeviceFrame>
                </div>

                {/* 4. SCREEN 4: REGISTRAR TREINO (Image 1) */}
                <div ref={screen4Ref} className="flex flex-col">
                  <DeviceFrame label="4. Registrar Treino" badge="Image 1">
                    <RegisterWorkoutModal
                      isOpen={true}
                      isEmbedded={true}
                      onClose={() => {}}
                      onSaveWorkout={handleSaveWorkout}
                    />
                  </DeviceFrame>
                </div>

              </div>
            </div>
          </div>
        ) : (
          /* SINGLE DEVICE MODE (CLIENT PRODUCTION APP) */
          <div className={`w-full ${showDevToolbar ? 'max-w-md py-4' : 'max-w-md mx-auto min-h-screen flex flex-col'}`}>
            
            {/* Single Device Navigation - ONLY in Dev mode */}
            {showDevToolbar && (
              <div className="mb-4 flex items-center justify-between p-1 bg-[#12161F] border border-[#222938] rounded-xl text-xs font-space">
                <button
                  onClick={() => {
                    setSingleMode('main');
                    setSingleTab('home');
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-colors ${
                    singleMode === 'main' && singleTab === 'home'
                      ? 'bg-[#00E5FF] text-[#0B0E14] font-bold'
                      : 'text-[#BAC9CC] hover:text-white'
                  }`}
                >
                  Início
                </button>
                <button
                  onClick={() => {
                    setSingleMode('main');
                    setSingleTab('progress');
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-colors ${
                    singleMode === 'main' && singleTab === 'progress'
                      ? 'bg-[#00E5FF] text-[#0B0E14] font-bold'
                      : 'text-[#BAC9CC] hover:text-white'
                  }`}
                >
                  Progresso
                </button>
                <button
                  onClick={() => {
                    setSingleMode('main');
                    setSingleTab('ranking');
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-colors ${
                    singleMode === 'main' && (singleTab === 'ranking' || singleTab === 'groups')
                      ? 'bg-[#00E5FF] text-[#0B0E14] font-bold'
                      : 'text-[#BAC9CC] hover:text-white'
                  }`}
                >
                  Ranking
                </button>
                <button
                  onClick={() => {
                    setSingleMode('main');
                    setSingleTab('profile');
                  }}
                  className={`flex-1 py-1.5 rounded-lg transition-colors ${
                    singleMode === 'main' && singleTab === 'profile'
                      ? 'bg-[#00E5FF] text-[#0B0E14] font-bold'
                      : 'text-[#BAC9CC] hover:text-white'
                  }`}
                >
                  Perfil
                </button>
                <button
                  onClick={() => setIsRegisterModalOpen(true)}
                  className="flex-1 py-1.5 rounded-lg text-[#00E5FF] font-bold hover:bg-[#00E5FF]/10 transition-colors"
                >
                  + Treino
                </button>
                <button
                  onClick={() => setSingleMode('onboarding')}
                  className={`flex-1 py-1.5 rounded-lg transition-colors ${
                    singleMode === 'onboarding'
                      ? 'bg-[#00E5FF] text-[#0B0E14] font-bold'
                      : 'text-[#BAC9CC] hover:text-white'
                  }`}
                >
                  Onboarding
                </button>
              </div>
            )}

            {showDevToolbar ? (
              <DeviceFrame>
                {singleMode === 'onboarding' ? (
                  <div className="p-4 pb-10">
                    <OnboardingView
                      stats={stats}
                      onUpdateStats={handleUpdateStats}
                      onStartApp={() => setSingleMode('main')}
                      onOpenDirectImageGuide={() => setIsDirectImageGuideOpen(true)}
                    />
                  </div>
                ) : (
                  <>
                    <div className="p-4 flex-1">
                      {singleTab === 'home' && (
                        <HomeView
                          stats={stats}
                          weeklyDays={weeklyDays}
                          todayFullName={todayFullName}
                          workouts={workouts}
                          unreadNotificationsCount={unreadNotifCount}
                          onOpenWorkoutDetails={(w) => setSelectedWorkout(w)}
                          onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
                          onOpenNotifications={() => setIsNotificationsOpen(true)}
                          onOpenDirectImageGuide={() => setIsDirectImageGuideOpen(true)}
                          onOpenMealsManager={() => {
                            setMealsModalTab('today');
                            setIsMealsModalOpen(true);
                          }}
                          onOpenMealsHistory={() => {
                            setMealsModalTab('history');
                            setIsMealsModalOpen(true);
                          }}
                          onNavigateToProgress={() => {
                            setSingleTab('progress');
                            setSingleMode('main');
                          }}
                          onNavigateToProfile={() => {
                            setSingleTab('profile');
                            setSingleMode('main');
                          }}
                        />
                      )}

                      {singleTab === 'progress' && (
                        <ProgressView
                          stats={stats}
                          workouts={workouts}
                          activeCalendarDays={activeCalendarDays}
                          onOpenWorkoutDetails={(w) => setSelectedWorkout(w)}
                          onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
                          onNavigateToProfile={() => {
                            setSingleTab('profile');
                            setSingleMode('main');
                          }}
                        />
                      )}

                      {(singleTab === 'ranking' || singleTab === 'groups') && (
                        <RankingView
                          stats={stats}
                          workouts={workouts}
                          onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
                        />
                      )}

                      {singleTab === 'profile' && (
                        <ProfileView
                          stats={stats}
                          workouts={workouts}
                          onOpenWorkoutDetails={(w) => setSelectedWorkout(w)}
                          onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
                          onReturnToOnboarding={() => setSingleMode('onboarding')}
                          onLogout={() => setIsGlobalLogoutModalOpen(true)}
                          onUpdateStats={handleUpdateStats}
                        />
                      )}
                    </div>

                    <BottomNav
                      currentTab={singleTab}
                      onChangeTab={(t) => setSingleTab(t)}
                      onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
                      isEmbedded={true}
                    />
                  </>
                )}
              </DeviceFrame>
            ) : (
              /* CLEAN NATIVE MOBILE APP CONTAINER FOR ATHLETES */
              <div className="w-full flex-1 flex flex-col bg-[#0B0E14] sm:border sm:border-[#222938] sm:rounded-[36px] sm:my-4 sm:shadow-2xl overflow-hidden min-h-screen sm:min-h-[820px]">
                {singleMode === 'onboarding' ? (
                  <div className="p-4 sm:p-5 flex-1 pb-10">
                    <OnboardingView
                      stats={stats}
                      onUpdateStats={handleUpdateStats}
                      onStartApp={() => setSingleMode('main')}
                      onOpenDirectImageGuide={() => {}}
                    />
                  </div>
                ) : (
                  <>
                    <div className="p-4 sm:p-5 flex-1">
                      {singleTab === 'home' && (
                        <HomeView
                          stats={stats}
                          weeklyDays={weeklyDays}
                          todayFullName={todayFullName}
                          workouts={workouts}
                          unreadNotificationsCount={unreadNotifCount}
                          onOpenWorkoutDetails={(w) => setSelectedWorkout(w)}
                          onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
                          onOpenNotifications={() => setIsNotificationsOpen(true)}
                          onOpenDirectImageGuide={() => {}}
                          onOpenMealsManager={() => {
                            setMealsModalTab('today');
                            setIsMealsModalOpen(true);
                          }}
                          onOpenMealsHistory={() => {
                            setMealsModalTab('history');
                            setIsMealsModalOpen(true);
                          }}
                          onNavigateToProgress={() => {
                            setSingleTab('progress');
                            setSingleMode('main');
                          }}
                          onNavigateToProfile={() => {
                            setSingleTab('profile');
                            setSingleMode('main');
                          }}
                        />
                      )}

                      {singleTab === 'progress' && (
                        <ProgressView
                          stats={stats}
                          workouts={workouts}
                          activeCalendarDays={activeCalendarDays}
                          onOpenWorkoutDetails={(w) => setSelectedWorkout(w)}
                          onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
                          onNavigateToProfile={() => {
                            setSingleTab('profile');
                            setSingleMode('main');
                          }}
                        />
                      )}

                      {(singleTab === 'ranking' || singleTab === 'groups') && (
                        <RankingView
                          stats={stats}
                          workouts={workouts}
                          onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
                        />
                      )}

                      {singleTab === 'profile' && (
                        <ProfileView
                          stats={stats}
                          workouts={workouts}
                          onOpenWorkoutDetails={(w) => setSelectedWorkout(w)}
                          onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
                          onReturnToOnboarding={() => setSingleMode('onboarding')}
                          onLogout={() => setIsGlobalLogoutModalOpen(true)}
                          onUpdateStats={handleUpdateStats}
                        />
                      )}
                    </div>

                    <BottomNav
                      currentTab={singleTab}
                      onChangeTab={(t) => setSingleTab(t)}
                      onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
                      isEmbedded={true}
                    />
                  </>
                )}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Footer Branding - ONLY visible in dev presentation mode */}
      {showDevToolbar && (
        <footer className="mt-auto py-8 border-t border-[#1D2026] flex flex-col items-center justify-center gap-2 text-center px-4">
          <WRLogo variant="full" size="md" subtext="@treinador.wagner" />
          <p className="text-[11px] text-[#849396] font-mono mt-1">
            Team Wagner • Alta Performance Física & Disciplina Diária
          </p>
        </footer>
      )}

      {/* Floating Modals for Workout Details, Notifications, and Direct Links */}
      <WorkoutDetailsModal
        workout={selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
        onDeleteWorkout={handleDeleteWorkout}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        stats={stats}
        workouts={workouts}
        onOpenRegisterModal={() => setIsRegisterModalOpen(true)}
        onOpenWaterModal={() => setIsWaterModalOpen(true)}
        onOpenSleepModal={() => setIsSleepModalOpen(true)}
        onOpenMealsModal={() => {
          setMealsModalTab('today');
          setIsMealsModalOpen(true);
        }}
        onNavigateToTab={(tab) => {
          const targetTab = tab === 'history' ? 'progress' : (tab as TabType);
          setSingleTab(targetTab);
          setSingleMode('main');
          if (viewMode === 'panorama') {
            if (tab === 'ranking' && screen4Ref.current) {
              screen4Ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            } else if (tab === 'progress' && screen3Ref.current) {
              screen3Ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            } else if (screen2Ref.current) {
              screen2Ref.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
          }
        }}
        onNotificationsChanged={refreshUnreadNotifs}
      />

      <WaterModal
        isOpen={isWaterModalOpen}
        onClose={() => setIsWaterModalOpen(false)}
      />

      <SleepModal
        isOpen={isSleepModalOpen}
        onClose={() => setIsSleepModalOpen(false)}
      />

      <DirectImageGuideModal
        isOpen={isDirectImageGuideOpen}
        onClose={() => setIsDirectImageGuideOpen(false)}
      />

      <RegisterWorkoutModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSaveWorkout={handleSaveWorkout}
        isEmbedded={false}
      />

      <UploadLogoModal
        isOpen={isUploadLogoOpen}
        onClose={() => setIsUploadLogoOpen(false)}
        onLogoUpdated={() => {
          setLogoVersion((v) => v + 1);
          setIsUploadLogoOpen(false);
        }}
      />

      {/* Meals Manager Modal (Item 2, 6, 7 da especificação) */}
      <MealsManagerModal
        isOpen={isMealsModalOpen}
        onClose={() => setIsMealsModalOpen(false)}
        dailyMealsTarget={stats.dailyMealsTarget || 4}
        initialTab={mealsModalTab}
      />

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        isOpen={isGlobalLogoutModalOpen}
        userName={stats.name}
        userEmail={stats.email}
        onClose={() => setIsGlobalLogoutModalOpen(false)}
        onConfirmLogout={handleConfirmLogout}
      />

      {/* Floating Success Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-[#12161F]/95 backdrop-blur-md border border-emerald-500/50 text-emerald-300 px-4 py-3 rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.35)] animate-in fade-in slide-in-from-bottom-3 duration-300 text-xs font-space font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}
