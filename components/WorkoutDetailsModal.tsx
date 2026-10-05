'use client';

import React from 'react';
import { X, Clock, Flame, Calendar, Dumbbell, Footprints, Timer, Link2, ExternalLink, Trash2 } from 'lucide-react';
import { WorkoutLog } from '@/lib/types';
import { WRLogo } from './WRLogo';
import { renderActivityIcon } from '@/lib/activity-helpers';

interface WorkoutDetailsModalProps {
  workout: WorkoutLog | null;
  onClose: () => void;
  onDeleteWorkout?: (workoutId: string) => void;
}

export const WorkoutDetailsModal: React.FC<WorkoutDetailsModalProps> = ({
  workout,
  onClose,
}) => {
  if (!workout) return null;

  const sensations = {
    pesado: { label: 'Pesado', emoji: '🔥', color: 'text-[#FF9100]' },
    muito_pesado: { label: 'Muito pesado', emoji: '💀', color: 'text-red-400' },
    bom: { label: 'Bom', emoji: '😃', color: 'text-[#00E5FF]' },
    leve: { label: 'Leve', emoji: '😌', color: 'text-emerald-400' },
  };

  const sens = sensations[workout.sensation] || sensations.bom;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#12161F] border border-[#222938] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl text-[#E1E2EB]">
        
        {/* Header */}
        <div className="p-4 border-b border-[#1D2026] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <WRLogo variant="monogram" size="sm" />
            <div>
              <span className="font-space text-xs font-bold text-[#00E5FF] block">
                TEAM WAGNER
              </span>
              <span className="text-[11px] text-[#849396] font-mono">
                {workout.date} ({workout.displayDate})
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#171B26] border border-[#222938] text-[#BAC9CC] hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Photo if present */}
        {workout.photoUrl && (
          <div className="relative w-full h-56 bg-[#0B0E14] overflow-hidden border-b border-[#222938]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={workout.photoUrl}
              alt={workout.activityType}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm border border-[#00E5FF]/40 px-2 py-0.5 rounded text-[10px] font-mono text-[#00E5FF]">
              Foto do Treino
            </div>
          </div>
        )}

        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
                {renderActivityIcon(workout.activityType, undefined, 'w-4 h-4')}
              </div>
              <h2 className="font-space text-xl font-bold text-white">
                {workout.activityType}
              </h2>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00E5FF] text-xs font-mono font-bold">
              {workout.durationMinutes} min
            </span>
          </div>

          {/* Key metrics grid */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-[#0B0E14] border border-[#222938] rounded-xl p-3">
              <span className="text-[#849396] font-space text-[10px] block uppercase">
                Sensação Registrada
              </span>
              <div className="flex items-center gap-1.5 mt-1 font-space font-semibold text-white">
                <span className="text-lg">{sens.emoji}</span>
                <span className={sens.color}>{sens.label}</span>
              </div>
            </div>

            <div className="bg-[#0B0E14] border border-[#222938] rounded-xl p-3">
              <span className="text-[#849396] font-space text-[10px] block uppercase">
                Metodologia
              </span>
              <div className="font-space font-semibold text-[#00E5FF] mt-1">
                Team Wagner Coach
              </div>
            </div>
          </div>

          {/* Notes if present */}
          {workout.notes && (
            <div className="bg-[#0B0E14] border border-[#222938] rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-space font-bold uppercase text-[#849396]">
                Observações do Treino:
              </span>
              <p className="text-xs text-[#BAC9CC] leading-relaxed italic">
                &ldquo;{workout.notes}&rdquo;
              </p>
            </div>
          )}

          {/* Direct link info if photo exists */}
          {workout.photoUrl && (
            <div className="bg-[#0B0E14] border border-[#222938] rounded-lg p-2.5 flex items-center justify-between text-[11px] font-mono text-[#849396]">
              <span className="truncate pr-2">
                URL da Imagem: <code className="text-[#00E5FF]">{workout.photoUrl}</code>
              </span>
            </div>
          )}

          <div className="flex gap-2 pt-1">
            {onDeleteWorkout && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Tem certeza que deseja excluir o registro deste treino?')) {
                    onDeleteWorkout(workout.id);
                  }
                }}
                className="py-3 px-4 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-space font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-3 bg-[#171B26] hover:bg-[#1D2026] border border-[#222938] text-white font-space font-bold text-xs rounded-xl cursor-pointer"
            >
              Fechar Detalhes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
