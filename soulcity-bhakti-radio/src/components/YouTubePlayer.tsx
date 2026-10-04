import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { Youtube, AlertTriangle, Maximize2, Minimize2, X, Sparkles } from 'lucide-react';
import { Aarti, DeityInfo } from '../types.ts';
import { loadYouTubeIframeApi } from '../utils/youtube.ts';

export interface YouTubePlayerRef {
  play: () => void;
  pause: () => void;
  seekTo: (seconds: number) => void;
  setVolume: (vol: number) => void; // 0 to 1
  setMuted: (muted: boolean) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
}

interface YouTubePlayerProps {
  currentAarti: Aarti | null;
  deity?: DeityInfo;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  onPlayStateChange: (playing: boolean) => void;
  onTimeUpdate: (currentTime: number, duration: number) => void;
  onTrackEnded: () => void;
  onError: (errorMessage: string) => void;
  onClearTrack?: () => void;
}

export const YouTubePlayer = forwardRef<YouTubePlayerRef, YouTubePlayerProps>(({
  currentAarti,
  deity,
  volume,
  isMuted,
  onPlayStateChange,
  onTimeUpdate,
  onTrackEnded,
  onError,
  onClearTrack,
}, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerInstanceRef = useRef<any>(null);
  const isApiReadyRef = useRef<boolean>(false);
  const currentVideoIdRef = useRef<string | null>(null);

  const [isMinimized, setIsMinimized] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isBuffering, setIsBuffering] = useState(false);

  // Time tracking interval
  const timeTrackerRef = useRef<any>(null);

  const isYouTubeTrack = currentAarti?.sourceType === 'youtube' && !!currentAarti?.youtubeVideoId;
  const videoId = currentAarti?.youtubeVideoId;

  // Initialize YouTube Iframe Player
  useEffect(() => {
    let isCancelled = false;

    loadYouTubeIframeApi().then(() => {
      if (isCancelled) return;
      isApiReadyRef.current = true;

      if (!playerInstanceRef.current && containerRef.current) {
        try {
          playerInstanceRef.current = new window.YT.Player(containerRef.current, {
            height: '100%',
            width: '100%',
            videoId: videoId || '',
            playerVars: {
              autoplay: 0,
              controls: 1,
              rel: 0,
              modestbranding: 1,
              playsinline: 1,
              enablejsapi: 1,
              origin: window.location.origin,
            },
            events: {
              onReady: (event: any) => {
                if (isCancelled) return;
                // Set initial volume & mute state
                event.target.setVolume(Math.round(volume * 100));
                if (isMuted) {
                  event.target.mute();
                } else {
                  event.target.unMute();
                }

                if (videoId) {
                  currentVideoIdRef.current = videoId;
                }
              },
              onStateChange: (event: any) => {
                if (isCancelled) return;
                const state = event.data;

                // YT.PlayerState: UNSTARTED (-1), ENDED (0), PLAYING (1), PAUSED (2), BUFFERING (3), CUED (5)
                if (state === 1) {
                  // PLAYING
                  setIsBuffering(false);
                  onPlayStateChange(true);
                  startTimeTracker();
                } else if (state === 2) {
                  // PAUSED
                  setIsBuffering(false);
                  onPlayStateChange(false);
                  stopTimeTracker();
                } else if (state === 0) {
                  // ENDED
                  setIsBuffering(false);
                  onPlayStateChange(false);
                  stopTimeTracker();
                  onTrackEnded();
                } else if (state === 3) {
                  // BUFFERING
                  setIsBuffering(true);
                }
              },
              onError: (event: any) => {
                if (isCancelled) return;
                const code = event.data;
                let msg = 'YouTube playback failed.';
                if (code === 2) {
                  msg = 'Invalid YouTube video ID parameter.';
                } else if (code === 5) {
                  msg = 'HTML5 player error on YouTube.';
                } else if (code === 100) {
                  msg = 'This YouTube video was not found or is private/removed.';
                } else if (code === 101 || code === 150) {
                  msg = 'The video owner does not allow embedded playback outside YouTube.';
                }
                setLoadError(msg);
                onError(msg);
                onPlayStateChange(false);
                stopTimeTracker();
              },
            },
          });
        } catch (err) {
          console.error('Failed to create YouTube player instance:', err);
        }
      }
    });

    return () => {
      isCancelled = true;
      stopTimeTracker();
    };
  }, []);

  // Update video when currentAarti changes
  useEffect(() => {
    if (!videoId) return;

    setLoadError(null);

    if (playerInstanceRef.current && isApiReadyRef.current) {
      if (typeof playerInstanceRef.current.loadVideoById === 'function') {
        if (currentVideoIdRef.current !== videoId) {
          currentVideoIdRef.current = videoId;
          // Cue or load depending on whether we should autoplay or just prepare
          playerInstanceRef.current.loadVideoById({
            videoId,
            startSeconds: 0,
          });
        }
      }
    }
  }, [videoId]);

  // Sync volume with player
  useEffect(() => {
    if (playerInstanceRef.current && typeof playerInstanceRef.current.setVolume === 'function') {
      try {
        playerInstanceRef.current.setVolume(Math.round(volume * 100));
        if (isMuted) {
          playerInstanceRef.current.mute();
        } else {
          playerInstanceRef.current.unMute();
        }
      } catch {
        // Safe catch if player not ready
      }
    }
  }, [volume, isMuted]);

  // Time tracker loop
  const startTimeTracker = () => {
    stopTimeTracker();
    timeTrackerRef.current = setInterval(() => {
      if (playerInstanceRef.current && typeof playerInstanceRef.current.getCurrentTime === 'function') {
        try {
          const cur = playerInstanceRef.current.getCurrentTime() || 0;
          const dur = playerInstanceRef.current.getDuration() || 0;
          onTimeUpdate(cur, dur);
        } catch {
          // ignore
        }
      }
    }, 400);
  };

  const stopTimeTracker = () => {
    if (timeTrackerRef.current) {
      clearInterval(timeTrackerRef.current);
      timeTrackerRef.current = null;
    }
  };

  // Expose methods to parent
  useImperativeHandle(ref, () => ({
    play: () => {
      if (playerInstanceRef.current && typeof playerInstanceRef.current.playVideo === 'function') {
        playerInstanceRef.current.playVideo();
      }
    },
    pause: () => {
      if (playerInstanceRef.current && typeof playerInstanceRef.current.pauseVideo === 'function') {
        playerInstanceRef.current.pauseVideo();
      }
    },
    seekTo: (seconds: number) => {
      if (playerInstanceRef.current && typeof playerInstanceRef.current.seekTo === 'function') {
        playerInstanceRef.current.seekTo(seconds, true);
      }
    },
    setVolume: (vol: number) => {
      if (playerInstanceRef.current && typeof playerInstanceRef.current.setVolume === 'function') {
        playerInstanceRef.current.setVolume(Math.round(vol * 100));
      }
    },
    setMuted: (muted: boolean) => {
      if (playerInstanceRef.current) {
        if (muted) {
          playerInstanceRef.current.mute();
        } else {
          playerInstanceRef.current.unMute();
        }
      }
    },
    getCurrentTime: () => {
      if (playerInstanceRef.current && typeof playerInstanceRef.current.getCurrentTime === 'function') {
        return playerInstanceRef.current.getCurrentTime() || 0;
      }
      return 0;
    },
    getDuration: () => {
      if (playerInstanceRef.current && typeof playerInstanceRef.current.getDuration === 'function') {
        return playerInstanceRef.current.getDuration() || 0;
      }
      return 0;
    },
  }));

  // Do not show the video darshan panel if not a YouTube track
  if (!isYouTubeTrack) {
    return (
      <div className="hidden" aria-hidden="true">
        <div ref={containerRef} />
      </div>
    );
  }

  return (
    <div
      className={`transition-all duration-300 z-30 ${
        isMinimized
          ? 'fixed bottom-24 right-4 w-72 sm:w-80 shadow-[0_10px_35px_rgba(0,0,0,0.85)] rounded-xl border border-amber-600/50 bg-[#16100c]'
          : 'relative w-full max-w-4xl mx-auto my-6 rounded-2xl border border-amber-600/40 bg-gradient-to-b from-[#18110c] to-[#0f0a07] p-3 sm:p-4 shadow-[0_0_35px_rgba(245,158,11,0.15)]'
      }`}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2 pb-2.5 mb-2 border-b border-amber-900/40">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-5 w-5 items-center justify-center rounded bg-red-600 text-white shrink-0">
            <Youtube className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-amber-300 truncate">
            {isMinimized ? currentAarti.title : `Sacred Darshan · ${currentAarti.title}`}
          </span>
          {deity && !isMinimized && (
            <span className="hidden sm:inline text-[11px] text-stone-400">
              ({deity.name})
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? 'Expand Darshan Video' : 'Minimize Darshan Video'}
            className="p-1 rounded text-stone-400 hover:text-amber-300 hover:bg-stone-800 transition-colors cursor-pointer"
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          {onClearTrack && (
            <button
              type="button"
              onClick={onClearTrack}
              title="Close video"
              className="p-1 rounded text-stone-400 hover:text-rose-400 hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Video IFrame Container */}
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black shadow-inner">
        <div ref={containerRef} className="w-full h-full" />

        {/* Buffering Indicator */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 text-xs text-amber-300 border border-amber-600/40">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>Loading Darshan...</span>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/85 text-center text-rose-300 text-xs">
            <AlertTriangle className="w-6 h-6 text-rose-400 mb-1" />
            <p className="font-semibold text-rose-200">Unable to play YouTube video</p>
            <p className="mt-1 text-stone-400 max-w-xs">{loadError}</p>
          </div>
        )}
      </div>

      {/* Footer hint */}
      {!isMinimized && (
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-stone-400 px-1">
          <span>Official YouTube Embedded Player</span>
          <span className="text-amber-400/80 font-medium">Use player bar or video controls to navigate</span>
        </div>
      )}
    </div>
  );
});

YouTubePlayer.displayName = 'YouTubePlayer';
