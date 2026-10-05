'use client';

import React from 'react';

interface WRLogoProps {
  variant?: 'full' | 'compact' | 'monogram';
  subtext?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const WRLogo: React.FC<WRLogoProps> = ({
  variant = 'monogram',
  subtext,
  size = 'md',
  className = '',
}) => {
  const containerSizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  // Carrega exatamente o arquivo de imagem PNG original enviado pelo Wagner
  const logoImage = (
    <div className={`relative flex items-center justify-center select-none ${containerSizes[size]} shrink-0`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="TEAM WAGNER"
        className="w-full h-full object-contain"
      />
    </div>
  );

  if (variant === 'monogram') {
    return <div className={`inline-flex items-center ${className}`}>{logoImage}</div>;
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        {logoImage}
        <div className="flex flex-col text-left">
          <span className="font-space text-sm font-extrabold tracking-tight text-white leading-tight">
            TEAM <span className="text-[#00E5FF]">WAGNER</span>
          </span>
          <span className="text-[10px] text-[#849396] font-mono leading-none">
            {subtext || 'Personal Trainer'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {logoImage}
      <div className="flex flex-col text-left justify-center">
        <span className="font-space text-sm sm:text-base font-extrabold tracking-[0.16em] text-white leading-tight">
          WAGNER ROCHA
        </span>
        <span className="text-xs text-[#00E5FF] font-mono mt-0.5">
          {subtext || '@treinador.wagner'}
        </span>
      </div>
    </div>
  );
};

export default WRLogo;
