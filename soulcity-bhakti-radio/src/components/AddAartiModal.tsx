import React, { useState } from 'react';
import { X, Music, AlertCircle, CheckCircle2, Loader2, Sparkles, Youtube, ExternalLink } from 'lucide-react';
import { DeityId, Aarti, AartiSourceType } from '../types.ts';
import { DEITIES, WEEKDAY_ORDER } from '../data/deities.ts';
import { extractYouTubeVideoId, getYouTubeThumbnailUrl, fetchYouTubeOEmbed } from '../utils/youtube.ts';

interface AddAartiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAarti: (newAarti: Aarti) => void;
  initialDeityId?: DeityId;
}

export const AddAartiModal: React.FC<AddAartiModalProps> = ({
  isOpen,
  onClose,
  onAddAarti,
  initialDeityId = 'shiva',
}) => {
  const [sourceType, setSourceType] = useState<AartiSourceType>('direct');
  const [title, setTitle] = useState('');
  const [hindiTitle, setHindiTitle] = useState('');
  const [deityId, setDeityId] = useState<DeityId>(initialDeityId);
  const [urlInput, setUrlInput] = useState('');

  // YouTube preview state
  const [ytVideoId, setYtVideoId] = useState<string | null>(null);
  const [ytThumbnail, setYtThumbnail] = useState<string | null>(null);

  // Verification state
  const [testingStatus, setTestingStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [testErrorMessage, setTestErrorMessage] = useState('');
  const [detectedDuration, setDetectedDuration] = useState('');

  if (!isOpen) return null;

  // Handle URL change
  const handleUrlChange = async (val: string) => {
    setUrlInput(val);
    setTestingStatus('idle');
    setTestErrorMessage('');

    if (sourceType === 'youtube') {
      const extractedId = extractYouTubeVideoId(val);
      if (extractedId) {
        setYtVideoId(extractedId);
        const thumb = getYouTubeThumbnailUrl(extractedId);
        setYtThumbnail(thumb);

        // Auto-fetch oEmbed metadata to assist user with title
        try {
          const meta = await fetchYouTubeOEmbed(val);
          if (meta && meta.title && !title.trim()) {
            setTitle(meta.title);
          }
        } catch {
          // Ignore oEmbed fetch errors, user can still type title manually
        }
      } else {
        setYtVideoId(null);
        setYtThumbnail(null);
      }
    }
  };

  // Test URL action
  const handleTestUrl = async () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setTestingStatus('failed');
      setTestErrorMessage(`Please enter a ${sourceType === 'youtube' ? 'YouTube' : 'direct audio'} URL first.`);
      return;
    }

    if (sourceType === 'youtube') {
      setTestingStatus('testing');
      setTestErrorMessage('');

      const extractedId = extractYouTubeVideoId(trimmed);
      if (!extractedId) {
        setTestingStatus('failed');
        setTestErrorMessage('Invalid YouTube URL. Please provide a standard watch link, youtu.be shortlink, or YouTube Shorts link.');
        return;
      }

      setYtVideoId(extractedId);
      setYtThumbnail(getYouTubeThumbnailUrl(extractedId));

      try {
        const meta = await fetchYouTubeOEmbed(trimmed);
        if (meta) {
          if (meta.title && !title.trim()) {
            setTitle(meta.title);
          }
          setTestingStatus('success');
          setDetectedDuration('YouTube Stream');
        } else {
          // Valid ID format even if oembed failed
          setTestingStatus('success');
          setDetectedDuration('YouTube Stream');
        }
      } catch {
        setTestingStatus('success');
        setDetectedDuration('YouTube Stream');
      }
    } else {
      // Direct Audio verification
      try {
        new URL(trimmed);
      } catch {
        setTestingStatus('failed');
        setTestErrorMessage('Invalid URL format. Must start with http:// or https://');
        return;
      }

      setTestingStatus('testing');
      setTestErrorMessage('');

      const testAudio = new Audio();
      let isSettled = false;

      const cleanup = () => {
        testAudio.pause();
        testAudio.src = '';
        testAudio.remove();
      };

      const timer = setTimeout(() => {
        if (!isSettled) {
          isSettled = true;
          cleanup();
          setTestingStatus('failed');
          setTestErrorMessage('Audio load timed out. The URL might be blocked or unreachable.');
        }
      }, 9000);

      testAudio.onloadedmetadata = () => {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timer);
          const mins = Math.floor(testAudio.duration / 60);
          const secs = Math.floor(testAudio.duration % 60);
          const durFormatted = !isNaN(mins) && !isNaN(secs)
            ? `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
            : '04:00';
          setDetectedDuration(durFormatted);
          setTestingStatus('success');
          cleanup();
        }
      };

      testAudio.onerror = () => {
        if (!isSettled) {
          isSettled = true;
          clearTimeout(timer);
          cleanup();
          setTestingStatus('failed');
          setTestErrorMessage('Failed to load audio from this URL. Please verify the URL points directly to an accessible audio file (e.g. MP3, OGG, WAV).');
        }
      };

      testAudio.src = trimmed;
      testAudio.load();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setTestingStatus('failed');
      setTestErrorMessage('Please provide an Aarti Title.');
      return;
    }

    const trimmedUrl = urlInput.trim();
    if (!trimmedUrl) {
      setTestingStatus('failed');
      setTestErrorMessage(`Please enter a valid ${sourceType === 'youtube' ? 'YouTube' : 'audio'} URL.`);
      return;
    }

    if (sourceType === 'youtube') {
      const extractedId = extractYouTubeVideoId(trimmedUrl);
      if (!extractedId) {
        setTestingStatus('failed');
        setTestErrorMessage('Invalid YouTube URL. Supported formats: youtube.com/watch?v=..., youtu.be/..., or youtube.com/shorts/...');
        return;
      }

      const newAarti: Aarti = {
        id: `custom-yt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: title.trim(),
        hindiTitle: hindiTitle.trim() || undefined,
        deityId,
        sourceType: 'youtube',
        audioUrl: trimmedUrl,
        youtubeVideoId: extractedId,
        thumbnailUrl: ytThumbnail || getYouTubeThumbnailUrl(extractedId),
        duration: detectedDuration || 'YouTube Track',
        isCustom: true,
        addedAt: Date.now(),
      };

      onAddAarti(newAarti);
      onClose();
    } else {
      try {
        new URL(trimmedUrl);
      } catch {
        setTestingStatus('failed');
        setTestErrorMessage('Invalid URL format. Please enter a valid http/https URL.');
        return;
      }

      const newAarti: Aarti = {
        id: `custom-aarti-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: title.trim(),
        hindiTitle: hindiTitle.trim() || undefined,
        deityId,
        sourceType: 'direct',
        audioUrl: trimmedUrl,
        duration: detectedDuration || '04:15',
        isCustom: true,
        addedAt: Date.now(),
      };

      onAddAarti(newAarti);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl border border-amber-700/50 bg-[#150f0c] p-6 shadow-[0_0_50px_rgba(0,0,0,0.9)] text-stone-200 my-8">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800/80 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-1 text-xs text-amber-400 font-semibold uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>Contribute Devotion</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight text-gold-gradient font-serif-temple">
          Add New Sacred Aarti
        </h3>
        <p className="mt-1 text-xs text-stone-400">
          Add a direct audio stream (MP3/OGG) or YouTube link (Video, Shorts, youtu.be).
        </p>

        {/* Source Type Selector (Segmented Control) */}
        <div className="mt-5 grid grid-cols-2 gap-2 p-1 bg-[#100b08] rounded-xl border border-amber-900/40">
          <button
            type="button"
            onClick={() => {
              setSourceType('direct');
              setUrlInput('');
              setTestingStatus('idle');
              setTestErrorMessage('');
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              sourceType === 'direct'
                ? 'bg-amber-500 text-stone-950 shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Music className="w-3.5 h-3.5" />
            <span>Direct Audio (MP3)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSourceType('youtube');
              setUrlInput('');
              setTestingStatus('idle');
              setTestErrorMessage('');
            }}
            className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              sourceType === 'youtube'
                ? 'bg-red-600 text-white shadow'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Youtube className="w-4 h-4" />
            <span>YouTube URL</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Aarti Title */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Aarti Title <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Om Jai Lakshmi Mata"
              className="w-full rounded-xl border border-amber-900/50 bg-[#1c130e] px-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {/* Hindi Title (Optional) */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Devanagari / Hindi Title <span className="text-stone-500 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={hindiTitle}
              onChange={(e) => setHindiTitle(e.target.value)}
              placeholder="e.g. ॐ जय लक्ष्मी माता"
              className="w-full rounded-xl border border-amber-900/50 bg-[#1c130e] px-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
          </div>

          {/* Associated Deity */}
          <div>
            <label className="block text-xs font-semibold text-stone-300 mb-1">
              Consecrated Deity <span className="text-amber-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {WEEKDAY_ORDER.map((id) => {
                const deity = DEITIES[id];
                const isSelected = deityId === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setDeityId(id)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border border-amber-400 bg-amber-950/80 text-amber-200'
                        : 'border border-stone-800 bg-[#1a120e] text-stone-300 hover:border-amber-800'
                    }`}
                  >
                    <img
                      src={deity.image}
                      alt={deity.name}
                      referrerPolicy="no-referrer"
                      className="w-6 h-6 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold truncate leading-tight">{deity.name}</p>
                      <p className="text-[9px] text-stone-400 truncate">{deity.day}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Audio or YouTube URL */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-stone-300">
                {sourceType === 'youtube' ? 'YouTube Video URL' : 'Playable Audio URL'}{' '}
                <span className="text-amber-400">*</span>
              </label>
              <button
                type="button"
                onClick={handleTestUrl}
                disabled={testingStatus === 'testing' || !urlInput.trim()}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              >
                {testingStatus === 'testing' ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Checking...</span>
                  </>
                ) : (
                  <span>Verify Link</span>
                )}
              </button>
            </div>
            <div className="relative">
              {sourceType === 'youtube' ? (
                <Youtube className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
              ) : (
                <Music className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
              )}
              <input
                type="url"
                required
                value={urlInput}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder={
                  sourceType === 'youtube'
                    ? 'https://www.youtube.com/watch?v=... or https://youtu.be/... or shorts'
                    : 'https://example.com/audio/aarti.mp3'
                }
                className="w-full rounded-xl border border-amber-900/50 bg-[#1c130e] pl-10 pr-3.5 py-2.5 text-sm text-stone-100 placeholder-stone-500 focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
            <p className="mt-1 text-[11px] text-stone-500">
              {sourceType === 'youtube'
                ? 'Supports standard YouTube video links, youtu.be shortlinks, and YouTube Shorts.'
                : 'Provide a direct streaming link (MP3, OGG, or WebM format).'}
            </p>
          </div>

          {/* YouTube Video Thumbnail Preview */}
          {sourceType === 'youtube' && ytVideoId && ytThumbnail && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1c130e] border border-amber-900/40">
              <div className="relative w-24 h-16 rounded-lg overflow-hidden shrink-0 bg-stone-900">
                <img
                  src={ytThumbnail}
                  alt="YouTube thumbnail preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Youtube className="w-5 h-5 text-red-500 drop-shadow" />
                </div>
              </div>
              <div className="min-w-0 flex-1 text-xs">
                <span className="text-[10px] text-red-400 font-semibold uppercase tracking-wider block">
                  YouTube Video Detected
                </span>
                <p className="font-semibold text-stone-200 truncate mt-0.5">
                  ID: <span className="font-mono text-amber-300">{ytVideoId}</span>
                </p>
                <p className="text-[11px] text-stone-400 truncate">
                  Official IFrame player will embed playback
                </p>
              </div>
            </div>
          )}

          {/* Testing Status Feedback */}
          {testingStatus === 'success' && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Valid {sourceType === 'youtube' ? 'YouTube video' : 'audio URL'} verified!</span>
            </div>
          )}

          {testingStatus === 'failed' && (
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-rose-950/60 border border-rose-700/50 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{testErrorMessage || 'Unable to play from this URL.'}</span>
            </div>
          )}

          {/* Form Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800/80 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold rounded-lg text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer"
            >
              Save Aarti to Radio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
