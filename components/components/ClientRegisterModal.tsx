'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, CheckCircle2, X, Sparkles, User, Dumbbell, Target, Calendar, Lock, Eye, EyeOff } from 'lucide-react';
import { UserStats } from '@/lib/types';
import { WRLogo } from './WRLogo';

interface ClientRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (updatedData: Partial<UserStats>) => void;
  initialStats: UserStats;
}

export const ClientRegisterModal: React.FC<ClientRegisterModalProps> = ({
  isOpen,
  onClose,
  onSaveProfile,
  initialStats,
}) => {
  const [name, setName] = useState(initialStats.name || '');
  const [email, setEmail] = useState(initialStats.email || '');
  const [birthDate, setBirthDate] = useState(initialStats.birthDate || '');
  const [password, setPassword] = useState(initialStats.password || '');
  const [confirmPassword, setConfirmPassword] = useState(initialStats.password || '');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialStats.avatarUrl || null);
  const [weeklyGoal, setWeeklyGoal] = useState<number>(initialStats.weeklyGoalTarget || 4);
  const [dailyMealsGoal, setDailyMealsGoal] = useState<number>(initialStats.dailyMealsTarget || 4);
  const [goalType, setGoalType] = useState('Hipertrofia & Força');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setAvatarUrl(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password && confirmPassword && password !== confirmPassword) {
      setPasswordError('As senhas digitadas não coincidem.');
      return;
    }

    if (password && password.length < 6) {
      setPasswordError('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    onSaveProfile({
      name: name.trim() || 'Wagner',
      email: email.trim() || undefined,
      birthDate: birthDate.trim() || undefined,
      password: password || undefined,
      avatarUrl: avatarUrl || undefined,
      weeklyGoalTarget: weeklyGoal,
      dailyMealsTarget: dailyMealsGoal,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#11141C] border border-[#222938] rounded-2xl max-w-md w-full p-6 space-y-5 text-white shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#222938] pb-3">
          <div className="flex items-center gap-2">
            <WRLogo variant="monogram" size="sm" />
            <h2 className="font-space font-bold text-lg text-white">
              Cadastro do Aluno
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#849396] hover:text-white transition-colors cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Photo Upload Section */}
          <div className="flex flex-col items-center justify-center gap-2 bg-[#0B0E14] p-4 rounded-xl border border-[#222938]">
            <label className="text-xs font-space font-bold text-[#BAC9CC] flex items-center gap-1.5 self-start mb-1">
              <Camera className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Sua Foto de Perfil</span>
            </label>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="w-24 h-24 rounded-full border-2 border-[#00E5FF] overflow-hidden bg-[#171B26] p-0.5 shadow-[0_0_20px_rgba(0,229,255,0.4)] flex items-center justify-center relative">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt="Foto do Aluno"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-[#849396] gap-1">
                    <User className="w-8 h-8 text-[#00E5FF]" />
                    <span className="text-[10px] font-mono text-[#BAC9CC]">Sem foto</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex flex-col items-center justify-center text-white text-xs gap-1">
                  <Upload className="w-4 h-4 text-[#00E5FF]" />
                  <span className="font-mono text-[9px]">Trocar Foto</span>
                </div>
              </div>

              <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#00E5FF] text-[#0B0E14] flex items-center justify-center shadow-md border-2 border-[#11141C]">
                <Camera className="w-3.5 h-3.5" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-1 text-xs text-[#00E5FF] hover:underline font-space font-semibold flex items-center gap-1"
            >
              <Upload className="w-3 h-3" />
              <span>Clique para carregar foto da galeria</span>
            </button>
          </div>

          {/* Student Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-space font-bold text-[#BAC9CC]">
              Nome Completo do Aluno
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Wagner Rocha"
              className="w-full bg-[#171B26] border border-[#222938] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#849396] font-space focus:outline-none focus:border-[#00E5FF]"
            />
          </div>

          {/* Student Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-space font-bold text-[#BAC9CC]">
              E-mail do Aluno (identificador da conta)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ex: atleta@gmail.com"
              className="w-full bg-[#171B26] border border-[#222938] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#849396] font-space focus:outline-none focus:border-[#00E5FF]"
            />
          </div>

          {/* Data de Nascimento */}
          <div className="space-y-1.5">
            <label className="text-xs font-space font-bold text-[#BAC9CC] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Data de Nascimento</span>
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full bg-[#171B26] border border-[#222938] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#849396] font-space focus:outline-none focus:border-[#00E5FF] cursor-pointer"
            />
          </div>

          {/* Senha de Acesso */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-space font-bold text-[#BAC9CC] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Senha de Acesso</span>
              </label>
              <span className="text-[10px] text-[#849396] font-mono">Mínimo 6 caracteres</span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(null);
                }}
                placeholder="Crie sua senha segura"
                className="w-full bg-[#171B26] border border-[#222938] rounded-xl px-3 py-2.5 pr-10 text-sm text-white placeholder-[#849396] font-space focus:outline-none focus:border-[#00E5FF]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#849396] hover:text-white transition-colors cursor-pointer"
                title={showPassword ? 'Ocultar senha' : 'Ver senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirmar Senha */}
          <div className="space-y-1.5">
            <label className="text-xs font-space font-bold text-[#BAC9CC] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Confirmar Senha</span>
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setPasswordError(null);
              }}
              placeholder="Digite a senha novamente"
              className="w-full bg-[#171B26] border border-[#222938] rounded-xl px-3 py-2.5 text-sm text-white placeholder-[#849396] font-space focus:outline-none focus:border-[#00E5FF]"
            />
            {passwordError && (
              <p className="text-xs text-rose-400 font-sans mt-1">
                {passwordError}
              </p>
            )}
          </div>

          {/* Primary Focus */}
          <div className="space-y-1.5">
            <label className="text-xs font-space font-bold text-[#BAC9CC] flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Objetivo Principal</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                'Hipertrofia & Força',
                'Emagrecimento & Definição',
                'Condicionamento Geral',
                'Saúde & Mobilidade',
              ].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setGoalType(f)}
                  className={`p-2 rounded-xl border text-xs font-space text-left transition-all ${
                    goalType === f
                      ? 'border-[#00E5FF] bg-[#00E5FF]/15 text-[#00E5FF] font-bold'
                      : 'border-[#222938] bg-[#0B0E14] text-[#BAC9CC] hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Weekly Target Days */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-space font-bold text-[#BAC9CC] flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Treinos Programados por Semana</span>
              </label>
              <span className="text-[10px] text-[#00E5FF] font-mono font-bold">{weeklyGoal}x / sem</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[3, 4, 5, 6].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setWeeklyGoal(days)}
                  className={`py-2 rounded-xl border text-xs font-mono font-bold transition-all ${
                    weeklyGoal === days
                      ? 'border-[#00E5FF] bg-[#00E5FF] text-[#0B0E14]'
                      : 'border-[#222938] bg-[#0B0E14] text-[#BAC9CC] hover:text-white'
                  }`}
                >
                  {days}x por sem
                </button>
              ))}
            </div>
          </div>

          {/* Daily Meals Target */}
          <div className="space-y-1.5 p-3 rounded-xl bg-[#0B0E14] border border-[#222938]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-space font-bold text-[#E5C378] flex items-center gap-1.5">
                <span className="text-sm">🍽️</span>
                <span>Refeições Programadas por Dia</span>
              </label>
              <span className="text-[10px] text-[#E5C378] font-mono font-bold">{dailyMealsGoal} refeições/dia</span>
            </div>
            <p className="text-[10px] text-[#849396] font-sans">
              Determina quantos espaços de registro de refeições aparecerão diariamente para o aluno.
            </p>
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[3, 4, 5, 6].map((mealsCount) => (
                <button
                  key={mealsCount}
                  type="button"
                  onClick={() => setDailyMealsGoal(mealsCount)}
                  className={`py-2 rounded-xl border text-xs font-mono font-bold transition-all ${
                    dailyMealsGoal === mealsCount
                      ? 'border-[#C5A059] bg-[#C5A059] text-[#0B0E14] shadow-[0_0_12px_rgba(197,160,89,0.3)]'
                      : 'border-[#222938] bg-[#171B26] text-[#BAC9CC] hover:text-white'
                  }`}
                >
                  {mealsCount} refeições
                </button>
              ))}
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#849396] hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold font-space bg-[#00E5FF] text-[#0B0E14] hover:bg-[#33EAFF] shadow-[0_0_15px_rgba(0,229,255,0.4)] flex items-center gap-2 cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              Concluir Cadastro
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
