import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  AlertTriangle,
  RefreshCw,
  X,
  Youtube,
  Music,
  Radio
} from 'lucide-react';
import { Aarti } from '../types.ts';
import { DEITIES } from '../data/deities.ts';

interface AudioPlayerProps {
  currentAarti: Aarti | null;
  isPlaying: boolean;
  onTogglePlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  playbackError: string | null;
  onClearError: () => void;
  onRetryPlayback: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  isLooping: boolean;
  onToggleLoop: () => void;
  themeAccentColor?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  currentAarti,
  isPlaying,
  onTogglePlayPause,
  onNext,
  onPrevious,
  playbackError,
  onClearError,
  onRetryPlayback,
  currentTime,
  duration,
  onSeek,
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  isLooping,
  onToggleLoop,
  themeAccentColor = '#f59e0b',
}) => {
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  // Sync seekValue with currentTime when not user-dragging
  useEffect(() => {
    if (!isSeeking) {
      setSeekValue(currentTime);
    }
  }, [currentTime, isSeeking]);

  if (!currentAarti) return null;

  const deity = DEITIES[currentAarti.deityId];
  const isYouTube = currentAarti.sourceType === 'youtube';
  const trackArtwork = currentAarti.thumbnailUrl || deity?.image;

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleVolumeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    onVolumeChange(val);
  };

  return (
    <div
      role="region"
      aria-label="Temple Radio Console"
      className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-[#170e09]/98 via-[#21140d]/98 to-[#170e09]/98 backdrop-blur-xl border-t-2 border-amber-600/60 shadow-[0_-10px_35px_rgba(0,0,0,0.9)]"
    >
      {/* Console Top Engraved Brass Filigree Trim */}
      <div className="h-1 w-full bg-gradient-to-r from-amber-700/40 via-amber-400 to-amber-700/40" />

      {/* Error notification bar if URL is invalid or unplayable */}
      {playbackError && (
        <div className="bg-rose-950/95 border-b border-rose-700/60 px-4 py-2 text-rose-200 text-xs flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 max-w-2xl">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-bold">Mandir Playback Notice:</span>
            <span className="truncate">{playbackError}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onRetryPlayback}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-rose-800/80 hover:bg-rose-700 text-white font-medium cursor-pointer text-[11px]"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
            <button
              type="button"
              onClick={onClearError}
              className="p-1 hover:text-white cursor-pointer"
              title="Dismiss notice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Progress Bar (Scrubber) with Golden Flame Gradient */}
      <div className="relative group w-full h-2 bg-[#2a1a12] cursor-pointer">
        <div
          className="absolute top-0 bottom-0 left-0 transition-all duration-150"
          style={{
            width: `${duration > 0 ? (seekValue / duration) * 100 : 0}%`,
            background: `linear-gradient(90deg, #d97706, ${themeAccentColor}, #fef08a)`,
          }}
        />
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.5}
          value={seekValue}
          onMouseDown={() => setIsSeeking(true)}
          onTouchStart={() => setIsSeeking(true)}
          onChange={(e) => setSeekValue(parseFloat(e.target.value))}
          onMouseUp={() => {
            setIsSeeking(false);
            onSeek(seekValue);
          }}
          onTouchEnd={() => {
            setIsSeeking(false);
            onSeek(seekValue);
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Seek track time"
        />
      </div>

      {/* Main Console Deck */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 sm:gap-6">
        {/* Left: Track Artwork with Temple Bezel & Title / Artist */}
        <div className="flex items-center gap-3 min-w-0 max-w-[42%] sm:max-w-xs md:max-w-sm">
          {/* Beveled Artwork */}
          <div className="relative w-11 h-11 sm:w-13 sm:h-13 shrink-0 rounded-xl overflow-hidden border-2 border-amber-500/70 bg-stone-950 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
            <img
              src={trackArtwork}
              alt={currentAarti.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {isYouTube && (
              <div className="absolute bottom-0 right-0 p-0.5 bg-red-600 rounded-tl text-white">
                <Youtube className="w-2.5 h-2.5" />
              </div>
            )}
          </div>

          {/* Title & Artist/Channel Information */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold tracking-widest text-amber-400 uppercase hidden sm:inline">
                RADIO CONSOLE
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-bold text-stone-100 truncate leading-snug">
              {currentAarti.title}
            </h4>

            <div className="flex items-center gap-1.5 text-[11px] text-stone-400 truncate">
              {/* Artist or Channel name when available */}
              {currentAarti.artist && currentAarti.artist !== 'Unknown' ? (
                <span className="text-amber-200/90 font-medium truncate">
                  {currentAarti.artist}
                </span>
              ) : (
                <span className="text-amber-300/80 font-medium">{deity?.name}</span>
              )}

              <span aria-hidden="true" className="text-stone-600">·</span>

              {/* Source Indicator */}
              {isYouTube ? (
                <span className="text-red-400 font-bold flex items-center gap-0.5 shrink-0 text-[10px]">
                  <Youtube className="w-3 h-3 inline" /> YouTube
                </span>
              ) : (
                <span className="text-amber-400 font-bold flex items-center gap-0.5 shrink-0 text-[10px]">
                  <Music className="w-3 h-3 inline" /> Direct Audio
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Mandir Radio Console Transport Controls */}
        <div className="flex flex-col items-center gap-0.5 shrink-0">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Previous */}
            <button
              type="button"
              onClick={onPrevious}
              title="Previous Track"
              className="p-1.5 sm:p-2 rounded-full text-stone-300 hover:text-amber-300 hover:bg-amber-950/60 transition-colors cursor-pointer"
              aria-label="Previous track"
            >
              <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </button>

            {/* Central Play/Pause Dial */}
            <button
              type="button"
              onClick={onTogglePlayPause}
              className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full text-stone-950 shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95 transition-all cursor-pointer hover:scale-105"
              style={{
                background: `linear-gradient(135deg, #f59e0b, ${themeAccentColor}, #ea580c)`,
              }}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-current stroke-current" />
              ) : (
                <Play className="w-5 h-5 fill-current stroke-current ml-0.5" />
              )}
            </button>

            {/* Next */}
            <button
              type="button"
              onClick={onNext}
              title="Next Track"
              className="p-1.5 sm:p-2 rounded-full text-stone-300 hover:text-amber-300 hover:bg-amber-950/60 transition-colors cursor-pointer"
              aria-label="Next track"
            >
              <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </button>

            {/* Repeat / Loop */}
            <button
              type="button"
              onClick={onToggleLoop}
              title={isLooping ? 'Repeat: On' : 'Repeat: Off'}
              className={`hidden sm:inline-flex p-1.5 rounded-full transition-colors cursor-pointer ${
                isLooping
                  ? 'text-amber-400 bg-amber-950/80 ring-1 ring-amber-400/50'
                  : 'text-stone-500 hover:text-stone-300'
              }`}
            >
              <Repeat className="w-4 h-4" />
            </button>
          </div>

          {/* Time Counter */}
          <div className="text-[10px] text-stone-400 font-mono tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span className="mx-1 text-stone-600">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right: Volume & Speaker Console */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 min-w-[80px] sm:min-w-[150px]">
          <button
            type="button"
            onClick={onToggleMute}
            className="p-1.5 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
            aria-label={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeInput}
            className="w-16 sm:w-24 h-1.5 accent-amber-400 bg-stone-800 rounded-lg cursor-pointer"
            aria-label="Volume slider"
          />
        </div>
      </div>
    </div>
  );
};
