import React from 'react';
import { Volume2, Sparkles, Search, Music, Radio, Send, Flame } from 'lucide-react';

interface TempleHeaderProps {
  onOpenSuggestModal?: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
  currentTrackTitle?: string;
  isPlaying?: boolean;
  navratriThemeColor?: string;
  isNavratriActive?: boolean;
}

export const TempleHeader: React.FC<TempleHeaderProps> = ({
  onOpenSuggestModal,
  activeSection,
  onNavigate,
  currentTrackTitle,
  isPlaying,
  navratriThemeColor = '#ea580c',
  isNavratriActive = true,
}) => {
  const navItems = [
    { id: 'daily-bhakti', label: "Today's Bhakti", icon: Radio },
    { id: 'navratri', label: 'Navratri', icon: Sparkles, isFestival: true },
    { id: 'aartis', label: 'Aarti', icon: Music },
    { id: 'bhajans', label: 'Bhajan', icon: Music },
    { id: 'playlists', label: 'Playlists', icon: null },
    { id: 'search', label: 'Search', icon: Search },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-900/40 bg-[#0e0a07]/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
        {/* Zone 1: SoulCity Bhakti Radio wordmark with Diya Flame logo */}
        <a
          href="#home"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('sanctum');
          }}
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] group-hover:scale-105 transition-transform p-1.5">
            <Flame className="w-5 h-5 text-stone-950 fill-stone-950" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm sm:text-base font-black tracking-wider text-gold-gradient font-serif-temple whitespace-nowrap leading-tight">
              SoulCity Bhakti Radio
            </span>
            <span className="text-[10px] tracking-widest text-amber-300/70 uppercase">
              Divya Mandir Sangeet
            </span>
          </div>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-semibold text-amber-200/80">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;

            if (item.isFestival) {
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer font-bold ${
                    isActive
                      ? 'text-stone-950 shadow-md'
                      : 'text-amber-300 hover:text-white bg-amber-950/40 border border-amber-600/40 hover:border-amber-400'
                  }`}
                  style={{
                    backgroundColor: isActive ? navratriThemeColor : undefined,
                    color: isActive && navratriThemeColor === '#fef08a' ? '#1c1917' : undefined,
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {isNavratriActive && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                  )}
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-amber-300 font-bold bg-amber-950/50 border border-amber-700/40'
                    : 'text-stone-300 hover:text-amber-300 hover:bg-stone-900/60'
                }`}
              >
                {Icon && <Icon className="w-3 h-3 text-amber-400" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Public Actions (Suggest Song, Now Playing) */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {isPlaying && currentTrackTitle && (
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-950/70 border border-amber-600/30 text-xs text-amber-300">
              <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
              <span className="truncate max-w-[150px] font-medium">{currentTrackTitle}</span>
            </div>
          )}

          {/* Public: Suggest a Song */}
          {onOpenSuggestModal && (
            <button
              type="button"
              onClick={onOpenSuggestModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 rounded-lg hover:from-amber-300 hover:to-amber-400 transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] whitespace-nowrap cursor-pointer active:scale-95"
              title="Suggest a song for admin review"
            >
              <Send className="w-3.5 h-3.5 text-stone-950" />
              <span>Suggest a Song</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Secondary Navigation Row */}
      <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-amber-950/60 bg-[#120d09]/90 no-scrollbar text-xs">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-3 py-1 rounded-full whitespace-nowrap cursor-pointer text-[11px] font-medium ${
                isActive
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
