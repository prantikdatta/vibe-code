import React from 'react';
import { Play, Pause, Flame, Radio, Sparkles } from 'lucide-react';
import { Aarti, DeityInfo, AartiType } from '../types.ts';
import { DEITIES } from '../data/deities.ts';
import { DiyaDecoration } from './DiyaDecoration.tsx';

interface DailyBhaktiSectionProps {
  todayDeity: DeityInfo;
  allAartis: Aarti[];
  currentAarti: Aarti | null;
  isPlaying: boolean;
  onPlayAarti: (aarti: Aarti) => void;
  onTogglePlayPause: () => void;
  indiaDay: string;
  indiaDate: string;
}

const CATEGORIES: { type: AartiType; label: string; desc: string }[] = [
  { type: 'Aarti', label: 'Aarti', desc: 'Divine light offering & praise' },
  { type: 'Bhajan', label: 'Bhajan', desc: 'Soulful devotional hymn' },
  { type: 'Mantra', label: 'Mantra', desc: 'Sacred meditative chanting' },
  { type: 'Chalisa', label: 'Chalisa', desc: 'Forty verses of divine glorification' },
  { type: 'Stotram', label: 'Stotram', desc: 'Classical Sanskrit hymn of adoration' },
];

export const DailyBhaktiSection: React.FC<DailyBhaktiSectionProps> = ({
  todayDeity,
  allAartis,
  currentAarti,
  isPlaying,
  onPlayAarti,
  onTogglePlayPause,
  indiaDay,
  indiaDate,
}) => {
  // Find recommended track for each category for today's deity (or fallback to any track of that type)
  const getTrackForCategory = (type: AartiType): Aarti | undefined => {
    // 1. Try matching today's deity + category
    const exact = allAartis.find(
      (a) => a.deityId === todayDeity.id && (a.type === type || (!a.type && type === 'Aarti'))
    );
    if (exact) return exact;

    // 2. Try matching category in general
    const general = allAartis.find((a) => a.type === type);
    if (general) return general;

    // 3. Fallback to any aarti of today's deity
    return allAartis.find((a) => a.deityId === todayDeity.id);
  };

  return (
    <section id="daily-bhakti" className="py-12 border-b border-amber-950/70 bg-[#0d0906] relative overflow-hidden scroll-mt-20 sm:scroll-mt-24">
      {/* Decorative Golden Rays */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      <div
        className="absolute top-10 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: todayDeity.colorHex }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header Kicker */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
              <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>नित्य भक्ति संग्रह · Consecrated Daily Recommendations</span>
            </div>
            <h2 className="mt-1 text-2xl sm:text-4xl font-black tracking-tight text-gold-gradient font-serif-temple">
              Today&apos;s Bhakti Recommendations
            </h2>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-stone-300 bg-[#17100b] border border-amber-800/40 px-3.5 py-1.5 rounded-full shadow-sm">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {indiaDay}, {indiaDate} · <strong>{todayDeity.name}</strong>
            </span>
          </div>
        </div>

        {/* 5-Column Recommendations Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {CATEGORIES.map(({ type, label, desc }) => {
            const track = getTrackForCategory(type);
            const isThisPlaying = isPlaying && currentAarti?.id === track?.id;
            const trackDeity = track ? DEITIES[track.deityId] : todayDeity;
            const artwork = track?.thumbnailUrl || trackDeity?.image || todayDeity.image;

            return (
              <div
                key={type}
                className="group relative flex flex-col justify-between rounded-2xl border border-amber-900/40 bg-gradient-to-b from-[#18110c]/90 via-[#130d0a] to-[#0d0806] p-4 shadow-lg hover:border-amber-600/60 hover:shadow-[0_0_25px_rgba(245,158,11,0.2)] transition-all"
              >
                <div>
                  {/* Category Banner */}
                  <div className="flex items-center justify-between gap-1 mb-3">
                    <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                      {label}
                    </span>
                    <span className="text-[10px] text-stone-500 font-medium">
                      Today&apos;s Vidhi
                    </span>
                  </div>

                  {/* Artwork with subtle frame */}
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-amber-800/30 bg-stone-950 mb-3 shadow">
                    <img
                      src={artwork}
                      alt={track?.title || label}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

                    {/* Deity Pill */}
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] text-stone-200">
                      <span className="font-semibold truncate">{trackDeity?.name}</span>
                      {track?.sourceType === 'youtube' ? (
                        <span className="text-red-400 font-bold">YouTube</span>
                      ) : (
                        <span className="text-amber-400 font-bold">Audio</span>
                      )}
                    </div>
                  </div>

                  {/* Track Title */}
                  <h3 className="text-sm font-bold text-stone-100 group-hover:text-amber-300 line-clamp-2 leading-snug">
                    {track?.title || `${todayDeity.name} ${label}`}
                  </h3>

                  <p className="mt-1 text-[11px] text-stone-400 line-clamp-1 italic">
                    {desc}
                  </p>
                </div>

                {/* One-Click Play Action */}
                <div className="mt-4 pt-3 border-t border-amber-950/60 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-stone-500">
                    {track?.duration || 'Sacred Track'}
                  </span>

                  {track ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (isThisPlaying) {
                          onTogglePlayPause();
                        } else {
                          onPlayAarti(track);
                        }
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm ${
                        isThisPlaying
                          ? 'bg-amber-400 text-stone-950 shadow-[0_0_15px_#f59e0b]'
                          : 'bg-[#22160f] text-amber-300 border border-amber-700/40 hover:bg-amber-500 hover:text-stone-950'
                      }`}
                    >
                      {isThisPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 fill-current stroke-current" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current stroke-current" />
                          <span>Listen</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-[11px] text-stone-500">Not loaded</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
