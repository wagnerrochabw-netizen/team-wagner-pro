'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#E1E2EB] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 font-bold text-2xl mb-4 font-mono">
        !
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Algo deu errado</h2>
      <p className="text-gray-400 max-w-md text-sm mb-6">
        Ocorreu uma falha inesperada ao carregar a interface. Tente recarregar a tela.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-2.5 rounded-xl bg-[#00E5FF] text-black font-semibold text-sm hover:bg-[#33EBFF] transition-colors shadow-lg shadow-[#00E5FF]/20 cursor-pointer"
      >
        Tentar novamente
      </button>
    </div>
  );
}
