import React from 'react';
import { Calendar, Flame, Sparkles, ArrowRight } from 'lucide-react';
import { DeityId, DeityInfo } from '../types.ts';
import { DEITIES, WEEKDAY_ORDER } from '../data/deities.ts';

interface TempleScheduleProps {
  todayDeityId: DeityId;
  onSelectDeity: (deity: DeityInfo) => void;
}

export const TempleSchedule: React.FC<TempleScheduleProps> = ({
  todayDeityId,
  onSelectDeity,
}) => {
  return (
    <section id="schedule" className="py-12 border-b border-amber-950/60 bg-[#0e0a07]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold tracking-wider uppercase">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Sanatan Saptahik Niyam</span>
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-gold-gradient font-serif-temple">
              Weekday Sacred Consecration
            </h2>
            <p className="mt-1 text-xs text-stone-400 max-w-xl">
              Each day of the week in Hindu tradition is sanctified to a specific deity. SoulCity Bhakti Radio automatically tunes to today&apos;s deity according to Indian Standard Time (IST).
            </p>
          </div>
        </div>

        {/* 7-Day Table/Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {WEEKDAY_ORDER.map((id) => {
            const deity = DEITIES[id];
            const isToday = todayDeityId === id;

            return (
              <div
                key={id}
                className={`relative flex flex-col justify-between rounded-2xl p-5 transition-all ${
                  isToday
                    ? 'border-2 border-amber-400 bg-gradient-to-b from-[#26170d] to-[#160f0b] shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                    : 'border border-amber-900/30 bg-[#140e0b]/90 hover:border-amber-700/50 hover:bg-[#1a120e]'
                }`}
              >
                {/* Consecrated Today Marker */}
                {isToday && (
                  <div className="absolute -top-3 right-4 flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-0.5 text-xs font-bold text-stone-950 shadow-md">
                    <Flame className="w-3 h-3 fill-stone-950" />
                    <span>Today&apos;s Sacred Day</span>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border border-amber-500/50 bg-stone-950 shrink-0">
                      <img
                        src={deity.image}
                        alt={deity.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">
                          {deity.day}
                        </span>
                        <span className="text-xs text-stone-400 font-medium">({deity.dayHindi})</span>
                      </div>
                      <h3 className="text-base font-bold text-stone-100 font-serif-temple">
                        {deity.name}
                      </h3>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-stone-300/80">
                    {deity.significance}
                  </p>

                  <div className="mt-3 rounded-lg bg-black/40 border border-amber-900/40 px-3 py-2 text-center">
                    <span className="text-[10px] text-amber-400/90 font-medium uppercase tracking-wider block">
                      Sacred Chant
                    </span>
                    <span className="text-sm font-semibold text-amber-200 font-serif-temple">
                      {deity.mantra}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-amber-950/80 flex items-center justify-between">
                  <span className="text-[11px] text-stone-400">
                    {deity.title.split('·')[0].trim()}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectDeity(deity);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
                  >
                    <span>Tune In</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
