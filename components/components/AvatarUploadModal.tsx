'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, Trash2, X, CheckCircle2, User, Sparkles } from 'lucide-react';

interface AvatarUploadModalProps {
  isOpen: boolean;
  currentAvatarUrl?: string;
  userName: string;
  onClose: () => void;
  onSaveAvatar: (newAvatarUrl: string) => void;
  onRemoveAvatar: () => void;
}

const PRESET_AVATARS = [
  {
    name: 'Atleta Musculação',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Atleta Força',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Atleta Cross',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Atleta Foco',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
];

export const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({
  isOpen,
  currentAvatarUrl,
  userName,
  onClose,
  onSaveAvatar,
  onRemoveAvatar,
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(currentAvatarUrl || null);
  const [customUrl, setCustomUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'presets' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setSelectedPhoto(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (selectedPhoto) {
      onSaveAvatar(selectedPhoto);
      onClose();
    }
  };

  const handleRemove = () => {
    setSelectedPhoto(null);
    onRemoveAvatar();
    onClose();
  };

  const initials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'W';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#11141C] border border-[#222938] rounded-2xl max-w-md w-full p-6 space-y-5 text-white shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-[#222938] pb-3">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#00E5FF]" />
            <h2 className="font-space font-bold text-lg text-white">
              Foto de Perfil do Aluno
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#849396] hover:text-white transition-colors cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Avatar Preview */}
        <div className="flex flex-col items-center justify-center gap-3 py-2">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-28 h-28 rounded-full border-2 border-[#00E5FF] overflow-hidden bg-[#171B26] p-0.5 shadow-[0_0_20px_rgba(0,229,255,0.4)] flex items-center justify-center relative">
              {selectedPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selectedPhoto}
                  alt={userName}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-[#849396] gap-1">
                  <User className="w-10 h-10 text-[#00E5FF]" />
                  <span className="font-space font-bold text-sm text-white">{initials}</span>
                </div>
              )}

              {/* Hover overlay with camera icon */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex flex-col items-center justify-center text-white text-xs gap-1">
                <Camera className="w-5 h-5 text-[#00E5FF]" />
                <span className="font-mono text-[10px]">Alterar</span>
              </div>
            </div>

            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#00E5FF] text-[#0B0E14] flex items-center justify-center shadow-lg border-2 border-[#11141C]">
              <Camera className="w-4 h-4" />
            </div>
          </div>

          <p className="text-xs text-[#849396] text-center font-mono">
            {selectedPhoto ? 'Prévia da foto selecionada' : 'Nenhuma foto selecionada (usando iniciais)'}
          </p>
        </div>

        {/* Method Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-[#0B0E14] border border-[#222938] rounded-xl text-xs font-space">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`py-2 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-[#00E5FF] text-[#0B0E14] font-bold shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                : 'text-[#BAC9CC] hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Galeria</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`py-2 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'presets'
                ? 'bg-[#00E5FF] text-[#0B0E14] font-bold shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                : 'text-[#BAC9CC] hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Atletas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`py-2 px-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'url'
                ? 'bg-[#00E5FF] text-[#0B0E14] font-bold shadow-[0_0_10px_rgba(0,229,255,0.4)]'
                : 'text-[#BAC9CC] hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Link URL</span>
          </button>
        </div>

        {/* Tab 1: Upload from Computer/Phone */}
        {activeTab === 'upload' && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#222938] hover:border-[#00E5FF] rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-[#0B0E14]/50 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-[#161B26] flex items-center justify-center text-[#00E5FF] group-hover:scale-110 transition-transform mb-2">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-white">
              Escolher foto do dispositivo
            </span>
            <span className="text-xs text-[#849396] mt-1">
              JPG, PNG ou WebP direto da sua galeria ou câmera
            </span>
          </div>
        )}

        {/* Tab 2: Athlete Presets */}
        {activeTab === 'presets' && (
          <div className="grid grid-cols-4 gap-2.5">
            {PRESET_AVATARS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedPhoto(preset.url)}
                className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all p-0.5 group cursor-pointer ${
                  selectedPhoto === preset.url
                    ? 'border-[#00E5FF] shadow-[0_0_10px_rgba(0,229,255,0.5)]'
                    : 'border-[#222938] hover:border-[#849396]'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preset.url}
                  alt={preset.name}
                  className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform"
                />
              </button>
            ))}
          </div>
        )}

        {/* Tab 3: Direct Link URL */}
        {activeTab === 'url' && (
          <div className="space-y-2">
            <span className="text-xs text-[#BAC9CC]">
              Cole o link direto da imagem na internet:
            </span>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://exemplo.com/minha-foto.jpg"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="flex-1 bg-[#171B26] border border-[#222938] rounded-xl px-3 py-2 text-xs text-white placeholder-[#849396] font-mono focus:outline-none focus:border-[#00E5FF]"
              />
              <button
                type="button"
                onClick={() => {
                  if (customUrl.trim()) {
                    setSelectedPhoto(customUrl.trim());
                  }
                }}
                className="px-4 py-2 bg-[#00E5FF] text-[#0B0E14] font-space font-bold text-xs rounded-xl"
              >
                Carregar
              </button>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          {selectedPhoto ? (
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-2 text-xs text-red-400 hover:text-red-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remover Foto</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#849396] hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl text-xs font-bold font-space bg-[#00E5FF] text-[#0B0E14] hover:bg-[#33EAFF] shadow-[0_0_15px_rgba(0,229,255,0.4)] flex items-center gap-2 cursor-pointer transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Salvar Foto de Perfil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
