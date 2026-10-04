import React, { useState, useMemo } from 'react';
import { Search, Play, Pause, Trash2, Music, Youtube, Plus, Volume2, Sparkles } from 'lucide-react';
import { Aarti, DeityId } from '../types.ts';
import { DEITIES, EXPLORER_DEITIES } from '../data/deities.ts';

interface AartiListProps {
  aartis: Aarti[];
  currentAarti: Aarti | null;
  isPlaying: boolean;
  onPlayAarti: (aarti: Aarti) => void;
  onTogglePlayPause: () => void;
  onDeleteAarti: (id: string) => void;
  onOpenAddModal: () => void;
  onOpenAdminPlaylistModal?: () => void;
}

export const AartiList: React.FC<AartiListProps> = ({
  aartis,
  currentAarti,
  isPlaying,
  onPlayAarti,
  onTogglePlayPause,
  onDeleteAarti,
  onOpenAddModal,
  onOpenAdminPlaylistModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterDeity, setSelectedFilterDeity] = useState<DeityId | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'direct' | 'youtube'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Filtered list
  const filteredAartis = useMemo(() => {
    return aartis.filter((item) => {
      // Source filter
      if (sourceFilter === 'youtube' && item.sourceType !== 'youtube') return false;
      if (sourceFilter === 'direct' && item.sourceType === 'youtube') return false;

      // Category filter
      if (categoryFilter === 'Navratri') {
        if (!item.festivalTags?.includes('Navratri') && item.deityId !== 'durga') return false;
      } else if (categoryFilter !== 'all') {
        if (item.type !== categoryFilter && !item.title.toLowerCase().includes(categoryFilter.toLowerCase())) {
          return false;
        }
      }

      // Deity filter
      if (selectedFilterDeity !== 'all' && item.deityId !== selectedFilterDeity) {
        return false;
      }

      // Search text filter
      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase().trim();
      const deity = DEITIES[item.deityId];
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchHindi = item.hindiTitle ? item.hindiTitle.toLowerCase().includes(q) : false;
      const matchDeityName = deity ? deity.name.toLowerCase().includes(q) : false;
      const matchDeityDay = deity ? deity.day.toLowerCase().includes(q) : false;
      const matchSource = item.sourceType === 'youtube' ? 'youtube'.includes(q) : 'audio mp3 direct'.includes(q);

      return matchTitle || matchHindi || matchDeityName || matchDeityDay || matchSource;
    });
  }, [aartis, searchQuery, selectedFilterDeity, sourceFilter, categoryFilter]);

  return (
    <section id="playlists" className="py-12 bg-[#0c0907] border-b border-amber-950/70 relative scroll-mt-20 sm:scroll-mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold tracking-wider uppercase">
              <Music className="w-3.5 h-3.5 text-amber-400" />
              <span>भक्ति संगीत सागर · Sacred Audio &amp; Video Repository</span>
            </div>
            <h2 className="mt-1 text-2xl sm:text-4xl font-black tracking-tight text-gold-gradient font-serif-temple">
              Playlists &amp; Devotional Repository
            </h2>
            <p className="mt-1 text-xs text-stone-400">
              Listen to consecrated audio recordings and YouTube darshan videos. Search by title, deity, or format.
            </p>
          </div>

          {/* Quick Add and Playlist Import CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            {onOpenAdminPlaylistModal && (
              <button
                type="button"
                onClick={onOpenAdminPlaylistModal}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-300 bg-[#1e140d] hover:bg-amber-950/80 border border-amber-600/40 rounded-lg transition-colors cursor-pointer shadow-sm active:scale-95"
              >
                <Youtube className="w-3.5 h-3.5 text-red-500" />
                <span>Import Playlist</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-900 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors cursor-pointer shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Aarti</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div id="search" className="mb-6 flex flex-col gap-4 scroll-mt-20 sm:scroll-mt-24">
          {/* Search Input */}
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500/70" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, deity (e.g. Shiva, Krishna, Durga), or keywords..."
              className="w-full rounded-xl border border-amber-900/40 bg-[#140e0b] pl-10 pr-10 py-3 text-sm text-stone-200 placeholder-stone-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-200 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs: All, Aarti, Bhajan, Mantra, Chalisa, Stotram, Navratri */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {['all', 'Aarti', 'Bhajan', 'Mantra', 'Chalisa', 'Stotram', 'Navratri'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                    : 'bg-[#18110c] text-stone-300 hover:text-white border border-amber-900/30'
                }`}
              >
                {cat === 'all' ? 'All Playlists' : cat}
              </button>
            ))}
          </div>

          {/* Filters: Format / Media Source Filter & Deity Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Format toggle */}
            <div className="flex items-center gap-1.5 p-1 bg-[#150f0c] rounded-lg border border-amber-900/30 self-start">
              <button
                type="button"
                onClick={() => setSourceFilter('all')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  sourceFilter === 'all'
                    ? 'bg-amber-500 text-stone-950 font-semibold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                All Sources
              </button>
              <button
                type="button"
                onClick={() => setSourceFilter('direct')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  sourceFilter === 'direct'
                    ? 'bg-amber-500 text-stone-950 font-semibold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Music className="w-3 h-3" />
                <span>Audio MP3</span>
              </button>
              <button
                type="button"
                onClick={() => setSourceFilter('youtube')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  sourceFilter === 'youtube'
                    ? 'bg-red-600 text-white font-semibold'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Youtube className="w-3 h-3" />
                <span>YouTube</span>
              </button>
            </div>

            {/* Interactive Deity Filter Controls */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedFilterDeity('all')}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  selectedFilterDeity === 'all'
                    ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                    : 'bg-[#18110c] text-stone-300 hover:text-white border border-amber-900/30'
                }`}
              >
                All Deities ({aartis.length})
              </button>

              {EXPLORER_DEITIES.map((id) => {
                const deity = DEITIES[id];
                if (!deity) return null;
                const count = aartis.filter((a) => a.deityId === id).length;
                const isSelected = selectedFilterDeity === id;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelectedFilterDeity(id)}
                    className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                        : 'bg-[#18110c] text-stone-300 hover:text-white border border-amber-900/30'
                    }`}
                  >
                    {deity.name.replace('Lord ', '').replace('Maa ', '')} ({count})
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Aarti Rows */}
        {filteredAartis.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-amber-900/40 bg-[#130d0a]/60 p-10 text-center">
            <Music className="mx-auto w-10 h-10 text-amber-600/50 mb-3" />
            <h3 className="text-base font-semibold text-stone-300">
              No Sacred Tracks Found
            </h3>
            <p className="mt-1 text-xs text-stone-500 max-w-sm mx-auto">
              {searchQuery
                ? `No tracks matched "${searchQuery}". Try a different search term or filter.`
                : 'There are no tracks listed for this selection.'}
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-3 py-1.5 text-xs rounded-md bg-stone-800 text-stone-300 hover:bg-stone-700 cursor-pointer"
                >
                  Clear Search
                </button>
              )}
              <button
                type="button"
                onClick={onOpenAddModal}
                className="px-3 py-1.5 text-xs rounded-md bg-amber-500 text-stone-950 font-semibold hover:bg-amber-400 cursor-pointer"
              >
                Add Your Aarti
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredAartis.map((item) => {
              const deity = DEITIES[item.deityId];
              const isItemPlaying = isPlaying && currentAarti?.id === item.id;
              const isSelected = currentAarti?.id === item.id;
              const isYouTube = item.sourceType === 'youtube';
              const trackArtwork = item.thumbnailUrl || deity?.image;

              return (
                <div
                  key={item.id}
                  className={`group relative flex items-center justify-between gap-3 sm:gap-4 rounded-xl p-3 sm:p-4 transition-all duration-200 border ${
                    isSelected
                      ? 'bg-[#1f150e] border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                      : 'bg-[#130d0a]/90 hover:bg-[#1a120d] border-amber-900/30 hover:border-amber-700/50'
                  }`}
                >
                  {/* Left: Play button, Artwork, and Title Info */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    {/* Play/Pause Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (isItemPlaying) {
                          onTogglePlayPause();
                        } else {
                          onPlayAarti(item);
                        }
                      }}
                      className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full text-stone-950 transition-all cursor-pointer ${
                        isItemPlaying
                          ? 'bg-amber-400 scale-105 shadow-[0_0_12px_#f59e0b]'
                          : 'bg-amber-500/80 group-hover:bg-amber-400 group-hover:scale-105'
                      }`}
                      aria-label={isItemPlaying ? 'Pause Aarti' : 'Play Aarti'}
                    >
                      {isItemPlaying ? (
                        <Pause className="w-4 h-4 fill-current stroke-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current stroke-current ml-0.5" />
                      )}
                    </button>

                    {/* Thumbnail Artwork with Source Indicator */}
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-lg overflow-hidden border border-amber-800/40 bg-stone-950">
                      <img
                        src={trackArtwork}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {isYouTube && (
                        <div
                          className="absolute bottom-0 right-0 p-0.5 bg-red-600 rounded-tl text-white"
                          title="YouTube Video"
                        >
                          <Youtube className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    {/* Title & Metadata */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4
                          className={`text-sm sm:text-base font-semibold truncate ${
                            isSelected ? 'text-amber-200' : 'text-stone-100 group-hover:text-amber-100'
                          }`}
                        >
                          {item.title}
                        </h4>

                        {/* Type Tag */}
                        {item.type && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-800/40 text-amber-300 shrink-0">
                            {item.type}
                          </span>
                        )}

                        {item.isCustom && (
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-amber-400/90 shrink-0">
                            Custom
                          </span>
                        )}
                      </div>

                      {/* Hindi title or subtitle */}
                      {item.hindiTitle && (
                        <p className="text-xs text-stone-400 truncate mt-0.5 font-serif-temple">
                          {item.hindiTitle}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-[11px] text-stone-400 mt-0.5">
                        <span className="text-amber-300/80 font-medium">
                          {deity?.name}
                        </span>
                        <span aria-hidden="true" className="text-stone-600">·</span>
                        <span>{deity?.day}</span>

                        {isYouTube ? (
                          <>
                            <span aria-hidden="true" className="text-stone-600">·</span>
                            <span className="text-red-400 font-medium">YouTube Video</span>
                          </>
                        ) : (
                          <>
                            <span aria-hidden="true" className="text-stone-600">·</span>
                            <span className="text-amber-400 font-medium">Direct MP3</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Duration, Active Playing Pulse, and Delete action */}
                  <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    {isItemPlaying && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold px-2 py-1 rounded bg-amber-950/60 border border-amber-600/30">
                        <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                        <span className="hidden sm:inline">Playing</span>
                      </div>
                    )}

                    <span className="text-xs font-mono text-stone-400 tabular-nums">
                      {item.duration || 'Devotional'}
                    </span>

                    {/* Delete button (for custom user-added aartis) */}
                    {item.isCustom && (
                      <button
                        type="button"
                        onClick={() => onDeleteAarti(item.id)}
                        className="p-1.5 text-stone-500 hover:text-rose-400 hover:bg-stone-800/80 rounded-lg transition-colors cursor-pointer"
                        title="Remove custom aarti"
                        aria-label={`Remove ${item.title}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
