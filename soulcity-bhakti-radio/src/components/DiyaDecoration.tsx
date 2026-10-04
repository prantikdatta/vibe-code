import React, { useState } from 'react';

interface DiyaProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showCaption?: boolean;
}

export const DiyaDecoration: React.FC<DiyaProps> = ({
  size = 'md',
  className = '',
  showCaption = false,
}) => {
  const [litCount, setLitCount] = useState(0);

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const handleInteract = () => {
    setLitCount((prev) => prev + 1);
  };

  return (
    <div className={`relative inline-flex flex-col items-center select-none ${className}`}>
      <button
        type="button"
        onClick={handleInteract}
        title="Sacred Diya (Click to offer devotion)"
        className={`group relative flex items-center justify-center p-1 transition-transform active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-full ${sizeClasses[size]}`}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible"
          aria-hidden="true"
        >
          <defs>
            {/* Outer golden flame glow */}
            <radialGradient id="flameGlow" cx="50%" cy="40%" r="50%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#ea580c" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
            </radialGradient>

            {/* Inner flame core */}
            <linearGradient id="flameCore" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#fef08a" />
              <stop offset="80%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>

            {/* Brass bowl metallic gradient */}
            <linearGradient id="brassBowl" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef3c7" />
              <stop offset="30%" stopColor="#d97706" />
              <stop offset="70%" stopColor="#92400e" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>
            
            {/* Brass base stand */}
            <linearGradient id="brassStand" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#78350f" />
              <stop offset="50%" stopColor="#fef08a" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>
          </defs>

          {/* Diya Light Aura */}
          <circle
            cx="50"
            cy="36"
            r="38"
            fill="url(#flameGlow)"
            className="animate-pulse opacity-70"
          />

          {/* Flickering Flame */}
          <g className="animate-diya">
            {/* Outer flame flame shape */}
            <path
              d="M50 8 C43 24, 38 32, 40 43 C42 53, 58 53, 60 43 C62 32, 57 24, 50 8 Z"
              fill="url(#flameGlow)"
            />
            {/* Inner intense flame heart */}
            <path
              d="M50 16 C45 27, 43 33, 44 42 C45 49, 55 49, 56 42 C57 33, 55 27, 50 16 Z"
              fill="url(#flameCore)"
            />
            {/* Core pure white spark */}
            <ellipse cx="50" cy="38" rx="2.5" ry="5" fill="#ffffff" opacity="0.9" />
          </g>

          {/* Wick */}
          <line
            x1="50"
            y1="44"
            x2="50"
            y2="49"
            stroke="#1c1917"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Diya Oil Vessel (Clay/Brass Deepam) */}
          <path
            d="M20 48 Q50 68 80 48 Q85 58 75 66 Q65 72 50 72 Q35 72 25 66 Q15 58 20 48 Z"
            fill="url(#brassBowl)"
            stroke="#b45309"
            strokeWidth="1"
          />

          {/* Vessel Rim highlight */}
          <path
            d="M20 48 Q50 54 80 48 Q50 51 20 48 Z"
            fill="#fef3c7"
            opacity="0.8"
          />

          {/* Lotus Pedestal Base */}
          <path
            d="M38 72 L36 78 Q50 82 64 78 L62 72 Z"
            fill="url(#brassStand)"
          />
          <ellipse
            cx="50"
            cy="80"
            rx="22"
            ry="4"
            fill="url(#brassBowl)"
            stroke="#78350f"
            strokeWidth="1"
          />

          {/* Sacred engraving dots */}
          <circle cx="50" cy="62" r="1.5" fill="#fef08a" opacity="0.8" />
          <circle cx="42" cy="60" r="1.2" fill="#fef08a" opacity="0.7" />
          <circle cx="58" cy="60" r="1.2" fill="#fef08a" opacity="0.7" />
        </svg>

        {litCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-black shadow-sm">
            {litCount}
          </span>
        )}
      </button>

      {showCaption && (
        <span className="text-[11px] font-medium tracking-wide text-amber-300/80 mt-1 uppercase">
          Sacred Deepam
        </span>
      )}
    </div>
  );
};
