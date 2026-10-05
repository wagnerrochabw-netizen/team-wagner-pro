'use client';

import React from 'react';
import { X, Link2, Check, ExternalLink, Code2 } from 'lucide-react';
import { DirectImageHelper } from './DirectImageHelper';

interface DirectImageGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DirectImageGuideModal: React.FC<DirectImageGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#0B0E14] border border-[#222938] rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl text-[#E1E2EB]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-[#1D2026]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-[#00E5FF] flex items-center justify-center">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-space font-bold text-base text-white">
                Links Diretos para Imagens HTML
              </h3>
              <p className="text-xs text-[#849396]">
                Guia de uso de URLs diretas no Team Wagner
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#171B26] border border-[#222938] text-[#BAC9CC] hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Answer in Portuguese */}
        <div className="bg-[#12161F] border border-[#222938] rounded-xl p-4 text-xs space-y-2">
          <p className="text-white font-medium">
            <span className="text-[#00E5FF] font-bold">Sim, com certeza!</span> É totalmente possível adicionar links diretos para as imagens no HTML do aplicativo.
          </p>
          <p className="text-[#BAC9CC] leading-relaxed">
            Você pode passar qualquer URL direta (terminando com <code>.jpg</code>, <code>.png</code>, <code>.webp</code> ou URLs de CDN como Unsplash, Cloudinary, AWS S3) ou caminhos locais como <code className="text-[#00E5FF]">/gym_dark_atmospheric_dumbbells.jpg</code>.
          </p>
          
          <div className="bg-[#0B0E14] border border-[#222938] rounded-lg p-2.5 font-mono text-[11px] text-[#00E5FF] space-y-1">
            <div className="text-[#849396]">{'// Exemplo em HTML:'}</div>
            <div>{'<img src="https://seusite.com/treino.jpg" alt="Treino" />'}</div>
          </div>
        </div>

        {/* Live helper with tester */}
        <DirectImageHelper />

        <button
          onClick={onClose}
          className="w-full py-3 bg-[#00E5FF] text-[#0B0E14] font-space font-bold text-xs uppercase tracking-wider rounded-xl"
        >
          Fechar Guia
        </button>
      </div>
    </div>
  );
};
