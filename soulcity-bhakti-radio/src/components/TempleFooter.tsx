import React from 'react';
import { DiyaDecoration } from './DiyaDecoration.tsx';
import { Sparkles, Flame } from 'lucide-react';

interface TempleFooterProps {
  onReopenCurtain?: () => void;
}

export const TempleFooter: React.FC<TempleFooterProps> = ({ onReopenCurtain }) => {
  return (
    <footer className="relative mt-16 border-t-2 border-amber-900/60 bg-[#090604] py-14 text-center text-xs text-stone-400 overflow-hidden">
      {/* Subtle Sacred Mandala Background Pattern */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at center, #f59e0b 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 flex flex-col items-center justify-center gap-4">
        {/* Sacred Diya Medallion (No Om symbol) */}
        <div className="flex items-center gap-3">
          <DiyaDecoration size="sm" />
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-amber-500/70 bg-gradient-to-b from-[#251009] to-[#100603] shadow-[0_0_20px_rgba(245,158,11,0.4)] p-2">
            <Flame className="w-6 h-6 text-amber-400 fill-amber-400 animate-pulse" />
          </div>
          <DiyaDecoration size="sm" />
        </div>

        {/* SoulCity Bhakti Radio Typography */}
        <div className="flex flex-col items-center">
          <span className="text-xl sm:text-2xl font-bold tracking-widest text-gold-gradient font-serif-temple">
            SoulCity Bhakti Radio
          </span>
          <span className="mt-1 text-sm font-medium tracking-wider text-amber-200/90 font-serif-temple">
            Aarti • Bhajan • Mantra
          </span>
        </div>

        {/* Shanti Mantra Benedictory Text */}
        <p className="max-w-md text-stone-400 text-xs leading-relaxed font-serif-temple italic text-amber-100/70">
          ॐ शान्तिः शान्तिः शान्तिः · May divine light, inner stillness, and pure devotion illuminate every home.
        </p>

        {/* Made for SoulCity Badge */}
        <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-amber-400/90 bg-[#160e0a] border border-amber-800/40 px-4 py-1.5 rounded-full shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Made for SoulCity</span>
        </div>

        {/* Replay Curtain Experience CTA */}
        {onReopenCurtain && (
          <button
            type="button"
            onClick={onReopenCurtain}
            className="mt-2 text-[11px] text-amber-300/80 hover:text-amber-200 underline underline-offset-4 cursor-pointer transition-colors"
          >
            Replay Divya Mandir Pravesh Curtain Experience
          </button>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-stone-500 mt-2">
          <span>Official YouTube Embedded Player &amp; Direct MP3</span>
          <span aria-hidden="true">·</span>
          <span>Indian Standard Time (Asia/Kolkata)</span>
          <span aria-hidden="true">·</span>
          <span>Shardiya Navratri 2026 Portal</span>
        </div>
      </div>
    </footer>
  );
};
