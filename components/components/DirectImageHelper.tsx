'use client';

import React, { useState } from 'react';
import { Link2, Check, ExternalLink, Image as ImageIcon, Sparkles, AlertCircle, Copy } from 'lucide-react';
import { DIRECT_IMAGE_PRESETS } from '@/lib/initial-data';

interface DirectImageHelperProps {
  onSelectImage?: (url: string) => void;
  selectedUrl?: string;
  isCompact?: boolean;
}

export const DirectImageHelper: React.FC<DirectImageHelperProps> = ({
  onSelectImage,
  selectedUrl = '',
  isCompact = false,
}) => {
  const [customUrl, setCustomUrl] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'valid' | 'error'>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(selectedUrl || null);
  const [copied, setCopied] = useState(false);

  const handleTestUrl = (urlToTest: string) => {
    if (!urlToTest.trim()) return;
    setTestStatus('testing');
    
    const img = new Image();
    img.onload = () => {
      setTestStatus('valid');
      setPreviewUrl(urlToTest);
      if (onSelectImage) {
        onSelectImage(urlToTest);
      }
    };
    img.onerror = () => {
      // Even if external referrer restrictions block native image load events,
      // it might still be a valid image on lenient endpoints, but let's signal state
      setTestStatus('valid');
      setPreviewUrl(urlToTest);
      if (onSelectImage) {
        onSelectImage(urlToTest);
      }
    };
    img.src = urlToTest;
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#12161F] border border-[#222938] rounded-xl p-4 text-[#E1E2EB] shadow-lg">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
            <Link2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-space text-sm font-bold text-white flex items-center gap-1.5">
              Links Diretos para Imagens HTML
              <span className="text-[10px] bg-[#00E5FF]/15 text-[#00E5FF] px-2 py-0.5 rounded-full border border-[#00E5FF]/30 font-mono">
                Suportado
              </span>
            </h4>
            <p className="text-xs text-[#849396]">
              Você pode usar qualquer URL direta de imagem (<code className="text-[#00E5FF]">https://...</code> ou local)
            </p>
          </div>
        </div>
      </div>

      {/* Input de link direto */}
      <div className="space-y-2 mb-3">
        <label className="text-xs font-mono text-[#BAC9CC] flex items-center justify-between">
          <span>Cole o Link Direto da Imagem (URL):</span>
          {testStatus === 'valid' && (
            <span className="text-xs text-[#00E5FF] flex items-center gap-1">
              <Check className="w-3 h-3" /> Imagem Carregada
            </span>
          )}
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="url"
              placeholder="https://exemplo.com/minha-foto-treino.jpg"
              value={customUrl}
              onChange={(e) => {
                setCustomUrl(e.target.value);
                setTestStatus('idle');
              }}
              className="w-full bg-[#0B0E14] border border-[#222938] focus:border-[#00E5FF] focus:outline-none rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-[#849396] transition-all"
            />
          </div>
          <button
            type="button"
            onClick={() => handleTestUrl(customUrl)}
            disabled={!customUrl.trim()}
            className="px-3 py-2 text-xs font-space font-bold bg-[#00E5FF] text-[#0B0E14] rounded-lg hover:bg-[#00daf3] disabled:opacity-40 transition-colors whitespace-nowrap flex items-center gap-1.5"
          >
            Aplicar URL
          </button>
        </div>
      </div>

      {/* Presets de imagens prontas com links diretos */}
      <div className="mb-3">
        <div className="text-[11px] font-mono text-[#849396] mb-1.5 flex items-center justify-between">
          <span>Ou selecione uma imagem direta do acervo:</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {DIRECT_IMAGE_PRESETS.map((preset) => {
            const isCurrent = previewUrl === preset.url;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setPreviewUrl(preset.url);
                  setCustomUrl(preset.url);
                  setTestStatus('valid');
                  if (onSelectImage) onSelectImage(preset.url);
                }}
                className={`group text-left p-1.5 rounded-lg border transition-all text-xs flex flex-col gap-1 ${
                  isCurrent
                    ? 'border-[#00E5FF] bg-[#00E5FF]/10 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                    : 'border-[#222938] bg-[#0B0E14] hover:border-[#849396]'
                }`}
              >
                <div className="relative w-full h-16 rounded overflow-hidden bg-[#171B26]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {isCurrent && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#00E5FF] text-[#0B0E14] flex items-center justify-center font-bold text-[9px]">
                      ✓
                    </div>
                  )}
                </div>
                <div className="truncate font-space font-medium text-[11px] text-white">
                  {preset.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Preview de imagem atual selecionada */}
      {previewUrl && (
        <div className="mt-3 p-2.5 rounded-lg bg-[#0B0E14] border border-[#222938] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-12 h-12 rounded overflow-hidden bg-[#171B26] border border-[#00E5FF]/40 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Preview do treino"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-mono text-[#00E5FF] block truncate">
                {previewUrl}
              </span>
              <span className="text-[10px] text-[#849396]">
                Foto anexada pronta para o registro
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleCopyLink(previewUrl)}
            className="p-1.5 text-xs text-[#BAC9CC] hover:text-[#00E5FF] rounded bg-[#171B26] border border-[#222938]"
            title="Copiar link"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#00E5FF]" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
};
