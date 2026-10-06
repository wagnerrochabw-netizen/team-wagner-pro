'use client';

import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  Clock,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  RefreshCw,
  X,
  FileText,
  Utensils
} from 'lucide-react';
import { MealItem, MealStatus } from '@/lib/types';
import { MEAL_PHOTO_PRESETS } from '@/lib/initial-data';

interface MealCardProps {
  meal: MealItem;
  onUpdate: (updated: MealItem) => void;
  onDelete: (mealId: string) => void;
  readOnly?: boolean;
}

export const MealCard: React.FC<MealCardProps> = ({
  meal,
  onUpdate,
  onDelete,
  readOnly = false,
}) => {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState(meal.notes || '');
  const [mealTime, setMealTime] = useState(meal.time || '');
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        const now = new Date();
        const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        onUpdate({
          ...meal,
          photoUrl: base64,
          status: 'registrada',
          time: meal.time || timeStr,
          updatedAt: Date.now(),
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleStatusChange = (newStatus: MealStatus) => {
    onUpdate({
      ...meal,
      status: newStatus,
      updatedAt: Date.now(),
    });
  };

  const handleSaveNotesAndTime = () => {
    onUpdate({
      ...meal,
      notes: noteText.trim() || undefined,
      time: mealTime.trim() || meal.time || undefined,
      status: meal.photoUrl ? 'registrada' : meal.status,
      updatedAt: Date.now(),
    });
    setIsEditingNote(false);
  };

  const handleSelectPreset = (url: string, title: string) => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const timestamp = now.getTime();

    onUpdate({
      ...meal,
      photoUrl: url,
      notes: meal.notes || title,
      status: 'registrada',
      time: meal.time || timeStr,
      updatedAt: timestamp,
    });
    setIsPresetModalOpen(false);
  };

  const getStatusBadge = () => {
    switch (meal.status) {
      case 'registrada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-space text-[10px] font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Registrada</span>
          </span>
        );
      case 'nao_realizada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 font-space text-[10px] font-bold">
            <AlertCircle className="w-3 h-3 text-rose-400" />
            <span>Não realizada</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-space text-[10px] font-bold">
            <HelpCircle className="w-3 h-3 text-amber-300" />
            <span>Pendente</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-[#12161F] border border-[#222938] hover:border-[#C5A059]/40 rounded-2xl p-4 space-y-3 transition-all shadow-md group">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#0B0E14] border border-[#222938] flex items-center justify-center text-[#C5A059]">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-space font-bold text-sm text-white">
                {meal.title}
              </h4>
              {meal.isExtra && (
                <span className="px-1.5 py-0.5 rounded bg-[#C5A059]/20 border border-[#C5A059]/40 text-[#E5C378] text-[9px] font-mono font-bold uppercase">
                  Extra
                </span>
              )}
            </div>
            {meal.time && (
              <span className="text-[11px] font-mono text-[#849396] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#C5A059]" />
                {meal.time}
              </span>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {getStatusBadge()}
        </div>
      </div>

      {/* Meal Photo Container */}
      <div className="relative rounded-xl overflow-hidden bg-[#0B0E14] border border-[#1D2026] aspect-video sm:aspect-[16/9] flex items-center justify-center">
        {meal.photoUrl ? (
          <div className="relative w-full h-full group/photo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={meal.photoUrl}
              alt={meal.title}
              className="w-full h-full object-cover"
            />
            {/* Overlay Action Buttons */}
            {!readOnly && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-[#00E5FF] text-[#0B0E14] font-space font-bold text-xs flex items-center gap-1.5 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title="Substituir foto da refeição"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Substituir</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(meal.id)}
                  className="p-1.5 rounded-xl bg-rose-500/80 hover:bg-rose-600 text-white font-space text-xs shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title="Excluir ou limpar refeição"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2.5 p-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#171B26] border border-[#222938] flex items-center justify-center text-[#C5A059] shadow-inner">
              <Camera className="w-6 h-6 text-[#C5A059]" />
            </div>
            <div>
              <p className="text-xs font-space font-bold text-[#E1E2EB]">
                Nenhuma foto registrada
              </p>
              <p className="text-[10px] text-[#849396] font-sans max-w-[220px]">
                Fotografe seu prato para pontuar e garantir consistência
              </p>
            </div>

            {!readOnly && (
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-[#C5A059] hover:bg-[#d6b068] active:scale-95 text-[#0B0E14] font-space font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(197,160,89,0.3)] transition-all cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Tirar / Enviar Foto</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPresetModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#171B26] hover:bg-[#222938] text-[#BAC9CC] hover:text-white border border-[#222938] font-space text-xs flex items-center gap-1 transition-colors cursor-pointer"
                  title="Escolher sugestão de foto fitness"
                >
                  <Sparkles className="w-3 h-3 text-[#00E5FF]" />
                  <span className="hidden sm:inline">Exemplo</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Observation & Notes Section */}
      <div className="space-y-1.5">
        {isEditingNote ? (
          <div className="space-y-2 bg-[#0B0E14] p-3 rounded-xl border border-[#222938]">
            <label className="text-[11px] font-space font-semibold text-[#C5A059] flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <span>Observação da Refeição</span>
            </label>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Ex: Arroz integral, patinho moído e salada verde. Pós-treino..."
              rows={2}
              className="w-full bg-[#12161F] border border-[#222938] rounded-lg p-2 text-xs text-white placeholder-[#849396] focus:border-[#C5A059] focus:outline-none"
            />
            <div className="flex items-center justify-between gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 text-[#849396]" />
                <input
                  type="time"
                  value={mealTime}
                  onChange={(e) => setMealTime(e.target.value)}
                  className="bg-[#12161F] border border-[#222938] rounded px-2 py-1 text-xs text-white font-mono focus:border-[#C5A059] focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingNote(false)}
                  className="px-2.5 py-1 rounded-lg text-xs text-[#849396] hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveNotesAndTime}
                  className="px-3 py-1 rounded-lg bg-[#C5A059] text-[#0B0E14] font-space font-bold text-xs hover:bg-[#d6b068] transition-colors"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2 p-2.5 rounded-xl bg-[#0B0E14]/60 border border-[#1D2026]">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-[#BAC9CC] leading-relaxed break-words font-sans">
                {meal.notes || (
                  <span className="text-[#64748B] italic">
                    Nenhuma observação informada. Clique em editar para descrever o prato.
                  </span>
                )}
              </p>
            </div>
            {!readOnly && (
              <button
                type="button"
                onClick={() => {
                  setNoteText(meal.notes || '');
                  setMealTime(meal.time || '');
                  setIsEditingNote(true);
                }}
                className="p-1 rounded text-[#849396] hover:text-[#C5A059] transition-colors shrink-0"
                title="Editar observação ou horário"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick Status Bar / Actions */}
      {!readOnly && (
        <div className="flex items-center justify-between pt-1 border-t border-[#1D2026] text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="text-[#849396] font-space">Status:</span>
            <button
              type="button"
              onClick={() => handleStatusChange('registrada')}
              className={`px-2 py-0.5 rounded font-space font-bold transition-all ${
                meal.status === 'registrada'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'text-[#849396] hover:text-white'
              }`}
            >
              Registrada
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange('pendente')}
              className={`px-2 py-0.5 rounded font-space font-bold transition-all ${
                meal.status === 'pendente'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-[#849396] hover:text-white'
              }`}
            >
              Pendente
            </button>
            <button
              type="button"
              onClick={() => handleStatusChange('nao_realizada')}
              className={`px-2 py-0.5 rounded font-space font-bold transition-all ${
                meal.status === 'nao_realizada'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'text-[#849396] hover:text-white'
              }`}
            >
              Não realizada
            </button>
          </div>

          <button
            type="button"
            onClick={() => onDelete(meal.id)}
            className="text-rose-400 hover:text-rose-300 text-[10px] font-space font-semibold flex items-center gap-1 transition-colors"
            title="Excluir refeição"
          >
            <Trash2 className="w-3 h-3" />
            <span>{meal.isExtra ? 'Excluir' : 'Limpar'}</span>
          </button>
        </div>
      )}

      {/* Preset Modal */}
      {isPresetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#11141C] border border-[#222938] rounded-2xl max-w-md w-full p-5 space-y-4 text-white shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#222938] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C5A059]" />
                <h3 className="font-space font-bold text-sm text-white">
                  Sugestões de Fotos Fitness
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPresetModalOpen(false)}
                className="text-[#849396] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {MEAL_PHOTO_PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset.url, preset.title)}
                  className="flex items-center gap-3 p-2 rounded-xl bg-[#0B0E14] border border-[#222938] hover:border-[#C5A059] transition-all cursor-pointer group/preset"
                >
                  <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 border border-[#222938]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preset.url}
                      alt={preset.title}
                      className="w-full h-full object-cover group-hover/preset:scale-105 transition-transform"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-space font-bold text-xs text-white group-hover/preset:text-[#E5C378] transition-colors truncate">
                      {preset.title}
                    </p>
                    <p className="text-[10px] text-[#849396] line-clamp-1">
                      {preset.description}
                    </p>
                  </div>
                  <span className="text-xs text-[#C5A059] font-space font-bold pr-2">
                    Usar
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealCard;
