'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Download, ArrowLeft, CheckCircle2, ShieldCheck, FileArchive, RefreshCw } from 'lucide-react';
import { WRLogo } from '@/components/WRLogo';

export default function DownloadPage() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async () => {
    setIsDownloading(true);
    setError(null);
    setDownloadSuccess(false);

    try {
      // 1. Tenta obter o arquivo via blob direto
      const response = await fetch('/team-wagner-app.zip');
      if (!response.ok) {
        throw new Error('Falha ao obter arquivo do servidor');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'team-wagner-app-atualizado.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setDownloadSuccess(true);
    } catch (err: unknown) {
      console.error('Download error:', err);
      // Fallback: redireciona diretamente para a rota de download
      try {
        window.location.href = '/api/download';
        setDownloadSuccess(true);
      } catch {
        setError('Não foi possível iniciar o download automático. Tente o botão alternativo.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#E1E2EB] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#12161F] border border-[#222938] rounded-2xl p-6 space-y-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1F2633] pb-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-[#BAC9CC] hover:text-[#00E5FF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao App</span>
          </Link>
          <WRLogo variant="monogram" size="sm" />
        </div>

        {/* Content */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] mx-auto shadow-[0_0_20px_rgba(0,229,255,0.25)]">
            <FileArchive className="w-8 h-8" />
          </div>

          <h1 className="text-xl font-space font-bold text-white">
            Baixar Código Atualizado
          </h1>
          <p className="text-xs text-[#849396] leading-relaxed">
            Contém todos os 83 arquivos do projeto corrigidos e prontos para atualizar o repositório no <strong className="text-white">GitHub Desktop</strong>.
          </p>
        </div>

        {/* Features included */}
        <div className="bg-[#171B26] border border-[#222938] rounded-xl p-3.5 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-space font-semibold text-[11px]">
            <ShieldCheck className="w-4 h-4" />
            <span>Pacote Completo e Verificado</span>
          </div>
          <ul className="text-[11px] text-[#BAC9CC] space-y-1 pl-1 font-mono">
            <li>✓ Correção de rotas & Next.js App Router</li>
            <li>✓ Correção do erro de hidratação</li>
            <li>✓ Notificações 100% integradas às abas</li>
            <li>✓ Tabelas e esquemas de dados prontos</li>
          </ul>
        </div>

        {/* Main Action Button */}
        <div className="space-y-3">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full py-3.5 px-4 bg-[#00E5FF] hover:bg-[#33EBFF] text-[#0B0E14] font-space font-bold text-sm rounded-xl transition-all cursor-pointer shadow-[0_0_20px_rgba(0,229,255,0.4)] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Gerando Download...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5 stroke-[2.5]" />
                <span>Baixar team-wagner-app.zip</span>
              </>
            )}
          </button>

          {/* Direct HTML anchor fallback */}
          <a
            href="/team-wagner-app.zip"
            download="team-wagner-app.zip"
            className="block w-full py-2.5 px-4 bg-[#171B26] hover:bg-[#1D2230] border border-[#222938] hover:border-[#00E5FF]/40 text-[#00E5FF] font-mono text-xs rounded-xl text-center transition-colors cursor-pointer"
          >
            Clique aqui para download alternativo direto
          </a>
        </div>

        {downloadSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-emerald-300 text-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Download iniciado com sucesso! Verifique sua pasta de Downloads.</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
