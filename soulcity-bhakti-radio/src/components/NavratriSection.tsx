import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Play,
  Pause,
  Flame,
  Music,
  Calendar,
  Layers,
  ChevronRight,
  ShieldAlert,
  Volume2,
  Sliders,
  Settings
} from 'lucide-react';
import { Aarti, NavratriDayConfig, NavratriSettings } from '../types.ts';
import { DiyaDecoration } from './DiyaDecoration.tsx';
import durgaImg from '../assets/images/deity_durga_1790943872256.jpg';

interface NavratriSectionProps {
  navratriSettings: NavratriSettings;
  activeNavratriDay: NavratriDayConfig;
  allAartis: Aarti[];
  currentAarti: Aarti | null;
  isPlaying: boolean;
  onPlayAarti: (aarti: Aarti) => void;
  onTogglePlayPause: () => void;
  onSelectNavratriDay: (dayNumber: number) => void;
  onOpenAdminConfig: () => void;
  isManualPreview: boolean;
}

type NavratriPlaylistKey =
  | 'today'
  | 'all-durga'
  | 'aartis'
  | 'mantras'
  | 'stotrams'
  | 'navdurga';

export const NavratriSection: React.FC<NavratriSectionProps> = ({
  navratriSettings,
  activeNavratriDay,
  allAartis,
  currentAarti,
  isPlaying,
  onPlayAarti,
  onTogglePlayPause,
  onSelectNavratriDay,
  onOpenAdminConfig,
  isManualPreview,
}) => {
  const [selectedPlaylist, setSelectedPlaylist] = useState<NavratriPlaylistKey>('today');

  // Filter tracks based on selected Navratri playlist
  const playlistTracks = useMemo(() => {
    const durgaTracks = allAartis.filter(
      (a) =>
        a.deityId === 'durga' ||
        a.festivalTags?.includes('Navratri') ||
        /durga|ambe|devi|mata|shakti|shailputri|brahmacharini|chandraghanta|kushmanda|skandamata|katyayani|kalaratri|mahagauri|siddhidatri/i.test(
          a.title
        )
    );

    switch (selectedPlaylist) {
      case 'today': {
        // Tracks specifically matching active day's Devi or assigned navratriDay
        const dayTracks = durgaTracks.filter(
          (a) =>
            a.navratriDay === activeNavratriDay.dayNumber ||
            (a.deviForm && a.deviForm.toLowerCase().includes(activeNavratriDay.deviForm.toLowerCase())) ||
            a.title.toLowerCase().includes(activeNavratriDay.deviForm.replace('Maa ', '').toLowerCase())
        );
        return dayTracks.length > 0 ? dayTracks : durgaTracks.slice(0, 4);
      }
      case 'all-durga':
        return durgaTracks.filter((a) => a.type === 'Bhajan' || !a.type);
      case 'aartis':
        return durgaTracks.filter((a) => a.type === 'Aarti');
      case 'mantras':
        return durgaTracks.filter((a) => a.type === 'Mantra');
      case 'stotrams':
        return durgaTracks.filter((a) => a.type === 'Stotram');
      case 'navdurga':
        return durgaTracks.filter((a) => a.navratriDay !== undefined || /navdurga|shailputri|brahmacharini|chandraghanta|kushmanda|skandamata|katyayani|kalaratri|mahagauri|siddhidatri/i.test(a.title));
      default:
        return durgaTracks;
    }
  }, [allAartis, selectedPlaylist, activeNavratriDay]);

  const primaryTodayTrack = playlistTracks[0] || allAartis.find((a) => a.deityId === 'durga');
  const isPrimaryPlaying = isPlaying && currentAarti?.id === primaryTodayTrack?.id;

  const handlePlayTodayRadio = () => {
    if (primaryTodayTrack) {
      if (isPrimaryPlaying) {
        onTogglePlayPause();
      } else {
        onPlayAarti(primaryTodayTrack);
      }
    }
  };

  return (
    <section
      id="navratri"
      className="relative py-12 border-b border-amber-950/80 overflow-hidden transition-colors duration-500 scroll-mt-20 sm:scroll-mt-24"
      style={{
        background: `radial-gradient(ellipse at 50% 10%, ${activeNavratriDay.colorHex}15 0%, #0c0907 70%, #080605 100%)`,
      }}
    >
      {/* Decorative Golden & Divine Aura Accents */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />
      <div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: activeNavratriDay.colorHex }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Banner with Navratri Status & Day Color Pill */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:px-5 sm:py-3 rounded-2xl bg-[#17100b]/90 border border-amber-700/30 backdrop-blur-md mb-8 shadow-lg">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 rounded-full animate-ping" style={{ backgroundColor: activeNavratriDay.colorHex }} />
            <div className="flex items-center gap-2 text-xs font-semibold text-stone-200">
              <span className="text-amber-400 uppercase tracking-wider font-bold">Shardiya Navratri 2026</span>
              <span className="text-stone-500">·</span>
              <span className="text-stone-300">
                {activeNavratriDay.dayLabel} ({activeNavratriDay.tithi})
              </span>
            </div>
            {isManualPreview && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-950/80 border border-amber-700/50 text-amber-300">
                Preview Mode
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Today's Configured Color Indicator */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 border border-stone-800 text-xs">
              <span
                className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-sm"
                style={{ backgroundColor: activeNavratriDay.colorHex }}
              />
              <span className="text-[11px] text-stone-300 font-medium">
                Day Color: <strong className="text-stone-100">{activeNavratriDay.colorName}</strong>
              </span>
            </div>

            {/* Admin Config Button */}
            <button
              type="button"
              onClick={onOpenAdminConfig}
              className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg text-amber-400 hover:text-amber-300 bg-amber-950/60 border border-amber-800/40 hover:bg-amber-900 transition-colors cursor-pointer"
              title="Configure Navratri Calendar & Themes"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>

        {/* 10-Day Navdurga Interactive Stepper Carousel */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Navdurga Swaroop Calendar (October 11–20, 2026)</span>
            </h3>
            <span className="text-[11px] text-stone-400">Click any day to view darshan</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2 sm:gap-2.5">
            {navratriSettings.days.map((day) => {
              const isSelected = day.dayNumber === activeNavratriDay.dayNumber;

              return (
                <button
                  key={day.dayNumber}
                  type="button"
                  onClick={() => onSelectNavratriDay(day.dayNumber)}
                  className={`group relative flex flex-col items-center p-2.5 rounded-xl border text-center transition-all cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'border-2 shadow-lg bg-[#20150e]'
                      : 'border-stone-800/80 bg-[#120d0a]/80 hover:border-amber-700/50 hover:bg-[#18110c]'
                  }`}
                  style={{
                    borderColor: isSelected ? day.colorHex : undefined,
                    boxShadow: isSelected ? `0 0 20px ${day.colorHex}33` : undefined,
                  }}
                >
                  {/* Color Swatch Badge */}
                  <div
                    className="w-3.5 h-3.5 rounded-full mb-1.5 shadow-sm border border-black/40"
                    style={{ backgroundColor: day.colorHex }}
                  />

                  <span className="text-[10px] font-bold text-stone-400 uppercase">
                    Day {day.dayNumber}
                  </span>

                  <span className="text-xs font-bold text-stone-100 group-hover:text-amber-300 truncate w-full mt-0.5">
                    {day.deviForm.replace('Maa ', '')}
                  </span>

                  <span className="text-[9px] text-stone-500 truncate w-full">
                    {day.tithi}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hero Section: Today's Consecrated Devi & Darshan Altar */}
        <div
          className="relative rounded-3xl border p-6 sm:p-10 shadow-2xl backdrop-blur-md mb-10 overflow-hidden"
          style={{
            borderColor: `${activeNavratriDay.colorHex}55`,
            background: `linear-gradient(135deg, ${activeNavratriDay.colorHex}12 0%, #17100b 50%, #0e0906 100%)`,
          }}
        >
          {/* Diyas Framing Altar */}
          <div className="absolute top-4 left-4 z-10 hidden sm:block">
            <DiyaDecoration size="sm" />
          </div>
          <div className="absolute top-4 right-4 z-10 hidden sm:block">
            <DiyaDecoration size="sm" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Devi Portrait & Saffron Halo */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center">
              <div className="relative group">
                <div
                  className="absolute -inset-3 rounded-full blur-xl opacity-60 transition-opacity"
                  style={{ backgroundColor: activeNavratriDay.colorHex }}
                />

                <div
                  className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full p-2 shadow-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${activeNavratriDay.colorHex}, #f59e0b, ${activeNavratriDay.colorHex})`,
                  }}
                >
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-stone-900 bg-stone-950">
                    <img
                      src={activeNavratriDay.artwork || durgaImg}
                      alt={activeNavratriDay.deviForm}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </div>

                {/* Day Badge */}
                <div
                  className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border px-4 py-0.5 text-xs font-bold text-stone-950 shadow-md"
                  style={{ backgroundColor: activeNavratriDay.colorHex, borderColor: '#ffffff55' }}
                >
                  {activeNavratriDay.dayLabel}
                </div>
              </div>

              {/* Day Mantra Card */}
              <div className="mt-8 w-full rounded-xl border border-amber-700/30 bg-[#120d0a]/90 p-4 text-center shadow-inner">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                  Sacred Dhyan Mantra
                </span>
                <p className="mt-1.5 text-sm sm:text-base font-bold text-amber-100 font-serif-temple leading-snug">
                  {activeNavratriDay.mantra}
                </p>
              </div>
            </div>

            {/* Right: Devi Story, Color Significance, and Play Radio CTA */}
            <div className="lg:col-span-8 flex flex-col justify-center text-left">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  {activeNavratriDay.tithi} Tithi
                </span>
                <span className="text-stone-500">·</span>
                <span className="text-xs text-stone-300">
                  Concurrence Date: <strong>{activeNavratriDay.dateString}</strong>
                </span>
                <span className="text-stone-500">·</span>
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border shadow-sm"
                  style={{
                    backgroundColor: `${activeNavratriDay.colorHex}22`,
                    borderColor: `${activeNavratriDay.colorHex}66`,
                    color: activeNavratriDay.colorHex === '#fef08a' ? '#fde047' : activeNavratriDay.colorHex,
                  }}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeNavratriDay.colorHex }} />
                  {activeNavratriDay.colorName}
                </span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-gold-gradient font-serif-temple">
                {activeNavratriDay.deviForm}
              </h2>
              <p className="mt-1 text-lg sm:text-xl text-amber-300/90 font-medium">
                {activeNavratriDay.deviHindi}
              </p>

              <p className="mt-4 text-sm sm:text-base leading-relaxed text-stone-300/90 max-w-2xl">
                {activeNavratriDay.significance}
              </p>

              {/* Devotional Categories Pill List */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-stone-400 font-medium">Conducted Vidhi:</span>
                {activeNavratriDay.associatedCategories.map((cat) => (
                  <span
                    key={cat}
                    className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#231811] border border-amber-700/40 text-amber-200"
                  >
                    {cat}
                  </span>
                ))}
              </div>

              {/* "Play Today's Navratri Radio" Main CTA */}
              <div className="mt-6 pt-6 border-t border-amber-900/40 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handlePlayTodayRadio}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-stone-950 shadow-lg hover:shadow-2xl transition-all cursor-pointer active:scale-95 text-sm"
                  style={{
                    background: `linear-gradient(135deg, #f59e0b, ${activeNavratriDay.colorHex})`,
                  }}
                >
                  {isPrimaryPlaying ? (
                    <>
                      <Volume2 className="w-5 h-5 text-stone-950 animate-pulse" />
                      <span>Playing {primaryTodayTrack?.title}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 fill-stone-950 text-stone-950" />
                      <span>Play Today&apos;s Navratri Radio</span>
                    </>
                  )}
                </button>

                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Akhand Jyoti Chants &amp; Stotras</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navratri Dedicated Playlists Tabs & Audio Listing */}
        <div className="mt-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold tracking-wider uppercase">
                <Music className="w-3.5 h-3.5" />
                <span>Navratri Mahotsav Playlists</span>
              </div>
              <h3 className="mt-1 text-2xl font-bold tracking-tight text-gold-gradient font-serif-temple">
                Sacred Devi Sangrah
              </h3>
            </div>
            <p className="text-xs text-stone-400">
              6 dedicated collections covering the 9 divine forms of Durga.
            </p>
          </div>

          {/* 6 Curated Playlist Filters (Zero-pill discipline) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs no-scrollbar">
            {[
              { key: 'today', label: `Today's Navratri (${activeNavratriDay.deviForm.replace('Maa ', '')})` },
              { key: 'all-durga', label: 'All Maa Durga Bhajans' },
              { key: 'aartis', label: 'Mata Ki Aartis' },
              { key: 'mantras', label: 'Navratri Mantras' },
              { key: 'stotrams', label: 'Devi Stotrams' },
              { key: 'navdurga', label: 'Navdurga Collection' },
            ].map((tab) => {
              const isSelected = selectedPlaylist === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedPlaylist(tab.key as NavratriPlaylistKey)}
                  className={`px-3.5 py-2 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'text-stone-950 shadow-md font-bold'
                      : 'bg-[#18110c] text-stone-300 hover:text-white border border-amber-900/40 hover:border-amber-700/60'
                  }`}
                  style={{
                    backgroundColor: isSelected ? activeNavratriDay.colorHex : undefined,
                    color: isSelected && activeNavratriDay.colorHex === '#fef08a' ? '#1c1917' : undefined,
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Playlist Track List */}
          <div className="mt-4 space-y-2.5">
            {playlistTracks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-amber-900/40 bg-[#120d0a]/60 p-8 text-center text-xs text-stone-400">
                <Music className="w-8 h-8 text-amber-600/40 mx-auto mb-2" />
                <p className="font-semibold text-stone-300">No tracks found for this playlist.</p>
                <p className="mt-1 text-stone-500">
                  Import a YouTube playlist or add an aarti with the Navratri tag to populate this collection.
                </p>
              </div>
            ) : (
              playlistTracks.map((track) => {
                const isCurrent = currentAarti?.id === track.id;
                const isTrackPlaying = isCurrent && isPlaying;
                const isYouTube = track.sourceType === 'youtube';

                return (
                  <div
                    key={track.id}
                    className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl p-3.5 sm:px-5 transition-all ${
                      isCurrent
                        ? 'border bg-[#22160f] shadow-md'
                        : 'border border-amber-950/60 bg-[#140e0b]/90 hover:bg-[#1a120e] hover:border-amber-800/40'
                    }`}
                    style={{
                      borderColor: isCurrent ? `${activeNavratriDay.colorHex}88` : undefined,
                    }}
                  >
                    {/* Track info */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (isCurrent) onTogglePlayPause();
                          else onPlayAarti(track);
                        }}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-stone-950 shadow transition-transform active:scale-95 cursor-pointer"
                        style={{
                          backgroundColor: activeNavratriDay.colorHex,
                        }}
                        aria-label={isTrackPlaying ? 'Pause' : 'Play'}
                      >
                        {isTrackPlaying ? (
                          <Pause className="w-4 h-4 fill-current stroke-current" />
                        ) : (
                          <Play className="w-4 h-4 fill-current stroke-current ml-0.5" />
                        )}
                      </button>

                      <div className="relative w-11 h-11 shrink-0 rounded-lg overflow-hidden border border-amber-700/40 bg-stone-950">
                        <img
                          src={track.thumbnailUrl || durgaImg}
                          alt={track.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-stone-100 truncate group-hover:text-amber-200">
                            {track.title}
                          </h4>
                          {track.type && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-800/40 text-amber-300">
                              {track.type}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-stone-400 mt-0.5">
                          {track.deviForm && (
                            <>
                              <span className="text-amber-300/80">{track.deviForm}</span>
                              <span aria-hidden="true">·</span>
                            </>
                          )}
                          {track.artist && (
                            <>
                              <span>{track.artist}</span>
                              <span aria-hidden="true">·</span>
                            </>
                          )}
                          <span>{track.duration || 'Devotional'}</span>
                          {isYouTube && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-red-400 font-medium">YouTube Video</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (isCurrent) onTogglePlayPause();
                          else onPlayAarti(track);
                        }}
                        className="text-xs font-semibold transition-colors cursor-pointer"
                        style={{ color: activeNavratriDay.colorHex }}
                      >
                        {isTrackPlaying ? 'Pause' : 'Play Now'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
