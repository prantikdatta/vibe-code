import React, { useEffect, useCallback, useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';

interface TempleCurtainProps {
  isOpen: boolean;
  onOpen: () => void;
}

export const TempleCurtain: React.FC<TempleCurtainProps> = ({ isOpen, onOpen }) => {
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [isRendered, setIsRendered] = useState(true);

  // Check prefers-reduced-motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Handle open trigger
  const handleOpenCurtain = useCallback(() => {
    if (!isOpen) {
      onOpen();
    }
  }, [isOpen, onOpen]);

  // Wheel listener
  useEffect(() => {
    if (isOpen) return;

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 15 || Math.abs(e.deltaX) > 15) {
        handleOpenCurtain();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'Enter', 'ArrowDown', 'PageDown'].includes(e.code)) {
        e.preventDefault();
        handleOpenCurtain();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleOpenCurtain]);

  // Touch listener
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setTouchStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY === null || isOpen) return;
    const currentY = e.touches[0].clientY;
    const diff = touchStartY - currentY;
    if (Math.abs(diff) > 25) {
      handleOpenCurtain();
    }
  };

  // Keep in DOM for animation to complete before removing pointer events
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 1200);
      return () => clearTimeout(timer);
    } else {
      setIsRendered(true);
    }
  }, [isOpen]);

  if (!isRendered && isOpen) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Temple Entrance Curtains"
      className={`fixed inset-0 z-50 overflow-hidden select-none transition-opacity duration-700 ${
        isOpen ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onClick={handleOpenCurtain}
    >
      {/* LEFT CURTAIN */}
      <div
        className={`absolute top-0 bottom-0 left-0 w-1/2 bg-[#30080e] shadow-[15px_0_35px_rgba(0,0,0,0.9)] z-20 flex flex-col justify-between overflow-hidden transition-transform ease-out ${
          prefersReducedMotion ? 'duration-300' : 'duration-1000'
        }`}
        style={{
          transform: isOpen ? 'translateX(-102%)' : 'translateX(0%)',
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              #2a060c 0px,
              #400d16 40px,
              #200408 80px,
              #380a12 120px
            )
          `,
        }}
      >
        {/* Top Gold Toran Pelmet Fragment */}
        <div className="w-full h-12 border-b-2 border-amber-500/70 bg-gradient-to-b from-[#1a0307] to-[#3a0b14] flex items-center justify-end pr-4">
          <div className="w-full h-full flex items-center justify-around opacity-40">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="text-amber-400 text-xs">♦</span>
            ))}
          </div>
        </div>

        {/* Velvet Drapery Highlights */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40 pointer-events-none" />

        {/* Right Edge (Center Hem) Gold Filigree Border */}
        <div className="absolute top-0 bottom-0 right-0 w-6 border-r-2 border-amber-400 bg-gradient-to-l from-amber-500/20 to-transparent flex flex-col justify-around items-center py-8">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shadow-[0_0_8px_#f59e0b]" />
          ))}
        </div>
      </div>

      {/* RIGHT CURTAIN */}
      <div
        className={`absolute top-0 bottom-0 right-0 w-1/2 bg-[#30080e] shadow-[-15px_0_35px_rgba(0,0,0,0.9)] z-20 flex flex-col justify-between overflow-hidden transition-transform ease-out ${
          prefersReducedMotion ? 'duration-300' : 'duration-1000'
        }`}
        style={{
          transform: isOpen ? 'translateX(102%)' : 'translateX(0%)',
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              #380a12 0px,
              #200408 40px,
              #400d16 80px,
              #2a060c 120px
            )
          `,
        }}
      >
        {/* Top Gold Toran Pelmet Fragment */}
        <div className="w-full h-12 border-b-2 border-amber-500/70 bg-gradient-to-b from-[#1a0307] to-[#3a0b14] flex items-center justify-start pl-4">
          <div className="w-full h-full flex items-center justify-around opacity-40">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="text-amber-400 text-xs">♦</span>
            ))}
          </div>
        </div>

        {/* Velvet Drapery Highlights */}
        <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-transparent to-black/40 pointer-events-none" />

        {/* Left Edge (Center Hem) Gold Filigree Border */}
        <div className="absolute top-0 bottom-0 left-0 w-6 border-l-2 border-amber-400 bg-gradient-to-r from-amber-500/20 to-transparent flex flex-col justify-around items-center py-8">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400/80 shadow-[0_0_8px_#f59e0b]" />
          ))}
        </div>
      </div>

      {/* CENTER GLOWING OM & MANDAL MEDALLION */}
      <div
        className={`absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none transition-all duration-700 ${
          isOpen ? 'scale-110 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <div className="relative flex flex-col items-center max-w-lg px-6 text-center">
          {/* Radiant Halo Behind Om */}
          <div className="absolute -inset-10 rounded-full bg-amber-500/20 blur-3xl animate-pulse" />

          {/* Ornamental Medallion Plate (No Om symbol) */}
          <div className="relative mb-6 flex h-28 w-28 sm:h-32 sm:w-32 items-center justify-center rounded-full border-2 border-amber-400/80 bg-gradient-to-b from-[#450e18] via-[#200408] to-[#120205] shadow-[0_0_50px_rgba(245,158,11,0.5)]">
            {/* Subtle Mandala Rings */}
            <div className="absolute inset-1.5 rounded-full border border-amber-400/40 border-dashed animate-[spin_60s_linear_infinite]" />
            <div className="absolute inset-3 rounded-full border border-amber-300/40" />

            {/* Marigold / Floral Ornament Ring */}
            <div className="absolute inset-5 rounded-full border border-amber-500/30 flex items-center justify-between p-1.5 opacity-80 pointer-events-none">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            </div>

            {/* Radiant Brass Diya Flame Motif */}
            <div className="relative flex flex-col items-center justify-center">
              <div className="w-6 h-9 sm:w-7 sm:h-10 rounded-t-full bg-gradient-to-t from-amber-600 via-amber-400 to-yellow-100 animate-pulse shadow-[0_0_25px_#f59e0b]" />
              <div className="w-10 h-3 sm:w-12 sm:h-3.5 rounded-b-full bg-gradient-to-r from-amber-800 via-amber-600 to-amber-800 border-t border-amber-300/90 shadow-md" />
            </div>

            {/* Soft Golden Glow Accent */}
            <div className="absolute -bottom-2 flex items-center justify-center">
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping opacity-75" />
            </div>
          </div>

          {/* Typography: SOULCITY BHAKTI RADIO */}
          <span className="text-xs sm:text-sm font-semibold tracking-[0.35em] text-amber-300 uppercase">
            SOULCITY
          </span>
          <h1 className="mt-1 text-3xl sm:text-5xl font-black tracking-wider text-gold-gradient font-serif-temple drop-shadow-md">
            BHAKTI RADIO
          </h1>
          <p className="mt-2 text-sm sm:text-base font-medium tracking-wide text-amber-100/90 font-serif-temple">
            Aarti • Bhajan • Mantra
          </p>

          <p className="mt-3 text-xs sm:text-sm text-stone-300/80 max-w-xs sm:max-w-sm">
            दिव्य मंदिर प्रवेश · Step into the sacred temple of eternal devotion
          </p>

          {/* Enter Button & Subtle Scroll Indicator */}
          <div className="mt-8 flex flex-col items-center gap-3 pointer-events-auto">
            <button
              type="button"
              onClick={handleOpenCurtain}
              className="group flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-stone-950 font-bold text-xs sm:text-sm shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.7)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-stone-950 group-hover:rotate-12 transition-transform" />
              <span>प्रवेश करें · ENTER MANDIR</span>
            </button>

            <div className="flex items-center gap-1.5 text-[11px] text-amber-200/70 animate-bounce mt-1">
              <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
              <span>Scroll, swipe or tap to enter</span>
              <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
