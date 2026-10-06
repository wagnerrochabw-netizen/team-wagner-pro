'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  Flame,
  Trophy,
  Bell,
  CheckCheck,
  Droplets,
  Dumbbell,
  Moon,
  UtensilsCrossed,
  Medal,
  ChevronRight,
  BellOff,
  RotateCcw,
} from 'lucide-react';
import { UserStats, WorkoutLog } from '@/lib/types';
import {
  AppNotification,
  NotificationActionType,
  generateRealNotifications,
  markAsRead,
  markAllAsRead,
  dismissNotification,
  resetDismissedNotifications,
} from '@/lib/notifications-service';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  stats: UserStats;
  workouts: WorkoutLog[];
  onOpenRegisterModal: () => void;
  onOpenWaterModal?: () => void;
  onOpenSleepModal?: () => void;
  onOpenMealsModal?: () => void;
  onNavigateToTab?: (tab: 'dashboard' | 'history' | 'progress' | 'profile' | 'ranking') => void;
  onNotificationsChanged?: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  stats,
  workouts,
  onOpenRegisterModal,
  onOpenWaterModal,
  onOpenSleepModal,
  onOpenMealsModal,
  onNavigateToTab,
  onNotificationsChanged,
}) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  // Escuta atualizações de notificações para atualizar a lista
  useEffect(() => {
    const handleUpdate = () => {
      setRefreshKey((k) => k + 1);
      if (onNotificationsChanged) onNotificationsChanged();
    };

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
  }, [onNotificationsChanged]);

  const allNotifications = useMemo(() => {
    void refreshKey;
    return generateRealNotifications(stats, workouts);
  }, [refreshKey, stats, workouts]);

  const unreadCount = useMemo(() => {
    return allNotifications.filter((n) => !n.isRead).length;
  }, [allNotifications]);

  const displayedNotifications = useMemo(() => {
    if (filter === 'unread') {
      return allNotifications.filter((n) => !n.isRead);
    }
    return allNotifications;
  }, [allNotifications, filter]);

  const handleActionClick = useCallback(
    (notification: AppNotification) => {
      // Marca como lida
      markAsRead(notification.id);
      setRefreshKey((k) => k + 1);
      if (onNotificationsChanged) onNotificationsChanged();

      // Executa a ação específica
      switch (notification.actionType) {
        case 'open_register':
          onClose();
          onOpenRegisterModal();
          break;
        case 'open_water':
          onClose();
          if (onOpenWaterModal) onOpenWaterModal();
          break;
        case 'open_sleep':
          onClose();
          if (onOpenSleepModal) onOpenSleepModal();
          break;
        case 'open_meals':
          onClose();
          if (onOpenMealsModal) onOpenMealsModal();
          break;
        case 'navigate_history':
          onClose();
          if (onNavigateToTab) onNavigateToTab('history');
          break;
        case 'navigate_progress':
          onClose();
          if (onNavigateToTab) onNavigateToTab('progress');
          break;
        case 'navigate_ranking':
          onClose();
          if (onNavigateToTab) onNavigateToTab('ranking');
          break;
        default:
          onClose();
          break;
      }
    },
    [
      onClose,
      onOpenRegisterModal,
      onOpenWaterModal,
      onOpenSleepModal,
      onOpenMealsModal,
      onNavigateToTab,
      onNotificationsChanged,
    ]
  );

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dismissNotification(id);
    setRefreshKey((k) => k + 1);
    if (onNotificationsChanged) onNotificationsChanged();
  };

  const handleMarkAllRead = () => {
    markAllAsRead(allNotifications.map((n) => n.id));
    setRefreshKey((k) => k + 1);
    if (onNotificationsChanged) onNotificationsChanged();
  };

  const handleRestoreDismissed = () => {
    resetDismissedNotifications();
    setRefreshKey((k) => k + 1);
    if (onNotificationsChanged) onNotificationsChanged();
  };

  if (!isOpen) return null;

  const renderIcon = (type: AppNotification['iconType']) => {
    switch (type) {
      case 'water':
        return <Droplets className="w-4 h-4 text-[#00E5FF]" />;
      case 'workout':
        return <Dumbbell className="w-4 h-4 text-[#00E5FF]" />;
      case 'streak':
        return <Flame className="w-4 h-4 text-[#FF9100]" />;
      case 'trophy':
        return <Trophy className="w-4 h-4 text-[#FFD600]" />;
      case 'meal':
        return <UtensilsCrossed className="w-4 h-4 text-[#00E676]" />;
      case 'sleep':
        return <Moon className="w-4 h-4 text-[#B388FF]" />;
      case 'ranking':
        return <Medal className="w-4 h-4 text-[#00E5FF]" />;
      default:
        return <Bell className="w-4 h-4 text-[#00E5FF]" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[#12161F] border border-[#222938] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl text-[#E1E2EB] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-1 border-b border-[#1F2633]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-space font-bold text-base text-white">
                  Notificações
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-[#00E5FF] font-mono text-[10px] font-bold">
                    {unreadCount} nova{unreadCount === 1 ? '' : 's'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#849396] font-mono">
                Team Wagner • Alertas e Ações em Tempo Real
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#171B26] border border-[#222938] text-[#BAC9CC] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter and Mark All Read Bar */}
        <div className="flex items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex items-center gap-1.5 bg-[#171B26] p-1 rounded-xl border border-[#222938]">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg font-space font-semibold transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-[#00E5FF] text-[#0B0E14]'
                  : 'text-[#BAC9CC] hover:text-white'
              }`}
            >
              Todas ({allNotifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg font-space font-semibold transition-colors cursor-pointer ${
                filter === 'unread'
                  ? 'bg-[#00E5FF] text-[#0B0E14]'
                  : 'text-[#BAC9CC] hover:text-white'
              }`}
            >
              Não Lidas ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 text-[11px] text-[#00E5FF] hover:underline font-mono cursor-pointer"
              title="Marcar todas como lidas"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Marcar lidas</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 custom-scrollbar min-h-[220px]">
          {displayedNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-10 px-4 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#171B26] border border-[#222938] flex items-center justify-center text-[#849396]">
                <BellOff className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-space font-bold text-sm text-white">
                  Tudo em dia!
                </h4>
                <p className="text-xs text-[#849396] max-w-xs mt-1">
                  {filter === 'unread'
                    ? 'Você já leu todas as suas notificações ativas.'
                    : 'Nenhuma notificação pendente no momento. Bom treino!'}
                </p>
              </div>

              {allNotifications.length === 0 && (
                <button
                  onClick={handleRestoreDismissed}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#171B26] border border-[#222938] text-[11px] text-[#00E5FF] hover:border-[#00E5FF]/40 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restaurar notificações dispensadas</span>
                </button>
              )}
            </div>
          ) : (
            displayedNotifications.map((n) => {
              return (
                <div
                  key={n.id}
                  onClick={() => handleActionClick(n)}
                  className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer ${
                    !n.isRead
                      ? 'bg-[#151B26] border-[#00E5FF]/40 hover:border-[#00E5FF] shadow-sm'
                      : 'bg-[#171B26] border-[#222938] hover:border-[#00E5FF]/40 opacity-90 hover:opacity-100'
                  }`}
                >
                  {/* Dismiss (X) button */}
                  <button
                    onClick={(e) => handleDismiss(n.id, e)}
                    className="absolute top-2.5 right-2.5 w-6 h-6 rounded-md bg-[#12161F]/80 text-[#849396] hover:text-rose-400 hover:bg-rose-500/10 flex items-center justify-center transition-colors cursor-pointer opacity-70 group-hover:opacity-100"
                    title="Dispensar notificação"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-start gap-2.5 pr-6">
                    <div className="mt-0.5 shrink-0 p-1.5 rounded-lg bg-[#12161F] border border-[#222938]">
                      {renderIcon(n.iconType)}
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-[#849396] font-mono uppercase tracking-wider">
                          {n.category}
                        </span>
                        <span className="text-[10px] text-[#475569]">·</span>
                        <span className="text-[10px] text-[#849396] font-mono">
                          {n.time}
                        </span>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]" />
                        )}
                      </div>

                      <h4 className="font-space font-bold text-xs text-white group-hover:text-[#00E5FF] transition-colors">
                        {n.title}
                      </h4>

                      <p className="text-xs text-[#BAC9CC] leading-relaxed">
                        {n.desc}
                      </p>

                      {/* Interactive Action Button */}
                      <div className="pt-2">
                        <div className="inline-flex items-center gap-1 text-[11px] font-space font-semibold text-[#00E5FF] group-hover:underline">
                          <span>{n.actionLabel}</span>
                          <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-[#00E5FF] hover:bg-[#33EBFF] text-[#0B0E14] font-space font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-lg shadow-[#00E5FF]/20"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};
