'use client';

import React from 'react';
import { Home, Flame, Plus, Trophy, User } from 'lucide-react';

export type TabType = 'home' | 'progress' | 'ranking' | 'profile';

interface BottomNavProps {
  currentTab: TabType;
  onChangeTab: (tab: TabType) => void;
  onOpenRegisterModal: () => void;
  isEmbedded?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onChangeTab,
  onOpenRegisterModal,
  isEmbedded = false,
}) => {
  return (
    <div
      className={`${
        isEmbedded
          ? 'sticky bottom-0 left-0 right-0 z-30 w-full rounded-b-[32px]'
          : 'fixed bottom-0 left-0 right-0 z-40'
      } bg-[#0B0E14]/95 backdrop-blur-lg border-t border-[#1D2026]`}
    >
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between relative">
        
        {/* INÍCIO */}
        <button
          type="button"
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            currentTab === 'home'
              ? 'text-[#00E5FF]'
              : 'text-[#BAC9CC] hover:text-white'
          }`}
        >
          <Home className={`w-5 h-5 ${currentTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className="text-[10px] font-space font-bold tracking-wider mt-1 uppercase">
            Início
          </span>
        </button>

        {/* PROGRESSO */}
        <button
          type="button"
          onClick={() => onChangeTab('progress')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            currentTab === 'progress'
              ? 'text-[#00E5FF]'
              : 'text-[#BAC9CC] hover:text-white'
          }`}
        >
          <Flame className={`w-5 h-5 ${currentTab === 'progress' ? 'fill-current' : 'stroke-[1.75]'}`} />
          <span className="text-[10px] font-space font-bold tracking-wider mt-1 uppercase">
            Progresso
          </span>
        </button>

        {/* CENTER FLOATING TREINO (+) ACTION BUTTON matching images */}
        <div className="flex-1 flex flex-col items-center justify-center relative -top-4">
          <button
            type="button"
            onClick={onOpenRegisterModal}
            className="w-13 h-13 rounded-full bg-[#00E5FF] text-[#0B0E14] flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.6)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Registrar Novo Treino"
          >
            <Plus className="w-7 h-7 stroke-[3]" />
          </button>
          <span className="text-[9px] font-space font-bold tracking-wider mt-1 text-[#00E5FF] uppercase">
            Treino
          </span>
        </div>

        {/* RANKING */}
        <button
          type="button"
          onClick={() => onChangeTab('ranking')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            currentTab === 'ranking'
              ? 'text-[#00E5FF]'
              : 'text-[#BAC9CC] hover:text-white'
          }`}
        >
          <Trophy className={`w-5 h-5 ${currentTab === 'ranking' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className="text-[10px] font-space font-bold tracking-wider mt-1 uppercase">
            Ranking
          </span>
        </button>

        {/* PERFIL */}
        <button
          type="button"
          onClick={() => onChangeTab('profile')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            currentTab === 'profile'
              ? 'text-[#00E5FF]'
              : 'text-[#BAC9CC] hover:text-white'
          }`}
        >
          <User className={`w-5 h-5 ${currentTab === 'profile' ? 'stroke-[2.5]' : 'stroke-[1.75]'}`} />
          <span className="text-[10px] font-space font-bold tracking-wider mt-1 uppercase">
            Perfil
          </span>
        </button>

      </div>
    </div>
  );
};
