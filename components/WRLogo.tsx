'use client';

import React, { useState, useEffect } from 'react';

interface WRLogoProps {
  variant?: 'full' | 'compact' | 'monogram';
  subtext?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const STORAGE_KEY_ICON = 'team_wagner_custom_logo';
const STORAGE_KEY_FULL = 'team_wagner_full_logo';

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

  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadStoredLogo = () => {
      try {
        const stored = variant === 'full' 
          ? (localStorage.getItem(STORAGE_KEY_FULL) || localStorage.getItem(STORAGE_KEY_ICON))
          : localStorage.getItem(STORAGE_KEY_ICON);
        if (stored) {
          setCustomLogoUrl(stored);
        } else {
          setCustomLogoUrl(null);
        }
      } catch {
        // Ignora caso localStorage indisponível
      }
    };

    loadStoredLogo();

    const handleLogoUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        if (customEvent.detail.startsWith('data:') || customEvent.detail.startsWith('http')) {
          setCustomLogoUrl(customEvent.detail);
        } else {
          loadStoredLogo();
        }
      } else {
        loadStoredLogo();
      }
    };

    window.addEventListener('team_wagner_logo_updated', handleLogoUpdate);
    window.addEventListener('storage', loadStoredLogo);

    return () => {
      window.removeEventListener('team_wagner_logo_updated', handleLogoUpdate);
      window.removeEventListener('storage', loadStoredLogo);
    };
  }, [variant]);

  const isBanner = variant === 'full';
  const defaultSource = isBanner ? '/logo-banner.png' : '/logo.png';
  const effectiveSrc = customLogoUrl || defaultSource;

  if (variant === 'full') {
    return (
      <div className={`inline-flex items-center select-none ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={effectiveSrc}
          alt="WAGNER ROCHA - @treinador.wagner"
          className="h-8 sm:h-9 w-auto object-contain max-w-[260px]"
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            if (img.src.includes('logo-banner.png')) {
              img.src = '/logo-banner.PNG';
            } else if (img.src.includes('logo-banner.PNG')) {
              img.src = '/logo-banner.svg';
            }
          }}
        />
      </div>
    );
  }

  const logoImage = (
    <div className={`relative flex items-center justify-center select-none ${containerSizes[size]} shrink-0`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={effectiveSrc}
        alt="TEAM WAGNER"
        className="w-full h-full object-contain"
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          if (img.src.includes('logo.png')) {
            img.src = '/logo.PNG';
          } else if (img.src.includes('logo.PNG')) {
            img.src = '/logo.svg';
          }
        }}
      />
    </div>
  );

  if (variant === 'monogram') {
    return <div className={`inline-flex items-center ${className}`}>{logoImage}</div>;
  }

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
};

export default WRLogo;
