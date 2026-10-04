import React, { useState } from 'react';
import {
  X,
  Youtube,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  CheckSquare,
  Square,
  Edit2,
  Check,
  Trash2,
  ExternalLink,
  Shield,
  HelpCircle,
  Key
} from 'lucide-react';
import { Aarti, DeityId, AartiType, ClassifiedPlaylistItem } from '../types.ts';
import { DEITIES, WEEKDAY_ORDER } from '../data/deities.ts';
import { extractYouTubePlaylistId } from '../utils/youtube.ts';

interface AdminPlaylistImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportAartis: (imported: Aarti[]) => void;
}

const DEITY_DAY_MAP: Record<DeityId, string> = {
  shiva: 'Monday',
  hanuman: 'Tuesday',
  ganesh: 'Wednesday',
  vishnu: 'Thursday',
  durga: 'Friday',
  shani: 'Saturday',
  surya: 'Sunday',
  krishna: 'Wednesday',
  lakshmi: 'Friday',
  saraswati: 'Thursday',
};

const SAMPLE_PLAYLIST_URL = 'https://www.youtube.com/playlist?list=PLCE9AEC40B6F9C90E';

const SAMPLE_PLAYLIST_VIDEOS = [
  {
    videoId: 'AETFvQonfV8',
    title: 'श्री हनुमान चालीसा 🌺🙏| Shree Hanuman Chalisa Original Video | GULSHAN KUMAR | HARIHARAN | 8K',
    description: 'T-Series Bhakti Sagar presents Shree Hanuman Chalisa sung by Hariharan composed by Lalit Sen.',
    thumbnail: 'https://img.youtube.com/vi/AETFvQonfV8/hqdefault.jpg',
  },
  {
    videoId: 's2K9m4n1p8k',
    title: 'Om Jai Shiv Omkara Aarti | Lord Shiva Aarti by Anuradha Paudwal | Mahashivratri Special',
    description: 'Sacred Lord Shiva Aarti sung by Anuradha Paudwal for Monday Kailash worship.',
    thumbnail: 'https://img.youtube.com/vi/AETFvQonfV8/hqdefault.jpg',
  },
  {
    videoId: 'g5L1m2n9q3p',
    title: 'Jai Ganesh Jai Ganesh Deva | Ganpati Aarti with lyrics by Suresh Wadkar',
    description: 'Vighnaharta Shri Ganesh Aarti sung by Suresh Wadkar for Wednesday prayers.',
    thumbnail: 'https://img.youtube.com/vi/AETFvQonfV8/hqdefault.jpg',
  },
  {
    videoId: 'v8J2k3m1p9n',
    title: 'Om Jai Jagdish Hare | Lord Vishnu Aarti | Vishnu Sahasranamam',
    description: 'Universal Vishnu prayer for Thursday worship by Anuradha Paudwal.',
    thumbnail: 'https://img.youtube.com/vi/AETFvQonfV8/hqdefault.jpg',
  },
  {
    videoId: 'd7M1n2k4p8j',
    title: 'Jai Ambe Gauri | Durga Mata Ki Aarti | Navratri Bhajans',
    description: 'Sacred Durga Aarti for Friday Shakti worship.',
    thumbnail: 'https://img.youtube.com/vi/AETFvQonfV8/hqdefault.jpg',
  },
];

export const AdminPlaylistImporterModal: React.FC<AdminPlaylistImporterModalProps> = ({
  isOpen,
  onClose,
  onImportAartis,
}) => {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKeyField, setShowKeyField] = useState(false);

  // Workflow states: 'input' | 'fetching' | 'classifying' | 'review' | 'imported'
  const [phase, setPhase] = useState<'input' | 'fetching' | 'classifying' | 'review'>('input');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  // Review items
  const [items, setItems] = useState<ClassifiedPlaylistItem[]>([]);

  if (!isOpen) return null;

  // Test with sample playlist videos directly through Gemini classification
  const handleTestWithSampleVideos = async () => {
    setPlaylistUrl(SAMPLE_PLAYLIST_URL);
    setErrorMessage(null);
    setErrorDetails(null);
    setPhase('classifying');

    try {
      const geminiRes = await fetch('/api/gemini/classify-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videos: SAMPLE_PLAYLIST_VIDEOS }),
      });

      const geminiData = await geminiRes.json();
      if (!geminiRes.ok || !geminiData.classifications) {
        setPhase('input');
        setErrorMessage(geminiData.error || 'Gemini classification service encountered an issue.');
        return;
      }

      const classificationsMap = new Map<string, any>();
      geminiData.classifications.forEach((c: any) => {
        classificationsMap.set(c.videoId, c);
      });

      const reviewItems: ClassifiedPlaylistItem[] = SAMPLE_PLAYLIST_VIDEOS.map((v) => {
        const c = classificationsMap.get(v.videoId) || {};
        let deity: DeityId | 'Unknown' = 'Unknown';
        if (['shiva', 'hanuman', 'ganesh', 'vishnu', 'durga', 'shani', 'surya'].includes(c.deity)) {
          deity = c.deity as DeityId;
        }

        const suggestedDays = Array.isArray(c.suggestedDays) && c.suggestedDays.length > 0
          ? c.suggestedDays
          : (deity !== 'Unknown' ? [DEITY_DAY_MAP[deity]] : []);

        return {
          videoId: v.videoId,
          originalTitle: v.title,
          cleanTitle: c.cleanTitle || v.title,
          description: v.description,
          thumbnail: v.thumbnail,
          type: (c.type as AartiType) || 'Aarti',
          deity,
          suggestedDays,
          artist: c.artist || 'Unknown',
          confidence: typeof c.confidence === 'number' ? Math.round(c.confidence * 100) : 95,
          selected: true,
          isEditing: false,
        };
      });

      setItems(reviewItems);
      setPhase('review');
    } catch (err: any) {
      setPhase('input');
      setErrorMessage(err.message || 'Error running sample classification.');
    }
  };

  const handleFetchAndClassify = async () => {
    setErrorMessage(null);
    setErrorDetails(null);

    const trimmedUrl = playlistUrl.trim();
    if (!trimmedUrl) {
      setErrorMessage('Please enter a YouTube playlist URL or ID.');
      return;
    }

    const playlistId = extractYouTubePlaylistId(trimmedUrl);
    if (!playlistId) {
      setErrorMessage('Invalid YouTube playlist URL or ID. Supported formats: https://www.youtube.com/playlist?list=PL..., https://youtu.be/...&list=..., or direct playlist ID.');
      return;
    }

    setPhase('fetching');

    try {
      // 1. Call official YouTube Data API v3 proxy
      const ytRes = await fetch('/api/youtube/playlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          urlOrId: trimmedUrl,
          apiKey: apiKeyInput.trim() || undefined,
        }),
      });

      const ytData = await ytRes.json();

      if (!ytRes.ok || ytData.error) {
        setPhase('input');
        setErrorMessage(ytData.error || 'Failed to retrieve playlist items from YouTube Data API.');
        if (ytData.details) {
          setErrorDetails(typeof ytData.details === 'string' ? ytData.details : JSON.stringify(ytData.details));
        }
        return;
      }

      const fetchedVideos = ytData.videos || [];
      if (fetchedVideos.length === 0) {
        setPhase('input');
        setErrorMessage('This playlist does not contain any available videos or contains only private/deleted items.');
        return;
      }

      // 2. Classify with Gemini
      setPhase('classifying');

      const geminiRes = await fetch('/api/gemini/classify-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videos: fetchedVideos }),
      });

      const geminiData = await geminiRes.json();

      if (!geminiRes.ok || !geminiData.classifications) {
        setPhase('input');
        setErrorMessage(geminiData.error || 'Gemini classification service encountered an issue.');
        return;
      }

      // 3. Merge fetched metadata with Gemini classifications
      const classificationsMap = new Map<string, any>();
      geminiData.classifications.forEach((c: any) => {
        classificationsMap.set(c.videoId, c);
      });

      const reviewItems: ClassifiedPlaylistItem[] = fetchedVideos.map((v: any) => {
        const c = classificationsMap.get(v.videoId) || {};
        let deity: DeityId | 'Unknown' = 'Unknown';
        if (['shiva', 'hanuman', 'ganesh', 'vishnu', 'durga', 'shani', 'surya'].includes(c.deity)) {
          deity = c.deity as DeityId;
        }

        const suggestedDays = Array.isArray(c.suggestedDays) && c.suggestedDays.length > 0
          ? c.suggestedDays
          : (deity !== 'Unknown' ? [DEITY_DAY_MAP[deity]] : []);

        return {
          videoId: v.videoId,
          originalTitle: v.title,
          cleanTitle: c.cleanTitle || v.title,
          description: v.description,
          thumbnail: v.thumbnail,
          type: (c.type as AartiType) || 'Aarti',
          deity,
          suggestedDays,
          artist: c.artist || 'Unknown',
          confidence: typeof c.confidence === 'number' ? Math.round(c.confidence * 100) : 85,
          selected: true,
          isEditing: false,
          festivalTags: c.festivalTags || (deity === 'durga' ? ['Navratri'] : []),
          navratriDay: c.navratriDay || null,
          deviForm: c.deviForm || null,
        };
      });

      setItems(reviewItems);
      setPhase('review');
    } catch (err: any) {
      console.error('Error during playlist import workflow:', err);
      setPhase('input');
      setErrorMessage(err.message || 'An unexpected error occurred during playlist processing.');
    }
  };

  // Toggle selection
  const handleToggleSelect = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleSelectAll = (selectAll: boolean) => {
    setItems((prev) => prev.map((item) => ({ ...item, selected: selectAll })));
  };

  // Row edit toggles
  const handleToggleEdit = (index: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, isEditing: !item.isEditing } : item))
    );
  };

  // Field updates
  const handleUpdateItem = (index: number, field: keyof ClassifiedPlaylistItem, value: any) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };

        // If deity changed and suggestedDays hasn't been manually set
        if (field === 'deity' && value !== 'Unknown' && DEITY_DAY_MAP[value as DeityId]) {
          updated.suggestedDays = [DEITY_DAY_MAP[value as DeityId]];
        }
        return updated;
      })
    );
  };

  // Reject / Remove item from list
  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Approve & Import
  const handleApproveAndImport = () => {
    const selected = items.filter((item) => item.selected);
    if (selected.length === 0) {
      alert('Please select at least one aarti to import.');
      return;
    }

    const approvedAartis: Aarti[] = selected.map((item) => {
      // Default to Ganesh if deity is Unknown so it seamlessly fits existing deity architecture
      const finalDeity: DeityId = item.deity !== 'Unknown' ? item.deity : 'ganesh';

      return {
        id: `yt-${item.videoId}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: item.cleanTitle.trim() || item.originalTitle,
        deityId: finalDeity,
        sourceType: 'youtube',
        audioUrl: `https://www.youtube.com/watch?v=${item.videoId}`,
        youtubeVideoId: item.videoId,
        thumbnailUrl: item.thumbnail,
        duration: 'YouTube Track',
        isCustom: true,
        addedAt: Date.now(),
        type: item.type,
        artist: item.artist !== 'Unknown' ? item.artist : undefined,
        suggestedDay: item.suggestedDays?.[0] || DEITY_DAY_MAP[finalDeity],
        festivalTags: item.festivalTags && item.festivalTags.length > 0 ? item.festivalTags : (finalDeity === 'durga' ? ['Navratri'] : undefined),
        navratriDay: item.navratriDay || undefined,
        deviForm: item.deviForm || undefined,
      };
    });

    onImportAartis(approvedAartis);
    onClose();
  };

  const selectedCount = items.filter((i) => i.selected).length;
  const allSelected = items.length > 0 && selectedCount === items.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl border border-amber-600/50 bg-[#140e0b] p-5 sm:p-7 shadow-[0_0_60px_rgba(0,0,0,0.95)] text-stone-200 my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-900/40">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 text-stone-950 shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
                <Youtube className="w-3.5 h-3.5 text-red-500" />
                <span>Admin Devotional Portal</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-gold-gradient font-serif-temple">
                Import YouTube Playlist
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800/80 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Phase: Input & Settings */}
        {phase === 'input' && (
          <div className="py-6 space-y-5 overflow-y-auto flex-1">
            <div>
              <label className="block text-xs font-semibold text-stone-200 mb-1.5">
                YouTube Playlist URL or Playlist ID <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <Youtube className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
                <input
                  type="text"
                  value={playlistUrl}
                  onChange={(e) => setPlaylistUrl(e.target.value)}
                  placeholder="https://www.youtube.com/playlist?list=PL... or https://youtu.be/...&list=..."
                  className="w-full rounded-xl border border-amber-900/50 bg-[#1b120d] pl-10 pr-28 py-3 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setPlaylistUrl(SAMPLE_PLAYLIST_URL)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-medium text-amber-300 bg-amber-950/80 hover:bg-amber-900 border border-amber-700/50 rounded-lg cursor-pointer"
                >
                  Load Sample
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-stone-400">
                Supports standard YouTube playlist links, video URLs with playlist parameter, and raw playlist IDs.
              </p>
            </div>

            {/* Optional API Key Toggle */}
            <div className="rounded-xl border border-amber-950/60 bg-[#110c09] p-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold text-stone-300">
                    YouTube Data API Key Configuration
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowKeyField(!showKeyField)}
                  className="text-xs text-amber-400 hover:text-amber-300 underline cursor-pointer"
                >
                  {showKeyField ? 'Hide' : 'Configure Custom Key'}
                </button>
              </div>

              {showKeyField && (
                <div className="mt-3 pt-3 border-t border-amber-900/40">
                  <label className="block text-[11px] font-medium text-stone-300 mb-1">
                    Custom YouTube Data API v3 Key <span className="text-stone-500">(Optional)</span>
                  </label>
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="AIzaSy... (leave blank to use server environment default)"
                    className="w-full rounded-lg border border-amber-900/40 bg-[#1b120d] px-3 py-2 text-xs text-stone-200 placeholder-stone-600 focus:border-amber-400 focus:outline-none"
                  />
                  <p className="mt-1 text-[10px] text-stone-400">
                    Ensure your Google Cloud API key has the <strong>YouTube Data API v3</strong> service enabled.
                  </p>
                </div>
              )}
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-4 rounded-xl bg-rose-950/70 border border-rose-700/60 text-rose-200 text-xs space-y-1 animate-in fade-in">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                {errorDetails && (
                  <p className="text-[11px] text-rose-300/80 pl-6 break-words font-mono">
                    {errorDetails}
                  </p>
                )}
              </div>
            )}

            {/* Compliance Guarantee Notice */}
            <div className="p-3.5 rounded-xl bg-[#110c09] border border-amber-900/30 text-[11px] text-stone-400 flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 block">Terms &amp; Official Playback Guarantee:</strong>
                SoulCity Bhakti Radio only stores video IDs and metadata. Playback strictly uses the official YouTube IFrame Player without extracting, downloading, or proxying audio streams.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleTestWithSampleVideos}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-amber-300 bg-[#1e140d] border border-amber-600/40 hover:bg-amber-950/80 transition-colors cursor-pointer"
                title="Instant test using pre-verified Bhakti playlist tracks"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Test with Sample Bhakti Playlist</span>
              </button>

              <button
                type="button"
                onClick={handleFetchAndClassify}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-stone-950 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] cursor-pointer text-xs"
              >
                <Youtube className="w-4 h-4 text-stone-950" />
                <span>Fetch Playlist &amp; Classify with Gemini</span>
              </button>
            </div>
          </div>
        )}

        {/* Phase: Fetching & Classifying Loading Screen */}
        {(phase === 'fetching' || phase === 'classifying') && (
          <div className="py-16 text-center space-y-4 flex-1 flex flex-col items-center justify-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-amber-600/30 border-t-amber-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-amber-400">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gold-gradient font-serif-temple">
                {phase === 'fetching' ? 'Connecting to YouTube Data API...' : 'Classifying Devotional Content with Gemini AI...'}
              </h3>
              <p className="mt-1 text-xs text-stone-400 max-w-sm mx-auto">
                {phase === 'fetching'
                  ? 'Retrieving official playlist items, titles, and thumbnails...'
                  : 'Gemini is standardizing titles, identifying deities, artists, and assigning sacred days.'}
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-amber-300/80 bg-amber-950/50 px-4 py-2 rounded-full border border-amber-700/40">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Please hold on, analyzing sacred tracks</span>
            </div>
          </div>
        )}

        {/* Phase: Review Table */}
        {phase === 'review' && (
          <div className="flex-1 flex flex-col min-h-0 pt-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-amber-900/40">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSelectAll(!allSelected)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a120e] hover:bg-stone-800 border border-amber-900/40 text-xs font-semibold text-amber-300 cursor-pointer"
                >
                  {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
                </button>
                <span className="text-xs text-stone-400">
                  <strong className="text-amber-400 font-bold">{selectedCount}</strong> of {items.length} tracks selected for import
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPhase('input')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-stone-400 hover:text-stone-200 cursor-pointer"
                >
                  Change Playlist
                </button>
                <button
                  type="button"
                  onClick={handleApproveAndImport}
                  disabled={selectedCount === 0}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 transition-all shadow cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Approve &amp; Import ({selectedCount})</span>
                </button>
              </div>
            </div>

            {/* Scrollable Review Table */}
            <div className="flex-1 overflow-y-auto rounded-xl border border-amber-950/60 bg-[#100b08]">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 z-10 bg-[#1b120d] text-amber-300/90 uppercase text-[10px] tracking-wider border-b border-amber-900/50">
                  <tr>
                    <th className="p-3 w-10 text-center">Sel</th>
                    <th className="p-3 w-16">Video</th>
                    <th className="p-3">Clean Title / Original</th>
                    <th className="p-3 w-28">Type</th>
                    <th className="p-3 w-32">Deity</th>
                    <th className="p-3 w-28">Suggested Day</th>
                    <th className="p-3 w-28">Artist</th>
                    <th className="p-3 w-16 text-center">AI Conf.</th>
                    <th className="p-3 w-20 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-950/50">
                  {items.map((item, idx) => {
                    const deity = item.deity !== 'Unknown' ? DEITIES[item.deity as DeityId] : null;

                    return (
                      <tr
                        key={item.videoId}
                        className={`transition-colors ${
                          item.selected ? 'bg-[#18110c]/80 hover:bg-[#1d140e]' : 'bg-[#0f0a07] opacity-60 hover:opacity-90'
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => handleToggleSelect(idx)}
                            className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                          />
                        </td>

                        {/* Thumbnail */}
                        <td className="p-3">
                          <div className="relative w-14 h-9 rounded overflow-hidden bg-stone-900 border border-amber-900/40 shrink-0">
                            <img
                              src={item.thumbnail}
                              alt={item.cleanTitle}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover"
                            />
                            <a
                              href={`https://www.youtube.com/watch?v=${item.videoId}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Watch on YouTube"
                              className="absolute bottom-0 right-0 p-0.5 bg-black/70 hover:bg-red-600 text-white rounded-tl"
                            >
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </td>

                        {/* Title (Display or Edit) */}
                        <td className="p-3">
                          {item.isEditing ? (
                            <div className="space-y-1.5">
                              <input
                                type="text"
                                value={item.cleanTitle}
                                onChange={(e) => handleUpdateItem(idx, 'cleanTitle', e.target.value)}
                                className="w-full rounded bg-[#251a13] border border-amber-600/50 px-2 py-1 text-xs text-stone-100"
                              />
                              <div className="flex items-center gap-1.5 pt-0.5">
                                <span className="text-[10px] text-amber-400 font-semibold">Navratri:</span>
                                <select
                                  value={item.navratriDay ? String(item.navratriDay) : ''}
                                  onChange={(e) => {
                                    const dayVal = e.target.value ? parseInt(e.target.value, 10) : null;
                                    const deviMap: Record<number, string> = {
                                      1: 'Maa Shailputri',
                                      2: 'Maa Brahmacharini',
                                      3: 'Maa Chandraghanta',
                                      4: 'Maa Kushmanda',
                                      5: 'Maa Skandamata',
                                      6: 'Maa Katyayani',
                                      7: 'Maa Kalaratri',
                                      8: 'Maa Mahagauri',
                                      9: 'Maa Siddhidatri',
                                      10: 'Maa Durga Vijaya',
                                    };
                                    const tags = dayVal ? ['Navratri'] : [];
                                    handleUpdateItem(idx, 'navratriDay', dayVal);
                                    handleUpdateItem(idx, 'deviForm', dayVal ? deviMap[dayVal] : null);
                                    handleUpdateItem(idx, 'festivalTags', tags);
                                  }}
                                  className="rounded bg-[#1a120e] border border-amber-600/40 px-1 py-0.5 text-[10px] text-stone-200"
                                >
                                  <option value="">None (Standard)</option>
                                  <option value="1">Day 1 · Shailputri</option>
                                  <option value="2">Day 2 · Brahmacharini</option>
                                  <option value="3">Day 3 · Chandraghanta</option>
                                  <option value="4">Day 4 · Kushmanda</option>
                                  <option value="5">Day 5 · Skandamata</option>
                                  <option value="6">Day 6 · Katyayani</option>
                                  <option value="7">Day 7 · Kalaratri</option>
                                  <option value="8">Day 8 · Mahagauri</option>
                                  <option value="9">Day 9 · Siddhidatri</option>
                                  <option value="10">Day 10 · Vijaya</option>
                                </select>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="font-semibold text-stone-100 line-clamp-1">{item.cleanTitle}</p>
                              <p className="text-[10px] text-stone-500 line-clamp-1">{item.originalTitle}</p>
                              {(item.navratriDay || item.festivalTags?.includes('Navratri')) && (
                                <div className="mt-1 flex items-center gap-1">
                                  <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-950/70 border border-amber-600/40 text-amber-300">
                                    Navratri {item.navratriDay ? `Day ${item.navratriDay}` : ''} {item.deviForm ? `· ${item.deviForm}` : ''}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Type */}
                        <td className="p-3">
                          {item.isEditing ? (
                            <select
                              value={item.type}
                              onChange={(e) => handleUpdateItem(idx, 'type', e.target.value as AartiType)}
                              className="w-full rounded bg-[#251a13] border border-amber-600/50 px-2 py-1 text-xs text-stone-200"
                            >
                              <option value="Aarti">Aarti</option>
                              <option value="Bhajan">Bhajan</option>
                              <option value="Chalisa">Chalisa</option>
                              <option value="Mantra">Mantra</option>
                              <option value="Stotram">Stotram</option>
                              <option value="Other">Other</option>
                            </select>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950/70 border border-amber-700/40 text-amber-300">
                              {item.type}
                            </span>
                          )}
                        </td>

                        {/* Deity */}
                        <td className="p-3">
                          {item.isEditing ? (
                            <select
                              value={item.deity}
                              onChange={(e) => handleUpdateItem(idx, 'deity', e.target.value)}
                              className="w-full rounded bg-[#251a13] border border-amber-600/50 px-2 py-1 text-xs text-stone-200"
                            >
                              <option value="shiva">Lord Shiva</option>
                              <option value="hanuman">Lord Hanuman</option>
                              <option value="ganesh">Lord Ganesh</option>
                              <option value="vishnu">Lord Vishnu</option>
                              <option value="durga">Maa Durga</option>
                              <option value="krishna">Lord Krishna</option>
                              <option value="lakshmi">Maa Lakshmi</option>
                              <option value="saraswati">Maa Saraswati</option>
                              <option value="shani">Lord Shani</option>
                              <option value="surya">Lord Surya</option>
                              <option value="Unknown">Unknown</option>
                            </select>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              {deity && (
                                <img
                                  src={deity.image}
                                  alt={deity.name}
                                  referrerPolicy="no-referrer"
                                  className="w-4 h-4 rounded-full object-cover shrink-0"
                                />
                              )}
                              <span className="font-medium text-stone-200 truncate">
                                {deity ? deity.name : 'Unknown'}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Suggested Day */}
                        <td className="p-3">
                          {item.isEditing ? (
                            <select
                              value={item.suggestedDays?.[0] || 'Monday'}
                              onChange={(e) => handleUpdateItem(idx, 'suggestedDays', [e.target.value])}
                              className="w-full rounded bg-[#251a13] border border-amber-600/50 px-2 py-1 text-xs text-stone-200"
                            >
                              <option value="Monday">Monday (Shiva)</option>
                              <option value="Tuesday">Tuesday (Hanuman)</option>
                              <option value="Wednesday">Wednesday (Ganesh)</option>
                              <option value="Thursday">Thursday (Vishnu)</option>
                              <option value="Friday">Friday (Durga)</option>
                              <option value="Saturday">Saturday (Shani)</option>
                              <option value="Sunday">Sunday (Surya)</option>
                            </select>
                          ) : (
                            <span className="text-stone-300">
                              {item.suggestedDays?.[0] || 'None'}
                            </span>
                          )}
                        </td>

                        {/* Artist */}
                        <td className="p-3">
                          {item.isEditing ? (
                            <input
                              type="text"
                              value={item.artist}
                              onChange={(e) => handleUpdateItem(idx, 'artist', e.target.value)}
                              className="w-full rounded bg-[#251a13] border border-amber-600/50 px-2 py-1 text-xs text-stone-200"
                            />
                          ) : (
                            <span className={item.artist === 'Unknown' ? 'text-stone-500 italic' : 'text-stone-300 font-medium'}>
                              {item.artist}
                            </span>
                          )}
                        </td>

                        {/* Confidence */}
                        <td className="p-3 text-center">
                          <span
                            className={`font-mono font-semibold text-[11px] ${
                              item.confidence >= 90 ? 'text-emerald-400' : item.confidence >= 70 ? 'text-amber-400' : 'text-stone-400'
                            }`}
                          >
                            {item.confidence}%
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleToggleEdit(idx)}
                              title={item.isEditing ? 'Save edits' : 'Edit item'}
                              className="p-1 rounded text-stone-400 hover:text-amber-300 hover:bg-stone-800 transition-colors cursor-pointer"
                            >
                              {item.isEditing ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Edit2 className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              title="Reject / Remove"
                              className="p-1 rounded text-stone-400 hover:text-rose-400 hover:bg-stone-800 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 flex items-center justify-between gap-3">
              <span className="text-xs text-stone-400">
                Tip: Click the edit icon to adjust titles, deities, or suggested days before approving.
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800/80 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApproveAndImport}
                  disabled={selectedCount === 0}
                  className="flex items-center gap-1.5 px-6 py-2 text-xs font-bold rounded-lg text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Approve &amp; Import ({selectedCount})</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
