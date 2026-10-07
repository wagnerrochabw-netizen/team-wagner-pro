'use client';

import React, { useState } from 'react';
import {
  X,
  Dumbbell,
  Footprints,
  Flame,
  Clock,
  Camera,
  Image as ImageIcon,
  Check,
  Link2,
  ChevronLeft,
  MoreVertical,
  User,
  Sparkles,
  Bike,
  Swords,
  Timer,
  Plus
} from 'lucide-react';
import { ActivityType, SensationType, WorkoutLog } from '@/lib/types';
import { WRLogo } from './WRLogo';
import { DIRECT_IMAGE_PRESETS } from '@/lib/initial-data';
import {
  getStoredCustomActivities,
  saveStoredCustomActivities,
  CustomActivityItem,
  AVAILABLE_ICONS,
  PRESET_SUGGESTIONS,
  renderActivityIcon
} from '@/lib/activity-helpers';

interface RegisterWorkoutModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSaveWorkout: (workout: Omit<WorkoutLog, 'id' | 'timestamp'>) => void;
  isEmbedded?: boolean;
}

export const RegisterWorkoutModal: React.FC<RegisterWorkoutModalProps> = ({
  isOpen = true,
  onClose = () => {},
  onSaveWorkout,
  isEmbedded = false,
}) => {
  const [activityType, setActivityType] = useState<ActivityType>('Musculação');
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [customMinutes, setCustomMinutes] = useState<string>('');
  const [sensation, setSensation] = useState<SensationType>('pesado');
  const [notes, setNotes] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [photoSource, setPhotoSource] = useState<'direct_url' | 'upload' | 'preset'>('direct_url');
  const [showDirectLinkInput, setShowDirectLinkInput] = useState<boolean>(false);
  const [directLinkInput, setDirectLinkInput] = useState<string>('');
  const [isSuccessFeedback, setIsSuccessFeedback] = useState<boolean>(false);

  const [customActivities, setCustomActivities] = useState<CustomActivityItem[]>([]);
  const [isAddingCustom, setIsAddingCustom] = useState<boolean>(false);
  const [newActivityName, setNewActivityName] = useState<string>('');
  const [selectedIconName, setSelectedIconName] = useState<string>('zap');

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const stored = getStoredCustomActivities();
      if (stored.length > 0) {
        setCustomActivities(stored);
      }
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleAddCustomActivity = (nameToAdd?: string, iconToAdd?: string) => {
    const name = (nameToAdd || newActivityName).trim();
    if (!name) return;

    const icon = iconToAdd || selectedIconName;
    const exists = customActivities.some((c) => c.name.toLowerCase() === name.toLowerCase()) ||
                   activities.some((a) => a.label.toLowerCase() === name.toLowerCase());

    if (!exists) {
      const newItem: CustomActivityItem = {
        id: `act_${customActivities.length + 1}_${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
        name,
        iconName: icon,
      };
      const updated = [...customActivities, newItem];
      setCustomActivities(updated);
      saveStoredCustomActivities(updated);
    }

    setActivityType(name);
    setNewActivityName('');
    setIsAddingCustom(false);
  };

  const handleDeleteCustomActivity = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const itemToDelete = customActivities.find((c) => c.id === id);
    const updated = customActivities.filter((c) => c.id !== id);
    setCustomActivities(updated);
    saveStoredCustomActivities(updated);
    if (itemToDelete && activityType === itemToDelete.name) {
      setActivityType('Musculação');
    }
  };

  if (!isOpen && !isEmbedded) return null;

  const activities: { label: ActivityType; icon: React.ReactNode }[] = [
    { label: 'Musculação', icon: <Dumbbell className="w-4 h-4" /> },
    { label: 'Corrida', icon: <Footprints className="w-4 h-4" /> },
    { label: 'Caminhada', icon: <Footprints className="w-4 h-4 opacity-80" /> },
    { label: 'Cross Training', icon: <Timer className="w-4 h-4" /> },
    { label: 'Ciclismo', icon: <Bike className="w-4 h-4" /> },
    { label: 'Luta', icon: <Swords className="w-4 h-4" /> },
  ];

  const durationPresets = [30, 45, 60, 90];

  const sensations: {
    id: SensationType;
    label: string;
    emoji: string;
    badgeIcon?: React.ReactNode;
  }[] = [
    { id: 'leve', label: 'Leve', emoji: '😌' },
    { id: 'bom', label: 'Bom', emoji: '😃' },
    { id: 'pesado', label: 'Pesado', emoji: '🔥' },
    { id: 'muito_pesado', label: 'Muito pesado', emoji: '💀' },
  ];

  const handleCustomMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setCustomMinutes(val);
    if (val) {
      setDurationMinutes(parseInt(val, 10));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
        setPhotoSource('upload');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyDirectLink = () => {
    if (directLinkInput.trim()) {
      setPhotoUrl(directLinkInput.trim());
      setPhotoSource('direct_url');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccessFeedback(true);

    const now = new Date();
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const displayDate = `${now.getDate()} ${months[now.getMonth()]}`;
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    setTimeout(() => {
      onSaveWorkout({
        date: dateStr,
        displayDate: 'Hoje',
        activityType,
        durationMinutes,
        sensation,
        notes: notes.trim() || undefined,
        photoUrl: photoUrl || undefined,
        photoSource,
      });
      setIsSuccessFeedback(false);
      onClose();
    }, 400);
  };

  const innerCard = (
    <div className={`w-full bg-[#0B0E14] text-[#E1E2EB] flex flex-col pb-10 ${
      isEmbedded ? 'rounded-[32px]' : 'max-w-lg min-h-screen sm:min-h-0 sm:rounded-2xl border border-[#222938] shadow-2xl my-auto'
    }`}>
      
      {/* Top App Bar Header matching Image 1 */}
      <div className="sticky top-0 z-20 bg-[#0B0E14]/95 backdrop-blur-md border-b border-[#1D2026] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1 text-[#BAC9CC] hover:text-white transition-colors"
            title="Voltar"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <WRLogo variant="monogram" size="sm" />
          <div className="flex flex-col">
            <span className="font-space text-xs font-bold tracking-tight text-[#00E5FF] leading-none">
              TEAM WAGNER
            </span>
            <span className="text-[11px] text-white font-medium">Novo Tre...</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-1 text-[#BAC9CC] hover:text-white transition-colors">
            <MoreVertical className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-[#00E5FF]/20 border border-[#00E5FF] flex items-center justify-center text-[#00E5FF]">
            <User className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Inner Content */}
      <div className="p-5 space-y-6">
        {/* Title Header with Close */}
        <div className="relative">
          <div className="text-[11px] font-mono tracking-wider font-semibold text-[#00E5FF] uppercase mb-1">
            TEAM WAGNER • DIÁRIO
          </div>
          <h1 className="font-space text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Registrar Treino
          </h1>
          <p className="text-xs text-[#849396] mt-0.5">
            Adicione seu treino de hoje em menos de 15 segundos.
          </p>

          <button
            onClick={onClose}
            className="absolute right-0 top-0 w-8 h-8 rounded-full bg-[#171B26] border border-[#222938] text-[#BAC9CC] hover:text-white flex items-center justify-center transition-colors"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Data do Treino: Exclusivo no Dia Atual */}
          <div className="p-3 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
              <span className="font-space font-bold text-white">Data do Registro:</span>
              <span suppressHydrationWarning className="font-mono text-[#00E5FF] font-semibold">Hoje ({new Date().toLocaleDateString('pt-BR')})</span>
            </div>
            <span className="text-[10px] font-mono text-[#00E5FF] px-2 py-0.5 rounded bg-[#0B0E14] border border-[#00E5FF]/40 font-bold">
              Apenas Dia Atual
            </span>
          </div>

          {/* 1. TIPO DE ATIVIDADE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-space font-bold uppercase tracking-wider text-white">
                1. TIPO DE ATIVIDADE
              </span>
              <span className="font-mono text-[#00E5FF] text-[11px]">
                Obrigatório
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Atividades Padrão */}
              {activities.map((act) => {
                const isSelected = activityType === act.label;
                return (
                  <button
                    type="button"
                    key={act.label}
                    onClick={() => setActivityType(act.label)}
                    className={`px-4 py-2.5 rounded-full text-xs font-medium font-space flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#00E5FF] text-[#0B0E14] font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                        : 'bg-[#12161F] text-[#E1E2EB] border border-[#222938] hover:border-[#849396]'
                    }`}
                  >
                    {act.icon}
                    <span>{act.label}</span>
                  </button>
                );
              })}

              {/* Atividades Personalizadas Adicionadas pelo Usuário */}
              {customActivities.map((act) => {
                const isSelected = activityType === act.name;
                return (
                  <div
                    key={act.id}
                    className="relative group flex items-center"
                  >
                    <button
                      type="button"
                      onClick={() => setActivityType(act.name)}
                      className={`px-4 py-2.5 rounded-full text-xs font-medium font-space flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#00E5FF] text-[#0B0E14] font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)] pr-7'
                          : 'bg-[#12161F] text-[#E1E2EB] border border-[#222938] hover:border-[#849396] pr-7'
                      }`}
                    >
                      {renderActivityIcon(act.name, act.iconName)}
                      <span>{act.name}</span>
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteCustomActivity(act.id, e)}
                      className={`absolute right-2 p-0.5 rounded-full transition-colors cursor-pointer ${
                        isSelected ? 'text-[#0B0E14]/70 hover:text-[#0B0E14]' : 'text-[#849396] hover:text-red-400'
                      }`}
                      title="Excluir modalidade personalizada"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}

              {/* Botão + Adicionar Atividade */}
              <button
                type="button"
                onClick={() => setIsAddingCustom(!isAddingCustom)}
                className={`px-4 py-2.5 rounded-full text-xs font-medium font-space flex items-center gap-1.5 transition-all cursor-pointer border ${
                  isAddingCustom
                    ? 'border-[#00E5FF] bg-[#00E5FF]/20 text-[#00E5FF] font-bold shadow-[0_0_10px_rgba(0,229,255,0.2)]'
                    : 'border-dashed border-[#00E5FF]/60 hover:border-[#00E5FF] text-[#00E5FF] hover:bg-[#00E5FF]/10 bg-[#12161F]/60'
                }`}
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Adicionar Atividade</span>
              </button>
            </div>

            {/* Painel Expansível de Adicionar Nova Atividade */}
            {isAddingCustom && (
              <div className="p-4 rounded-2xl bg-[#12161F] border border-[#00E5FF]/40 space-y-3.5 animate-in fade-in duration-200 shadow-xl mt-2">
                <div className="flex items-center justify-between">
                  <span className="font-space font-bold text-xs text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span>Nova Atividade Personalizada</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingCustom(false)}
                    className="text-[#849396] hover:text-white p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Input de Nome */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newActivityName}
                    onChange={(e) => setNewActivityName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomActivity();
                      }
                    }}
                    placeholder="Nome da atividade (ex: Natação, Pilates, Funcional...)"
                    className="flex-1 bg-[#0B0E14] border border-[#222938] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-[#849396] focus:outline-none focus:border-[#00E5FF]"
                    autoFocus
                  />
                  <button
                    type="button"
                    disabled={!newActivityName.trim()}
                    onClick={() => handleAddCustomActivity()}
                    className="px-4 py-2.5 rounded-xl bg-[#00E5FF] hover:bg-[#33EAFF] disabled:opacity-40 disabled:hover:bg-[#00E5FF] text-[#0B0E14] font-space font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-[0_0_12px_rgba(0,229,255,0.3)]"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Salvar</span>
                  </button>
                </div>

                {/* Sugestões Rápidas em 1 Clique */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-[#849396] uppercase tracking-wider block">
                    Sugestões Rápidas:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_SUGGESTIONS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => handleAddCustomActivity(preset.name, preset.iconName)}
                        className="px-2.5 py-1 rounded-lg bg-[#171B26] hover:bg-[#00E5FF]/15 border border-[#222938] hover:border-[#00E5FF]/40 text-[11px] font-space text-[#BAC9CC] hover:text-[#00E5FF] flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        {renderActivityIcon(preset.name, preset.iconName, 'w-3 h-3')}
                        <span>+{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Escolha do Ícone */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-[#849396] uppercase tracking-wider block">
                    Ícone Representativo:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_ICONS.map((iconItem) => (
                      <button
                        key={iconItem.id}
                        type="button"
                        onClick={() => setSelectedIconName(iconItem.id)}
                        className={`p-2 rounded-lg border transition-all cursor-pointer flex items-center gap-1 text-[11px] font-space ${
                          selectedIconName === iconItem.id
                            ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF]'
                            : 'bg-[#0B0E14] border-[#222938] text-[#849396] hover:text-white'
                        }`}
                        title={iconItem.label}
                      >
                        {iconItem.icon}
                        <span className="text-[9px]">{iconItem.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. DURAÇÃO */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-space font-bold uppercase tracking-wider text-white">
                2. DURAÇÃO
              </span>
              <span className="font-mono text-[#00E5FF] text-xs font-semibold">
                {durationMinutes} minutos
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {durationPresets.map((mins) => {
                const isSelected = durationMinutes === mins && !customMinutes;
                return (
                  <button
                    type="button"
                    key={mins}
                    onClick={() => {
                      setDurationMinutes(mins);
                      setCustomMinutes('');
                    }}
                    className={`py-2.5 rounded-lg text-xs font-medium font-mono transition-all ${
                      isSelected
                        ? 'bg-[#00E5FF] text-[#0B0E14] font-bold shadow-[0_0_15px_rgba(0,229,255,0.35)]'
                        : 'bg-[#12161F] text-[#BAC9CC] border border-[#222938] hover:border-[#849396]'
                    }`}
                  >
                    {mins} min
                  </button>
                );
              })}
            </div>

            {/* Exact minutes input */}
            <div className="flex items-center gap-2 bg-[#12161F] border border-[#222938] rounded-lg px-3 py-2 focus-within:border-[#00E5FF] transition-colors">
              <Clock className="w-4 h-4 text-[#00E5FF]" />
              <input
                type="text"
                placeholder="ou digite os minutos exatos"
                value={customMinutes}
                onChange={handleCustomMinutesChange}
                className="bg-transparent text-xs text-white placeholder-[#849396] focus:outline-none flex-1 font-mono"
              />
              <span className="text-[11px] font-mono text-[#849396] font-bold">
                MIN
              </span>
            </div>
          </div>

          {/* 3. COMO FOI O TREINO HOJE? */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-space font-bold uppercase tracking-wider text-white">
                3. COMO FOI O TREINO HOJE?
              </span>
              <span className="font-mono text-[#00E5FF] text-[11px]">
                Sensação
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {sensations.map((sens) => {
                const isSelected = sensation === sens.id;
                return (
                  <button
                    type="button"
                    key={sens.id}
                    onClick={() => setSensation(sens.id)}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-[#12161F] border-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.2)]'
                        : 'bg-[#12161F] border-[#222938] hover:border-[#849396]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{sens.emoji}</span>
                      <span
                        className={`font-space text-xs font-semibold ${
                          isSelected ? 'text-[#00E5FF]' : 'text-white'
                        }`}
                      >
                        {sens.label}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full border border-[#00E5FF] bg-[#00E5FF]/20 flex items-center justify-center text-[#00E5FF]">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. OBSERVAÇÕES */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-space font-bold uppercase tracking-wider text-white">
                4. QUER REGISTRAR ALGUMA OBSERVAÇÃO?
              </span>
              <span className="font-mono text-[#849396] text-[11px]">
                Opcional
              </span>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Treino de pernas com foco em agachamento, intensidade máxima nas últimas séries..."
              rows={3}
              className="w-full bg-[#12161F] border border-[#222938] rounded-xl p-3 text-xs text-white placeholder-[#849396] focus:border-[#00E5FF] focus:outline-none transition-colors font-sans resize-none"
            />
          </div>

          {/* 5. FOTO DO TREINO */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-space font-bold uppercase tracking-wider text-white">
                5. FOTO DO TREINO
              </span>
              <span className="font-mono text-[#849396] text-[11px]">
                Opcional
              </span>
            </div>

            {/* Upload Card */}
            <div className="bg-[#12161F] border border-[#222938] rounded-xl p-4 text-center space-y-3">
              
              {photoUrl ? (
                <div className="relative w-full h-44 rounded-lg overflow-hidden border border-[#00E5FF]/40 bg-[#0B0E14] group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoUrl}
                    alt="Foto do treino"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="px-3 py-1.5 rounded-lg bg-red-600/80 text-white text-xs font-space font-semibold hover:bg-red-600 transition-colors"
                    >
                      Remover Foto
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-[#0B0E14]/80 backdrop-blur-sm border border-[#00E5FF]/40 px-2 py-0.5 rounded text-[10px] font-mono text-[#00E5FF]">
                    Foto anexada ✓
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] flex items-center justify-center mx-auto">
                    <Camera className="w-5 h-5" />
                  </div>

                  <div>
                    <h4 className="font-space font-bold text-sm text-white">
                      Adicionar foto do treino
                    </h4>
                    <p className="text-xs text-[#849396] mt-0.5">
                      Registre a evolução do dia para o seu histórico visual Team Wagner
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    {/* Galeria button (file upload) */}
                    <label className="cursor-pointer px-4 py-2 rounded-lg bg-[#171B26] border border-[#222938] hover:border-[#849396] text-xs font-space font-medium text-white flex items-center gap-1.5 transition-colors">
                      <ImageIcon className="w-4 h-4 text-[#00E5FF]" />
                      <span>Galeria</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>

                    {/* Câmera button (camera capture/simulate) */}
                    <label className="cursor-pointer px-4 py-2 rounded-lg bg-[#171B26] border border-[#222938] hover:border-[#849396] text-xs font-space font-medium text-white flex items-center gap-1.5 transition-colors">
                      <Camera className="w-4 h-4 text-[#00E5FF]" />
                      <span>Câmera</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>

                    {/* Direct HTML Link Button (User request feature) */}
                    <button
                      type="button"
                      onClick={() => setShowDirectLinkInput(!showDirectLinkInput)}
                      className={`px-4 py-2 rounded-lg border text-xs font-space font-medium flex items-center gap-1.5 transition-colors ${
                        showDirectLinkInput
                          ? 'bg-[#00E5FF]/20 border-[#00E5FF] text-[#00E5FF]'
                          : 'bg-[#171B26] border-[#222938] text-white hover:border-[#849396]'
                      }`}
                    >
                      <Link2 className="w-4 h-4 text-[#00E5FF]" />
                      <span>Link Direto (URL)</span>
                    </button>
                  </div>
                </>
              )}

              {/* Direct Link Panel */}
              {showDirectLinkInput && (
                <div className="mt-3 pt-3 border-t border-[#222938] text-left space-y-2">
                  <span className="text-[11px] font-mono text-[#BAC9CC] block">
                    Cole a URL direta da imagem (ex: https://...):
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={directLinkInput}
                      onChange={(e) => setDirectLinkInput(e.target.value)}
                      className="flex-1 bg-[#0B0E14] border border-[#222938] rounded-lg px-3 py-1.5 text-xs text-white placeholder-[#849396] focus:border-[#00E5FF] focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={handleApplyDirectLink}
                      disabled={!directLinkInput.trim()}
                      className="px-3 py-1.5 bg-[#00E5FF] text-[#0B0E14] font-space font-bold text-xs rounded-lg disabled:opacity-40"
                    >
                      Aplicar
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 pt-1 overflow-x-auto pb-1">
                    <span className="text-[10px] text-[#849396] shrink-0 font-mono">
                      Presets rápidos:
                    </span>
                    {DIRECT_IMAGE_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setDirectLinkInput(p.url);
                          setPhotoUrl(p.url);
                          setPhotoSource('preset');
                        }}
                        className="px-2 py-0.5 rounded bg-[#171B26] border border-[#222938] text-[10px] text-[#BAC9CC] hover:text-[#00E5FF] hover:border-[#00E5FF] shrink-0 transition-colors"
                      >
                        {p.category}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CONCLUIR TREINO BUTTON matching Image 1 */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSuccessFeedback}
              className="w-full h-14 rounded-xl bg-[#00E5FF] text-[#0B0E14] hover:bg-[#00daf3] active:scale-[0.99] font-space font-bold text-sm tracking-wider uppercase flex flex-col items-center justify-center shadow-[0_0_25px_rgba(0,229,255,0.4)] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 fill-current" />
                <span>CONCLUIR TREINO</span>
              </div>
            </button>
            <p className="text-center text-[11px] text-[#849396] mt-2 font-mono">
              Registro instantâneo sincronizado com seu plano Team Wagner
            </p>
          </div>
        </form>

        {/* Footer Logo */}
        <div className="pt-6 border-t border-[#1D2026] flex justify-center">
          <WRLogo variant="full" subtext="@treinador.wagner" size="sm" />
        </div>
      </div>
    </div>
  );

  if (isEmbedded) {
    return innerCard;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex justify-center items-start sm:p-4 animate-in fade-in duration-200">
      {innerCard}
    </div>
  );
};
