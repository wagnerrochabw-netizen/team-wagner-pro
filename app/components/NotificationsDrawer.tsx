'use client';

import React from 'react';
import { X, Flame, Trophy, Bell, CheckCircle2, Clock, Droplets } from 'lucide-react';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'n_water',
      title: 'Lembrete de Hidratação 💧',
      desc: 'Mantenha o ritmo de ingestão de água para atingir a faixa 🟢 Bom (2–3 L) ou ⭐ Excelente (> 3 L)!',
      time: 'Ativo agora',
      icon: <Droplets className="w-4 h-4 text-[#00E5FF]" />,
    },
    {
      id: 'n1',
      title: 'Sequência em Chamas! 🔥',
      desc: 'Você atingiu 5 dias ininterruptos de treino. Mantenha o ritmo para alcançar o recorde de 12 dias!',
      time: 'Há 2 horas',
      icon: <Flame className="w-4 h-4 text-[#FF9100]" />,
    },
    {
      id: 'n2',
      title: 'Meta Semanal Quase Lá',
      desc: 'Você completou 3 de 4 treinos da semana. Falta apenas 1 sessão para fechar 100%!',
      time: 'Ontem',
      icon: <Trophy className="w-4 h-4 text-[#00E5FF]" />,
    },
    {
      id: 'n3',
      title: 'Plano Wagner Rocha Atualizado',
      desc: 'Novas orientações de mobilidade e carga adicionadas ao seu plano de treinamento.',
      time: '3 dias atrás',
      icon: <CheckCircle2 className="w-4 h-4 text-[#00E5FF]" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#12161F] border border-[#222938] rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl text-[#E1E2EB]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#00E5FF]" />
            <h3 className="font-space font-bold text-base text-white">
              Notificações
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#171B26] border border-[#222938] text-[#BAC9CC] hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-3 rounded-xl bg-[#171B26] border border-[#222938] space-y-1 hover:border-[#00E5FF]/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {n.icon}
                  <h4 className="font-space font-bold text-xs text-white">
                    {n.title}
                  </h4>
                </div>
                <span className="text-[10px] text-[#849396] font-mono">
                  {n.time}
                </span>
              </div>
              <p className="text-xs text-[#BAC9CC] leading-relaxed">
                {n.desc}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-[#00E5FF] text-[#0B0E14] font-space font-bold text-xs rounded-xl"
        >
          Entendido
        </button>
      </div>
    </div>
  );
};
