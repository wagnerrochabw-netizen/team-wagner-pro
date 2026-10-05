'use client';

import React from 'react';
import { LogOut, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { WRLogo } from './WRLogo';

interface LogoutConfirmationModalProps {
  isOpen: boolean;
  userName: string;
  userEmail?: string;
  onClose: () => void;
  onConfirmLogout: () => void;
}

export const LogoutConfirmationModal: React.FC<LogoutConfirmationModalProps> = ({
  isOpen,
  userName,
  userEmail,
  onClose,
  onConfirmLogout,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#11141C] border border-[#222938] rounded-2xl max-w-sm w-full p-6 space-y-5 text-white shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-[#222938] pb-3">
          <div className="flex items-center gap-2">
            <WRLogo variant="monogram" size="sm" />
            <h3 className="font-space font-bold text-base text-white">
              Sair da Conta
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#849396] hover:text-white transition-colors cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center text-center space-y-3 pt-1">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
            <LogOut className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h4 className="font-space font-bold text-sm text-white">
              Deseja desconectar de {userName}?
            </h4>
            {userEmail && (
              <p className="text-xs text-[#849396] font-mono">
                {userEmail}
              </p>
            )}
            <p className="text-xs text-[#BAC9CC] font-sans leading-relaxed pt-1">
              Todos os seus treinos e metas sincronizados no banco de dados estão salvos com segurança. Você retornará à tela de login/cadastro de atletas.
            </p>
          </div>

          <div className="w-full p-2.5 rounded-xl bg-[#0B0E14] border border-[#1D2026] flex items-center justify-center gap-1.5 text-[11px] text-emerald-400 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Dados preservados na nuvem</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-[#171B26] hover:bg-[#1D2026] border border-[#222938] text-xs font-space font-medium text-[#BAC9CC] hover:text-white transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmLogout();
              onClose();
            }}
            className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-space font-bold flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(225,29,72,0.4)] cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair Agora</span>
          </button>
        </div>
      </div>
    </div>
  );
};
