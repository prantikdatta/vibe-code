/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TempleHeader } from './components/TempleHeader.tsx';
import { HeroSanctum } from './components/HeroSanctum.tsx';
import { DeitySelector } from './components/DeitySelector.tsx';
import { AartiList } from './components/AartiList.tsx';
import { TempleSchedule } from './components/TempleSchedule.tsx';
import { AudioPlayer } from './components/AudioPlayer.tsx';
import { YouTubePlayer, YouTubePlayerRef } from './components/YouTubePlayer.tsx';
import { AddAartiModal } from './components/AddAartiModal.tsx';
import { AdminPlaylistImporterModal } from './components/AdminPlaylistImporterModal.tsx';
import { DiyaDecoration } from './components/DiyaDecoration.tsx';
import { Aarti, DeityInfo, NavratriSettings } from './types.ts';
import { DEITIES, getFeaturedDeityForToday, getIndiaLiveInfo } from './data/deities.ts';
import { DEFAULT_AARTIS } from './data/defaultAartis.ts';
import { extractYouTubeVideoId, getYouTubeThumbnailUrl } from './utils/youtube.ts';
import {
  LOCAL_STORAGE_NAVRATRI_KEY,
  DEFAULT_NAVRATRI_SETTINGS,
  getEffectiveNavratriStatus,
} from './data/navratriConfig.ts';
import { NavratriSection } from './components/NavratriSection.tsx';
import { NavratriAdminConfigModal } from './components/NavratriAdminConfigModal.tsx';
import { TempleCurtain } from './components/TempleCurtain.tsx';
import { DailyBhaktiSection } from './components/DailyBhaktiSection.tsx';
import { AartiDarshanSection } from './components/AartiDarshanSection.tsx';
import { BhajanSection } from './components/BhajanSection.tsx';
import { CategorySection } from './components/CategorySection.tsx';
import { TempleDivider } from './components/TempleDivider.tsx';
import { TempleFooter } from './components/TempleFooter.tsx';
import { SuggestSongModal } from './components/SuggestSongModal.tsx';
import { PrivateAdminSanctum } from './components/PrivateAdminSanctum.tsx';
import { testFirestoreConnection } from './lib/firebase.ts';
import { fetchApprovedTracksFromFirestore } from './lib/firestoreService.ts';

const LOCAL_STORAGE_KEY = 'soulcity_bhakti_radio_custom_aartis_v2';

export default function App() {
  // Current Live Time & Day in India (Asia/Kolkata)
  const [indiaInfo, setIndiaInfo] = useState(() => getIndiaLiveInfo());
  const todayDeity = useMemo(() => getFeaturedDeityForToday(), [indiaInfo.day]);

  // Selected Deity (Default is today's deity in India)
  const [selectedDeity, setSelectedDeity] = useState<DeityInfo>(() => getFeaturedDeityForToday());

  // Aartis State: Default aartis + saved aartis from localStorage
  const [aartis, setAartis] = useState<Aarti[]>(() => {
    try {
      // Check v2 or previous v1 storage
      const savedV2 = localStorage.getItem(LOCAL_STORAGE_KEY);
      const savedV1 = !savedV2 ? localStorage.getItem('soulcity_bhakti_radio_custom_aartis_v1') : null;
      const saved = savedV2 || savedV1;

      if (saved) {
        const parsed: Aarti[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize items
          const normalized = parsed.map((item) => {
            const ytId = item.youtubeVideoId || extractYouTubeVideoId(item.audioUrl);
            if (ytId && !item.sourceType) {
              return {
                ...item,
                sourceType: 'youtube' as const,
                youtubeVideoId: ytId,
                thumbnailUrl: item.thumbnailUrl || getYouTubeThumbnailUrl(ytId),
              };
            }
            return {
              ...item,
              sourceType: item.sourceType || 'direct',
            };
          });
          return [...DEFAULT_AARTIS, ...normalized];
        }
      }
    } catch (e) {
      console.error('Error loading custom aartis from localStorage:', e);
    }
    return DEFAULT_AARTIS;
  });

  // Active audio state
  // DO NOT AUTOPLAY on page load.
  const [currentAarti, setCurrentAarti] = useState<Aarti | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);

  // Protected Admin Route State (/admin or #admin)
  const [currentRoute, setCurrentRoute] = useState<'public' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname === '/admin' || window.location.hash === '#admin' ? 'admin' : 'public';
    }
    return 'public';
  });

  useEffect(() => {
    const handleRouteChange = () => {
      const isAdminPath = window.location.pathname === '/admin' || window.location.hash === '#admin';
      setCurrentRoute(isAdminPath ? 'admin' : 'public');
    };
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdminPlaylistModalOpen, setIsAdminPlaylistModalOpen] = useState(false);
  const [isNavratriAdminOpen, setIsNavratriAdminOpen] = useState(false);
  const [isSuggestModalOpen, setIsSuggestModalOpen] = useState(false);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);
  const [activeNavSection, setActiveNavSection] = useState('daily-bhakti');
  const [isCurtainOpen, setIsCurtainOpen] = useState(false);

  // Load canonical official tracks from Firestore on boot
  useEffect(() => {
    testFirestoreConnection();
    loadFirestoreTracks();
  }, []);

  const loadFirestoreTracks = async () => {
    try {
      const fsTracks = await fetchApprovedTracksFromFirestore();
      if (fsTracks.length > 0) {
        setAartis((prev) => {
          const map = new Map<string, Aarti>();
          DEFAULT_AARTIS.forEach((a) => map.set(a.id, a));
          prev.filter((a) => a.isCustom).forEach((a) => map.set(a.id, a));
          fsTracks.forEach((a) => map.set(a.id, a));
          return Array.from(map.values());
        });
      }
    } catch (e) {
      console.error('Error loading Firestore tracks:', e);
    }
  };

  // Navratri Settings & Live Festival Status (Asia/Kolkata)
  const [navratriSettings, setNavratriSettings] = useState<NavratriSettings>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_NAVRATRI_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.days)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error loading Navratri settings from localStorage:', e);
    }
    return DEFAULT_NAVRATRI_SETTINGS;
  });

  const navratriStatus = useMemo(() => {
    return getEffectiveNavratriStatus(navratriSettings);
  }, [navratriSettings, indiaInfo.formattedDate]);

  // Dynamic Daily Theme accent color (applied across hero, player, buttons, glow)
  const currentAccentColor = navratriStatus.isActive
    ? navratriStatus.currentDay.colorHex
    : '#f59e0b';

  const handleSaveNavratriSettings = (newSettings: NavratriSettings) => {
    setNavratriSettings(newSettings);
    try {
      localStorage.setItem(LOCAL_STORAGE_NAVRATRI_KEY, JSON.stringify(newSettings));
      setNotificationToast('Navratri calendar & theme settings updated!');
      setTimeout(() => setNotificationToast(null), 4000);
    } catch (e) {
      console.error('Failed to save navratri settings:', e);
    }
  };

  const handleUpdateAarti = (updated: Aarti) => {
    const nextList = aartis.map((a) => (a.id === updated.id ? updated : a));
    setAartis(nextList);
    saveCustomAartis(nextList);
    if (currentAarti?.id === updated.id) {
      setCurrentAarti(updated);
    }
    setNotificationToast(`Updated "${updated.title}" with Navratri metadata`);
    setTimeout(() => setNotificationToast(null), 4000);
  };

  // Player references
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const youtubePlayerRef = useRef<YouTubePlayerRef | null>(null);

  // Update India time every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setIndiaInfo(getIndiaLiveInfo());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Initialize default aarti for the featured deity (without autoplaying)
  useEffect(() => {
    if (!currentAarti) {
      const deityAarti = aartis.find((a) => a.deityId === todayDeity.id) || aartis[0];
      if (deityAarti) {
        setCurrentAarti(deityAarti);
      }
    }
  }, [aartis, todayDeity.id, currentAarti]);

  // Save custom aartis to localStorage when modified
  const saveCustomAartis = (updatedList: Aarti[]) => {
    try {
      const customOnly = updatedList.filter((a) => a.isCustom);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customOnly));
    } catch (e) {
      console.error('Failed to save aartis to localStorage:', e);
    }
  };

  const handleAddAarti = (newAarti: Aarti) => {
    const updated = [newAarti, ...aartis];
    setAartis(updated);
    saveCustomAartis(updated);
    // Select the deity of the new aarti and switch to it
    setSelectedDeity(DEITIES[newAarti.deityId]);
  };

  const handleImportPlaylistAartis = (importedList: Aarti[]) => {
    if (importedList.length === 0) return;

    // Filter duplicates by youtubeVideoId
    const existingYtIds = new Set(
      aartis.map((a) => a.youtubeVideoId).filter(Boolean)
    );

    const newUnique = importedList.filter(
      (item) => !item.youtubeVideoId || !existingYtIds.has(item.youtubeVideoId)
    );

    const countAdded = newUnique.length;
    const updated = [...newUnique, ...aartis];
    setAartis(updated);
    saveCustomAartis(updated);

    if (newUnique.length > 0) {
      setSelectedDeity(DEITIES[newUnique[0].deityId]);
    }

    setNotificationToast(
      `Successfully imported ${countAdded} sacred ${countAdded === 1 ? 'track' : 'tracks'} from YouTube playlist!`
    );
    setTimeout(() => {
      setNotificationToast(null);
    }, 6000);
  };

  const handleDeleteAarti = (id: string) => {
    const target = aartis.find((a) => a.id === id);
    if (!target) return;

    if (window.confirm(`Are you sure you want to remove "${target.title}"?`)) {
      const updated = aartis.filter((a) => a.id !== id);
      setAartis(updated);
      saveCustomAartis(updated);

      if (currentAarti?.id === id) {
        if (target.sourceType === 'youtube') {
          youtubePlayerRef.current?.pause();
        } else if (audioRef.current) {
          audioRef.current.pause();
        }
        setIsPlaying(false);
        setCurrentAarti(updated[0] || null);
      }
    }
  };

  // Play Aarti Handler (User initiated)
  const handlePlayAarti = (aarti: Aarti) => {
    setPlaybackError(null);
    setCurrentAarti(aarti);
    setCurrentTime(0);
    setDuration(0);

    const isYouTube = aarti.sourceType === 'youtube';

    if (isYouTube) {
      // Pause HTML5 audio element
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // Check YouTube video ID
      const videoId = aarti.youtubeVideoId || extractYouTubeVideoId(aarti.audioUrl);
      if (!videoId) {
        setPlaybackError(`Invalid YouTube URL for "${aarti.title}". Cannot extract video ID.`);
        setIsPlaying(false);
        return;
      }

      // Instruct YouTube Player
      setIsPlaying(true);
      setTimeout(() => {
        youtubePlayerRef.current?.play();
      }, 100);
    } else {
      // Pause YouTube player if active
      youtubePlayerRef.current?.pause();

      // Play via HTMLAudioElement
      setIsPlaying(true);
      if (audioRef.current) {
        audioRef.current.src = aarti.audioUrl;
        audioRef.current.load();
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.error('Playback error:', err);
            setIsPlaying(false);
            setPlaybackError(
              `Unable to play "${aarti.title}". The audio URL may be invalid, blocked by CORS, or unreachable. Please verify the link.`
            );
          });
      }
    }
  };

  // Toggle Play / Pause
  const handleTogglePlayPause = () => {
    if (!currentAarti) return;

    const isYouTube = currentAarti.sourceType === 'youtube';

    if (isPlaying) {
      if (isYouTube) {
        youtubePlayerRef.current?.pause();
      } else if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      setPlaybackError(null);
      if (isYouTube) {
        youtubePlayerRef.current?.play();
        setIsPlaying(true);
      } else {
        if (audioRef.current) {
          if (!audioRef.current.src) {
            audioRef.current.src = currentAarti.audioUrl;
            audioRef.current.load();
          }
          audioRef.current
            .play()
            .then(() => {
              setIsPlaying(true);
            })
            .catch((err) => {
              console.error('Playback error:', err);
              setIsPlaying(false);
              setPlaybackError(
                `Unable to play "${currentAarti.title}". The URL may be invalid or unreachable.`
              );
            });
        }
      }
    }
  };

  // Next Track
  const handleNextTrack = () => {
    if (!currentAarti || aartis.length === 0) return;
    const currentIndex = aartis.findIndex((a) => a.id === currentAarti.id);
    const nextIndex = (currentIndex + 1) % aartis.length;
    const nextAarti = aartis[nextIndex];
    handlePlayAarti(nextAarti);
  };

  // Previous Track
  const handlePreviousTrack = () => {
    if (!currentAarti || aartis.length === 0) return;
    const currentIndex = aartis.findIndex((a) => a.id === currentAarti.id);
    const prevIndex = (currentIndex - 1 + aartis.length) % aartis.length;
    const prevAarti = aartis[prevIndex];
    handlePlayAarti(prevAarti);
  };

  // Seek
  const handleSeek = (time: number) => {
    setCurrentTime(time);
    if (currentAarti?.sourceType === 'youtube') {
      youtubePlayerRef.current?.seekTo(time);
    } else if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  // Volume
  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
      audioRef.current.muted = newVol === 0 || isMuted;
    }
    youtubePlayerRef.current?.setVolume(newVol);
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (audioRef.current) {
      audioRef.current.muted = next;
    }
    youtubePlayerRef.current?.setMuted(next);
  };

  // Toggle Loop
  const handleToggleLoop = () => {
    const next = !isLooping;
    setIsLooping(next);
    if (audioRef.current) {
      audioRef.current.loop = next;
    }
  };

  // Retry playback
  const handleRetryPlayback = () => {
    if (currentAarti) {
      handlePlayAarti(currentAarti);
    }
  };

  // Filter aartis for selected deity in Hero
  const selectedDeityAartis = useMemo(() => {
    return aartis.filter((a) => a.deityId === selectedDeity.id);
  }, [aartis, selectedDeity.id]);

  const scrollToSection = (sectionId: string) => {
    setActiveNavSection(sectionId);
    if (!isCurtainOpen) {
      setIsCurtainOpen(true);
    }
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (currentRoute === 'admin') {
    return (
      <PrivateAdminSanctum
        aartis={aartis}
        onRefreshAartis={loadFirestoreTracks}
        navratriSettings={navratriSettings}
        onSaveNavratriSettings={handleSaveNavratriSettings}
        indiaDay={indiaInfo.day}
        onBackToRadio={() => {
          window.history.pushState({}, '', '/');
          setCurrentRoute('public');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0705] text-stone-200 pb-28 selection:bg-amber-500/30 selection:text-amber-200 relative overflow-x-hidden">
      {/* Divya Mandir Pravesh Velvet Curtain Experience */}
      <TempleCurtain
        isOpen={isCurtainOpen}
        onOpen={() => setIsCurtainOpen(true)}
      />

      {/* Hidden standard audio element strictly controlling direct audio */}
      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={() => {
          if (audioRef.current && currentAarti?.sourceType !== 'youtube') {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current && currentAarti?.sourceType !== 'youtube') {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={isLooping ? () => audioRef.current?.play() : handleNextTrack}
        onError={() => {
          if (currentAarti?.sourceType !== 'youtube') {
            setIsPlaying(false);
            setPlaybackError(
              `Unable to stream audio from: ${currentAarti?.audioUrl || 'source'}. The link might be expired or not supported.`
            );
          }
        }}
      />

      {/* Public Top Navigation (No Admin Links Visible) */}
      <TempleHeader
        onOpenSuggestModal={() => setIsSuggestModalOpen(true)}
        activeSection={activeNavSection}
        onNavigate={scrollToSection}
        currentTrackTitle={currentAarti?.title}
        isPlaying={isPlaying}
        navratriThemeColor={currentAccentColor}
        isNavratriActive={navratriStatus.isActive}
      />

      {/* Auspicious Import Notification Toast */}
      {notificationToast && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-2.5 rounded-xl border border-amber-500/60 bg-[#1e140d] px-4 py-3 text-xs font-semibold text-amber-200 shadow-[0_0_30px_rgba(245,158,11,0.3)] animate-in fade-in slide-in-from-top-3">
          <DiyaDecoration size="sm" />
          <span>{notificationToast}</span>
          <button
            type="button"
            onClick={() => setNotificationToast(null)}
            className="ml-2 text-stone-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      <main>
        {/* 1. Hero Sanctum Section with Altar & Featured Deity */}
        <HeroSanctum
          selectedDeity={selectedDeity}
          todayDeity={todayDeity}
          indiaDay={indiaInfo.day}
          indiaDate={indiaInfo.formattedDate}
          indiaTime={indiaInfo.time}
          deityAartis={selectedDeityAartis}
          currentAarti={currentAarti}
          isPlaying={isPlaying}
          onPlayAarti={handlePlayAarti}
          onSelectDeity={setSelectedDeity}
          navratriActiveDay={navratriStatus.currentDay}
          isNavratriActive={navratriStatus.isActive}
        />

        <TempleDivider variant="mandala" />

        {/* 2. Today's Bhakti Section with 5 Consecrated Recommendations */}
        <DailyBhaktiSection
          todayDeity={todayDeity}
          allAartis={aartis}
          currentAarti={currentAarti}
          isPlaying={isPlaying}
          onPlayAarti={handlePlayAarti}
          onTogglePlayPause={handleTogglePlayPause}
          indiaDay={indiaInfo.day}
          indiaDate={indiaInfo.formattedDate}
        />

        {/* 3. Official YouTube IFrame Player Screen (Visible when YouTube track is selected/playing) */}
        {currentAarti?.sourceType === 'youtube' && (
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6">
            <YouTubePlayer
              ref={youtubePlayerRef}
              currentAarti={currentAarti}
              deity={selectedDeity}
              isPlaying={isPlaying}
              volume={volume}
              isMuted={isMuted}
              onPlayStateChange={(playing) => setIsPlaying(playing)}
              onTimeUpdate={(cur, dur) => {
                setCurrentTime(cur);
                if (dur > 0) setDuration(dur);
              }}
              onTrackEnded={isLooping ? () => youtubePlayerRef.current?.seekTo(0) : handleNextTrack}
              onError={(msg) => {
                setPlaybackError(msg);
                setIsPlaying(false);
              }}
            />
          </div>
        )}

        {/* 4. Dedicated Navratri Festival Section & Daily Darshan */}
        <NavratriSection
          navratriSettings={navratriSettings}
          activeNavratriDay={navratriStatus.currentDay}
          allAartis={aartis}
          currentAarti={currentAarti}
          isPlaying={isPlaying}
          onPlayAarti={handlePlayAarti}
          onTogglePlayPause={handleTogglePlayPause}
          onSelectNavratriDay={(dayNum) => {
            const updated = {
              ...navratriSettings,
              manualOverrideDay: dayNum,
            };
            handleSaveNavratriSettings(updated);
          }}
          onOpenAdminConfig={() => setIsNavratriAdminOpen(true)}
          isManualPreview={navratriStatus.isManualPreview}
        />

        <TempleDivider variant="diya" />

        {/* 5. 8-Deity Horizontal Mandir Deity Explorer */}
        <DeitySelector
          selectedDeityId={selectedDeity.id}
          todayDeityId={todayDeity.id}
          onSelectDeity={(deity) => {
            setSelectedDeity(deity);
            scrollToSection('sanctum');
          }}
        />

        <TempleDivider variant="om" />

        {/* 6. Aarti Darshan Section with Framed Cards */}
        <AartiDarshanSection
          aartis={aartis}
          currentAarti={currentAarti}
          isPlaying={isPlaying}
          onPlayAarti={handlePlayAarti}
          onTogglePlayPause={handleTogglePlayPause}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />

        <TempleDivider variant="mandala" />

        {/* 7. Soulful Bhajan Sangrah Section */}
        <BhajanSection
          aartis={aartis}
          currentAarti={currentAarti}
          isPlaying={isPlaying}
          onPlayAarti={handlePlayAarti}
          onTogglePlayPause={handleTogglePlayPause}
        />

        <TempleDivider variant="diya" />

        {/* 8. Devotional Categories */}
        <CategorySection
          aartis={aartis}
          onSelectCategory={(sec) => scrollToSection(sec)}
        />

        <TempleDivider variant="mandala" />

        {/* 9. Searchable Aarti Repository & Playlists */}
        <AartiList
          aartis={aartis}
          currentAarti={currentAarti}
          isPlaying={isPlaying}
          onPlayAarti={handlePlayAarti}
          onTogglePlayPause={handleTogglePlayPause}
          onDeleteAarti={handleDeleteAarti}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenAdminPlaylistModal={() => setIsAdminPlaylistModalOpen(true)}
        />

        {/* 10. Weekly Hindu Consecration & Schedule */}
        <TempleSchedule
          todayDeityId={todayDeity.id}
          onSelectDeity={(deity) => {
            setSelectedDeity(deity);
            scrollToSection('sanctum');
          }}
        />
      </main>

      {/* 11. Premium Temple-Style Footer */}
      <TempleFooter onReopenCurtain={() => setIsCurtainOpen(false)} />

      {/* Docked Working Audio & Media Player */}
      {currentAarti && (
        <AudioPlayer
          currentAarti={currentAarti}
          isPlaying={isPlaying}
          onTogglePlayPause={handleTogglePlayPause}
          onNext={handleNextTrack}
          onPrevious={handlePreviousTrack}
          playbackError={playbackError}
          onClearError={() => setPlaybackError(null)}
          onRetryPlayback={handleRetryPlayback}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
          volume={volume}
          isMuted={isMuted}
          onVolumeChange={handleVolumeChange}
          onToggleMute={handleToggleMute}
          isLooping={isLooping}
          onToggleLoop={handleToggleLoop}
          themeAccentColor={currentAccentColor}
        />
      )}

      {/* Add Single Aarti Modal */}
      <AddAartiModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddAarti={handleAddAarti}
        initialDeityId={selectedDeity.id}
      />

      {/* Admin YouTube Playlist Importer Modal */}
      <AdminPlaylistImporterModal
        isOpen={isAdminPlaylistModalOpen}
        onClose={() => setIsAdminPlaylistModalOpen(false)}
        onImportAartis={handleImportPlaylistAartis}
      />

      {/* Navratri Calendar & Theme Admin Config Modal */}
      <NavratriAdminConfigModal
        isOpen={isNavratriAdminOpen}
        onClose={() => setIsNavratriAdminOpen(false)}
        settings={navratriSettings}
        onSaveSettings={handleSaveNavratriSettings}
        aartis={aartis}
        onUpdateAarti={handleUpdateAarti}
      />

      {/* Public Suggest a Song Modal */}
      <SuggestSongModal
        isOpen={isSuggestModalOpen}
        onClose={() => setIsSuggestModalOpen(false)}
        onSubmissionSuccess={(msg) => {
          setNotificationToast(msg);
          setTimeout(() => setNotificationToast(null), 4500);
        }}
      />
    </div>
  );
}
