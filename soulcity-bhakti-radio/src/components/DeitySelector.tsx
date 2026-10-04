import React from 'react';
import { Sparkles, Check, Flame } from 'lucide-react';
import { DeityId, DeityInfo } from '../types.ts';
import { DEITIES, EXPLORER_DEITIES } from '../data/deities.ts';

interface DeityExplorerProps {
  selectedDeityId: DeityId;
  todayDeityId: DeityId;
  onSelectDeity: (deity: DeityInfo) => void;
}

export const DeitySelector: React.FC<DeityExplorerProps> = ({
  selectedDeityId,
  todayDeityId,
  onSelectDeity,
}) => {
  return (
    <section id="deities" className="py-10 border-b border-amber-950/60 bg-[#0c0806] relative scroll-mt-20 sm:scroll-mt-24">
      {/* Decorative top mandala hairline divider */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-600/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>दिव्य दर्शन · Divya Mandir Deity Explorer</span>
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-gold-gradient font-serif-temple">
              Sacred Deity Darshan
            </h2>
          </div>
          <p className="text-xs text-stone-400 max-w-md">
            Choose a revered deity to explore consecrated aartis, bhajans, stotras, and daily chants.
          </p>
        </div>

        {/* Horizontal 8-Deity Explorer (Shiva, Ganesh, Hanuman, Durga, Krishna, Vishnu, Lakshmi, Saraswati) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-3.5">
          {EXPLORER_DEITIES.map((id) => {
            const deity = DEITIES[id];
            if (!deity) return null;
            const isSelected = selectedDeityId === id;
            const isToday = todayDeityId === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => onSelectDeity(deity)}
                className={`group relative flex flex-col items-center rounded-2xl p-3 text-center transition-all duration-300 cursor-pointer active:scale-95 ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#2a130b] via-[#1a0c07] to-[#120704] border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.3)]'
                    : 'bg-[#150f0c]/90 hover:bg-[#1d140f] border border-amber-900/40 hover:border-amber-600/60'
                }`}
              >
                {/* Consecrated Today Marker */}
                {isToday && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-2 py-0.5 text-[9px] font-bold text-stone-950 shadow-sm whitespace-nowrap">
                    <Flame className="w-2.5 h-2.5 fill-stone-950" />
                    <span>Today IST</span>
                  </div>
                )}

                {/* Thumbnail Avatar with Subtle Golden Mandala Halo */}
                <div className="relative mt-1 mb-2.5 w-16 h-16 sm:w-18 sm:h-18 rounded-full p-1 bg-gradient-to-tr from-amber-600 via-amber-300 to-amber-500 shadow-md">
                  {/* Outer subtle mandala dash ring */}
                  <div className="absolute -inset-1 rounded-full border border-amber-400/40 border-dashed animate-[spin_40s_linear_infinite] pointer-events-none" />

                  <div className="w-full h-full rounded-full overflow-hidden bg-stone-950 relative">
                    <img
                      src={deity.image}
                      alt={deity.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  {isSelected && (
                    <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-stone-950 shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                {/* Deity Name */}
                <span className="text-xs sm:text-sm font-bold text-stone-100 group-hover:text-amber-300 line-clamp-1">
                  {deity.name.replace('Lord ', '').replace('Maa ', '')}
                </span>

                {/* Hindi Name */}
                <span className="text-[11px] text-amber-300/80 font-medium line-clamp-1">
                  {deity.hindiName}
                </span>

                {/* Day / Vidhi */}
                <span className="text-[10px] text-stone-500 truncate w-full mt-0.5">
                  {deity.day.split('/')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
