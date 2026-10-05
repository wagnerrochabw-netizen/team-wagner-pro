'use client';

import React, { useState } from 'react';
import {
  User,
  Settings,
  Flame,
  Trophy,
  Calendar,
  Image as ImageIcon,
  Link2,
  ExternalLink,
  ChevronRight,
  LogOut,
  Sparkles,
  Shield,
  Plus,
  Camera,
  CheckSquare,
  Download
} from 'lucide-react';
import { UserStats, WorkoutLog } from '@/lib/types';
import { WRLogo } from './WRLogo';
import { AvatarUploadModal } from './AvatarUploadModal';
import { AthleteChecklistsAndNotes } from './AthleteChecklistsAndNotes';
import { LogoutConfirmationModal } from './LogoutConfirmationModal';
import { ClientRegisterModal } from './ClientRegisterModal';

interface ProfileViewProps {
  stats: UserStats;
  workouts: WorkoutLog[];
  onOpenWorkoutDetails: (workout: WorkoutLog) => void;
  onOpenRegisterModal: () => void;
  onReturnToOnboarding: () => void;
  onLogout?: () => void;
  onUpdateStats?: (updatedStats: UserStats) => void;
  onToggleDevMode?: () => void;
  isDevMode?: boolean;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  stats,
  workouts,
  onOpenWorkoutDetails,
  onOpenRegisterModal,
  onReturnToOnboarding,
  onLogout,
  onUpdateStats,
  onToggleDevMode,
  isDevMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<'fotos' | 'rotina' | 'config'>('fotos');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Filter workouts that have photos
  const workoutsWithPhotos = workouts.filter((w) => !!w.photoUrl);

  const handleSaveAvatar = (newAvatarUrl: string) => {
    if (onUpdateStats) {
      onUpdateStats({
        ...stats,
        avatarUrl: newAvatarUrl,
      });
    }
  };

  const handleRemoveAvatar = () => {
    if (onUpdateStats) {
      onUpdateStats({
        ...stats,
        avatarUrl: undefined,
      });
    }
  };

  const initials = stats.name
    ? stats.name.slice(0, 2).toUpperCase()
    : 'WR';

  return (
    <div className="space-y-4 pb-24">
      {/* Top Header */}
      <div className="flex items-center justify-between pt-1">
        <WRLogo variant="monogram" size="md" />
        <span className="font-space text-lg font-bold text-white">Perfil & Galeria</span>
        <button
          onClick={onReturnToOnboarding}
          className="p-2 rounded-lg bg-[#12161F] border border-[#222938] text-[#BAC9CC] hover:text-white"
          title="Ver Tela de Boas-vindas (Onboarding)"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* User Bio Card with Interactive Avatar Photo */}
      <div className="bg-[#12161F] border border-[#222938] rounded-2xl p-5 space-y-4 shadow-lg">
        <div className="flex items-center gap-4">
          
          {/* Avatar with click-to-upload */}
          <div
            onClick={() => setIsAvatarModalOpen(true)}
            className="relative group cursor-pointer shrink-0"
            title="Clique para adicionar ou trocar sua foto de perfil"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#171B26] to-[#0B0E14] border-2 border-[#00E5FF] overflow-hidden p-0.5 flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.3)] relative">
              {stats.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={stats.avatarUrl}
                  alt={stats.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span className="font-space font-extrabold text-xl text-[#00E5FF]">
                  {initials}
                </span>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                <Camera className="w-5 h-5 text-[#00E5FF]" />
              </div>
            </div>

            {/* Small camera badge */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#00E5FF] text-[#0B0E14] flex items-center justify-center shadow-md border border-[#11141C]">
              <Camera className="w-3 h-3" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <h2 className="font-space text-xl font-bold text-white truncate">
                  {stats.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-[#00E5FF] text-[10px] font-mono shrink-0">
                  PRO
                </span>
              </div>

              {/* Sair da Conta Button */}
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 hover:text-rose-300 text-[11px] font-space font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm"
                title="Sair da Conta (Logout)"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            </div>
            <p className="text-xs text-[#849396] font-mono mt-0.5">
              Aluno Team Wagner • Plano Alta Performance
            </p>
            <div className="flex items-center gap-3 text-xs text-[#BAC9CC] mt-2">
              <span className="flex items-center gap-1 font-mono">
                <Flame className="w-3.5 h-3.5 text-[#FF9100]" />
                {stats.streakDays} dias seguidos
              </span>
              <span className="text-[#222938]">|</span>
              <span className="flex items-center gap-1 font-mono">
                <Trophy className="w-3.5 h-3.5 text-[#00E5FF]" />
                Recorde: {stats.recordStreakDays}d
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons matching Image 2 */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setIsEditProfileOpen(true)}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#00E5FF]/15 via-[#00E5FF]/10 to-transparent border border-[#00E5FF]/60 hover:border-[#00E5FF] text-[#00E5FF] font-space font-bold text-xs tracking-wide flex items-center justify-between shadow-[0_0_15px_rgba(0,229,255,0.2)] transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <Camera className="w-4 h-4 text-[#00E5FF]" />
            <span className="text-[#00E5FF] font-space font-bold text-xs">
              Cadastrar Aluno & Adicionar Foto de Perfil
            </span>
          </div>
          <ChevronRight className="w-4 h-4 text-[#00E5FF] group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          type="button"
          onClick={() => setIsEditProfileOpen(true)}
          className="w-full py-3 px-4 rounded-2xl bg-[#12161F] hover:bg-[#171B26] border border-[#222938] hover:border-[#849396] text-[#BAC9CC] hover:text-white font-space font-semibold text-xs flex items-center justify-between transition-all cursor-pointer group"
        >
          <span className="text-xs font-space">Ajustar Metas e Foco</span>
          <ChevronRight className="w-4 h-4 text-[#849396] group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-1 p-1 bg-[#12161F] border border-[#222938] rounded-xl text-xs font-space">
        <button
          onClick={() => setActiveTab('fotos')}
          className={`py-2 rounded-lg font-medium transition-all ${
            activeTab === 'fotos'
              ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF] font-bold'
              : 'text-[#BAC9CC] hover:text-white'
          }`}
        >
          Galeria ({workoutsWithPhotos.length})
        </button>
        <button
          onClick={() => setActiveTab('rotina')}
          className={`py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1 ${
            activeTab === 'rotina'
              ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF] font-bold'
              : 'text-[#BAC9CC] hover:text-white'
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Rotina</span>
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`py-2 rounded-lg font-medium transition-all ${
            activeTab === 'config'
              ? 'bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF] font-bold'
              : 'text-[#BAC9CC] hover:text-white'
          }`}
        >
          Conta
        </button>
      </div>

      {/* Content depending on tab */}
      {activeTab === 'rotina' && (
        <AthleteChecklistsAndNotes />
      )}

      {activeTab === 'fotos' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-space font-bold text-sm text-white">
              Histórico Visual dos Treinos
            </h3>
            <button
              onClick={onOpenRegisterModal}
              className="text-xs text-[#00E5FF] font-space font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Treino
            </button>
          </div>

          {workoutsWithPhotos.length === 0 ? (
            <div className="bg-[#12161F] border border-[#222938] rounded-2xl p-8 text-center space-y-3">
              <ImageIcon className="w-10 h-10 text-[#849396] mx-auto" />
              <p className="text-xs text-[#849396]">
                Nenhuma foto registrada ainda. Registre um treino e anexe uma foto por link direto ou upload!
              </p>
              <button
                onClick={onOpenRegisterModal}
                className="px-4 py-2 bg-[#00E5FF] text-[#0B0E14] rounded-lg font-space font-bold text-xs cursor-pointer"
              >
                Registrar com Foto
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {workoutsWithPhotos.map((w) => (
                <div
                  key={w.id}
                  onClick={() => onOpenWorkoutDetails(w)}
                  className="group relative rounded-xl overflow-hidden border border-[#222938] hover:border-[#00E5FF] bg-[#12161F] cursor-pointer transition-all"
                >
                  <div className="w-full h-36 bg-[#0B0E14] relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={w.photoUrl}
                      alt={w.activityType}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute bottom-2 left-2 right-2">
                      <span className="font-space text-xs font-bold text-white block truncate">
                        {w.activityType}
                      </span>
                      <div className="flex items-center justify-between text-[10px] text-[#00E5FF] font-mono mt-0.5">
                        <span>{w.displayDate}</span>
                        <span>{w.durationMinutes} min</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'config' && (
        <div className="space-y-3">
          {/* Photo Management Card */}
          <div className="bg-[#12161F] border border-[#222938] rounded-xl p-4 space-y-3">
            <h4 className="font-space font-bold text-sm text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-[#00E5FF]" />
              <span>Foto de Perfil do Aluno</span>
            </h4>
            <p className="text-xs text-[#849396]">
              Personalize sua foto de identificação no aplicativo e nos rankings da comunidade.
            </p>
            <button
              type="button"
              onClick={() => setIsAvatarModalOpen(true)}
              className="w-full py-2.5 px-3 bg-[#00E5FF]/15 border border-[#00E5FF]/40 text-[#00E5FF] hover:bg-[#00E5FF]/25 rounded-xl font-space font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{stats.avatarUrl ? 'Trocar Foto de Perfil' : 'Adicionar Foto de Perfil'}</span>
            </button>
          </div>

          <div className="bg-[#12161F] border border-[#222938] rounded-xl p-4 space-y-3">
            <h4 className="font-space font-bold text-sm text-white flex items-center gap-2">
              <span className="text-[#00E5FF]">💧</span>
              <span>Metas Diárias de Água & Hidratação</span>
            </h4>
            <p className="text-xs text-[#849396]">
              Critérios oficiais de hidratação adotados na metodologia Wagner Rocha:
            </p>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-red-950/20 border border-red-800/30 text-xs">
                <span className="font-space font-bold text-red-400">🔴 Ruim</span>
                <span className="font-mono font-semibold text-red-300">&lt; 1 L</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-orange-950/20 border border-orange-800/30 text-xs">
                <span className="font-space font-bold text-orange-400">🟠 Regular</span>
                <span className="font-mono font-semibold text-orange-300">1–2 L</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30 text-xs">
                <span className="font-space font-bold text-emerald-400">🟢 Bom</span>
                <span className="font-mono font-semibold text-emerald-300">2–3 L</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-space font-bold text-[#00E5FF]">⭐ Excelente</span>
                  <span className="font-mono font-semibold text-[#00E5FF]">&gt; 3 L</span>
                </div>
                <p className="text-[10px] text-[#BAC9CC] leading-tight font-sans">
                  * Quando compatível com a rotina e necessidade da pessoa.
                </p>
              </div>
            </div>
          </div>

          {/* Tabela de Metas de Sono */}
          <div className="bg-[#12161F] border border-[#222938] rounded-xl p-4 space-y-3">
            <h4 className="font-space font-bold text-sm text-white flex items-center gap-2">
              <span className="text-[#00E5FF]">🌙</span>
              <span>Metas de Sono & Recuperação Muscular</span>
            </h4>
            <p className="text-xs text-[#849396]">
              Classificação oficial de horas de sono por noite recomendada para atletas:
            </p>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-red-950/20 border border-red-800/30 text-xs">
                <span className="font-space font-bold text-red-400">🔴 Ruim</span>
                <span className="font-mono font-semibold text-red-300">&lt; 5h (Menos de 5h)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-orange-950/20 border border-orange-800/30 text-xs">
                <span className="font-space font-bold text-orange-400">🟠 Abaixo do ideal</span>
                <span className="font-mono font-semibold text-orange-300">5–6h</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-yellow-950/20 border border-yellow-800/30 text-xs">
                <span className="font-space font-bold text-yellow-400">🟡 Regular</span>
                <span className="font-mono font-semibold text-yellow-300">6–7h</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30 text-xs">
                <span className="font-space font-bold text-emerald-400">🟢 Bom</span>
                <span className="font-mono font-semibold text-emerald-300">7–8h (7 a 9h)</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-space font-bold text-[#00E5FF]">⭐ Excelente</span>
                  <span className="font-mono font-semibold text-[#00E5FF]">8–9h</span>
                </div>
                <p className="text-[10px] text-[#BAC9CC] leading-tight font-sans">
                  * 8 a 9 horas com sono profundo e boa qualidade (pico de GH e anabolismo).
                </p>
              </div>
            </div>
          </div>

          {/* Dados Cadastrais do Aluno */}
          <div className="bg-[#12161F] border border-[#222938] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-space font-bold text-sm text-white flex items-center gap-2">
                <User className="w-4 h-4 text-[#00E5FF]" />
                <span>Dados Cadastrais do Aluno</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(true)}
                className="text-xs text-[#00E5FF] hover:underline font-space font-semibold cursor-pointer"
              >
                Editar Dados / Senha
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-[#1D2026]">
                <span className="text-[#BAC9CC]">Nome:</span>
                <span className="font-space font-bold text-white">{stats.name}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#1D2026]">
                <span className="text-[#BAC9CC]">E-mail / Login:</span>
                <span className="font-mono text-white">{stats.email || 'Não informado'}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-[#1D2026]">
                <span className="text-[#BAC9CC]">Data de Nascimento:</span>
                <span className="font-mono text-[#00E5FF]">
                  {stats.birthDate
                    ? stats.birthDate.split('-').reverse().join('/')
                    : 'Não informada'}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-[#BAC9CC]">Senha de Acesso:</span>
                <span className="font-mono text-[#849396]">•••••••• (Protegida)</span>
              </div>
            </div>
          </div>

          <div className="bg-[#12161F] border border-[#222938] rounded-xl p-4 space-y-3">
            <h4 className="font-space font-bold text-sm text-white">
              Metas do Plano Team Wagner
            </h4>
            <div className="flex items-center justify-between text-xs py-2 border-b border-[#1D2026]">
              <span className="text-[#BAC9CC]">Meta Semanal de Treinos</span>
              <span className="font-mono font-bold text-[#00E5FF]">{stats.weeklyGoalTarget} dias / semana</span>
            </div>
            <div className="flex items-center justify-between text-xs py-2 border-b border-[#1D2026]">
              <span className="text-[#BAC9CC]">Meta Mensal</span>
              <span className="font-mono font-bold text-white">16 treinos</span>
            </div>
            <div className="flex items-center justify-between text-xs py-2">
              <span className="text-[#BAC9CC]">Metodologia</span>
              <span className="font-mono text-[#BAC9CC]">Wagner Rocha Coaching</span>
            </div>
          </div>

          <div className="bg-[#12161F] border border-[#222938] rounded-xl p-4 space-y-3">
            <h4 className="font-space font-bold text-sm text-white flex items-center justify-between">
              <span>Sessão & Conta</span>
              <span className="text-[10px] font-mono text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30">
                Atleta Ativo
              </span>
            </h4>
            <p className="text-xs text-[#849396] leading-relaxed">
              Deseja alternar de perfil ou cadastrar um novo atleta? Seus treinos, metas e checklists permanecem salvos com segurança no banco de dados.
            </p>
            <button
              onClick={() => setIsLogoutModalOpen(true)}
              className="w-full py-3 bg-rose-600/15 hover:bg-rose-600/25 border border-rose-500/40 hover:border-rose-500 text-rose-300 hover:text-rose-200 rounded-xl font-space font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(225,29,72,0.2)]"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>Sair da Conta (Logout)</span>
            </button>

            {/* Exportar Código Atualizado para GitHub / Vercel */}
            <div className="pt-2 border-t border-[#222938]">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch('/team-wagner-app.zip');
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'team-wagner-app.zip';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                  } catch (e) {
                    window.open('/team-wagner-app.zip', '_blank');
                  }
                }}
                className="w-full py-3 px-3 bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 border border-[#00E5FF]/50 hover:border-[#00E5FF] text-[#00E5FF] hover:text-white rounded-xl font-space font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(0,229,255,0.2)]"
              >
                <Download className="w-4 h-4 text-[#00E5FF]" />
                <span>Baixar Projeto Atualizado (.ZIP)</span>
              </button>
              <p className="text-[10px] text-[#849396] text-center mt-1.5 font-mono">
                Baixe este arquivo e suba na pasta do seu GitHub para atualizar a Vercel
              </p>
            </div>

            {onToggleDevMode && (
              <div className="pt-2 border-t border-[#222938]">
                <button
                  type="button"
                  onClick={onToggleDevMode}
                  className="w-full py-2 px-3 bg-[#0B0E14] hover:bg-[#171B26] border border-[#222938] hover:border-[#00E5FF]/40 text-[#849396] hover:text-[#00E5FF] rounded-lg font-mono text-[11px] flex items-center justify-between transition-colors"
                >
                  <span>{isDevMode ? 'Ocultar Barra de Desenvolvedor' : 'Ferramentas do Treinador (4 Telas / ZIP)'}</span>
                  <span className="text-[10px] text-[#00E5FF] px-1.5 py-0.5 rounded bg-[#00E5FF]/10 font-bold">Admin</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <div className="pt-6 flex justify-center">
        <WRLogo variant="full" subtext="@treinador.wagner" size="sm" />
      </div>

      {/* Avatar Upload Modal */}
      <AvatarUploadModal
        isOpen={isAvatarModalOpen}
        currentAvatarUrl={stats.avatarUrl}
        userName={stats.name}
        onClose={() => setIsAvatarModalOpen(false)}
        onSaveAvatar={handleSaveAvatar}
        onRemoveAvatar={handleRemoveAvatar}
      />

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        isOpen={isLogoutModalOpen}
        userName={stats.name}
        userEmail={stats.email}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirmLogout={() => {
          if (onLogout) {
            onLogout();
          } else {
            onReturnToOnboarding();
          }
        }}
      />

      {/* Edit Student Profile Modal */}
      <ClientRegisterModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        onSaveProfile={(updated) => {
          if (onUpdateStats) {
            onUpdateStats({
              ...stats,
              ...updated,
            });
          }
        }}
        initialStats={stats}
      />
    </div>
  );
};
