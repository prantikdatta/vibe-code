import React from 'react';

interface TempleDividerProps {
  variant?: 'diya' | 'om' | 'mandala';
  className?: string;
}

export const TempleDivider: React.FC<TempleDividerProps> = ({
  variant = 'mandala',
  className = '',
}) => {
  return (
    <div
      className={`relative w-full flex items-center justify-center py-4 my-2 select-none overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Left Hairline Gradient */}
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-600/40 to-amber-500/70" />

      {/* Center Motif */}
      <div className="mx-4 flex items-center gap-2">
        <span className="text-[10px] text-amber-500/60">♦</span>

        {variant === 'om' && (
          <span className="text-xl font-bold font-serif-temple text-gold-gradient drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
            ॐ
          </span>
        )}

        {variant === 'diya' && (
          <span className="text-base text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]">
            🪔
          </span>
        )}

        {variant === 'mandala' && (
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shadow-[0_0_6px_#f59e0b]" />
            <span className="text-xs text-amber-400 font-bold">❋</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shadow-[0_0_6px_#f59e0b]" />
          </div>
        )}

        <span className="text-[10px] text-amber-500/60">♦</span>
      </div>

      {/* Right Hairline Gradient */}
      <div className="h-px flex-1 bg-gradient-to-r from-amber-500/70 via-amber-600/40 to-transparent" />
    </div>
  );
};
