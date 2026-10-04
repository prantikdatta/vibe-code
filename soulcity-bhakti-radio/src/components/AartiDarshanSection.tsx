import React, { useState, useMemo } from 'react';
import { Play, Pause, Flame, Music, Youtube, Sparkles } from 'lucide-react';
import { Aarti, DeityId } from '../types.ts';
import { DEITIES, EXPLORER_DEITIES } from '../data/deities.ts';

interface AartiDarshanSectionProps {
  aartis: Aarti[];
  currentAarti: Aarti | null;
  isPlaying: boolean;
  onPlayAarti: (aarti: Aarti) => void;
  onTogglePlayPause: () => void;
  onOpenAddModal: () => void;
}

export const AartiDarshanSection: React.FC<AartiDarshanSectionProps> = ({
  aartis,
  currentAarti,
  isPlaying,
  onPlayAarti,
  onTogglePlayPause,
}) => {
  const [filterDeity, setFilterDeity] = useState<DeityId | 'all'>('all');

  // Filter for Aartis specifically
  const aartiTracks = useMemo(() => {
    return aartis.filter((item) => {
      const isAarti = item.type === 'Aarti' || (!item.type && !item.id.includes('bhajan') && !item.id.includes('mantra'));
      if (!isAarti) return false;
      if (filterDeity === 'all') return true;
      return item.deityId === filterDeity;
    });
  }, [aartis, filterDeity]);

  return (
    <section id="aartis" className="py-12 border-b border-amber-950/70 bg-[#0a0705] relative scroll-mt-20 sm:scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-widest">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>आरती दर्शन · Aarti Darshan</span>
            </div>
            <h2 className="mt-1 text-2xl sm:text-4xl font-black tracking-tight text-gold-gradient font-serif-temple">
              Sacred Aarti Sangrah
            </h2>
            <p className="mt-1 text-xs text-stone-400">
              Traditional lighted offerings, invoking divine presence and peace.
            </p>
          </div>

          {/* Deity Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setFilterDeity('all')}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap cursor-pointer transition-all ${
                filterDeity === 'all'
                  ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                  : 'bg-[#18110c] text-stone-300 hover:text-white border border-amber-900/40'
              }`}
            >
              All Deities ({aartis.filter(a => a.type === 'Aarti' || !a.type).length})
            </button>
            {EXPLORER_DEITIES.map((id) => {
              const d = DEITIES[id];
              const count = aartis.filter(a => (a.type === 'Aarti' || !a.type) && a.deityId === id).length;
              if (count === 0) return null;

              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFilterDeity(id)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap cursor-pointer transition-all ${
                    filterDeity === id
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-md'
                      : 'bg-[#18110c] text-stone-300 hover:text-white border border-amber-900/40'
                  }`}
                >
                  {d.name.replace('Lord ', '').replace('Maa ', '')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Ornamental Framed Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {aartiTracks.map((track) => {
            const deity = DEITIES[track.deityId];
            const isTrackPlaying = isPlaying && currentAarti?.id === track.id;
            const artwork = track.thumbnailUrl || deity?.image;
            const isYouTube = track.sourceType === 'youtube';

            return (
              <div
                key={track.id}
                className={`group relative rounded-2xl border p-4 bg-gradient-to-b from-[#18110c] via-[#120c08] to-[#0c0806] shadow-xl transition-all duration-300 ${
                  isTrackPlaying
                    ? 'border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.25)]'
                    : 'border-amber-900/40 hover:border-amber-600/70 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                }`}
              >
                {/* Ornamental Corner Border Accents */}
                <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-amber-400/50" />
                <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-amber-400/50" />
                <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b border-l border-amber-400/50" />
                <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b border-r border-amber-400/50" />

                {/* Artwork Thumbnail */}
                <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-stone-950 border border-amber-800/40 mb-3 shadow">
                  <img
                    src={artwork}
                    alt={track.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* Play Overlay Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isTrackPlaying) {
                        onTogglePlayPause();
                      } else {
                        onPlayAarti(track);
                      }
                    }}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors cursor-pointer"
                    aria-label={isTrackPlaying ? 'Pause Aarti' : 'Play Aarti'}
                  >
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-full text-stone-950 transition-transform ${
                        isTrackPlaying
                          ? 'bg-amber-400 scale-105 shadow-[0_0_20px_#f59e0b]'
                          : 'bg-gradient-to-r from-amber-400 to-amber-500 opacity-90 group-hover:opacity-100 group-hover:scale-110 shadow-md'
                      }`}
                    >
                      {isTrackPlaying ? (
                        <Pause className="w-5 h-5 fill-current stroke-current" />
                      ) : (
                        <Play className="w-5 h-5 fill-current stroke-current ml-0.5" />
                      )}
                    </div>
                  </button>

                  {/* Source Badge */}
                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5 text-[10px]">
                    {isYouTube ? (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-950/80 border border-red-700/50 text-red-200 font-bold">
                        <Youtube className="w-2.5 h-2.5 text-red-400" /> YouTube
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-700/50 text-amber-200 font-bold">
                        <Music className="w-2.5 h-2.5 text-amber-400" /> Direct Audio
                      </span>
                    )}
                  </div>
                </div>

                {/* Track Title & Metadata */}
                <div>
                  <div className="flex items-center justify-between text-[11px] text-amber-400/90 mb-1">
                    <span className="font-semibold">{deity?.name}</span>
                    <span className="text-stone-400 font-mono text-[10px]">{track.duration || 'Aarti'}</span>
                  </div>

                  <h3 className="text-sm font-bold text-stone-100 group-hover:text-amber-300 line-clamp-1">
                    {track.title}
                  </h3>

                  {track.hindiTitle && (
                    <p className="text-xs text-stone-400 line-clamp-1 mt-0.5 font-serif-temple">
                      {track.hindiTitle}
                    </p>
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
