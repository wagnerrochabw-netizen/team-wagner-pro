'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-[#0B0E14] text-[#E1E2EB] min-h-screen flex items-center justify-center p-6 text-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Erro crítico no aplicativo</h2>
          <p className="text-gray-400 max-w-md text-sm mb-6">
            Por favor, tente recarregar o sistema.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-xl bg-[#00E5FF] text-black font-semibold text-sm hover:bg-[#33EBFF] transition-colors"
          >
            Recarregar
          </button>
        </div>
      </body>
    </html>
  );
}
