import type {Metadata} from 'next';
import { Space_Grotesk, Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
});

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-hanken',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Team Wagner - Treino & Consistência',
  description: 'Aplicativo de alta performance física para registro ágil de treinos, rastreamento de consistência e métricas do Team Wagner.',
  openGraph: {
    title: 'Team Wagner - Treino & Consistência',
    description: 'Aplicativo de alta performance física para registro ágil de treinos, rastreamento de consistência e métricas do Team Wagner.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Team Wagner - Treino & Consistência',
    description: 'Aplicativo de alta performance física para registro ágil de treinos, rastreamento de consistência e métricas do Team Wagner.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className={`${spaceGrotesk.variable} ${hankenGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#0B0E14] text-[#E1E2EB] min-h-screen antialiased selection:bg-[#00E5FF]/20 selection:text-[#00E5FF]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

