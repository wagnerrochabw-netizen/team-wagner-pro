'use client';

import React, { useState, useRef } from 'react';
import { Upload, CheckCircle2, AlertCircle, X, Image as ImageIcon, Trash2, LayoutTemplate } from 'lucide-react';

interface UploadLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogoUpdated: () => void;
}

const STORAGE_KEY_ICON = 'team_wagner_custom_logo';
const STORAGE_KEY_FULL = 'team_wagner_full_logo';

export const UploadLogoModal: React.FC<UploadLogoModalProps> = ({
  isOpen,
  onClose,
  onLogoUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'full' | 'icon'>('full');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentStorageKey = activeTab === 'full' ? STORAGE_KEY_FULL : STORAGE_KEY_ICON;

  const handleTabChange = (tab: 'full' | 'icon') => {
    setActiveTab(tab);
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      setSuccess(null);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSaveToLocalStorage = () => {
    if (!selectedFile) {
      setError('Selecione o arquivo da imagem.');
      return;
    }

    try {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const base64String = event.target?.result as string;
          if (!base64String) {
            throw new Error('Falha ao processar os dados da imagem.');
          }

          localStorage.setItem(currentStorageKey, base64String);

          window.dispatchEvent(
            new CustomEvent<string>('team_wagner_logo_updated', {
              detail: base64String,
            })
          );

          const tabName = activeTab === 'full' ? 'Logo Completa Horizontal' : 'Símbolo WR';
          setSuccess(`${tabName} aplicada com sucesso!`);
          onLogoUpdated();
        } catch (storageErr) {
          console.error('Erro ao gravar no localStorage:', storageErr);
          setError('Espaço insuficiente no armazenamento do navegador.');
        }
      };

      reader.onerror = (readErr) => {
        console.error('Erro no FileReader:', readErr);
        setError('Erro ao ler arquivo do computador.');
      };

      reader.readAsDataURL(selectedFile);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao processar imagem';
      setError(msg);
    }
  };

  const handleResetToDefault = () => {
    localStorage.removeItem(currentStorageKey);
    window.dispatchEvent(
      new CustomEvent<string>('team_wagner_logo_updated', {
        detail: '/logo.png',
      })
    );
    setSelectedFile(null);
    setPreviewUrl(null);
    setSuccess('Restaurado para o padrão.');
    onLogoUpdated();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#11141C] border border-[#222938] rounded-2xl max-w-lg w-full p-6 space-y-5 text-white shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-[#222938] pb-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#00E5FF]" />
            <h2 className="font-space font-bold text-lg text-white">
              Personalizar Logos do App
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#849396] hover:text-white transition-colors cursor-pointer p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#0B0E14] border border-[#222938] rounded-xl">
          <button
            type="button"
            onClick={() => handleTabChange('full')}
            className={`py-2 px-3 rounded-lg text-xs font-space font-medium flex items-center justify-center gap-2 transition-all ${
              activeTab === 'full'
                ? 'bg-[#00E5FF] text-[#0B0E14] font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                : 'text-[#BAC9CC] hover:text-white'
            }`}
          >
            <LayoutTemplate className="w-4 h-4" />
            <span>Logo Completa (Banner)</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('icon')}
            className={`py-2 px-3 rounded-lg text-xs font-space font-medium flex items-center justify-center gap-2 transition-all ${
              activeTab === 'icon'
                ? 'bg-[#00E5FF] text-[#0B0E14] font-bold shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                : 'text-[#BAC9CC] hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Símbolo WR (Ícone)</span>
          </button>
        </div>

        <p className="text-xs text-[#BAC9CC] leading-relaxed">
          {activeTab === 'full' ? (
            <>
              Envie o arquivo completo <code className="text-[#00E5FF]">IMG_4945.PNG</code> (com o símbolo, <strong>WAGNER ROCHA</strong> e <strong>@treinador.wagner</strong>). Ele substituirá todos os rodapés e blocos completos de marca diretamente pela sua imagem original!
            </>
          ) : (
            <>
              Envie o arquivo do símbolo quadrado <code className="text-[#00E5FF]">logo.png</code>. Ele será exibido nos ícones do topo, cabeçalhos compactos e avatares.
            </>
          )}
        </p>

        {/* Upload Drop Zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-[#222938] hover:border-[#00E5FF] rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-[#0B0E14]/50 group min-h-[140px]"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {previewUrl ? (
            <div className="flex flex-col items-center gap-2 w-full">
              <div className={`relative rounded-lg border border-[#222938] bg-black/60 p-3 flex items-center justify-center ${
                activeTab === 'full' ? 'w-full h-24 max-w-sm' : 'w-24 h-24'
              }`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="Prévia selecionada"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xs font-mono text-[#00E5FF] truncate max-w-[280px]">
                {selectedFile?.name}
              </span>
              <span className="text-[11px] text-[#849396]">
                {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : ''}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-[#161B26] flex items-center justify-center text-[#00E5FF] group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold text-white">
                {activeTab === 'full' ? 'Clique para selecionar o IMG_4945.PNG' : 'Clique para selecionar o símbolo WR'}
              </span>
              <span className="text-xs text-[#849396]">
                Formato PNG com fundo transparente
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/30 border border-red-800/50 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-xs text-[#00E5FF] bg-[#00E5FF]/10 border border-[#00E5FF]/30 p-3 rounded-lg">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-3 py-2 text-xs text-[#849396] hover:text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Restaurar padrão"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Restaurar padrão</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-[#849396] hover:text-white transition-colors cursor-pointer"
            >
              Fechar
            </button>
            <button
              type="button"
              disabled={!selectedFile}
              onClick={handleSaveToLocalStorage}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold font-space flex items-center gap-2 cursor-pointer transition-all ${
                selectedFile
                  ? 'bg-[#00E5FF] text-[#0B0E14] hover:bg-[#33EAFF] shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                  : 'bg-[#222938] text-[#849396] cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              {activeTab === 'full' ? 'Aplicar Logo Completa' : 'Aplicar Símbolo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
