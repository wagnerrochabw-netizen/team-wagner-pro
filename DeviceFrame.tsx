'use client';

import React from 'react';

interface DeviceFrameProps {
  children: React.ReactNode;
  label?: string;
  badge?: string;
  className?: string;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({
  children,
  label,
  badge,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center shrink-0 ${className}`}>
      {/* Optional Top Device Label */}
      {label && (
        <div className="mb-3 flex items-center gap-2">
          <span className="font-space text-xs font-bold text-white tracking-wide uppercase">
            {label}
          </span>
          {badge && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00E5FF]/15 border border-[#00E5FF]/30 text-[#00E5FF]">
              {badge}
            </span>
          )}
        </div>
      )}

      {/* Realistic Mobile Device Mockup Chassis matching user's image */}
      <div className="w-[375px] sm:w-[390px] h-[820px] bg-[#0B0E14] border-2 border-[#222938] hover:border-[#00E5FF]/40 rounded-[38px] p-2 flex flex-col relative shadow-[0_25px_60px_-12px_rgba(0,0,0,0.95),0_0_25px_rgba(0,229,255,0.06)] transition-all duration-300">
        
        {/* Dynamic Island / Speaker Pill */}
        <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#12161F] border border-[#222938] rounded-full z-30 flex items-center justify-center gap-2 pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0B0E14] border border-[#222938]" />
          <div className="w-8 h-1 rounded-full bg-[#222938]" />
        </div>

        {/* Device Screen Area */}
        <div className="w-full h-full bg-[#0B0E14] rounded-[30px] overflow-y-auto overflow-x-hidden flex flex-col relative custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};
