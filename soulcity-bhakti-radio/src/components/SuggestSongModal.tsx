import React, { useState } from 'react';
import { X, Sparkles, Send, CheckCircle2, Music, Youtube } from 'lucide-react';
import { DeityId, AartiType } from '../types.ts';
import { DEITIES, EXPLORER_DEITIES } from '../data/deities.ts';
import { submitSongSuggestionToFirestore } from '../lib/firestoreService.ts';

interface SuggestSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmissionSuccess?: (msg: string) => void;
}

export const SuggestSongModal: React.FC<SuggestSongModalProps> = ({
  isOpen,
  onClose,
  onSubmissionSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [sourceType, setSourceType] = useState<'youtube' | 'direct'>('youtube');
  const [deityId, setDeityId] = useState<DeityId>('shiva');
  const [category, setCategory] = useState<AartiType>('Aarti');
  const [artist, setArtist] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) {
      setErrorMessage('Please provide both song title and media URL.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await submitSongSuggestionToFirestore({
        title: title.trim(),
        sourceType,
        url: url.trim(),
        deityId,
        category,
        artist: artist.trim(),
        note: note.trim(),
      });

      const msg = 'Your song has been submitted for admin review.';
      setSuccessMessage(msg);
      if (onSubmissionSuccess) {
        onSubmissionSuccess(msg);
      }

      setTimeout(() => {
        // Reset form
        setTitle('');
        setUrl('');
        setArtist('');
        setNote('');
        setSuccessMessage(null);
        onClose();
      }, 2500);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to submit song suggestion.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-amber-600/50 bg-[#160d09] p-6 shadow-2xl text-stone-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-amber-900/40 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-bold font-serif-temple text-gold-gradient">
                Suggest a Song for SoulCity
              </h2>
              <p className="text-[11px] text-stone-400">
                Share a sacred Aarti, Bhajan, or Mantra for community inclusion
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Message Banner */}
        {successMessage ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
            <h3 className="text-lg font-bold text-amber-200 font-serif-temple">
              Submission Received!
            </h3>
            <p className="text-sm text-stone-300 max-w-xs font-medium">
              {successMessage}
            </p>
            <span className="text-xs text-stone-500">
              Thank you for contributing to SoulCity Bhakti Radio.
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-700/50 text-rose-200">
                {errorMessage}
              </div>
            )}

            {/* Song Title */}
            <div>
              <label className="block text-amber-300 font-semibold mb-1">
                Song Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Shri Hanuman Chalisa, Jai Ambe Gauri"
                className="w-full rounded-xl border border-amber-900/50 bg-[#20130d] px-3.5 py-2 text-stone-100 placeholder-stone-500 focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Source Type Toggle & URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-amber-300 font-semibold">
                  Media Source URL *
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSourceType('youtube')}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                      sourceType === 'youtube'
                        ? 'bg-red-600 text-white'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    <Youtube className="w-3 h-3" /> YouTube
                  </button>
                  <button
                    type="button"
                    onClick={() => setSourceType('direct')}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                      sourceType === 'direct'
                        ? 'bg-amber-500 text-stone-950'
                        : 'bg-stone-800 text-stone-400'
                    }`}
                  >
                    <Music className="w-3 h-3" /> MP3 Audio
                  </button>
                </div>
              </div>

              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={
                  sourceType === 'youtube'
                    ? 'https://www.youtube.com/watch?v=...'
                    : 'https://example.com/audio.mp3'
                }
                className="w-full rounded-xl border border-amber-900/50 bg-[#20130d] px-3.5 py-2 text-stone-100 placeholder-stone-500 focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Deity & Category Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-amber-300 font-semibold mb-1">
                  Consecrated Deity *
                </label>
                <select
                  value={deityId}
                  onChange={(e) => setDeityId(e.target.value as DeityId)}
                  className="w-full rounded-xl border border-amber-900/50 bg-[#20130d] px-3 py-2 text-stone-100 focus:border-amber-400 focus:outline-none"
                >
                  {EXPLORER_DEITIES.map((id) => (
                    <option key={id} value={id}>
                      {DEITIES[id]?.name || id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-amber-300 font-semibold mb-1">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as AartiType)}
                  className="w-full rounded-xl border border-amber-900/50 bg-[#20130d] px-3 py-2 text-stone-100 focus:border-amber-400 focus:outline-none"
                >
                  <option value="Aarti">Aarti</option>
                  <option value="Bhajan">Bhajan</option>
                  <option value="Mantra">Mantra</option>
                  <option value="Chalisa">Chalisa</option>
                  <option value="Stotram">Stotram</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Optional Artist */}
            <div>
              <label className="block text-stone-400 font-semibold mb-1">
                Artist / Singer (Optional)
              </label>
              <input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="e.g. Anuradha Paudwal, Hariharan"
                className="w-full rounded-xl border border-amber-900/50 bg-[#20130d] px-3.5 py-2 text-stone-100 placeholder-stone-500 focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Optional Note */}
            <div>
              <label className="block text-stone-400 font-semibold mb-1">
                Note for Admin (Optional)
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Why should this song be included?"
                className="w-full rounded-xl border border-amber-900/50 bg-[#20130d] px-3.5 py-2 text-stone-100 placeholder-stone-500 focus:border-amber-400 focus:outline-none"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-stone-800 text-stone-300 font-semibold hover:bg-stone-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-stone-950 font-bold hover:from-amber-300 hover:to-amber-400 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Submitting...' : 'Submit Suggestion'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
