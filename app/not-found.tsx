import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0B0E14] text-[#E1E2EB] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] font-bold text-2xl mb-4 font-mono">
        404
      </div>
      <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Página não encontrada</h2>
      <p className="text-gray-400 max-w-md text-sm mb-6 font-sans">
        A página solicitada não existe ou retornou ao início.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-xl bg-[#00E5FF] text-black font-semibold text-sm hover:bg-[#33EBFF] transition-colors"
      >
        Voltar para o Início
      </Link>
    </div>
  );
}
