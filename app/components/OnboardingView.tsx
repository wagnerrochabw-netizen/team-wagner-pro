'use client';

import React, { useState } from 'react';
import {
  Zap,
  Flame,
  Activity,
  Users,
  ChevronRight,
  Sparkles,
  Dumbbell,
  CheckCircle2,
  Lock,
  ArrowRight,
  Image as ImageIcon,
  Link2,
  Camera,
  User
} from 'lucide-react';
import { WRLogo } from './WRLogo';
import { UserStats } from '@/lib/types';
import { ClientRegisterModal } from './ClientRegisterModal';

interface OnboardingViewProps {
  onStartApp: () => void;
  onOpenDirectImageGuide: () => void;
  stats?: UserStats;
  onUpdateStats?: (updated: UserStats) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  onStartApp,
  onOpenDirectImageGuide,
  stats,
  onUpdateStats,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showGoalsModal, setShowGoalsModal] = useState(false);
  const [isRegisterClientOpen, setIsRegisterClientOpen] = useState(false);
  const [targetWeeklyDays, setTargetWeeklyDays] = useState(stats?.weeklyGoalTarget || 4);
  const [primaryFocus, setPrimaryFocus] = useState('Hipertrofia & Força');
  const [bannerImageUrl, setBannerImageUrl] = useState('/gym_dark_atmospheric_dumbbells.jpg');
  const [isChangingBanner, setIsChangingBanner] = useState(false);
  const [customBannerUrl, setCustomBannerUrl] = useState('');

  const stepsData = [
    {
      step: 1,
      tag: 'PASSO 1 DE 3',
      title: 'Transforme treino em progresso',
      description: 'O método definitivo para quem forja disciplina em cada repetição diária.',
      features: [
        {
          icon: <Zap className="w-4 h-4 text-[#00E5FF]" />,
          title: 'Registre seus treinos em segundos',
          desc: 'Fluxo ágil sem atrito para manter o foco na carga.',
        },
        {
          icon: <Activity className="w-4 h-4 text-[#00E5FF]" />,
          title: 'Veja sua consistência crescer',
          desc: 'Métricas refinadas e streaks de aço inquebráveis.',
        },
        {
          icon: <Users className="w-4 h-4 text-[#00E5FF]" />,
          title: 'Participe de desafios com amigos',
          desc: 'Comunidade de alta performance cobrando resultados.',
        },
      ],
    },
    {
      step: 2,
      tag: 'PASSO 2 DE 3',
      title: 'Métricas de Elite & Telemetria',
      description: 'Acompanhe seu volume de carga, RPE de esforço e evolução semanal com precisão.',
      features: [
        {
          icon: <Flame className="w-4 h-4 text-[#FF9100]" />,
          title: 'Streaks à prova de falhas',
          desc: 'Alertas estratégicos e reforço diário de hábitos.',
        },
        {
          icon: <Sparkles className="w-4 h-4 text-[#00E5FF]" />,
          title: 'Histórico visual com fotos',
          desc: 'Anexe fotos de treinos via link direto HTML ou câmera.',
        },
        {
          icon: <CheckCircle2 className="w-4 h-4 text-[#00E5FF]" />,
          title: 'Planilha sincronizada Team Wagner',
          desc: 'Orientação personalizada com a metodologia Wagner Rocha.',
        },
      ],
    },
    {
      step: 3,
      tag: 'PASSO 3 DE 3',
      title: 'Pronto para entrar na arena?',
      description: 'Adicione sua foto de perfil, defina seus objetivos e inicie sua jornada agora mesmo.',
      features: [
        {
          icon: <Camera className="w-4 h-4 text-[#00E5FF]" />,
          title: 'Foto de Perfil Personalizada',
          desc: 'Envie sua foto direto da câmera ou galeria do seu celular.',
        },
        {
          icon: <Dumbbell className="w-4 h-4 text-[#00E5FF]" />,
          title: 'Treinos estruturados',
          desc: 'Registro rápido em menos de 15 segundos.',
        },
        {
          icon: <Activity className="w-4 h-4 text-[#00E5FF]" />,
          title: 'Metas progressivas semanais',
          desc: 'Objetivo padrão: 4 treinos para manter ritmo consistente.',
        },
      ],
    },
  ];

  const currentStepInfo = stepsData[currentStep - 1] || stepsData[0];

  const handleSaveRegisteredProfile = (updatedData: Partial<UserStats>) => {
    if (onUpdateStats && stats) {
      onUpdateStats({
        ...stats,
        ...updatedData,
      });
    }
    onStartApp();
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#E1E2EB] px-4 py-8 max-w-md mx-auto flex flex-col justify-between">
      {/* Brand Header matching Image 7 */}
      <div className="text-center space-y-2 pt-2">
        <div className="flex justify-center">
          <WRLogo variant="monogram" size="xl" />
        </div>
        <h1 className="font-space text-3xl font-extrabold text-[#00E5FF] tracking-tight drop-shadow-[0_0_20px_rgba(0,229,255,0.4)]">
          TEAM WAGNER
        </h1>
        <p className="text-xs text-[#BAC9CC] font-sans">
          Consistência constrói resultados.
        </p>

        {/* Stepper Dots */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {[1, 2, 3].map((stepIdx) => (
            <button
              key={stepIdx}
              type="button"
              onClick={() => setCurrentStep(stepIdx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                currentStep === stepIdx
                  ? 'w-8 bg-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.8)]'
                  : 'w-2 bg-[#222938] hover:bg-[#849396]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Card matching Image 7 */}
      <div className="my-6 bg-[#12161F] border border-[#222938] rounded-2xl p-5 space-y-4 shadow-xl">
        {/* Step Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-[#00E5FF] font-mono font-semibold">
            <Dumbbell className="w-4 h-4" />
            <span>{currentStepInfo.tag}</span>
          </div>
        </div>

        {/* Headline */}
        <div>
          <h2 className="font-space text-xl font-bold text-white tracking-tight leading-snug">
            {currentStepInfo.title}
          </h2>
          <p className="text-xs text-[#849396] mt-1 leading-relaxed">
            {currentStepInfo.description}
          </p>
        </div>

        {/* Image Banner matching Image 7 */}
        <div className="relative w-full h-36 rounded-xl overflow-hidden border border-[#222938] bg-[#0B0E14] group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bannerImageUrl}
            alt="Atmosfera Team Wagner"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Overlay pills: Ritual Diário • Ativo */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#00E5FF]/40 text-[#00E5FF] font-space text-[10px] font-bold flex items-center gap-1">
              <Flame className="w-3 h-3 fill-current" />
              Ritual Diário
            </span>
            <span className="px-2 py-1 rounded-full bg-[#00E5FF]/20 backdrop-blur-md border border-[#00E5FF]/40 text-[#00E5FF] font-mono text-[10px] font-semibold">
              Ativo
            </span>
          </div>

          {/* Quick customize banner with direct link button */}
          <button
            onClick={() => setIsChangingBanner(!isChangingBanner)}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-[#BAC9CC] hover:text-[#00E5FF] border border-[#222938] text-[10px] flex items-center gap-1 cursor-pointer"
            title="Alterar imagem do banner com link direto"
          >
            <ImageIcon className="w-3 h-3" />
            <span className="hidden sm:inline font-mono">Alterar Banner</span>
          </button>
        </div>

        {/* Changing banner drawer */}
        {isChangingBanner && (
          <div className="p-3 rounded-xl bg-[#0B0E14] border border-[#00E5FF]/30 space-y-2 animate-in fade-in">
            <span className="text-[11px] font-mono text-[#00E5FF] block">
              Inserir link direto de imagem HTML (URL):
            </span>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://... ou /gym_dark_atmospheric_dumbbells.jpg"
                value={customBannerUrl}
                onChange={(e) => setCustomBannerUrl(e.target.value)}
                className="flex-1 bg-[#171B26] border border-[#222938] rounded-lg px-2.5 py-1 text-xs text-white placeholder-[#849396] font-mono focus:outline-none focus:border-[#00E5FF]"
              />
              <button
                type="button"
                onClick={() => {
                  if (customBannerUrl.trim()) {
                    setBannerImageUrl(customBannerUrl.trim());
                    setIsChangingBanner(false);
                  }
                }}
                className="px-3 py-1 bg-[#00E5FF] text-[#0B0E14] font-space font-bold text-xs rounded-lg cursor-pointer"
              >
                Salvar
              </button>
            </div>
          </div>
        )}

        {/* Student Profile Quick Card Preview if stats available */}
        {stats?.avatarUrl && (
          <div className="p-3 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#00E5FF] overflow-hidden p-0.5 bg-[#0B0E14] shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={stats.avatarUrl}
                alt={stats.name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-space font-bold text-xs text-white block truncate">
                Perfil de {stats.name}
              </span>
              <span className="text-[10px] text-[#00E5FF] font-mono">
                Foto de perfil carregada com sucesso
              </span>
            </div>
          </div>
        )}

        {/* Feature Bullets matching Image 7 */}
        <div className="space-y-3 pt-1">
          {currentStepInfo.features.map((feat, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#171B26] border border-[#222938] flex items-start gap-3 hover:border-[#00E5FF]/40 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[#0B0E14] border border-[#222938] flex items-center justify-center shrink-0">
                {feat.icon}
              </div>
              <div className="min-w-0">
                <h4 className="font-space font-bold text-xs text-white leading-tight">
                  {feat.title}
                </h4>
                <p className="text-[11px] text-[#849396] mt-0.5 leading-snug">
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Primary CTA: COMEÇAR AGORA ⚡ matching Image 7 */}
      <div className="space-y-4">
        {/* Registration & Goals Actions matching Image 2 */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => setIsRegisterClientOpen(true)}
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
            onClick={() => setShowGoalsModal(true)}
            className="w-full py-3 px-4 rounded-2xl bg-[#12161F] hover:bg-[#171B26] border border-[#222938] hover:border-[#849396] text-[#BAC9CC] hover:text-white font-space font-semibold text-xs flex items-center justify-between transition-all cursor-pointer group"
          >
            <span className="text-xs font-space">Ajustar Metas e Foco</span>
            <ChevronRight className="w-4 h-4 text-[#849396] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div>
          <button
            onClick={() => {
              if (!stats?.avatarUrl) {
                setIsRegisterClientOpen(true);
              } else {
                onStartApp();
              }
            }}
            className="w-full h-14 rounded-xl bg-[#00E5FF] hover:bg-[#00daf3] active:scale-[0.99] text-[#0B0E14] font-space font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all cursor-pointer"
          >
            <span>COMEÇAR AGORA</span>
            <Zap className="w-5 h-5 fill-current" />
          </button>
          <p className="text-center text-[11px] text-[#849396] mt-2 font-mono">
            Acesso instantâneo • Sem cartão obrigatório
          </p>
        </div>

        {/* Social logins */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#1D2026]" />
            <span className="text-[10px] font-mono uppercase text-[#849396]">
              OU CONECTE-SE COM
            </span>
            <div className="flex-1 h-px bg-[#1D2026]" />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setIsRegisterClientOpen(true)}
              className="py-2.5 px-3 rounded-xl bg-[#12161F] hover:bg-[#171B26] border border-[#222938] text-xs font-space font-semibold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span className="font-bold text-sm">G</span>
              <span>Google</span>
            </button>
            <button
              onClick={() => setIsRegisterClientOpen(true)}
              className="py-2.5 px-3 rounded-xl bg-[#12161F] hover:bg-[#171B26] border border-[#222938] text-xs font-space font-semibold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span className="font-bold text-sm"></span>
              <span>Apple</span>
            </button>
          </div>
        </div>

        {/* Login Prompt */}
        <div className="text-center text-xs pt-1">
          <span className="text-[#849396]">Já tem uma conta no Team Wagner? </span>
          <button
            onClick={onStartApp}
            className="text-[#00E5FF] font-space font-bold hover:underline cursor-pointer"
          >
            Fazer login
          </button>
        </div>

        {/* Footer Brand */}
        <div className="pt-2 flex justify-center">
          <WRLogo variant="full" subtext="@treinador.wagner" size="sm" />
        </div>
      </div>

      {/* Client Registration Modal with Profile Photo Upload */}
      <ClientRegisterModal
        isOpen={isRegisterClientOpen}
        onClose={() => setIsRegisterClientOpen(false)}
        onSaveProfile={handleSaveRegisteredProfile}
        initialStats={stats || {
          name: 'Wagner',
          streakDays: 5,
          recordStreakDays: 12,
          weeklyGoalTarget: 4,
          weeklyGoalCompleted: 3,
          monthlyWorkouts: 14,
          monthlyPreviousWorkouts: 11,
          monthlyActiveDays: 10,
          monthlyTotalHoursMinutes: '11h 40m',
          averageMinutesPerSession: 50,
          consistencyPercentage: 64,
        }}
      />

      {/* Goals Modal */}
      {showGoalsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#12161F] border border-[#222938] rounded-2xl p-6 max-w-sm w-full space-y-4 text-[#E1E2EB]">
            <div className="flex items-center justify-between">
              <h3 className="font-space text-lg font-bold text-white">
                Defina seus Objetivos
              </h3>
              <button
                onClick={() => setShowGoalsModal(false)}
                className="text-[#849396] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-space font-bold text-[#BAC9CC]">
                Foco Principal
              </label>
              <div className="grid grid-cols-2 gap-2">
                {['Hipertrofia', 'Emagrecimento', 'Condicionamento', 'Força Pura'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setPrimaryFocus(f)}
                    className={`p-2.5 rounded-lg border text-xs font-space ${
                      primaryFocus === f
                        ? 'border-[#00E5FF] bg-[#00E5FF]/15 text-[#00E5FF] font-bold'
                        : 'border-[#222938] bg-[#0B0E14] text-[#BAC9CC]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-space font-bold text-[#BAC9CC]">
                Meta de treinos por semana
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[3, 4, 5, 6].map((days) => (
                  <button
                    key={days}
                    onClick={() => setTargetWeeklyDays(days)}
                    className={`py-2 rounded-lg border text-xs font-mono ${
                      targetWeeklyDays === days
                        ? 'border-[#00E5FF] bg-[#00E5FF] text-[#0B0E14] font-bold'
                        : 'border-[#222938] bg-[#0B0E14] text-[#BAC9CC]'
                    }`}
                  >
                    {days}x
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                setShowGoalsModal(false);
                setIsRegisterClientOpen(true);
              }}
              className="w-full py-3 bg-[#00E5FF] text-[#0B0E14] rounded-xl font-space font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Avançar para Foto de Perfil
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
